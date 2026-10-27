import { useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * Gambar yang muncul dengan efek "decode" ASCII: sel-sel karakter mengacak, mengendap
 * menjadi ASCII dari bentuk gambarnya, lalu berganti menjadi gambar aslinya, menyapu
 * ke satu arah.
 *
 * mode "image": setelah terurai, gambar aslinya yang tampil (bisa diwarnai lewat `tint`).
 * mode "ascii": hasil akhirnya karakter ASCII yang dibentuk dari siluet gambar.
 *
 * `idle` menambah animasi tenang setelah gambar tampil, hanya selagi terlihat di layar:
 *  - "fall": karakter ASCII kecil berguguran pelan dari tepi bawah daun/kelopak
 *  - "shimmer": beberapa sel sesekali berkilau menjadi karakter lalu kembali
 */

const SCRAMBLE = '01<>/\\|=+*#%@$&?!:;{}[]'
const RAMP = '.:-=+*#%@'
const FALL_CHARS = "*+·:°o@%'*+·"
/** Lama satu sel mengacak sebelum mengendap (ms) */
const SCR_MS = 560
/** Lama sel memudar menjadi gambar asli (ms, mode image) */
const FADE_MS = 300
/** Lebar sel relatif terhadap tingginya (proporsi huruf monospace) */
const CELL_ASPECT = 0.62
/** Animasi idle dibatasi ±30 fps */
const IDLE_FRAME_MS = 33

type Idle = 'none' | 'fall' | 'shimmer'

/**
 * Arah "bawah layar" di koordinat lokal elemen. Aset sering diputar/dicerminkan
 * (rotate, scale, transform), jadi gravitasi karakter yang berguguran dihitung ulang
 * agar selalu jatuh ke bawah layar dan hurufnya tetap tegak.
 */
function screenDown(el: HTMLElement) {
  let m = new DOMMatrix()
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    const cs = getComputedStyle(node)
    const local = new DOMMatrix()
    if (cs.rotate && cs.rotate !== 'none') {
      const deg = cs.rotate.match(/(-?[\d.]+)deg/g)
      if (deg) local.rotateSelf(parseFloat(deg[deg.length - 1]))
    }
    if (cs.scale && cs.scale !== 'none') {
      const v = cs.scale.split(' ').map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)))
      local.scaleSelf(v[0], v[1] ?? v[0])
    }
    if (cs.transform && cs.transform !== 'none') local.multiplySelf(new DOMMatrix(cs.transform))
    m = local.multiply(m)
  }
  const inv = m.inverse()
  const o = inv.transformPoint({ x: 0, y: 0 })
  const d = inv.transformPoint({ x: 0, y: 1 })
  const gx = d.x - o.x
  const gy = d.y - o.y
  const len = Math.hypot(gx, gy) || 1
  return { x: gx / len, y: gy / len, mirror: m.a * m.d - m.b * m.c < 0 }
}

interface AsciiRevealProps {
  src: string
  /** Ukuran asli gambar, untuk rasio aspek tanpa layout shift */
  width: number
  height: number
  mode?: 'image' | 'ascii'
  /** Warnai gambar (mode image) dengan satu warna, mempertahankan tekstur alfanya */
  tint?: string
  idle?: Idle
  /** Hentikan animasi idle sementara (mis. elemen sticky yang sudah tertutup konten) */
  idlePaused?: boolean
  /** Tinggi sel karakter (px CSS) */
  cell?: number
  delay?: number
  duration?: number
  /** Arah sapuan di layar (y ke bawah), mis. [1, -1] = kiri-bawah ke kanan-atas */
  dir?: [number, number]
  /** Mulai animasi saat true */
  play?: boolean
  /** Setiap kali nilai ini berubah (setelah selesai), sebagian sel berkedip mengacak sebentar */
  glitchKey?: number | string
  /** Warna karakter di ujung sapuan */
  hot?: string
  /** Warna karakter (mode ascii, saat mengacak, dan idle); bawaan: warna tint atau putih */
  color?: string
  alt?: string
  className?: string
  style?: CSSProperties
  /** Dipanggil sekali saat animasi terurai selesai */
  onDone?: () => void
}

