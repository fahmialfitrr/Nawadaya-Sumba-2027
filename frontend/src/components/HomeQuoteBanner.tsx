import { useRef } from 'react'
import { useInView } from 'framer-motion'
import AsciiReveal from './AsciiReveal'
import { AsciiBloom, BrandFrame, Ornament } from './Brand'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'

/** Jeda antar section ala slide judul brand kit: foto, bingkai peach, ornamen & kuda ASCII */
export default function HomeQuoteBanner() {
  const photo = SUMBA_PHOTOS.senjaSumba
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  return (
    <ScrollPhoto
      src={photo.src}
      alt={photo.alt}
      strength={14}
      reveal={false}
      className="w-full min-h-[76vh] md:min-h-[86vh] flex items-center isolate"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/35 to-slate-950/65" />
      <BrandFrame color="peach" className="absolute inset-1.5 sm:inset-2 z-[2]" />
      <AsciiBloom kind="flower" color="teal" className="absolute z-[2] left-[-2%] top-[-4%] w-[clamp(150px,19vw,320px)] -scale-x-100 -rotate-[20deg]" />
      <AsciiBloom kind="rose" color="yellow" dir={[-1, -1]} className="absolute z-[2] right-[-1%] bottom-[-4%] w-[clamp(130px,15vw,250px)] rotate-[170deg]" />

      <div ref={ref} className="relative z-10 w-full max-w-4xl mx-auto px-[clamp(44px,7vw,96px)] py-24 text-center">
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AsciiReveal
            src="/images/hero/horse.webp"
            width={928}
            height={1002}
            mode="image"
            cell={10}
            duration={2000}
            dir={[1, -1.2]}
            play={inView}
            idle="shimmer"
            className="shrink-0 h-[96%] opacity-20"
          />
        </div>
        <Reveal>
          <Ornament kind="divider" color="white" className="relative w-[min(440px,80%)] mx-auto mb-6 opacity-90" />
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="relative font-montserrat font-bold text-xl sm:text-2xl md:text-3xl text-white leading-[1.25] tracking-tight [text-shadow:_0_2px_18px_rgb(0_0_0_/_45%)]">
            “Di tanah seribu bukit ini, kami belajar bahwa mengabdi berarti <span className="text-brand-yellow">mendengar lebih dulu</span>, lalu berjalan bersama.”
          </blockquote>
        </Reveal>
        <Reveal delay={0.2}>
          <span className="relative block mt-6 font-mono text-xs uppercase tracking-[0.18em] text-white/80">— Tim KKN-PPM UGM Nawadaya Sumba</span>
        </Reveal>
      </div>
      <span className="absolute bottom-[clamp(16px,2.4vw,40px)] left-[clamp(44px,6vw,110px)] z-10 max-w-[52%] sm:max-w-none font-mono text-[10.4px] text-white/70">
        Foto: {photo.caption} — {photo.author}, {photo.license}
      </span>
    </ScrollPhoto>
  )
}
