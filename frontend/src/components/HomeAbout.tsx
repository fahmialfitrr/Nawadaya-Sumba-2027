import React, { useRef, useState, useEffect } from 'react'
import { MapPin, Mail, Globe } from 'lucide-react'
import { ScrambleText } from './ScrambleText'

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

function TypewriterText() {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let isCancelled = false
    const sequence = async () => {
      const wait = (ms: number) => new Promise(res => setTimeout(res, ms))
      const typeStr = async (str: string) => {
        for (let i = 1; i <= str.length; i++) {
          if (isCancelled) return
          setDisplayedText(str.slice(0, i))
          await wait(140)
        }
      }
      const deleteStr = async (str: string) => {
        for (let i = str.length; i >= 0; i--) {
          if (isCancelled) return
          setDisplayedText(str.slice(0, i))
          await wait(90)
        }
      }

      await typeStr('Sumba?')
      if (isCancelled) return
      await wait(1000)
      await deleteStr('Sumba?')
      if (isCancelled) return
      await wait(250)
      await typeStr('Nawadaya?')
    }

    sequence()
    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <span className="inline-flex items-center">
      {displayedText}
      <span className="w-[3px] md:w-[5px] h-[28px] sm:h-[40px] md:h-[60px] bg-[#f1f5f9] ml-1 inline-block typewriter-cursor" />
    </span>
  )
}

export default function HomeAbout() {
  const links = [
    { name: 'Posko Tema Tana, Kodi Bangedo', icon: MapPin, href: '#map' },
    { name: 'kkn.nawadaya.sumba@ugm.ac.id', icon: Mail, href: 'mailto:kkn.nawadaya.sumba@ugm.ac.id' },
    { name: '@kkn.nawadayasumba', icon: InstagramIcon, href: 'https://instagram.com' },
    { name: 'kkn.ugm.ac.id', icon: Globe, href: 'https://kkn.ugm.ac.id' },
  ]

  return (
    <section id="about" className="relative w-full py-16 md:py-28 px-4 sm:px-6 md:px-8 flex justify-center">
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
        
        {/* Left Column (Text Content, Safwan About style) */}
        <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 text-center lg:text-left">
          
          {/* Header Title with Primary Stabilo Blue Box */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center lg:justify-start">
            <span className="font-montserrat font-bold text-[32px] sm:text-[44px] md:text-[60px] text-slate-900 leading-none">
              Tentang
            </span>
            <div className="bg-[#2563eb] border-2 border-[#1d4ed8] flex items-center justify-center px-3 sm:px-4 py-1 sm:py-2 shadow-[0_2px_10px_rgba(37,99,235,0.25)] -rotate-1 rounded-sm">
              <span className="font-montserrat font-black text-2xl sm:text-3xl md:text-4xl text-white leading-none tracking-tight">
                <ScrambleText text="Nawadaya Sumba" />
              </span>
            </div>
          </div>

          {/* Quoted Body Text */}
          <p className="font-montserrat font-medium text-[14px] sm:text-[17px] md:text-[19px] text-slate-700 leading-[24px] sm:leading-[30px] md:leading-[34px] tracking-[0.15px]">
            "Kami adalah <span className="font-bold">30 mahasiswa Universitas Gadjah Mada</span> yang mengabdi di <span className="font-bold">Kecamatan Kodi Bangedo, Sumba Barat Daya</span>. Dengan memadukan 4 kluster keilmuan (<span className="font-bold text-[#16b8c5]">Saintek</span>, <span className="font-bold text-[#a2258d]">Soshum</span>, <span className="font-bold text-[#f05b6e]">Medika</span>, <span className="font-bold text-[#f78d66]">Agro</span>), misi kami adalah berjalan berdampingan bersama masyarakat untuk <span className="font-bold">membangun kemandirian energi surya, penguatan literasi anak dusun, ketahanan pakan ternak silase, dan perbaikan gizi keluarga</span>. Mari berkolaborasi bersama kami!"
          </p>

          {/* Key Links */}
          <div className="flex flex-col items-center lg:items-start gap-3 w-full pt-2">
            <h3 className="font-montserrat font-bold text-sm sm:text-base text-slate-700">
              Informasi Posko & Kontak Resmi:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-[#3057a6] transition-all no-underline group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#3057a6]/10 flex items-center justify-center text-[#3057a6] shrink-0 transition-colors">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="font-inter text-xs text-slate-700 group-hover:text-[#3057a6] transition-colors truncate">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (3D Identity Card Showcase) */}
        <div className="flex items-center justify-center lg:justify-end w-full">
          <div className="relative group w-full max-w-md">
            
            {/* Background Paper 1 */}
            <div className="absolute inset-0 bg-slate-300 border border-slate-300 transition-all duration-500 ease-out origin-bottom-left rotate-[3deg] translate-x-2 group-hover:rotate-[5deg] group-hover:translate-x-3 group-hover:-translate-y-1 z-[-2] shadow-sm rounded-2xl" />

            {/* Background Paper 2 */}
            <div className="absolute inset-0 bg-slate-200 border border-slate-200 transition-all duration-500 ease-out origin-bottom-right -rotate-[2deg] -translate-x-2 group-hover:-rotate-[3deg] group-hover:-translate-x-3 group-hover:-translate-y-0.5 z-[-1] shadow-sm rounded-2xl" />

            {/* Front Card */}
            <div className="bg-[#f9fafb] p-6 rounded-2xl border border-white shadow-xl flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#3057a6] text-white flex items-center justify-center font-bold text-xs">
                    UGM
                  </div>
                  <div>
                    <h4 className="font-montserrat font-bold text-sm text-slate-800">
                      KKN-PPM UGM SBD-02
                    </h4>
                    <p className="font-inter text-[10px] text-slate-500">Unit Sumba Barat Daya</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdde09] text-slate-900">
                  Periode 2 • 2026
                </span>
              </div>

              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="/images/kkn_community.jpg"
                  alt="Tim KKN Nawadaya Bersama Warga"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-montserrat font-bold">
                  Kodi Bangedo, SBD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Wilayah Binaan</span>
                  <strong className="text-slate-800 font-bold">7 Titik Desa</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Durasi Pengabdian</span>
                  <strong className="text-slate-800 font-bold">50 Hari Kerja</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
