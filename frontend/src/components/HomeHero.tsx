import React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import { Button } from './ui/Button'

export default function HomeHero() {
  const logosRow1 = [
    { name: 'UGM', src: '/source_image/Logo UGM.svg' },
    { name: 'Kodi Bangedo', src: '/source_image/Logo PIONIR.svg' },
    { name: 'KAGAMA', src: '/source_image/Logo GDGoC.svg' },
    { name: 'Saintek', src: '/source_image/Logo RDK.svg' },
    { name: 'Soshum', src: '/source_image/Logo PSG Putih.svg' },
    { name: 'Medika', src: '/source_image/Logo Palpod.svg' },
    { name: 'Agro', src: '/source_image/Logo BEM SV.svg' },
  ]

  const logosRow2 = [
    { name: 'Pemkab SBD', src: '/source_image/Logo KMTEDI.svg' },
    { name: 'DPkM UGM', src: '/source_image/Logo TGES.svg' },
    { name: 'Bank BPD NTT', src: '/source_image/Logo SkyBase.svg' },
    { name: 'Kompas Gramedia', src: '/source_image/Logo TED.svg' },
    { name: 'RRI Sumba', src: '/source_image/Logo Liga TRPL.svg' },
  ]

  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-b from-[#1da1f2] via-[#28a6ff] to-[#f4f5f7] relative z-0 overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[15%] left-[8%] w-[180px] h-[180px] md:w-[350px] md:h-[350px] bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[25%] right-[10%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-slate-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Content */}
      <section className="relative w-full pt-[120px] md:pt-[180px] pb-[40px] md:pb-[60px] flex flex-col items-center justify-center text-center px-4 md:px-6 z-10">
        
        {/* Top Tagline */}
        <p className="font-montserrat text-[13px] md:text-[20px] text-white font-semibold tracking-[0.3px] mb-2 [text-shadow:_0_1px_4px_rgb(0_0_0_/_35%)]">
          KKN-PPM UGM 2026 • <span className="font-bold">Kodi Bangedo, Sumba Barat Daya</span>
        </p>

        {/* Big Bold Headline with Scramble Text (Safwan signature) */}
        <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-x-[14px] gap-y-[2px] items-center text-[38px] sm:text-[52px] md:text-[72px] lg:text-[84px] text-white tracking-[0.2px] font-black leading-[1.1] mb-4 [text-shadow:_0_2px_8px_rgb(0_0_0_/_25%)]">
          <span className="font-montserrat font-bold">Pengabdian</span>
          <span className="font-doto font-black text-white bg-slate-900/25 px-4 py-0.5 rounded-2xl backdrop-blur-xs border border-white/30 shadow-xs">
            <ScrambleText text="Nawadaya" />
          </span>
          <span className="font-montserrat font-bold">Tanah Marapu</span>
        </div>

        {/* Subtitle */}
        <p className="font-montserrat font-medium text-[15px] sm:text-[20px] md:text-[24px] text-white max-w-3xl leading-relaxed tracking-[0.15px] mb-8 [text-shadow:_0_1px_4px_rgb(0_0_0_/_35%)]">
          Sinergi 30 Mahasiswa UGM lintas <span className="font-bold underline decoration-white decoration-2 underline-offset-4">Saintek</span>, <span className="font-bold underline decoration-white decoration-2 underline-offset-4">Soshum</span>, <span className="font-bold underline decoration-white decoration-2 underline-offset-4">Medika</span>, dan <span className="font-bold underline decoration-white decoration-2 underline-offset-4">Agro</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-[340px] sm:max-w-none">
          <Link to="/proker" className="no-underline w-full sm:w-auto">
            <Button
              variant="yellow"
              icon={ChevronDown}
              className="w-full sm:w-auto justify-center"
            >
              Eksplorasi Program Kerja
            </Button>
          </Link>
          <Link to="/anggota" className="no-underline w-full sm:w-auto">
            <Button
              variant="white"
              icon={ArrowUpRight}
              className="w-full sm:w-auto justify-center"
            >
              Bagan Anggota KKN
            </Button>
          </Link>
        </div>

      </section>

      {/* Hero Scenic Card with Horizon Transition */}
      <div className="w-full max-w-6xl px-4 relative mt-4 md:mt-8 z-10">
        <div className="w-full aspect-[21/9] sm:aspect-[2.5/1] rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white shadow-2xl relative bg-slate-900">
          <img
            src="/hero_img.jpg"
            alt="Lanskap Perbukitan dan Savana Sumba Barat Daya"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white text-left">
            <span className="text-[10px] sm:text-xs font-bold text-[#fdde09] uppercase tracking-widest block">
              Desa Tema Tana • Kecamatan Kodi Bangedo
            </span>
            <h3 className="font-montserrat font-bold text-base sm:text-xl md:text-2xl text-white">
              Harmoni Perubahan, Pengabdian Berkelanjutan
            </h3>
          </div>
        </div>
      </div>

      {/* Marquee Partner Logos (Double Row, moving left and right) */}
      <div className="w-full py-10 md:py-14 flex flex-col gap-4 overflow-hidden pointer-events-none">
        {/* Row 1 - Left */}
        <div className="relative flex w-full overflow-hidden">
          <div className="flex gap-[30px] md:gap-[50px] w-[max-content] animate-marquee-left items-center opacity-85">
            {[...logosRow1, ...logosRow1, ...logosRow1, ...logosRow1].map((logo, idx) => (
              <div key={`r1-${idx}`} className="h-[28px] md:h-[40px] px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full flex items-center justify-center shadow-xs">
                <span className="font-montserrat font-bold text-xs md:text-sm text-slate-700 whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right */}
        <div className="relative flex w-full overflow-hidden">
          <div className="flex gap-[30px] md:gap-[50px] w-[max-content] animate-marquee-right items-center opacity-85">
            {[...logosRow2, ...logosRow2, ...logosRow2, ...logosRow2].map((logo, idx) => (
              <div key={`r2-${idx}`} className="h-[28px] md:h-[40px] px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full flex items-center justify-center shadow-xs">
                <span className="font-montserrat font-bold text-xs md:text-sm text-slate-700 whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
