import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { HERO_OVERSCAN as OVERSCAN, type HeroScene as HeroSceneData } from '../data/heroScenes'

/**
 * Hero 3D: foto lanskap dibentuk jadi permukaan 3D dari depth map-nya,
 * lalu kamera bergerak pelan (mouse / idle / scroll) sehingga muncul parallax nyata.
 *
 * Saat berganti, lanskap berikutnya hidup di ruang 3D tersendiri di belakang lanskap sekarang.
 * Gelombang ASCII menyapu dari titik klik (gradient wipe): foto menjadi huruf, huruf menipis
 * lalu hilang sambil melewati kamera, dan dunia di belakangnya maju menggantikannya.
 */

const FOV = 32
const CAM_DIST = 6
const DEPTH_SCALE = 2
const SWAY = { x: 0.75, y: 0.38 }
const INTRO_MS = 2200
/**
 * Pemindaian 3D saat sampul pertama dibuka: lanskap tersusun dari yang terdekat (sabana)
 * sampai yang terjauh (langit). Di garis depan pindaian muncul karakter ASCII yang menyala
 * dan gumpalan "gaussian splat" yang mengendap menjadi foto, foto lalu menajam.
 */
const SCAN_MS = 3400
/** Jumlah splat (kolom x baris) di layar lebar; di layar kecil dikurangi */
const SPLAT_GRID = { desktop: [150, 84], small: [96, 64] }
const TRANSITION_MS = 2900
/** Tinggi sel karakter ASCII di layar (px CSS); lebarnya mengikuti proporsi huruf monospace */
const CELL_PX = { desktop: 15, small: 12 }
const CELL_ASPECT = 0.62
/** Butiran film di atas foto */
const GRAIN = 0.075
/** Jarak dunia lanskap berikutnya di belakang lanskap sekarang (satuan dunia 3D) */
const BACK_DIST = 2.6
/** Ukuran tampak dunia belakang saat menunggu (sedikit lebih kecil = terasa jauh) */
const BACK_APPARENT = 0.94
/** Kabut tipis pada dunia belakang sebagai penanda jarak */
const BACK_FOG = 0.2
/** Seberapa jauh lanskap sekarang bergerak melewati kamera saat terurai */
const FRONT_FLY = 2.4

interface HeroSceneProps {
  scenes: HeroSceneData[]
  active: number
  /** Seberapa jauh hero sudah tertutup konten di bawahnya, 0..1 */
  scrollRef: { current: number }
  /** Titik awal wipe berikutnya (px CSS, relatif terhadap kontainer); null = dari tengah */
  originRef: { current: { x: number; y: number } | null }
  onReady: () => void
  /** Pemindaian 3D awal selesai; aset lain boleh mulai muncul */
  onIntroDone: () => void
  onError: () => void
  className?: string
}

interface LoadedScene {
  image: THREE.Texture
  depth: THREE.Texture
}

const common = /* glsl */ `
  #define PI 3.14159265
  uniform float uDepthScale;
  uniform float uFlat;
  uniform float uTime;
  uniform float uLife;

  vec2 coverUv(vec2 uv, vec2 s, vec2 o) { return (uv - 0.5) * s + 0.5 + o; }

  // Objek dekat maju penuh; latar (langit, laut jauh) hanya mundur sedikit
  // supaya tepi permukaan tidak pernah terlihat saat kamera bergeser.
  float shapeDepth(float d, float focus) {
    float z = d - focus;
    return z > 0.0 ? z : z * 0.35;
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // Butiran film yang berganti tiap frame
  float grain(vec2 fc) {
    return (hash(fc * 0.71 + fract(uTime * 3.7) * 311.0) - 0.5) * ${GRAIN.toFixed(3)};
  }

  vec3 shade(sampler2D tex, sampler2D dep, vec2 uv, float wind, float shadow) {
    float depth = texture2D(dep, uv).r;
    // Angin: hanya objek terdekat (daun, semak) yang bergoyang
    float near = smoothstep(0.6, 0.95, depth) * wind * uLife;
    vec2 sway = vec2(
      sin(uTime * 1.5 + uv.y * 13.0 + uv.x * 5.0) + 0.5 * sin(uTime * 2.6 + uv.x * 21.0),
      cos(uTime * 1.15 + uv.x * 10.0)
    ) * 0.0014 * near;
    vec3 c = texture2D(tex, uv + sway).rgb;
    // Bayangan awan yang melintas pelan di daratan (langit dikecualikan)
    if (shadow > 0.0) {
      float n = fbm(uv * vec2(2.2, 1.5) + vec2(uTime * 0.016, uTime * 0.005));
      float land = smoothstep(0.14, 0.32, depth);
      c *= 1.0 - shadow * uLife * land * smoothstep(0.5, 0.74, n);
    }
    return c;
  }
`

