import { useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * Gambar yang muncul dengan efek "decode" ASCII: sel-sel karakter mengacak lalu
 * mengendap menjadi gambarnya, menyapu ke satu arah.
 *
 * mode "image": setelah terurai, gambar aslinya yang tampil (canvas dilepas).
 * mode "ascii": hasil akhirnya karakter ASCII yang dibentuk dari siluet gambar.
 *
 * Kanvas hanya bergerak selama animasi; setelah selesai tidak ada render per frame.
 */

const SCRAMBLE = '01<>/\\|=+*#%@$&?!:;{}[]'
const RAMP = '.:-=+*#%@'
/** Lama satu sel mengacak sebelum mengendap (ms) */
const SCR_MS = 520
/** Lama sel memudar menjadi gambar asli (ms, mode image) */
const FADE_MS = 280
/** Lebar sel relatif terhadap tingginya (proporsi huruf monospace) */
const CELL_ASPECT = 0.62

interface AsciiRevealProps {
  src: string
  /** Ukuran asli gambar, untuk rasio aspek tanpa layout shift */
  width: number
  height: number
  mode?: 'image' | 'ascii'
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
  /** Warna karakter (mode ascii & saat mengacak) */
  color?: string
  alt?: string
  className?: string
  style?: CSSProperties
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
  end: number
  mask: HTMLCanvasElement | null
  maskData: ImageData | null
}

const hash = (a: number, b: number, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return s - Math.floor(s)
}

export default function AsciiReveal({
  src,
  width,
  height,
  mode = 'image',
  cell = 9,
  delay = 0,
  duration = 1600,
  dir = [1, -1],
  play = true,
  glitchKey,
  hot = '#ffe7b0',
  color = '#ffffff',
  alt = '',
  className = '',
  style,
}: AsciiRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const glitchRef = useRef<(() => void) | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!play) return
    const wrap = wrapRef.current
    const base = baseRef.current
    const fx = fxRef.current
    if (!wrap || !base || !fx) return
    const bctx = base.getContext('2d')
    const fctx = fx.getContext('2d')
    if (!bctx || !fctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = new Image()
    img.decoding = 'async'
    img.src = src

    let layout: Layout | null = null
    let raf = 0
    let t0 = 0
    let finished = false
    let disposed = false
    let glitch: { at: number; cells: Int32Array; start: Float32Array } | null = null

    const font = (l: Layout) => `700 ${Math.round(l.ch * l.dpr * 0.92)}px Consolas, "Courier New", ui-monospace, monospace`

    const build = (): Layout | null => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return null
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const ch = cell
      const cw = cell * CELL_ASPECT
      const cols = Math.ceil(w / cw)
      const rows = Math.ceil(h / ch)

      // Sampel tutupan tiap sel: turunkan resolusi bertahap agar rata-ratanya halus
      const mid = document.createElement('canvas')
      mid.width = cols * 4
      mid.height = rows * 4
      const mctx = mid.getContext('2d')!
      mctx.imageSmoothingQuality = 'high'
      mctx.drawImage(img, 0, 0, (w / cw) * 4, (h / ch) * 4)
      const grid = document.createElement('canvas')
      grid.width = cols
      grid.height = rows
      const gctx = grid.getContext('2d', { willReadFrequently: true })!
      gctx.imageSmoothingQuality = 'high'
      gctx.drawImage(mid, 0, 0, cols, rows)
      const px = gctx.getImageData(0, 0, cols, rows).data

      const idx: number[] = []
      const cov: number[] = []
      const ord: number[] = []
      const len = Math.hypot(dir[0], dir[1]) || 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c
          const a = px[i * 4 + 3] / 255
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
      for (let k = 0; k < idx.length; k++) {
        const c = idx[k] % cols
        const r = (idx[k] / cols) | 0
        const o = hi > lo ? (ord[k] - lo) / (hi - lo) : 0
        start[k] = delay + (o * 0.78 + hash(c, r) * 0.22) * span
        end = Math.max(end, start[k])
      }

      base.width = fx.width = Math.round(w * dpr)
      base.height = fx.height = Math.round(h * dpr)

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
      ctx.font = font(l)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
    }

    // Hasil akhir mode ascii: semua karakter digambar sekali
    const drawFinalAscii = (l: Layout) => {
      bctx.clearRect(0, 0, base.width, base.height)
      prepText(l, bctx)
      bctx.fillStyle = color
      for (let k = 0; k < l.cells.length; k++) {
        bctx.globalAlpha = 0.6 + 0.4 * l.cover[k]
        glyphAt(l, k, bctx, rampChar(l, k))
      }
      bctx.globalAlpha = 1
    }

    const finish = () => {
      finished = true
      fctx.clearRect(0, 0, fx.width, fx.height)
      if (layout && mode === 'ascii') drawFinalAscii(layout)
      if (mode === 'image') {
        bctx.clearRect(0, 0, base.width, base.height)
        setDone(true)
      }
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
            const m = Math.min(1, Math.max(0, (t - l.start[k] - SCR_MS * 0.55) / FADE_MS))
            d[l.cells[k] * 4 + 3] = m * 255
          }
          l.mask.getContext('2d')!.putImageData(l.maskData, 0, 0)
          bctx.globalCompositeOperation = 'copy'
          bctx.imageSmoothingEnabled = false
          bctx.drawImage(l.mask, 0, 0, l.cols * l.cw * l.dpr, l.rows * l.ch * l.dpr)
          bctx.globalCompositeOperation = 'source-in'
          bctx.imageSmoothingEnabled = true
          bctx.drawImage(img, 0, 0, base.width, base.height)
          bctx.globalCompositeOperation = 'source-over'
        } else if (mode === 'ascii') {
          prepText(l, bctx)
          bctx.fillStyle = color
          for (let k = 0; k < l.cells.length; k++) {
            if (l.settled[k] || t < l.start[k] + SCR_MS) continue
            l.settled[k] = 1
            bctx.globalAlpha = 0.6 + 0.4 * l.cover[k]
            glyphAt(l, k, bctx, rampChar(l, k))
          }
          bctx.globalAlpha = 1
        }

        // Karakter yang sedang mengacak
        fctx.clearRect(0, 0, fx.width, fx.height)
        prepText(l, fctx)
        const tick = Math.floor(t / 55)
        for (let k = 0; k < l.cells.length; k++) {
          const p = (t - l.start[k]) / SCR_MS
          if (p < 0 || p >= 1) continue
          const i = l.cells[k]
          const a = l.cover[k]
          fctx.fillStyle = p < 0.32 ? hot : color
          const fade = mode === 'image' ? 1 - Math.max(0, (p - 0.6) / 0.4) : 1
          fctx.globalAlpha = Math.min(1, p * 6) * fade * (0.4 + 0.6 * a)
          glyphAt(l, k, fctx, SCRAMBLE[Math.floor(hash(i, tick) * SCRAMBLE.length)])
        }
        fctx.globalAlpha = 1

        if (t >= l.end) finish()
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
          fctx.fillStyle = p < 0.4 ? hot : color
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
      if (finished) {
        if (mode === 'ascii') drawFinalAscii(next)
      } else if (!raf) raf = requestAnimationFrame(frame)
    })
    ro.observe(wrap)

    return () => {
      disposed = true
      glitchRef.current = null
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, src, mode])

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
      {mode === 'image' && (
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
        style={{ display: done ? 'none' : undefined }}
      />
      <canvas ref={fxRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />
    </div>
  )
}
