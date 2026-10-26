import type { ReactNode } from 'react'
import { ScrambleText } from './ScrambleText'
import { Reveal } from './ScrollPhoto'

interface SectionHeadingProps {
  index: string
  eyebrow: string
  lead: string
  highlight: string
  align?: 'left' | 'center'
  children?: ReactNode
  className?: string
}

/**
 * Judul section bertema ASCII: label mono `[01] ·:· EYEBROW`, judul 56px dengan
 * satu kata bergradasi senja yang ter-"decode", lalu deskripsi.
 */
export default function SectionHeading({ index, eyebrow, lead, highlight, align = 'left', children, className = '' }: SectionHeadingProps) {
  const center = align === 'center'
  return (
    <Reveal className={`flex flex-col gap-4 ${center ? 'items-center text-center' : 'items-start'} ${className}`}>
      <span className="flex items-center gap-2.5 font-mono font-medium text-[10.4px] md:text-xs uppercase tracking-[0.2em] text-senja-gold">
        <span>[{index}]</span>
        <span aria-hidden="true" className="tracking-[0.05em] text-dusk">
          ·:·:·
        </span>
        <span>{eyebrow}</span>
      </span>
      <h2 className={`font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl leading-[1.08] tracking-tight text-cream ${center ? 'max-w-3xl' : ''}`}>
        {lead}{' '}
        <span className="text-senja whitespace-nowrap">
          <ScrambleText text={highlight} />
        </span>
      </h2>
      {children && <p className="font-inter text-sm leading-relaxed max-w-xl text-mist">{children}</p>}
    </Reveal>
  )
}
