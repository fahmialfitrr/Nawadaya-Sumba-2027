import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useInView } from 'framer-motion'
import AsciiReveal from './AsciiReveal'
import { COLOR_HEX, type BrandColor } from '../data/theme'

/**
 * Komponen brand kit Nawadaya: bingkai ornamen berwarna palet, bunga ASCII,
 * ornamen tinted, judul script berpiksel, dan "slide" pembungkus section.
 */

/** Bingkai ornamen sampul, diwarnai sesuai palet (9-slice, sudut tidak gepeng) */
export function BrandFrame({ color, className = '', width }: { color: BrandColor; className?: string; width?: string }) {
  const style = { '--frame': `url('/images/brand/frame-${color}.webp')`, ...(width ? { '--frame-w': width } : {}) } as CSSProperties
  return <div aria-hidden="true" className={`brand-frame pointer-events-none ${className}`} style={style} />
}

const BLOOMS = {
  rose: { src: '/images/brand/bloom-rose.png', w: 277, h: 300 },
  garland: { src: '/images/brand/bloom-garland.png', w: 420, h: 276 },
  flower: { src: '/images/hero/flower.png', w: 250, h: 320 },
} as const

export type BloomKind = keyof typeof BLOOMS

/** Bunga dari karakter ASCII dengan warna palet; terurai saat masuk layar */
export function AsciiBloom({
  kind,
  color,
  cell = 9,
  delay = 0,
  dir = [1, 1],
  className = '',
  style,
}: {
  kind: BloomKind
  color: BrandColor
  cell?: number
  delay?: number
  dir?: [number, number]
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const b = BLOOMS[kind]
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} style={style}>
      <AsciiReveal
        src={b.src}
        width={b.w}
        height={b.h}
        mode="ascii"
        cell={cell}
        delay={delay}
        duration={1400}
        dir={dir}
        play={inView}
        color={COLOR_HEX[color]}
        className="w-full"
      />
    </div>
  )
}

const ORNAMENTS = {
  divider: { src: '/images/brand/divider.webp', w: 1200, h: 223 },
  corner: { src: '/images/brand/corner-halftone.webp', w: 900, h: 685 },
} as const

/** Ornamen (pembatas bunga, sudut halftone) yang diwarnai lewat CSS mask */
export function Ornament({ kind, color, className = '', style }: { kind: keyof typeof ORNAMENTS; color: BrandColor; className?: string; style?: CSSProperties }) {
  const o = ORNAMENTS[kind]
  return (
    <span
      aria-hidden="true"
      className={`tint-mask block pointer-events-none ${className}`}
      style={{ '--mask': `url('${o.src}')`, '--tint': COLOR_HEX[color], aspectRatio: `${o.w} / ${o.h}`, ...style } as CSSProperties}
    />
  )
}

// ---------------------------------------------------------------- judul script berpiksel

const scriptCache = new Map<string, Promise<{ url: string; w: number; h: number }>>()

/**
 * Tulisan script (Mea Culpa) digambar kecil lalu diperbesar tanpa penghalusan,
 * sehingga tepinya berpiksel seperti "Sumba" di wordmark.
 */
function renderPixelScript(text: string, color: string) {
  const key = `${text}|${color}`
  let p = scriptCache.get(key)
  if (!p) {
    p = (async () => {
      const LOW = 46
      const SCALE = 6
      const font = `${LOW}px "Mea Culpa", cursive`
      await document.fonts.load(font).catch(() => undefined)
      const c = document.createElement('canvas')
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.font = font
      const m = ctx.measureText(text)
      const pad = 4
      const left = Math.ceil(m.actualBoundingBoxLeft) + pad
      const asc = Math.ceil(m.actualBoundingBoxAscent) + pad
      const w = left + Math.ceil(m.actualBoundingBoxRight) + pad
      const h = asc + Math.ceil(m.actualBoundingBoxDescent) + pad
      c.width = w
      c.height = h
      ctx.font = font
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.3
      ctx.lineJoin = 'round'
      ctx.fillText(text, left, asc)
      ctx.strokeText(text, left, asc)
      // Ambang alfa: piksel tegas tanpa tepi halus
      const id = ctx.getImageData(0, 0, w, h)
      const d = id.data
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      for (let i = 0; i < d.length; i += 4) {
        const on = d[i + 3] >= 100
        d[i] = r
        d[i + 1] = g
        d[i + 2] = b
        d[i + 3] = on ? 255 : 0
      }
      ctx.putImageData(id, 0, 0)
      const big = document.createElement('canvas')
      big.width = w * SCALE
      big.height = h * SCALE
      const bctx = big.getContext('2d')!
      bctx.imageSmoothingEnabled = false
      bctx.drawImage(c, 0, 0, big.width, big.height)
      return { url: big.toDataURL('image/png'), w: big.width, h: big.height }
    })()
    scriptCache.set(key, p)
  }
  return p
}

/** Kata script berpiksel yang terurai dari ASCII saat masuk layar. Tinggi diatur lewat className. */
export function ScriptWord({ text, color, delay = 0, className = '' }: { text: string; color: string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const [img, setImg] = useState<{ url: string; w: number; h: number } | null>(null)

  useEffect(() => {
    let alive = true
    renderPixelScript(text, color).then((r) => alive && setImg(r))
    return () => {
      alive = false
    }
  }, [text, color])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`relative inline-block align-bottom ${className}`}
      style={img ? { aspectRatio: `${img.w} / ${img.h}` } : { aspectRatio: '3 / 1' }}
    >
      {img && (
        <AsciiReveal
          src={img.url}
          width={img.w}
          height={img.h}
          mode="image"
          cell={7}
          delay={delay}
          duration={1100}
          dir={[1, 0.25]}
          play={inView}
          className="absolute inset-0 w-full h-full"
        />
      )}
    </span>
  )
}

// ---------------------------------------------------------------- slide

export interface BloomSpec {
  kind: BloomKind
  color: BrandColor
  className: string
  cell?: number
  dir?: [number, number]
}

/**
 * Section bergaya slide brand kit: latar kertas bertekstur ASCII (atau foto dengan
 * panel kertas di dalamnya), bingkai ornamen berwarna, dan bunga ASCII di sudut.
 */
export function Slide({
  id,
  frame,
  tone = 'light',
  photo,
  blooms = [],
  className = '',
  children,
}: {
  id?: string
  frame: BrandColor
  tone?: 'light' | 'deep'
  photo?: string
  blooms?: BloomSpec[]
  className?: string
  children: ReactNode
}) {
  const surface = tone === 'light' ? 'bg-paper-ascii' : 'bg-deep-ascii'
  return (
    <section id={id} className={`relative isolate w-full overflow-hidden scroll-mt-16 ${tone === 'light' ? 'text-slate-900' : 'text-white'}`}>
      {photo ? (
        <>
          <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 -z-20 w-full h-full object-cover" />
          <div className={`absolute -z-10 inset-[clamp(12px,1.9vw,34px)] ${surface} opacity-[0.95]`} />
        </>
      ) : (
        <div className={`absolute inset-0 -z-20 ${surface}`} />
      )}

      {blooms.map((b, i) => (
        <AsciiBloom key={i} kind={b.kind} color={b.color} cell={b.cell} dir={b.dir} delay={i * 250} className={`absolute z-[1] ${b.className}`} />
      ))}

      <BrandFrame color={frame} className="absolute inset-1.5 sm:inset-2 z-[2]" />

      <div className={`relative z-[3] w-full px-[clamp(40px,7vw,128px)] py-[clamp(76px,9vw,144px)] ${className}`}>{children}</div>
    </section>
  )
}
