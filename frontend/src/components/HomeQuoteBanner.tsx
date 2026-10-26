import { useRef } from 'react'
import { useInView } from 'framer-motion'
import AsciiReveal from './AsciiReveal'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'
import { SENJA } from '../data/theme'

/** Jeda antar section: foto parallax, bingkai ornamen sampul, dan kuda ASCII di belakang kutipan */
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
      className="w-full min-h-[76vh] md:min-h-[86vh] flex items-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-900/45 to-ink-900" />
      <div ref={ref} className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-20">
        <div className="ornate-frame relative">
          <div className="relative px-2 sm:px-8 py-10 md:py-14 text-center">
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
                className="shrink-0 h-[118%] opacity-25"
              />
            </div>
            <Reveal>
              <span className="relative font-mono font-medium text-[10.4px] md:text-xs uppercase tracking-[0.22em] text-senja-gold block mb-6">
                [ Refleksi Pengabdian ]
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="relative font-montserrat font-bold text-xl sm:text-2xl md:text-3xl text-cream leading-[1.25] tracking-tight [text-shadow:_0_2px_18px_rgb(11_18_32_/_60%)]">
                “Di tanah seribu bukit ini, kami belajar bahwa mengabdi berarti{' '}
                <span className="text-senja">mendengar lebih dulu</span>, lalu berjalan bersama.”
              </blockquote>
            </Reveal>
            <Reveal delay={0.2}>
              <span className="relative block mt-6 font-mono text-xs text-mist">— Tim KKN-PPM UGM Nawadaya Sumba</span>
            </Reveal>
          </div>
        </div>
      </div>
      <span className="absolute bottom-3 right-4 z-10 font-mono text-[10.4px]" style={{ color: `${SENJA.cream}99` }}>
        Foto: {photo.caption} — {photo.author}, {photo.license}
      </span>
    </ScrollPhoto>
  )
}
