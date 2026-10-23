import type { ReactNode } from 'react'
import { ScrambleText } from './ScrambleText'
import { Reveal } from './ScrollPhoto'

interface SectionHeadingProps {
  index: string
  eyebrow: string
  lead: string
  highlight: string
  /** Warna kotak sorot & eyebrow */
  color: string
  border: string
  align?: 'left' | 'center'
  dark?: boolean
  children?: ReactNode
  className?: string
}

/** Judul section: nomor + eyebrow, judul 56px dengan satu kata di kotak sorot, lalu deskripsi */
export default function SectionHeading({
  index,
  eyebrow,
  lead,
  highlight,
  color,
  border,
  align = 'left',
  dark = false,
  children,
  className = '',
}: SectionHeadingProps) {
  const center = align === 'center'
  return (
    <Reveal className={`flex flex-col gap-4 ${center ? 'items-center text-center' : 'items-start'} ${className}`}>
      <span
        className="flex items-center gap-3 font-inter font-semibold text-xs uppercase tracking-[0.2em]"
        style={{ color: dark ? '#fdde09' : color }}
      >
        <span className="tabular-nums">{index}</span>
        <span className="w-8 h-px bg-current opacity-50" />
        <span>{eyebrow}</span>
      </span>
      <h2
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl leading-[1.1] tracking-tight ${center ? 'justify-center' : ''} ${dark ? 'text-white' : 'text-slate-900'}`}
      >
        <span>{lead}</span>
        <span
          className="text-white font-black px-3 py-1 -rotate-1 rounded-sm border-2"
          style={{ backgroundColor: color, borderColor: border, boxShadow: `0 2px 12px ${color}40` }}
        >
          <ScrambleText text={highlight} />
        </span>
      </h2>
      {children && (
        <p className={`font-inter text-sm leading-relaxed max-w-xl ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{children}</p>
      )}
    </Reveal>
  )
}
