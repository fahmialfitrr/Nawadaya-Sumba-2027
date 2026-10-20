import React, { useState, useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Member } from '../data/membersData'

interface ThreeDMemberCardProps {
  member: Member
}

const DEFAULT_CV_URL =
  'https://drive.google.com/file/d/1dERAkdjWsF8jG6lda6rb7cPX7UDnDH_8/view?usp=sharing'

export default function ThreeDMemberCard({ member }: ThreeDMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotationY, setRotationY] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const cvLink = member.cvUrl || DEFAULT_CV_URL
  const frontPhoto = member.photo || '/hipster.svg'
  const backPhoto = '/tes2.svg'

  // Siklus flip 1 arah lanjut saja (+180 deg terus menerus) hanya saat di-hover
  useEffect(() => {
    if (!isHovered) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Kembalikan ke sisi depan dengan putaran searah maju (tidak berbalik arah)
      setRotationY((prev) => {
        if (prev % 360 === 0) return prev
        return Math.ceil(prev / 360) * 360
      })
      return
    }

    // Setiap 2 detik putar 180 derajat searah terus menerus (1 arah lanjut, tidak bolak-balik)
    const interval = setInterval(() => {
      setRotationY((prev) => prev + 180)
    }, 2000)
    timerRef.current = interval

    return () => {
      clearInterval(interval)
      timerRef.current = null
    }
  }, [isHovered])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group w-full max-w-[265px] h-[375px] flex flex-col justify-between select-none hover:z-30 transition-all duration-300 [perspective:1000px] ${
        isHovered ? 'animate-card-jiggle' : ''
      }`}
    >
      {/* Safwan Style Stacked Paper Backdrops */}
      {/* Layer 1 (Bottom) */}
      <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl transition-all duration-500 ease-out origin-bottom-left rotate-[2.5deg] translate-x-1.5 group-hover:rotate-[5deg] group-hover:translate-x-3 group-hover:-translate-y-1.5 z-0 shadow-xs" />

      {/* Layer 2 (Middle) */}
      <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl transition-all duration-500 ease-out origin-bottom-right -rotate-[1.5deg] -translate-x-1.5 group-hover:-rotate-[3deg] group-hover:-translate-x-3 group-hover:-translate-y-1 z-0 shadow-xs" />

      {/* 3D Flip Container: 1 Arah Lanjut Terus Menerus */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: `rotateY(${rotationY}deg)`,
        }}
        className="w-full h-full relative z-10 transition-transform duration-700 ease-in-out"
      >
        {/* SISI DEPAN: Foto Hipster / Kasual (hipster.svg) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 bg-white p-2 rounded-2xl border border-white shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full"
        >
          <div className="w-full h-full relative rounded-xl bg-slate-100/70 flex items-center justify-center">
            {/* Top-Right Button: Link Google Drive CV */}
            <a
              href={cvLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Buka CV ${member.name}`}
              className="absolute top-2.5 right-2.5 z-40 inline-flex items-center gap-1 bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3 py-1 rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 no-underline cursor-pointer"
              title={`Buka CV ${member.name}`}
            >
              <span>CV</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-900" />
            </a>

            {/* Photo kasual (hipster.svg): Idle naik 15% (translate-y-[10%]), Hover turun 15% (group-hover:translate-y-[31%]) */}
            <div
              className="w-full h-full flex items-end justify-center pointer-events-none relative z-10 overflow-visible"
              style={{ clipPath: 'inset(-500px -500px 0px -500px round 0 0 14px 14px)' }}
            >
              <img
                src={frontPhoto}
                alt={member.name}
                className="w-full h-full object-contain object-bottom filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.10)] origin-bottom scale-[1.30] translate-y-[10%] transition-all duration-500 ease-out group-hover:scale-[2.30] group-hover:translate-y-[31%] group-hover:drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Nama & Prodi Pop-Up Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 pointer-events-none transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
                <span className="font-montserrat font-bold text-xs sm:text-[13px] text-white truncate max-w-full leading-snug">
                  {member.name}
                </span>
                <span className="font-inter text-[11px] text-slate-300 font-medium truncate max-w-full mt-0.5 leading-snug">
                  {member.major}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI BELAKANG: Foto Jas Almamater (almet.svg) - Skala Besar Timbul Keluar Frame */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 bg-white p-2 rounded-2xl border border-white shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full"
        >
          <div className="w-full h-full relative rounded-xl bg-slate-100/70 flex items-center justify-center">
            {/* Top-Right Button: Link Google Drive CV */}
            <a
              href={cvLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Buka CV ${member.name}`}
              className="absolute top-2.5 right-2.5 z-40 inline-flex items-center gap-1 bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3 py-1 rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 no-underline cursor-pointer"
              title={`Buka CV ${member.name}`}
            >
              <span>CV</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-900" />
            </a>

            {/* Photo tes2.svg: Scale down 20% (idle 0.62, hover 1.04) */}
            <div
              className="w-full h-full flex items-end justify-center pointer-events-none relative z-10 overflow-visible"
              style={{ clipPath: 'inset(-500px -500px 0px -500px round 0 0 14px 14px)' }}
            >
              <img
                src={backPhoto}
                alt={`${member.name} (Alternatif)`}
                className="w-full h-full object-contain object-bottom filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.10)] origin-bottom scale-[0.62] translate-y-[18%] transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:translate-y-[12%] group-hover:drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Nama & Prodi Pop-Up Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 pointer-events-none transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
                <span className="font-montserrat font-bold text-xs sm:text-[13px] text-white truncate max-w-full leading-snug">
                  {member.name}
                </span>
                <span className="font-inter text-[11px] text-slate-300 font-medium truncate max-w-full mt-0.5 leading-snug">
                  {member.major}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
