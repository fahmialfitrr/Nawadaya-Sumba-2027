import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion'
import { ASCII_GLYPHS, BRAND } from '../data/theme'

/**
 * Tirai ASCII di atas foto: sel-sel berwarna latar berubah jadi karakter lalu hilang,
 * menyapu diagonal + acak. Foto di bawahnya tetap bebas (parallax, object-cover).
 *
 * progress 0 = tertutup penuh, 1 = terbuka. Tanpa `progress`, tirai terbuka sendiri
 * saat masuk layar. Kanvas hanya digambar ulang saat progres berubah.
 */

interface AsciiVeilProps {
  progress?: MotionValue<number>
  /** Warna tirai, samakan dengan latar di sekitar foto */
  color?: string
  /** Warna karakter di ujung sapuan */
  glyph?: string
  /** Tinggi sel (px CSS) */
  cell?: number
  seed?: number
  delay?: number
  duration?: number
}

const BAND = 0.14

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16)
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 128
}

export default function AsciiVeil({
  progress,
  color = '#e6e9ef',
  glyph = BRAND.blue,
  cell = 14,
  seed = 1,
  delay = 0,
  duration = 1.2,
}: AsciiVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const own = useMotionValue(0)
  const reduce = useReducedMotion()
  const mv = progress ?? own

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    let thresholds = new Float32Array(0)
    let last = -1

    const rand = (i: number) => {
      const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
      return s - Math.floor(s)
    }

    // Karakter yang mulai padam: putih di tirai gelap, tinta di tirai terang
    const fade = isDark(color) ? '#f4f5f7' : '#0f172a'

    const draw = (raw: number) => {
      last = raw
      const p = raw * (1 + BAND)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.style.background = 'transparent'
      if (raw >= 1) {
        canvas.style.visibility = 'hidden'
        return
      }
      canvas.style.visibility = 'visible'
      const tick = Math.floor(performance.now() / 60)
      ctx.font = `700 ${Math.round(ch * 0.86)}px "JetBrains Mono", Consolas, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          const t = thresholds[i]
          if (p >= t + BAND) continue
          const px = Math.floor(x * cw)
          const py = Math.floor(y * ch)
          if (p < t) {
            ctx.fillStyle = color
            ctx.fillRect(px, py, Math.ceil(cw) + 1, Math.ceil(ch) + 1)
            continue
          }
          // Di pita sapuan: latar menipis, karakter menyala lalu ikut padam
          const k = (p - t) / BAND
          ctx.globalAlpha = 1 - k
          ctx.fillStyle = color
          ctx.fillRect(px, py, Math.ceil(cw) + 1, Math.ceil(ch) + 1)
          ctx.globalAlpha = 1 - k * 0.7
          ctx.fillStyle = k < 0.4 ? glyph : fade
          ctx.fillText(ASCII_GLYPHS[Math.floor(rand(i + tick * 13) * ASCII_GLYPHS.length)], px + cw / 2, py + ch / 2)
          ctx.globalAlpha = 1
        }
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      if (!w || !h) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      cols = Math.max(6, Math.round(w / (cell * 0.62)))
      rows = Math.max(4, Math.round(h / cell))
      cw = canvas.width / cols
      ch = canvas.height / rows
      thresholds = new Float32Array(cols * rows)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const diag = 0.7 * (x / Math.max(1, cols - 1)) + 0.3 * (1 - y / Math.max(1, rows - 1))
          thresholds[y * cols + x] = 0.62 * diag + 0.38 * rand(y * cols + x)
        }
      }
      draw(mv.get())
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    const unsub = mv.on('change', (p) => {
      if (Math.abs(p - last) > 0.002 || (p >= 1 && last < 1)) draw(p)
    })

    // Tanpa progress dari luar: buka otomatis sekali saat terlihat
    let io: IntersectionObserver | null = null
    let anim: { stop: () => void } | null = null
    if (!progress) {
      if (reduce) own.set(1)
      else {
        io = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return
            anim = animate(own, 1, { duration, delay, ease: [0.4, 0, 0.2, 1] })
            io?.disconnect()
          },
          { rootMargin: '0px 0px -12% 0px' },
        )
        io.observe(parent)
      }
    }

    return () => {
      ro.disconnect()
      unsub()
      io?.disconnect()
      anim?.stop()
    }
  }, [mv, progress, own, reduce, color, glyph, cell, seed, delay, duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: reduce ? 'transparent' : color }}
    />
  )
}