interface Layout {
  w: number
  h: number
  dpr: number
  cw: number
  ch: number
  cols: number
  rows: number
  /** Indeks sel (r * cols + c) yang terisi */
  cells: Int32Array
  cover: Float32Array
  start: Float32Array
  settled: Uint8Array
  /** Sel di tepi bawah bentuk (titik lepas karakter yang berguguran) */
  edges: Int32Array
  end: number
  mask: HTMLCanvasElement | null
  maskData: ImageData | null
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  amp: number
  freq: number
  phase: number
  size: number
  ch: string
  flipIn: number
  /** shimmer: indeks sel */
  k: number
}

const hash = (a: number, b: number, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return s - Math.floor(s)
}

// Gambar yang diwarnai disimpan sekali per (src, warna) dan dipakai bersama
const tintCache = new Map<string, HTMLCanvasElement>()
function tinted(img: HTMLImageElement, src: string, color: string) {
  const key = `${src}|${color}`
  let c = tintCache.get(key)
  if (!c) {
    c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = color
    ctx.fillRect(0, 0, c.width, c.height)
    tintCache.set(key, c)
  }
  return c
}

export default function AsciiReveal({
  src,
  width,
  height,
  mode = 'image',
  tint,
  idle = 'none',
  idlePaused = false,
  cell = 9,
  delay = 0,
  duration = 1600,
  dir = [1, -1],
  play = true,
  glitchKey,
  hot = '#ffe7b0',
  color,
  alt = '',
  className = '',
  style,
  onDone,
}: AsciiRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const idleRef = useRef<HTMLCanvasElement>(null)
  const glitchRef = useRef<(() => void) | null>(null)
  const kickIdleRef = useRef<(() => void) | null>(null)
  const idlePausedRef = useRef(idlePaused)
  idlePausedRef.current = idlePaused
  const [done, setDone] = useState(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const glyphColor = color ?? tint ?? '#ffffff'
  // Gambar berwarna ditampilkan lewat kanvas; tanpa tint cukup <img> biasa
  const canvasFinal = mode === 'image' && !!tint

  useEffect(() => {
    if (!play) return
    const wrap = wrapRef.current
    const base = baseRef.current
    const fx = fxRef.current
    if (!wrap || !base || !fx) return
    const bctx = base.getContext('2d')
    const fctx = fx.getContext('2d')
    if (!bctx || !fctx) return
    const idleCanvas = idleRef.current
    const ictx = idleCanvas?.getContext('2d') ?? null

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    let source: CanvasImageSource = img

    let layout: Layout | null = null
    // Ruang ekstra kanvas idle (fraksi ukuran gambar) & arah jatuh di koordinat lokal
    let pad = { l: 0, r: 0, t: 0, b: 0 }
    let down = { x: 0, y: 1, mirror: false }
    let raf = 0
    let t0 = 0
    let finished = false
    let disposed = false
    let glitch: { at: number; cells: Int32Array; start: Float32Array } | null = null

    const fontPx = (l: Layout, scale = 0.92) => `700 ${Math.round(l.ch * l.dpr * scale)}px Consolas, "Courier New", ui-monospace, monospace`

    const build = (): Layout | null => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return null
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const ch = cell
      const cw = cell * CELL_ASPECT
      if (idle === 'fall') down = screenDown(wrap)
      const cols = Math.ceil(w / cw)
      const rows = Math.ceil(h / ch)

      // Sampel tutupan tiap sel: turunkan resolusi bertahap agar rata-ratanya halus
      const mid = document.createElement('canvas')
      mid.width = cols * 4
      mid.height = rows * 4
      const mctx = mid.getContext('2d')!
      mctx.imageSmoothingQuality = 'high'
      mctx.drawImage(source, 0, 0, (w / cw) * 4, (h / ch) * 4)
      const gridC = document.createElement('canvas')
      gridC.width = cols
      gridC.height = rows
      const gctx = gridC.getContext('2d', { willReadFrequently: true })!
      gctx.imageSmoothingQuality = 'high'
      gctx.drawImage(mid, 0, 0, cols, rows)
      const px = gctx.getImageData(0, 0, cols, rows).data

      const grid = new Float32Array(cols * rows)
      const idx: number[] = []
      const cov: number[] = []
      const ord: number[] = []
      const len = Math.hypot(dir[0], dir[1]) || 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c
          const a = px[i * 4 + 3] / 255
          grid[i] = a
          if (a < (mode === 'ascii' ? 0.1 : 0.04)) continue
          idx.push(i)
          cov.push(a)
          ord.push((((c + 0.5) / cols) * dir[0] + ((r + 0.5) / rows) * dir[1]) / len)
        }
      }
      let lo = Infinity
      let hi = -Infinity
      for (const o of ord) {
        lo = Math.min(lo, o)
        hi = Math.max(hi, o)
      }
      const span = Math.max(duration - SCR_MS, 1)
      const start = new Float32Array(idx.length)
      let end = 0
      const edges: number[] = []
      for (let k = 0; k < idx.length; k++) {
        const c = idx[k] % cols
        const r = (idx[k] / cols) | 0
        const o = hi > lo ? (ord[k] - lo) / (hi - lo) : 0
        start[k] = delay + (o * 0.78 + hash(c, r) * 0.22) * span
        end = Math.max(end, start[k])
        const nc = c + Math.round(down.x)
        const nr = r + Math.round(down.y)
        const out = nc < 0 || nr < 0 || nc >= cols || nr >= rows
        if (cov[k] > 0.25 && (out || grid[nr * cols + nc] < 0.12)) edges.push(k)
      }

      base.width = fx.width = Math.round(w * dpr)
      base.height = fx.height = Math.round(h * dpr)
      if (idleCanvas) {
        if (idle === 'fall') {
          // Kanvas dilebarkan ke arah jatuhnya karakter saja
          const reach = 0.55
          pad = {
            l: 0.08 + Math.max(0, -down.x) * reach,
            r: 0.08 + Math.max(0, down.x) * reach,
            t: 0.04 + Math.max(0, -down.y) * reach,
            b: 0.04 + Math.max(0, down.y) * reach,
          }
        }
        const idpr = Math.min(dpr, 1.5)
        idleCanvas.style.left = `${-pad.l * 100}%`
        idleCanvas.style.top = `${-pad.t * 100}%`
        idleCanvas.style.width = `${(1 + pad.l + pad.r) * 100}%`
        idleCanvas.style.height = `${(1 + pad.t + pad.b) * 100}%`
        idleCanvas.width = Math.round(w * (1 + pad.l + pad.r) * idpr)
        idleCanvas.height = Math.round(h * (1 + pad.t + pad.b) * idpr)
      }

      let mask: HTMLCanvasElement | null = null
      let maskData: ImageData | null = null
      if (mode === 'image') {
        mask = document.createElement('canvas')
        mask.width = cols
        mask.height = rows
        maskData = new ImageData(cols, rows)
        maskData.data.fill(255)
        for (let i = 3; i < maskData.data.length; i += 4) maskData.data[i] = 0
      }

      return {
        w,
        h,
        dpr,
        cw,
        ch,
        cols,
        rows,
        cells: Int32Array.from(idx),
        cover: Float32Array.from(cov),
        start,
        settled: new Uint8Array(idx.length),
        edges: Int32Array.from(edges.length ? edges : idx.map((_, k) => k)),
        end: end + SCR_MS + FADE_MS,
        mask,
        maskData,
      }
    }

    const glyphAt = (l: Layout, k: number, ctx: CanvasRenderingContext2D, ch: string) => {
      const i = l.cells[k]
      const c = i % l.cols
      const r = (i / l.cols) | 0
      ctx.fillText(ch, (c + 0.5) * l.cw * l.dpr, r * l.ch * l.dpr)
    }
    // Karakter sesuai tutupan sel, digeser acak satu tingkat agar teksturnya tidak seragam
    const rampChar = (l: Layout, k: number) => {
      const i = Math.floor(l.cover[k] * RAMP.length) + Math.round((hash(l.cells[k], 7) - 0.5) * 2)
      return RAMP[Math.min(RAMP.length - 1, Math.max(0, i))]
    }

    const prepText = (l: Layout, ctx: CanvasRenderingContext2D) => {
      ctx.font = fontPx(l)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
    }

    // Hasil akhir mode ascii: semua karakter digambar sekali
    const drawFinalAscii = (l: Layout) => {
      bctx.clearRect(0, 0, base.width, base.height)
      prepText(l, bctx)
      bctx.fillStyle = glyphColor
      for (let k = 0; k < l.cells.length; k++) {
        bctx.globalAlpha = 0.6 + 0.4 * l.cover[k]
        glyphAt(l, k, bctx, rampChar(l, k))
      }
      bctx.globalAlpha = 1
    }

    // Hasil akhir gambar berwarna: digambar sekali ke kanvas dasar
    const drawFinalImage = () => {
      bctx.globalCompositeOperation = 'source-over'
      bctx.clearRect(0, 0, base.width, base.height)
      bctx.drawImage(source, 0, 0, base.width, base.height)
    }

    // ------------------------------------------------------------ animasi idle
    let parts: Particle[] = []
    let spawnAcc = 0
    let idleRaf = 0
    let idleLast = 0
    let inView = false

    const idleActive = () =>
      idle !== 'none' && finished && inView && !idlePausedRef.current && !document.hidden && !reduce && !disposed && !!ictx && !!layout

    const spawn = (l: Layout) => {
      if (idle === 'fall') {
        const k = l.edges[Math.floor(Math.random() * l.edges.length)]
        const i = l.cells[k]
        const c = i % l.cols
        const r = (i / l.cols) | 0
        parts.push({
          x: (c + 0.5) * l.cw + (Math.random() - 0.5) * l.cw,
          y: (r + 0.5) * l.ch,
          vx: (Math.random() - 0.5) * 6,
          vy: 8 + Math.random() * 10,
          age: 0,
          life: 3.8 + Math.random() * 3,
          amp: 4 + Math.random() * 8,
          freq: 0.45 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          size: 1.05 + Math.random() * 0.5,
          ch: FALL_CHARS[Math.floor(Math.random() * FALL_CHARS.length)],
          flipIn: 0.6 + Math.random() * 0.8,
          k,
        })
      } else {
        // shimmer: sel bertutupan cukup tebal sesekali berkilau
        let k = Math.floor(Math.random() * l.cells.length)
        for (let tries = 0; tries < 6 && l.cover[k] < 0.35; tries++) k = Math.floor(Math.random() * l.cells.length)
        parts.push({
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          age: 0,
          life: 0.9 + Math.random() * 0.7,
          amp: 0,
          freq: 0,
          phase: 0,
          size: 1,
          ch: SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)],
          flipIn: 0.35 + Math.random() * 0.2,
          k,
        })
      }
    }

    const idleTick = (now: number) => {
      idleRaf = 0
      if (!idleActive() || !ictx || !idleCanvas || !layout) {
        ictx?.clearRect(0, 0, idleCanvas?.width ?? 0, idleCanvas?.height ?? 0)
        parts = []
        return
      }
      idleRaf = requestAnimationFrame(idleTick)
      if (now - idleLast < IDLE_FRAME_MS) return
      const dt = Math.min((now - idleLast) / 1000, 0.1)
      idleLast = now
      const l = layout

      // Jumlah karakter disesuaikan dengan luas gambar; sengaja sedikit agar tenang
      const area = (l.w * l.h) / 60000
      const rate = idle === 'fall' ? Math.min(2.2, Math.max(0.7, area * 1.4)) : Math.min(2, Math.max(0.6, area * 1.2))
      const cap = idle === 'fall' ? 14 : 7
      spawnAcc += dt * rate
      while (spawnAcc >= 1) {
        spawnAcc -= 1
        if (parts.length < cap) spawn(l)
      }

      const idpr = idleCanvas.width / (l.w * (1 + pad.l + pad.r))
      const ox = l.w * pad.l
      const oy = l.h * pad.t
      ictx.clearRect(0, 0, idleCanvas.width, idleCanvas.height)
      ictx.textAlign = 'center'
      ictx.textBaseline = 'middle'
      const next: Particle[] = []
      for (const p of parts) {
        p.age += dt
        if (p.age >= p.life) continue
        next.push(p)
        p.flipIn -= dt
        if (idle === 'fall') {
          if (p.flipIn <= 0) {
            p.ch = FALL_CHARS[Math.floor(Math.random() * FALL_CHARS.length)]
            p.flipIn = 0.6 + Math.random() * 0.8
          }
          p.vy = Math.min(p.vy + 6 * dt, 30)
          // vy = kecepatan ke bawah layar, vx = hanyut ke samping layar
          p.x += (down.x * p.vy - down.y * p.vx) * dt
          p.y += (down.y * p.vy + down.x * p.vx) * dt
          const fadeIn = Math.min(1, p.age / 0.6)
          const out = Math.min(1, Math.max(0, (p.age - p.life * 0.45) / (p.life * 0.55)))
          ictx.globalAlpha = 0.9 * fadeIn * (1 - out * out)
          ictx.fillStyle = glyphColor
          ictx.font = `700 ${Math.round(l.ch * p.size * idpr)}px Consolas, "Courier New", ui-monospace, monospace`
          const sway = Math.sin(p.age * p.freq * Math.PI * 2 + p.phase) * p.amp
          const px = (p.x - down.y * sway + ox) * idpr
          const py = (p.y + down.x * sway + oy) * idpr
          ictx.save()
          ictx.translate(px, py)
          ictx.rotate(Math.atan2(-down.x, down.y))
          if (down.mirror) ictx.scale(-1, 1)
          ictx.fillText(p.ch, 0, 0)
          ictx.restore()
        } else {
          if (p.flipIn <= 0) {
            p.ch = rampChar(l, p.k)
            p.flipIn = Infinity
          }
          const i = l.cells[p.k]
          const c = i % l.cols
          const r = (i / l.cols) | 0
          ictx.globalAlpha = Math.sin((Math.PI * p.age) / p.life) * 0.75
          ictx.fillStyle = hot
          ictx.font = `700 ${Math.round(l.ch * 0.92 * idpr)}px Consolas, "Courier New", ui-monospace, monospace`
          ictx.fillText(p.ch, ((c + 0.5) * l.cw + ox) * idpr, ((r + 0.5) * l.ch + oy) * idpr)
        }
      }
      ictx.globalAlpha = 1
      parts = next
    }

    const kickIdle = () => {
      if (idleActive() && !idleRaf) {
        idleLast = performance.now()
        idleRaf = requestAnimationFrame(idleTick)
      }
    }
    kickIdleRef.current = kickIdle

    const finish = () => {
      finished = true
      onDoneRef.current?.()
      fctx.clearRect(0, 0, fx.width, fx.height)
      if (layout && mode === 'ascii') drawFinalAscii(layout)
      if (mode === 'image') {
        if (canvasFinal) drawFinalImage()
        else bctx.clearRect(0, 0, base.width, base.height)
        setDone(true)
      }
      kickIdle()
    }

    const frame = (now: number) => {
      raf = 0
      const l = layout
      if (!l || disposed) return
      const t = now - t0

      if (!finished) {
        // Lapisan dasar
        if (mode === 'image' && l.mask && l.maskData) {
          const d = l.maskData.data
          for (let k = 0; k < l.cells.length; k++) {
            const m = Math.min(1, Math.max(0, (t - l.start[k] - SCR_MS * 0.62) / FADE_MS))
            d[l.cells[k] * 4 + 3] = m * 255
          }
          l.mask.getContext('2d')!.putImageData(l.maskData, 0, 0)
          bctx.globalCompositeOperation = 'copy'
          bctx.imageSmoothingEnabled = false
          bctx.drawImage(l.mask, 0, 0, l.cols * l.cw * l.dpr, l.rows * l.ch * l.dpr)
          bctx.globalCompositeOperation = 'source-in'
          bctx.imageSmoothingEnabled = true
          bctx.drawImage(source, 0, 0, base.width, base.height)
          bctx.globalCompositeOperation = 'source-over'
        } else if (mode === 'ascii') {
          prepText(l, bctx)
          bctx.fillStyle = glyphColor
          for (let k = 0; k < l.cells.length; k++) {
            if (l.settled[k] || t < l.start[k] + SCR_MS) continue
            l.settled[k] = 1
            bctx.globalAlpha = 0.6 + 0.4 * l.cover[k]
            glyphAt(l, k, bctx, rampChar(l, k))
          }
          bctx.globalAlpha = 1
        }

        // Karakter yang sedang mengacak; pada mode image karakter mengendap jadi ASCII
        // dari bentuk gambarnya sebelum gambar aslinya muncul
        fctx.clearRect(0, 0, fx.width, fx.height)
        prepText(l, fctx)
        const tick = Math.floor(t / 55)
        for (let k = 0; k < l.cells.length; k++) {
          const p = (t - l.start[k]) / SCR_MS
          if (p < 0 || p >= 1.15) continue
          const i = l.cells[k]
          const a = l.cover[k]
          fctx.fillStyle = p < 0.3 ? hot : glyphColor
          const fade = mode === 'image' ? 1 - Math.min(1, Math.max(0, (p - 0.72) / 0.43)) : p < 1 ? 1 : 0
          fctx.globalAlpha = Math.min(1, p * 6) * fade * (0.45 + 0.55 * a)
          const settle = mode === 'image' && p >= 0.42
          glyphAt(l, k, fctx, settle ? rampChar(l, k) : SCRAMBLE[Math.floor(hash(i, tick) * SCRAMBLE.length)])
        }
        fctx.globalAlpha = 1

        if (t >= l.end + SCR_MS * 0.15) finish()
        else raf = requestAnimationFrame(frame)
        return
      }

      // Kedipan saat lanskap berganti
      if (glitch) {
        const g = glitch
        const gt = now - g.at
        fctx.clearRect(0, 0, fx.width, fx.height)
        prepText(l, fctx)
        const tick = Math.floor(gt / 50)
        let alive = false
        for (let n = 0; n < g.cells.length; n++) {
          const p = (gt - g.start[n]) / 340
          if (p >= 1) continue
          alive = true
          if (p < 0) continue
          const k = g.cells[n]
          fctx.fillStyle = p < 0.4 ? hot : glyphColor
          fctx.globalAlpha = (1 - p) * (0.5 + 0.5 * l.cover[k])
          glyphAt(l, k, fctx, SCRAMBLE[Math.floor(hash(l.cells[k], tick, 3) * SCRAMBLE.length)])
        }
        fctx.globalAlpha = 1
        if (alive) raf = requestAnimationFrame(frame)
        else {
          glitch = null
          fctx.clearRect(0, 0, fx.width, fx.height)
        }
      }
    }

    glitchRef.current = () => {
      const l = layout
      if (!l || !finished || reduce || disposed) return
      // ~14% sel, menyapu cepat searah reveal
      const pick: number[] = []
      for (let k = 0; k < l.cells.length; k++) if (Math.random() < 0.14) pick.push(k)
      const st = new Float32Array(pick.length)
      const span = l.end - SCR_MS - FADE_MS - delay || 1
      pick.forEach((k, n) => {
        st[n] = ((l.start[k] - delay) / span) * 520 + Math.random() * 120
      })
      glitch = { at: performance.now(), cells: Int32Array.from(pick), start: st }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const begin = () => {
      if (disposed) return
      if (tint && mode === 'image' && img.naturalWidth) source = tinted(img, src, tint)
      layout = build()
      if (!layout) return
      if (reduce) {
        finish()
        return
      }
      t0 = performance.now()
      raf = requestAnimationFrame(frame)
    }

    img
      .decode()
      .catch(() => undefined)
      .then(begin)

    // Ukuran berubah: bangun ulang grid; animasi lanjut dari waktunya sekarang
    const ro = new ResizeObserver(() => {
      if (!layout || disposed) return
      const next = build()
      if (!next) return
      layout = next
      parts = []
      if (finished) {
        if (mode === 'ascii') drawFinalAscii(next)
        else if (canvasFinal) drawFinalImage()
      } else if (!raf) raf = requestAnimationFrame(frame)
    })
    ro.observe(wrap)

    // Idle hanya berjalan selagi gambar terlihat dan tab aktif
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting
        kickIdle()
      },
      { rootMargin: '80px' },
    )
    if (idle !== 'none') io.observe(wrap)
    const onVisibility = () => kickIdle()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      glitchRef.current = null
      kickIdleRef.current = null
      if (raf) cancelAnimationFrame(raf)
      if (idleRaf) cancelAnimationFrame(idleRaf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, src, mode, tint, idle])

  // Lanjutkan idle saat jeda dilepas (saat dijeda, loop berhenti sendiri di frame berikutnya)
  useEffect(() => {
    if (!idlePaused) kickIdleRef.current?.()
  }, [idlePaused])

  const firstGlitch = useRef(true)
  useEffect(() => {
    if (firstGlitch.current) {
      firstGlitch.current = false
      return
    }
    glitchRef.current?.()
  }, [glitchKey])

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ aspectRatio: `${width} / ${height}`, ...style }}>
      {mode === 'image' && !canvasFinal && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          draggable={false}
          className="absolute inset-0 w-full h-full select-none"
          style={{ opacity: done ? 1 : 0 }}
        />
      )}
      <canvas
        ref={baseRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{ display: done && !canvasFinal ? 'none' : undefined }}
      />
      <canvas ref={fxRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />
      {idle !== 'none' && (
        <canvas ref={idleRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />
      )}
    </div>
  )
}
