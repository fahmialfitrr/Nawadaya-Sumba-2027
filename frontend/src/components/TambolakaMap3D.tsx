import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MapPin } from 'lucide-react'

/**
 * Peta 3D wilayah KKN (Desa Rada Mata & Kota Tambolaka) dari data nyata:
 * elevasi Terrain Tiles (SRTM) + garis pantai & jalan OpenStreetMap.
 * Satu mesh terrain + satu set garis + beberapa berkas cahaya: ringan, dirender
 * hanya saat terlihat.
 */

export interface MapPin3D {
  id: string
  name: string
  lat: number
  lon: number
  kind: 'kkn' | 'landmark'
}

interface Props {
  pins: MapPin3D[]
  selectedId: string
  onSelect: (id: string) => void
  onReady?: () => void
  onError: () => void
  className?: string
}

interface LineData {
  bbox: [number, number, number, number]
  maxElevation: number
  size: [number, number]
  classes: number[]
  lines: number[][]
}

const WORLD_H = 10
/** Pembesaran vertikal agar relief terbaca (relief asli ±490 m di bentang ±15 km) */
const EXAGGERATION = 3.6
const MAX_PINS = 6
const BG = new THREE.Color('#0c1b33')

const terrainVertex = /* glsl */ `
  uniform sampler2D uHeight;
  uniform float uElev;
  uniform float uRise;
  varying vec2 vUv;
  varying float vH;
  varying vec3 vWorld;

  float elev(vec2 uv) { float e = texture2D(uHeight, uv).r; return e * e; }
  float edgeFall(vec2 uv) { return smoothstep(0.0, 0.14, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y))); }

  void main() {
    vUv = uv;
    float h = elev(uv) * edgeFall(uv);
    vH = h;
    vec3 p = position;
    p.y += h * uElev * uRise;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const terrainFragment = /* glsl */ `
  uniform sampler2D uHeight;
  uniform vec2 uTexel;
  uniform vec2 uWorld;
  uniform float uElev;
  uniform float uRise;
  uniform float uMaxM;
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec4 uBbox;
  uniform vec4 uPins[${MAX_PINS}];
  uniform float uPinCount;
  varying vec2 vUv;
  varying float vH;
  varying vec3 vWorld;

  float elev(vec2 uv) { float e = texture2D(uHeight, uv).r; return e * e; }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Garis tipis anti-alias pada nilai berkala
  float isoLine(float v, float width) {
    float f = abs(fract(v - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, fwidth(v) * width, f);
  }

  void main() {
    float meters = vH * uMaxM;
    float land = texture2D(uHeight, vUv).g;

    // Hillshade dari normal permukaan (cahaya dari barat laut)
    float hL = elev(vUv - vec2(uTexel.x, 0.0));
    float hR = elev(vUv + vec2(uTexel.x, 0.0));
    float hD = elev(vUv - vec2(0.0, uTexel.y));
    float hU = elev(vUv + vec2(0.0, uTexel.y));
    float k = uElev * uRise;
    vec3 n = normalize(vec3(-(hR - hL) * k / (2.0 * uTexel.x * uWorld.x), 1.0, (hU - hD) * k / (2.0 * uTexel.y * uWorld.y)));
    vec3 L = normalize(vec3(-0.55, 0.75, -0.45));
    float diff = clamp(dot(n, L), 0.0, 1.0);

    // Daratan: navy gelap yang menghangat ke dataran tinggi
    vec3 low = vec3(0.11, 0.18, 0.27);
    vec3 high = vec3(0.27, 0.31, 0.33);
    vec3 landCol = mix(low, high, smoothstep(0.0, 460.0, meters)) * (0.5 + 0.85 * diff);
    float c25 = isoLine(meters / 25.0, 1.1) * smoothstep(3.0, 12.0, meters);
    float c100 = isoLine(meters / 100.0, 1.4) * smoothstep(3.0, 12.0, meters);
    landCol += vec3(0.55, 0.85, 0.9) * (c25 * 0.07 + c100 * 0.16) * uRise;

    // Laut: lebih terang di perairan dangkal dekat pantai, dengan kilau pelan
    vec3 seaCol = vec3(0.035, 0.08, 0.15) + vec3(0.02, 0.1, 0.13) * smoothstep(0.0, 0.5, land);
    vec2 cell = floor(vWorld.xz * 9.0);
    float sparkle = step(0.985, hash(cell)) * (0.5 + 0.5 * sin(uTime * 2.0 + hash(cell + 3.1) * 30.0));
    seaCol += vec3(0.35, 0.6, 0.7) * sparkle * 0.18;
    float foam = exp(-pow((land - 0.5) / 0.09, 2.0));

    vec3 col = mix(seaCol, landCol, smoothstep(0.42, 0.58, land));
    col += vec3(0.5, 0.86, 0.9) * foam * 0.22;

    // Kisi lintang/bujur tiap 0,02°
    float lon = mix(uBbox.x, uBbox.z, vUv.x);
    float lat = mix(uBbox.y, uBbox.w, vUv.y);
    float grid = max(isoLine(lon / 0.02, 1.0), isoLine(lat / 0.02, 1.0));
    col += vec3(1.0) * grid * 0.035;

    // Cincin berdenyut di titik wilayah KKN, halo lembut di titik penanda
    for (int i = 0; i < ${MAX_PINS}; i++) {
      if (float(i) >= uPinCount) break;
      vec4 p = uPins[i];
      float d = distance(vWorld.xz, p.xy);
      if (p.z > 0.5) {
        float t = fract(uTime * 0.32 + float(i) * 0.5);
        float ring = exp(-pow((d - t * 1.3) / 0.035, 2.0)) * (1.0 - t);
        col += vec3(0.99, 0.87, 0.04) * (ring * 0.55 + exp(-d * d * 9.0) * 0.18) * (0.6 + 0.4 * p.w) * uRise;
      } else {
        col += vec3(0.75, 0.85, 1.0) * exp(-d * d * 30.0) * (0.06 + 0.12 * p.w) * uRise;
      }
    }

    // Tepi peta memudar ke latar agar terrain terasa melayang
    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    col = mix(uBg, col, smoothstep(0.0, 0.1, e));
    gl_FragColor = vec4(col, 1.0);
  }
`

const lineVertex = /* glsl */ `
  attribute float aClass;
  uniform sampler2D uHeight;
  uniform vec2 uWorld;
  uniform float uElev;
  uniform float uRise;
  varying float vClass;
  varying float vEdge;

  void main() {
    vec2 uv = position.xy;
    float e = texture2D(uHeight, uv).r;
    float fall = smoothstep(0.0, 0.14, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
    vec3 p = vec3((uv.x - 0.5) * uWorld.x, e * e * fall * uElev * uRise + 0.012, -(uv.y - 0.5) * uWorld.y);
    vClass = aClass;
    vEdge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`

const lineFragment = /* glsl */ `
  uniform float uRise;
  varying float vClass;
  varying float vEdge;

  void main() {
    if (vEdge < 0.0) discard;
    vec4 c;
    if (vClass < 0.5) c = vec4(0.99, 0.87, 0.04, 0.85);       // jalan utama
    else if (vClass < 1.5) c = vec4(0.89, 0.92, 0.95, 0.42);  // jalan sekunder
    else if (vClass < 2.5) c = vec4(0.62, 0.7, 0.8, 0.14);    // jalan lingkungan
    else if (vClass < 3.5) c = vec4(1.0, 1.0, 1.0, 0.85);     // landasan pacu
    else c = vec4(0.5, 0.86, 0.9, 0.5);                       // garis pantai
    c.a *= smoothstep(0.0, 0.1, vEdge) * uRise;
    gl_FragColor = c;
  }
`

const beamVertex = /* glsl */ `
  varying float vY;
  void main() {
    vY = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vY;
  void main() {
    gl_FragColor = vec4(uColor, pow(1.0 - vY, 1.6) * uAlpha);
  }
`

/** Urutan prioritas label saat bertumpuk: terpilih, lalu wilayah KKN, lalu penanda */
let selectedForRank = ''
const rank = (p: { id: string; kind: MapPin3D['kind'] }) => (p.id === selectedForRank ? 2 : p.kind === 'kkn' ? 1 : 0)

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function TambolakaMap3D({ pins, selectedId, onSelect, onReady, onError, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const selectedRef = useRef(selectedId)
  selectedRef.current = selectedId
  const callbacks = useRef({ onReady, onError })
  callbacks.current = { onReady, onError }
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    kickRef.current()
  }, [selectedId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 block w-full h-full'
    canvas.setAttribute('aria-hidden', 'true')
    container.prepend(canvas)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
    } catch {
      canvas.remove()
      callbacks.current.onError()
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(BG, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)

    let disposed = false
    let raf = 0
    let running = false
    let visible = false
    let riseStart = -1
    const disposables: Array<{ dispose: () => void }> = []
    let pinWorld: Array<{ id: string; pos: THREE.Vector3; top: THREE.Vector3; kind: MapPin3D['kind'] }> = []
    let world = { w: WORLD_H, h: WORLD_H }
    let uniforms: Record<string, THREE.IUniform> | null = null
    const camTarget = new THREE.Vector3(0, 0.3, 0)
    const camGoal = new THREE.Vector3(0, 0.3, 0)
    // Pusat area kerja (rata-rata titik wilayah KKN)
    const focus = new THREE.Vector3()
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const t0 = performance.now()
    let last = t0

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      kick()
    }

    const frame = (now: number) => {
      raf = 0
      if (!running || !uniforms) return
      selectedForRank = selectedRef.current
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = (now - t0) / 1000
      const rise = riseStart < 0 ? 0 : easeInOut(Math.min(1, (now - riseStart) / 1800))
      uniforms.uRise.value = rise
      uniforms.uTime.value = t

      // Fokus kamera bergeser ke titik terpilih
      const sel = pinWorld.find((p) => p.id === selectedRef.current)
      if (sel) camGoal.set(focus.x + (sel.pos.x - focus.x) * 0.6, 0.35, focus.z + (sel.pos.z - focus.z) * 0.6)
      camTarget.lerp(camGoal, 1 - Math.exp(-dt * 2.2))
      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 3))
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 3))

      const fit = Math.max(1, 1.4 / camera.aspect)
      const dist = 8.2 * fit
      const az = (reduce ? 0 : Math.sin(t * 0.11) * 0.2) + pointer.x * 0.22
      const polar = THREE.MathUtils.degToRad(50 + pointer.y * 5 - (1 - rise) * 18)
      camera.position.set(
        camTarget.x + dist * Math.sin(polar) * Math.sin(az),
        camTarget.y + dist * Math.cos(polar),
        camTarget.z + dist * Math.sin(polar) * Math.cos(az),
      )
      camera.lookAt(camTarget)

      // Cincin & halo titik: posisi + status terpilih
      const arr = uniforms.uPins.value as THREE.Vector4[]
      pinWorld.forEach((p, i) => {
        arr[i].set(p.pos.x, p.pos.z, p.kind === 'kkn' ? 1 : 0, p.id === selectedRef.current ? 1 : 0)
      })

      renderer.render(scene, camera)

      // Label HTML di ujung berkas cahaya; label yang bertumpuk didorong ke atas
      const w = container.clientWidth
      const h = container.clientHeight
      const v = new THREE.Vector3()
      const order = [...pinWorld].sort((a, b) => rank(b) - rank(a))
      const placed: Array<{ l: number; r: number; t: number; b: number }> = []
      for (const p of order) {
        const el = labelRefs.current.get(p.id)
        if (!el) continue
        v.copy(p.top)
        v.y *= rise
        v.y = Math.max(v.y, p.pos.y * rise + 0.15)
        v.project(camera)
        const x = (v.x * 0.5 + 0.5) * w
        let y = (-v.y * 0.5 + 0.5) * h
        const lw = el.offsetWidth
        const lh = el.offsetHeight
        for (let guard = 0; guard < 8; guard++) {
          const box = { l: x - lw / 2, r: x + lw / 2, t: y - lh, b: y }
          const hit = placed.find((q) => box.l < q.r + 4 && box.r > q.l - 4 && box.t < q.b + 3 && box.b > q.t - 3)
          if (!hit) break
          y = hit.t - 4
        }
        placed.push({ l: x - lw / 2, r: x + lw / 2, t: y - lh, b: y })
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
        el.style.opacity = String(Math.min(1, rise * 1.5))
      }

      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !visible || document.hidden || !uniforms) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const kick = () => {
      if (!running && uniforms && visible) start()
    }
    kickRef.current = kick

    const onPointer = (e: PointerEvent) => {
      const r = container.getBoundingClientRect()
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1
      pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    const onLeave = () => {
      pointer.tx = 0
      pointer.ty = 0
    }
    container.addEventListener('pointermove', onPointer)
    container.addEventListener('pointerleave', onLeave)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        if (riseStart < 0 && uniforms) riseStart = performance.now()
        start()
      } else stop()
    })
    io.observe(container)
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onContextLost = (e: Event) => {
      e.preventDefault()
      stop()
      callbacks.current.onError()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    // Muat data lalu bangun adegan
    Promise.all([
      fetch('/data/tambolaka-lines.json').then((r) => {
        if (!r.ok) throw new Error('data peta')
        return r.json() as Promise<LineData>
      }),
      new THREE.TextureLoader().loadAsync('/data/tambolaka-terrain.png'),
    ])
      .then(([data, height]) => {
        if (disposed) {
          height.dispose()
          return
        }
        height.generateMipmaps = false
        height.minFilter = THREE.LinearFilter
        height.magFilter = THREE.LinearFilter
        height.wrapS = height.wrapT = THREE.ClampToEdgeWrapping
        disposables.push(height)

        const [W, S, E, N] = data.bbox
        const aspect = data.size[0] / data.size[1]
        world = { w: WORLD_H * aspect, h: WORLD_H }
        const kmPerUnit = ((N - S) * 110.6) / WORLD_H
        const elevScale = (data.maxElevation / 1000 / kmPerUnit) * EXAGGERATION

        uniforms = {
          uHeight: { value: height },
          uTexel: { value: new THREE.Vector2(1 / data.size[0], 1 / data.size[1]) },
          uWorld: { value: new THREE.Vector2(world.w, world.h) },
          uElev: { value: elevScale },
          uRise: { value: 0 },
          uMaxM: { value: data.maxElevation },
          uTime: { value: 0 },
          uBg: { value: BG },
          uBbox: { value: new THREE.Vector4(W, S, E, N) },
          uPins: { value: Array.from({ length: MAX_PINS }, () => new THREE.Vector4()) },
          uPinCount: { value: Math.min(MAX_PINS, pins.length) },
        }

        // Terrain
        const geo = new THREE.PlaneGeometry(world.w, world.h, 220, Math.round(220 / aspect))
        geo.rotateX(-Math.PI / 2)
        const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: terrainVertex, fragmentShader: terrainFragment })
        scene.add(new THREE.Mesh(geo, mat))
        disposables.push(geo, mat)

        // Jalan, landasan pacu, garis pantai
        const positions: number[] = []
        const classes: number[] = []
        data.lines.forEach((flat, li) => {
          const cls = data.classes[li]
          for (let i = 0; i + 3 < flat.length; i += 2) {
            positions.push(flat[i], flat[i + 1], 0, flat[i + 2], flat[i + 3], 0)
            classes.push(cls, cls)
          }
        })
        const lgeo = new THREE.BufferGeometry()
        lgeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        lgeo.setAttribute('aClass', new THREE.Float32BufferAttribute(classes, 1))
        const lmat = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: lineVertex,
          fragmentShader: lineFragment,
          transparent: true,
          depthWrite: false,
        })
        const lineMesh = new THREE.LineSegments(lgeo, lmat)
        lineMesh.frustumCulled = false
        scene.add(lineMesh)
        disposables.push(lgeo, lmat)

        // Titik: posisi di permukaan + berkas cahaya vertikal
        const img = height.image as HTMLImageElement
        const sampler = document.createElement('canvas')
        sampler.width = img.width
        sampler.height = img.height
        const sctx = sampler.getContext('2d', { willReadFrequently: true })!
        sctx.drawImage(img, 0, 0)
        const pixels = sctx.getImageData(0, 0, img.width, img.height).data
        const elevAt = (u: number, v: number) => {
          const px = Math.min(img.width - 1, Math.max(0, Math.round(u * (img.width - 1))))
          const py = Math.min(img.height - 1, Math.max(0, Math.round((1 - v) * (img.height - 1))))
          const r = pixels[(py * img.width + px) * 4] / 255
          return r * r * elevScale
        }
        pinWorld = pins.slice(0, MAX_PINS).map((p) => {
          const u = (p.lon - W) / (E - W)
          const v = (p.lat - S) / (N - S)
          const pos = new THREE.Vector3((u - 0.5) * world.w, elevAt(u, v), -(v - 0.5) * world.h)
          const beamH = p.kind === 'kkn' ? 0.85 : 0.45
          const bgeo = new THREE.CylinderGeometry(p.kind === 'kkn' ? 0.018 : 0.01, p.kind === 'kkn' ? 0.018 : 0.01, beamH, 8, 1, true)
          bgeo.translate(0, beamH / 2, 0)
          const bmat = new THREE.ShaderMaterial({
            uniforms: {
              uColor: { value: new THREE.Color(p.kind === 'kkn' ? '#fdde09' : '#dbeafe') },
              uAlpha: { value: p.kind === 'kkn' ? 0.9 : 0.55 },
            },
            vertexShader: beamVertex,
            fragmentShader: beamFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
          const beam = new THREE.Mesh(bgeo, bmat)
          beam.position.copy(pos)
          beam.onBeforeRender = () => {
            beam.scale.y = Math.max(0.001, uniforms!.uRise.value as number)
            beam.position.y = pos.y * (uniforms!.uRise.value as number)
          }
          scene.add(beam)
          disposables.push(bgeo, bmat)
          return { id: p.id, pos, top: pos.clone().add(new THREE.Vector3(0, beamH, 0)), kind: p.kind }
        })

        const kkn = pinWorld.filter((p) => p.kind === 'kkn')
        kkn.forEach((p) => focus.add(p.pos))
        if (kkn.length) focus.divideScalar(kkn.length)
        camTarget.set(focus.x, 0.35, focus.z)
        camGoal.copy(camTarget)

        resize()
        if (visible) riseStart = performance.now()
        if (reduce) riseStart = performance.now() - 5000
        callbacks.current.onReady?.()
        start()
      })
      .catch(() => {
        if (!disposed) callbacks.current.onError()
      })

    return () => {
      disposed = true
      stop()
      io.disconnect()
      ro.disconnect()
      container.removeEventListener('pointermove', onPointer)
      container.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className || 'relative'}`}>
      <div className="absolute inset-0 pointer-events-none">
        {pins.map((p) => {
          const on = p.id === selectedId
          return (
            <button
              key={p.id}
              ref={(el) => {
                if (el) labelRefs.current.set(p.id, el)
                else labelRefs.current.delete(p.id)
              }}
              type="button"
              onClick={() => onSelect(p.id)}
              aria-pressed={on}
              aria-label={`${p.name}${p.kind === 'kkn' ? ', wilayah KKN' : ', penanda'}`}
              style={{ opacity: 0 }}
              className={`pointer-events-auto absolute left-0 top-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-inter font-semibold transition-colors cursor-pointer ${
                p.kind === 'kkn' ? 'text-xs pl-1 pr-3 py-1' : 'text-[10.4px] pl-1 pr-2.5 py-0.5'
              } ${
                on
                  ? 'bg-[#fdde09] border-[#fdde09] text-slate-900 shadow-[0_0_24px_rgba(253,222,9,0.45)] z-10'
                  : p.kind === 'kkn'
                    ? 'bg-slate-950/80 border-[#fdde09]/60 text-white hover:bg-slate-900'
                    : 'bg-slate-950/70 border-white/15 text-white/85 hover:text-white'
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-full ${p.kind === 'kkn' ? 'w-5 h-5' : 'w-4 h-4'} ${
                  on ? 'bg-slate-900 text-[#fdde09]' : p.kind === 'kkn' ? 'bg-[#ffab2f] text-slate-900' : 'bg-[#3057a6] text-white'
                }`}
              >
                <MapPin className={p.kind === 'kkn' ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
              </span>
              {p.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