// Lanskap sekarang: tersusun dari blok per sel karakter agar tiap sel bisa berubah jadi huruf utuh
const frontVertex = /* glsl */ `
  ${common}
  attribute vec2 aCell;
  uniform sampler2D uDepth0;
  uniform sampler2D uDepth1;
  uniform vec2 uScale0;
  uniform vec2 uOff0;
  uniform vec2 uScale1;
  uniform vec2 uOff1;
  uniform float uFocus0;
  uniform vec2 uGrid;
  uniform float uPlaneAspect;
  uniform vec2 uOriginUv;
  uniform float uMix;
  uniform float uScroll;
  uniform float uEdgeV;
  uniform float uScan;
  varying vec2 vUv;
  varying vec2 vCellUv;
  varying vec2 vCell;
  varying float vState;
  varying float vScan;

  // Lebar pita gelombang: makin lebar, makin panjang fase foto -> huruf -> hilang
  const float BAND = 0.3;
  // Tinggi pita ASCII di atas tepi tirai (fraksi tinggi permukaan foto)
  const float CURTAIN_BAND = 0.42;

  // Saat tirai konten naik: sel di atas tepinya berubah jadi huruf, makin dekat makin tipis,
  // dan seluruh foto perlahan ikut berlapis huruf
  float curtainState(vec2 cell, vec2 cellUv) {
    if (uScroll <= 0.0) return 0.0;
    float rag = (noise(cellUv * vec2(uPlaneAspect, 1.0) * 7.0 + 3.0) - 0.5) * 0.12 + (hash(cell * 0.913 + 5.0) - 0.5) * 0.06;
    float near = clamp((uEdgeV + CURTAIN_BAND - cellUv.y + rag) / CURTAIN_BAND, 0.0, 1.0);
    float soft = smoothstep(0.0, 0.85, uScroll) * 0.26;
    return max(near * smoothstep(0.0, 0.05, uScroll), soft);
  }

  // Progres pindai 3D per sel (0 = belum, 1 = selesai): sabana (dekat) duluan, langit terakhir
  const float SCAN_BAND = 0.4;
  float scanProgress(vec2 cell, vec2 cellUv) {
    if (uScan >= 1.0) return 1.0;
    float d = texture2D(uDepth0, coverUv(cellUv, uScale0, uOff0)).r;
    float n = noise(cellUv * vec2(uPlaneAspect, 1.0) * 4.0 + 7.0);
    float raw = 0.5 * (1.0 - d) + 0.5 * cellUv.y + (n - 0.5) * 0.12 + hash(cell * 1.31 + 3.0) * 0.04;
    float th = clamp((raw - 0.15) / 0.82, 0.0, 1.0);
    return clamp((uScan * (1.0 + SCAN_BAND) - th) / SCAN_BAND, 0.0, 1.0);
  }

  // 0 = foto utuh, 1 = sel hilang
  float cellState(vec2 cell) {
    vec2 cellUv = (cell + 0.5) / uGrid;
    float curtain = curtainState(cell, cellUv);
    if (uMix <= 0.0) return curtain;
    float rnd = hash(cell * 0.731 + 17.0);
    vec2 asp = vec2(uPlaneAspect, 1.0);
    float dist = distance(cellUv * asp, uOriginUv * asp);

    // Peta gradien ala After Effects (0..1, tersebar merata): noise + acak per piksel
    // + kedalaman lanskap berikutnya (yang dekat terbuka duluan) + bias ke titik klik
    float n = clamp((fbm(cellUv * asp * 2.6 + 11.0) - 0.3) / 0.4, 0.0, 1.0);
    float d1 = texture2D(uDepth1, coverUv(cellUv, uScale1, uOff1)).r;
    float g = 0.42 * n + 0.18 * rnd + 0.22 * (1.0 - d1);
    // Gelombang memancar dari titik klik, tepinya dibentuk peta gradien
    float gWipe = g * 0.6 + 0.4 * clamp(dist / 1.1, 0.0, 1.0);
    return max(curtain, clamp((uMix * (1.0 + BAND) - gWipe) / BAND, 0.0, 1.0));
  }

  void main() {
    vUv = uv;
    vCellUv = (aCell + 0.5) / uGrid;
    vCell = aCell;
    // Pindaian: sel muncul sebagai huruf (bagian awal pita), lalu menjadi foto
    vScan = scanProgress(aCell, vCellUv);
    vState = max(cellState(aCell), clamp(1.0 - vScan / 0.6, 0.0, 1.0));
    float d0 = shapeDepth(texture2D(uDepth0, coverUv(uv, uScale0, uOff0)).r, uFocus0);
    vec3 p = position;
    p.z += d0 * uDepthScale * uFlat;
    // Sel yang sudah jadi huruf sedikit terangkat ke arah kamera: lapisan teks punya parallax sendiri
    float rz = hash(aCell * 0.731 + 17.0);
    p.z += smoothstep(0.0, 0.6, vState) * (0.05 + 0.12 * rz);
    // Saat dipindai, sel melayang dari depan lalu mengendap ke permukaannya
    p.z += (1.0 - smoothstep(0.0, 0.75, vScan)) * (0.18 + 0.45 * rz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const frontFragment = /* glsl */ `
  ${common}
  uniform sampler2D uTex0;
  uniform sampler2D uDepth0;
  uniform vec2 uScale0;
  uniform vec2 uOff0;
  uniform float uWind0;
  uniform float uShadow0;
  uniform sampler2D uGlyphs;
  uniform float uGlyphCount;
  uniform vec2 uGrid;
  varying vec2 vUv;
  varying vec2 vCellUv;
  varying vec2 vCell;
  varying float vState;
  varying float vScan;

  const vec3 SCAN_COL = vec3(0.78, 0.97, 1.0);

  void main() {
    float s = vState;
    if (s >= 0.999) discard;
    vec3 photo = shade(uTex0, uDepth0, coverUv(vUv, uScale0, uOff0), uWind0, uShadow0);
    if (vScan < 0.999) {
      // Baru dipindai: foto masih buram & bernuansa data pindaian, lalu menajam
      float settle = smoothstep(0.6, 1.0, vScan);
      float blur = (1.0 - settle) * 4.5;
      if (blur > 0.05) photo = texture2D(uTex0, coverUv(vUv, uScale0, uOff0), blur).rgb;
      photo = mix(photo * 0.7 + SCAN_COL * 0.12, photo, settle);
    }
    float gr = grain(gl_FragCoord.xy);
    if (s <= 0.0) {
      gl_FragColor = vec4(photo + gr, 1.0);
      return;
    }

    // Warna rata-rata sel (dari mipmap) menjadi warna hurufnya
    vec3 cellCol = texture2D(uTex0, coverUv(vCellUv, uScale0, uOff0), 3.0).rgb;
    float lum = dot(cellCol, vec3(0.299, 0.587, 0.114));

    // Kerapatan huruf: ikut terang sel, menipis saat sel mendekati hilang, berkedip mengacak
    float thin = smoothstep(0.3, 1.0, s);
    float flick = hash(vCell * 1.37 + floor(uTime * 15.0) * 0.61);
    float dens = clamp(0.3 + lum * 0.85, 0.0, 1.0) * (1.0 - thin * 0.9);
    dens = clamp(dens + (flick - 0.5) * 0.32 * (1.0 - thin * 0.5), 0.0, 0.999);
    float idx = floor(dens * uGlyphCount);
    vec2 local = clamp(vUv * uGrid - vCell, 0.02, 0.98);
    float ink = smoothstep(0.3, 0.62, texture2D(uGlyphs, vec2((idx + local.x) / uGlyphCount, local.y)).a);

    // Ujung gelombang menyala hangat, lalu huruf mengambil warna fotonya
    float hot = 1.0 - smoothstep(0.04, 0.42, s);
    vec3 glyph = mix(cellCol * 1.4 + 0.07, vec3(1.0, 0.93, 0.78), hot * 0.65);
    // Garis depan pindaian menyala putih kebiruan
    float scanEdge = vScan < 0.999 ? 1.0 - smoothstep(0.0, 0.32, vScan) : 0.0;
    glyph = mix(glyph, SCAN_COL, scanEdge * 0.8);

    if (s < 0.3) {
      // Fase 1: huruf muncul di atas foto yang meredup
      vec3 bg = photo * (1.0 - smoothstep(0.0, 0.3, s) * 0.5);
      gl_FragColor = vec4(mix(bg, glyph, ink * smoothstep(0.0, 0.1, s)) + gr, 1.0);
      return;
    }
    // Fase 2: latar sel hilang, dunia belakang terlihat di sela huruf
    if (ink < 0.5) discard;
    gl_FragColor = vec4(glyph + gr, 1.0);
  }
