import type { ReactNode } from 'react'
import { Reveal } from './ScrollPhoto'
import { ScriptWord } from './Brand'
import { BRAND } from '../data/theme'

interface SectionHeadingProps {
  index: string
  eyebrow: string
  /** Kata sans di atas, seperti "Kluster" di slide brand kit */
  lead: string
  /** Kata script berpiksel di bawahnya */
  highlight: string
  /** Warna kata script */
  accent?: string
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  children?: ReactNode
  className?: string
}

/**
 * Judul section ala slide brand kit: label `[01] · EYEBROW`, kata sans tebal,
 * lalu kata script besar berpiksel yang terurai dari ASCII.
 */
export default function SectionHeading({
  index,
  eyebrow,
  lead,
  highlight,
  accent = BRAND.blue,
  tone = 'light',
  align = 'left',
  children,
  className = '',
}: SectionHeadingProps) {
  const center = align === 'center'
  const dark = tone === 'dark'
  return (
    <Reveal className={`flex flex-col ${center ? 'items-center text-center' : 'items-start'} ${className}`}>
      <span className={`flex items-center gap-2.5 font-mono font-medium text-[10.4px] md:text-xs uppercase tracking-[0.2em] mb-3 ${dark ? 'text-white/75' : 'text-slate-500'}`}>
        <span style={{ color: dark ? BRAND.yellow : accent }} className="font-bold">
          [{index}]
        </span>
        <span aria-hidden="true">·:·</span>
        <span>{eyebrow}</span>
      </span>
      <h2 className={`flex flex-col ${center ? 'items-center' : 'items-start'}`}>
        <span className="sr-only">
          {lead} {highlight}
        </span>
        <span aria-hidden="true" className={`font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl leading-none tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          {lead}
        </span>
        <ScriptWord
          text={highlight}
          color={accent}
          className={`h-[clamp(58px,8.4vw,112px)] -mt-[clamp(6px,0.9vw,14px)] ${center ? '' : 'ml-[clamp(10px,2vw,30px)]'} ${dark ? 'drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]' : ''}`}
        />
      </h2>
      {children && <p className={`font-inter text-sm leading-relaxed max-w-xl mt-4 ${dark ? 'text-white/75' : 'text-slate-600'}`}>{children}</p>}
    </Reveal>
  )
}
