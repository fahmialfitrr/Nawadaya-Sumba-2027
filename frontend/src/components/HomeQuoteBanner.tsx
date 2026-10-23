import React from 'react'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'

export default function HomeQuoteBanner() {
  const photo = SUMBA_PHOTOS.senjaSumba
  return (
    <ScrollPhoto
      src={photo.src}
      alt={photo.alt}
      strength={14}
      reveal={false}
      className="w-full min-h-[70vh] md:min-h-[80vh] flex items-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80" />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-24 text-center">
        <Reveal>
          <span className="font-inter font-semibold text-xs uppercase tracking-[0.2em] text-[#fdde09] block mb-6">
            Refleksi Pengabdian
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="font-montserrat font-bold text-xl sm:text-2xl md:text-3xl text-white leading-[1.25] tracking-tight [text-shadow:_0_2px_12px_rgb(0_0_0_/_35%)]">
            “Di tanah seribu bukit ini, kami belajar bahwa mengabdi berarti mendengar lebih dulu, lalu berjalan bersama.”
          </blockquote>
        </Reveal>
        <Reveal delay={0.2}>
          <span className="block mt-6 font-inter text-sm text-white/80">
            Tim KKN-PPM UGM Nawadaya Sumba
          </span>
        </Reveal>
      </div>
      <span className="absolute bottom-3 right-4 z-10 font-inter text-[10.4px] text-white/60">
        Foto: {photo.caption} — {photo.author}, {photo.license}
      </span>
    </ScrollPhoto>
  )
}