`

// Lanskap berikutnya: dunia 3D tersendiri di belakang
const backVertex = /* glsl */ `
  ${common}
  uniform sampler2D uDepth1;
  uniform vec2 uScale1;
  uniform vec2 uOff1;
  uniform float uFocus1;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float d1 = shapeDepth(texture2D(uDepth1, coverUv(uv, uScale1, uOff1)).r, uFocus1);
    vec3 p = position;
    p.z += d1 * uDepthScale * uFlat;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const backFragment = /* glsl */ `
  ${common}
  uniform sampler2D uTex1;
  uniform sampler2D uDepth1;
  uniform vec2 uScale1;
  uniform vec2 uOff1;
  uniform float uWind1;
  uniform float uShadow1;
  uniform float uFog;
  varying vec2 vUv;

  void main() {
    vec3 c = shade(uTex1, uDepth1, coverUv(vUv, uScale1, uOff1), uWind1, uShadow1);
    c = mix(c, vec3(0.06, 0.09, 0.15), uFog);
    gl_FragColor = vec4(c + grain(gl_FragCoord.xy), 1.0);
  }
`

// Gumpalan "gaussian splat": elips lembut berwarna foto di garis depan pindaian
const splatVertex = /* glsl */ `
  ${common}
  attribute vec2 aJit;
  uniform sampler2D uTex0;
  uniform sampler2D uDepth0;
  uniform vec2 uScale0;
  uniform vec2 uOff0;
  uniform float uFocus0;
  uniform float uScan;
  uniform float uPlaneAspect;
  uniform float uPxScale;
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vShape;

  const float SCAN_BAND = 0.4;

  void main() {
    vec2 cuv = coverUv(uv, uScale0, uOff0);
    float d = texture2D(uDepth0, cuv).r;
    float n = noise(uv * vec2(uPlaneAspect, 1.0) * 4.0 + 7.0);
    float raw = 0.5 * (1.0 - d) + 0.5 * uv.y + (n - 0.5) * 0.12 + aJit.x * 0.04;
    float th = clamp((raw - 0.15) / 0.82, 0.0, 1.0);
    float p = clamp((uScan * (1.0 + SCAN_BAND) - th) / SCAN_BAND, 0.0, 1.0);
    vAlpha = smoothstep(0.02, 0.22, p) * (1.0 - smoothstep(0.5, 0.92, p));
    vec3 pos = position;
    pos.z += shapeDepth(d, uFocus0) * uDepthScale * uFlat;
    pos.z += (1.0 - smoothstep(0.0, 0.8, p)) * (0.3 + aJit.y * 0.6);
    vColor = textureLod(uTex0, cuv, 2.0).rgb;
    vShape = vec2(aJit.x * 6.2832, 1.4 + aJit.y * 1.6);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = vAlpha <= 0.0 ? 0.0 : min(uPxScale * (0.75 + aJit.y * 0.9) * (1.0 + (1.0 - p) * 0.9) / -mv.z, 72.0);
  }
`

const splatFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vShape;

  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float c = cos(vShape.x);
    float s = sin(vShape.x);
    q = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
    q.x *= vShape.y;
    float a = exp(-dot(q, q) * 19.0) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * 1.06 + 0.03, a * 0.85);
  }
`

const particleVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uBox;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float drift = uTime * (0.03 + aSeed * 0.05);
    p.x = mod(p.x + drift + uBox.x, uBox.x * 2.0) - uBox.x;
    p.y += sin(uTime * 0.35 + aSeed * 20.0) * 0.04;
    p.x += cos(uTime * 0.27 + aSeed * 13.0) * 0.03;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uScale / -mv.z, 26.0);
    vAlpha = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 1.1 + aSeed * 40.0));
  }
`

const particleFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.95, 0.84, a * a * vAlpha * uOpacity);
  }
`

/**
 * Atlas karakter untuk shader: glyph diurutkan dari yang paling tipis ke paling padat
 * (diukur dari tintanya), lalu dipilih merata sebanyak GLYPH_COUNT.
 */
const GLYPH_SET = '.,:;-~=+*!?/\\|()[]{}<>xo0#%&@$'
const GLYPH_COUNT = 16

function buildGlyphAtlas() {
  const CW = 48
  const CH = 80
  const font = `700 ${Math.round(CH * 0.86)}px Consolas, "Courier New", ui-monospace, monospace`
  const probe = document.createElement('canvas')
  probe.width = CW
  probe.height = CH
  const pctx = probe.getContext('2d', { willReadFrequently: true })!
  const draw = (ctx: CanvasRenderingContext2D, ch: string, x: number) => {
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(ch, x + CW / 2, CH * 0.53)
  }
  const scored = [...GLYPH_SET].map((ch) => {
    pctx.clearRect(0, 0, CW, CH)
    draw(pctx, ch, 0)
    const d = pctx.getImageData(0, 0, CW, CH).data
    let ink = 0
    for (let i = 3; i < d.length; i += 4) ink += d[i]
    return { ch, ink }
  })
  scored.sort((a, b) => a.ink - b.ink)
  const canvas = document.createElement('canvas')
  canvas.width = CW * GLYPH_COUNT
  canvas.height = CH
  const ctx = canvas.getContext('2d')!
  for (let i = 0; i < GLYPH_COUNT; i++) {
    draw(ctx, scored[Math.round((i * (scored.length - 1)) / (GLYPH_COUNT - 1))].ch, i * CW)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function HeroScene({
  scenes,
  active,
  scrollRef,
  originRef,
  onReady,
  onIntroDone,
  onError,
  className = '',
}: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{ setActive: (i: number) => void } | null>(null)
  const callbacks = useRef({ onReady, onIntroDone, onError })
  callbacks.current = { onReady, onIntroDone, onError }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Kanvas dibuat per mount: konteks WebGL yang sudah dilepas tidak bisa dipakai ulang
    const canvas = document.createElement('canvas')
    canvas.className = 'block w-full h-full'
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      canvas.remove()
      callbacks.current.onError()
      return
    }

    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x0b1220, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50)
    camera.position.set(0, 0, CAM_DIST)

    // Uniform bersama kedua dunia
    const uniforms = {
      uTex0: { value: null as THREE.Texture | null },
      uTex1: { value: null as THREE.Texture | null },
      uDepth0: { value: null as THREE.Texture | null },
      uDepth1: { value: null as THREE.Texture | null },
      uScale0: { value: new THREE.Vector2(1, 1) },
      uScale1: { value: new THREE.Vector2(1, 1) },
      uOff0: { value: new THREE.Vector2(0, 0) },
      uOff1: { value: new THREE.Vector2(0, 0) },
      uFocus0: { value: 0.3 },
      uFocus1: { value: 0.3 },
      uWind0: { value: 0 },
      uWind1: { value: 0 },
      uShadow0: { value: 0 },
      uShadow1: { value: 0 },
      uMix: { value: 0 },
      uFlat: { value: 0 },
      uDepthScale: { value: DEPTH_SCALE },
      uTime: { value: 0 },
      uLife: { value: 0 },
      uGrid: { value: new THREE.Vector2(60, 34) },
      uPlaneAspect: { value: 16 / 9 },
      uOriginUv: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uScan: { value: 0 },
      uPxScale: { value: 10 },
      uEdgeV: { value: -1 },
      uFog: { value: BACK_FOG },
      uGlyphs: { value: buildGlyphAtlas() },
      uGlyphCount: { value: GLYPH_COUNT },
    }

    // Dunia belakang (lanskap berikutnya)
    const backGeometry = new THREE.PlaneGeometry(1, 1, isSmall ? 110 : 170, isSmall ? 110 : 170)
    const backMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: backVertex, fragmentShader: backFragment })
    const back = new THREE.Mesh(backGeometry, backMaterial)
    back.frustumCulled = false
    back.visible = false
    scene.add(back)

    // Dunia depan (lanskap sekarang): satu blok kecil per piksel agar bisa dilubangi
    let frontGeometry = new THREE.BufferGeometry()
    const frontMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: frontVertex, fragmentShader: frontFragment })
    const front = new THREE.Mesh(frontGeometry, frontMaterial)
    front.frustumCulled = false
    scene.add(front)

    const [sCols, sRows] = isSmall ? SPLAT_GRID.small : SPLAT_GRID.desktop
    const splatGeo = new THREE.BufferGeometry()
    {
      const n = sCols * sRows
      const sp = new Float32Array(n * 3)
      const su = new Float32Array(n * 2)
      const sj = new Float32Array(n * 2)
      let k = 0
      for (let y = 0; y < sRows; y++) {
        for (let x = 0; x < sCols; x++) {
          const u = (x + Math.random()) / sCols
          const v = (y + Math.random()) / sRows
          sp[k * 3] = u - 0.5
          sp[k * 3 + 1] = v - 0.5
          su[k * 2] = u
          su[k * 2 + 1] = v
          sj[k * 2] = Math.random()
          sj[k * 2 + 1] = Math.random()
          k++
        }
      }
      splatGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
      splatGeo.setAttribute('uv', new THREE.BufferAttribute(su, 2))
      splatGeo.setAttribute('aJit', new THREE.BufferAttribute(sj, 2))
    }
    const splatMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: splatVertex,
      fragmentShader: splatFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const splats = new THREE.Points(splatGeo, splatMat)
    splats.frustumCulled = false
    splats.renderOrder = 2
    splats.visible = false
    front.add(splats)

    const buildFront = (cols: number, rows: number) => {
      // Kerapatan titik per blok dijaga sekitar 60 ribu titik total
      const k = Math.min(6, Math.max(2, Math.round(Math.sqrt(60000 / (cols * rows))) - 1))
      const vpc = (k + 1) * (k + 1)
      const cells = cols * rows
      const pos = new Float32Array(cells * vpc * 3)
      const uv = new Float32Array(cells * vpc * 2)
      const cell = new Float32Array(cells * vpc * 2)
      const index = new Uint32Array(cells * k * k * 6)
      let v = 0
      let t = 0
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const base = v
          for (let j = 0; j <= k; j++) {
            for (let i = 0; i <= k; i++) {
              const u = (x + i / k) / cols
              const w = (y + j / k) / rows
              pos[v * 3] = u - 0.5
              pos[v * 3 + 1] = w - 0.5
              uv[v * 2] = u
              uv[v * 2 + 1] = w
              cell[v * 2] = x
              cell[v * 2 + 1] = y
              v++
            }
          }
          for (let j = 0; j < k; j++) {
            for (let i = 0; i < k; i++) {
              const a = base + j * (k + 1) + i
              const b = a + 1
              const c = a + k + 1
              const d = c + 1
              index[t++] = a
              index[t++] = b
              index[t++] = d
              index[t++] = a
              index[t++] = d
              index[t++] = c
            }
          }
        }
      }
      const next = new THREE.BufferGeometry()
      next.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      next.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
      next.setAttribute('aCell', new THREE.BufferAttribute(cell, 2))
      next.setIndex(new THREE.BufferAttribute(index, 1))
      frontGeometry.dispose()
      frontGeometry = next
      front.geometry = next
    }

    // Partikel cahaya / serbuk sari yang melayang
    const count = isSmall ? 70 : 150
    const pGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2
      pos[i * 3 + 2] = -0.2 + Math.random() * 3.6
      seeds[i] = Math.random()
      sizes[i] = 0.5 + Math.pow(Math.random(), 2.2) * 1.8
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    const pUniforms = {
      uTime: { value: 0 },
      uScale: { value: 10 },
      uBox: { value: new THREE.Vector3(1, 1, 1) },
      uOpacity: { value: 0 },
    }
    const pMat = new THREE.ShaderMaterial({
      uniforms: pUniforms,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(pGeo, pMat)
    particles.frustumCulled = false
    scene.add(particles)

    // Ukuran & cover-fit
    let viewW = 1
    const edgeRay = new THREE.Vector3()
    let viewH = 1
    let planeAspect = 1
    let cssW = 1
    let cssH = 1
    let grid = { cols: 0, rows: 0 }
    const slotScene: [HeroSceneData | null, HeroSceneData | null] = [null, null]

    const coverFor = (s: HeroSceneData, scale: THREE.Vector2, off: THREE.Vector2) => {
      const fx = s.focal?.[0] ?? 0.5
      const fy = s.focal?.[1] ?? 0.5
      if (planeAspect > s.aspect) scale.set(1, s.aspect / planeAspect)
      else scale.set(planeAspect / s.aspect, 1)
      off.set((fx - 0.5) * (1 - scale.x), (0.5 - fy) * (1 - scale.y))
    }
    const applyCover = () => {
      if (slotScene[0]) coverFor(slotScene[0], uniforms.uScale0.value, uniforms.uOff0.value)
      if (slotScene[1]) coverFor(slotScene[1], uniforms.uScale1.value, uniforms.uOff1.value)
    }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      cssW = w
      cssH = h
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      viewH = 2 * CAM_DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2))
      viewW = viewH * camera.aspect
      planeAspect = camera.aspect
      front.scale.set(viewW * OVERSCAN, viewH * OVERSCAN, 1)
      uniforms.uPlaneAspect.value = planeAspect
      particles.scale.set(viewW * 0.55, viewH * 0.55, 1)
      pUniforms.uScale.value = h * dpr * 0.011
      uniforms.uPxScale.value = (3.2 * ((viewW * OVERSCAN) / sCols) * h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)))
      // Grid sel karakter: ukurannya di layar kira-kira tetap di semua resolusi
      const cellH = w < 700 ? CELL_PX.small : CELL_PX.desktop
      const cols = Math.min(210, Math.max(30, Math.round((w / (cellH * CELL_ASPECT)) * OVERSCAN)))
      const rows = Math.max(12, Math.round((h / cellH) * OVERSCAN))
      if (cols !== grid.cols || rows !== grid.rows) {
        grid = { cols, rows }
        uniforms.uGrid.value.set(cols, rows)
        buildFront(cols, rows)
      }
      applyCover()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // px CSS (dari kiri atas) -> koordinat UV permukaan depan (perkiraan tanpa goyangan kamera)
    const toPlaneUv = (x: number, y: number) => ({
      u: 0.5 + (x / cssW - 0.5) / OVERSCAN,
      v: 0.5 + (0.5 - y / cssH) / OVERSCAN,
    })
    const setOrigin = (x: number, y: number) => {
      const p = toPlaneUv(x, y)
      uniforms.uOriginUv.value.set(p.u, p.v)
    }
    // Pemuatan tekstur
    const loader = new THREE.TextureLoader()
    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    // Ambang sama dengan srcset poster (1280w / 2560w) agar foto tidak diunduh dua kali
    const useLarge = window.innerWidth * (window.devicePixelRatio || 1) > 1280
    const cache = new Map<number, Promise<LoadedScene>>()
    const loaded = new Map<number, LoadedScene>()
    let disposed = false

    const loadTexture = (url: string, isDepth: boolean) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            if (isDepth) {
              tex.generateMipmaps = false
              tex.minFilter = THREE.LinearFilter
            } else {
              tex.anisotropy = maxAniso
            }
            tex.magFilter = THREE.LinearFilter
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
            resolve(tex)
          },
          undefined,
          reject,
        )
      })

    const load = (i: number) => {
      let p = cache.get(i)
      if (!p) {
        const s = scenes[i]
        p = Promise.all([loadTexture(useLarge ? s.image.lg : s.image.sm, false), loadTexture(s.depth, true)]).then(
          ([image, depth]) => {
            const res = { image, depth }
            if (disposed) {
              image.dispose()
              depth.dispose()
            } else loaded.set(i, res)
            return res
          },
        )
        p.catch(() => cache.delete(i))
        cache.set(i, p)
      }
      return p
    }

    // Simpan maksimal lanskap aktif + berikutnya di GPU
    const trim = (keep: number[]) => {
      for (const [i, res] of loaded) {
        if (keep.includes(i)) continue
        res.image.dispose()
        res.depth.dispose()
        loaded.delete(i)
        cache.delete(i)
      }
    }

    const setSlot = (slot: 0 | 1, i: number, res: LoadedScene) => {
      const s = scenes[i]
      slotScene[slot] = s
      if (slot === 0) {
        uniforms.uTex0.value = res.image
        uniforms.uDepth0.value = res.depth
        uniforms.uFocus0.value = s.focus
        uniforms.uWind0.value = s.wind
        uniforms.uShadow0.value = s.shadow
      } else {
        uniforms.uTex1.value = res.image
        uniforms.uDepth1.value = res.depth
        uniforms.uFocus1.value = s.focus
        uniforms.uWind1.value = s.wind
        uniforms.uShadow1.value = s.shadow
      }
      applyCover()
    }

    // Transisi: gelombang dari titik klik, atau dari tengah saat berganti otomatis
    let transition: { start: number; x: number; y: number; resolve: () => void } | null = null

    const runTransition = () =>
      new Promise<void>((resolve) => {
        const o = originRef.current ?? { x: cssW * 0.5, y: cssH * 0.5 }
        originRef.current = null
        transition = { start: performance.now(), x: o.x, y: o.y, resolve }
        start()
      })

    let current = -1
    let preview = -1
    let pending: number | null = null
    let busy = false
    let introStart = -1
    let introDone = false

    const runQueue = async () => {
      if (busy) return
      busy = true
      try {
        while (!disposed) {
          if (pending !== null && pending !== current) {
            const target = pending
            pending = null
            const res = await load(target)
            if (disposed) return
            if (current === -1) {
              setSlot(0, target, res)
              current = target
              introStart = performance.now()
              start()
              callbacks.current.onReady()
            } else {
              if (preview !== target) {
                setSlot(1, target, res)
                preview = target
              }
              await runTransition()
              if (disposed) return
              // Dunia belakang kini sudah tepat di posisi dunia depan: tukar tanpa terlihat
              setSlot(0, target, res)
              current = target
              uniforms.uMix.value = 0
            }
            continue
          }
          // Siapkan lanskap berikutnya di dunia belakang
          const next = (current + 1) % scenes.length
          if (scenes.length < 2 || preview === next) break
          const res = await load(next)
          if (disposed) return
          if (pending !== null && pending !== current) continue
          setSlot(1, next, res)
          preview = next
          trim([current, next])
          break
        }
      } catch {
        if (!disposed) callbacks.current.onError()
      } finally {
        busy = false
      }
    }

    apiRef.current = {
      setActive: (i: number) => {
        pending = i
        runQueue()
      },
    }

    // Input kamera
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, last: -1e9 }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1)
      pointer.last = performance.now()
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Loop render (berhenti saat hero tertutup, tidak terlihat, atau tab disembunyikan)
    let raf = 0
    let running = false
    let visible = true
    let lastFrame = performance.now()
    const t0 = performance.now()

    const frame = (now: number) => {
      raf = 0
      if (!running) return
      const scroll = Math.min(1, Math.max(0, scrollRef.current))
      if (scroll >= 0.999 && !transition) {
        stop()
        return
      }
      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      const t = (now - t0) / 1000

      // Pindai 3D dulu; angin, bayangan awan, serbuk sari & goyang kamera menyusul
      const scanT = introStart < 0 ? 0 : Math.min(1, (now - introStart) / SCAN_MS)
      // Cepat di awal (sabana langsung terlihat), melambat saat menyapu langit
      const scan = scanT <= 0 ? 0 : 0.06 + 0.94 * (1 - Math.pow(1 - scanT, 1.6))
      uniforms.uScan.value = scan
      splats.visible = scan > 0 && scan < 1
      // Aset lain mulai muncul saat langit tinggal menajam, tidak menunggu ekor pindaian
      if (scanT >= 0.78 && !introDone) {
        introDone = true
        callbacks.current.onIntroDone()
      }
      const intro = introStart < 0 ? 0 : easeInOut(Math.min(1, Math.max(0, (now - introStart - SCAN_MS * 0.7) / INTRO_MS)))
      uniforms.uLife.value = intro
      uniforms.uFlat.value = introStart < 0 ? 0 : 1
      pUniforms.uOpacity.value = intro * 0.75
      // Kamera menengadah pelan mengikuti pindaian dari sabana ke langit
      const tilt = introStart < 0 ? 1 : 1 - easeInOut(scanT)

      // Transisi: dunia depan terurai jadi huruf lalu hilang sambil melewati kamera,
      // dunia belakang maju dari kedalamannya dan kabutnya menghilang
      let frontZ = 0
      let arrive = 0
      if (transition) {
        const k = Math.min(1, (now - transition.start) / TRANSITION_MS)
        setOrigin(transition.x, transition.y)
        uniforms.uMix.value = k * 0.75 + (0.5 - 0.5 * Math.cos(Math.PI * k)) * 0.25
        frontZ = FRONT_FLY * k * k
        arrive = easeInOut(k)
        if (k >= 1) {
          const done = transition.resolve
          transition = null
          frontZ = 0
          done()
        }
      }
      // Dunia belakang hanya perlu dirender selama transisi; frame terakhir (sebelum
      // lanskap ditukar) masih memakainya di posisi akhir agar tidak ada kedipan
      back.visible = uniforms.uMix.value > 0
      front.position.z = frontZ
      const backZ = -BACK_DIST * (1 - arrive)
      const apparent = BACK_APPARENT + (1 - BACK_APPARENT) * arrive
      const fill = (apparent * (CAM_DIST - backZ)) / CAM_DIST
      back.position.z = backZ
      back.scale.set(viewW * OVERSCAN * fill, viewH * OVERSCAN * fill, 1)
      uniforms.uFog.value = BACK_FOG * (1 - arrive)

      // Kamera: mouse di desktop, melayang pelan saat diam / di perangkat sentuh
      const idle = isTouch || now - pointer.last > 3500
      const cx = idle ? Math.sin(t * 0.19) * 0.55 : pointer.tx
      const cy = idle ? Math.sin(t * 0.15 + 1.3) * 0.4 : pointer.ty
      const ease = 1 - Math.exp(-dt * (idle ? 0.8 : 2.4))
      pointer.x += (cx - pointer.x) * ease
      pointer.y += (cy - pointer.y) * ease

      camera.position.set(
        pointer.x * SWAY.x * intro,
        pointer.y * SWAY.y * intro + scroll * 0.45 - tilt * 0.06,
        CAM_DIST - easeInOut(scroll) * 1.9,
      )
      camera.lookAt(0, scroll * 0.3 - tilt * 0.28, 0)

      // Tepi atas tirai konten (naik dari bawah layar) -> koordinat v di permukaan foto depan,
      // agar huruf ASCII selalu mendahului tepi tirai
      uniforms.uScroll.value = scroll
      if (scroll > 0) {
        camera.updateMatrixWorld()
        edgeRay.set(0, scroll * 2 - 1, 0.5).unproject(camera).sub(camera.position).normalize()
        const hit = (front.position.z - camera.position.z) / edgeRay.z
        uniforms.uEdgeV.value = 0.5 + (camera.position.y + edgeRay.y * hit) / (viewH * OVERSCAN)
      }

      uniforms.uTime.value = t
      pUniforms.uTime.value = t
      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !visible || document.hidden || current === -1) return
      running = true
      lastFrame = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(container)
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    // Frame berhenti sendiri saat hero tertutup penuh; scroll membangunkannya lagi
    const onScroll = () => start()
    window.addEventListener('scroll', onScroll, { passive: true })

    const onContextLost = (e: Event) => {
      e.preventDefault()
      stop()
      callbacks.current.onError()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      disposed = true
      stop()
      apiRef.current = null
      transition?.resolve()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      for (const res of loaded.values()) {
        res.image.dispose()
        res.depth.dispose()
      }
      loaded.clear()
      frontGeometry.dispose()
      frontMaterial.dispose()
      backGeometry.dispose()
      backMaterial.dispose()
      pGeo.dispose()
      pMat.dispose()
      splatGeo.dispose()
      splatMat.dispose()
      uniforms.uGlyphs.value.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    apiRef.current?.setActive(active)
  }, [active])

  return <div ref={containerRef} className={className} />
}
