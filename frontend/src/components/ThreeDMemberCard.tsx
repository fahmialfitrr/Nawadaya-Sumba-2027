import { useState, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Member } from '../data/membersData'

interface ThreeDMemberCardProps {
  member: Member
}

const DEFAULT_CV_URL =
  'https://drive.google.com/file/d/1dERAkdjWsF8jG6lda6rb7cPX7UDnDH_8/view?usp=sharing'

// Hanya properti yang dianimasikan lewat compositor (transform / opacity) agar
// hover tidak memicu repaint: tanpa filter drop-shadow, backdrop-blur, atau animasi box-shadow.
const PHOTO_CLASS =
  'w-full h-full object-contain object-bottom origin-bottom scale-[1.3] translate-y-[10%] transition-transform duration-500 ease-out group-hover:scale-[1.5] group-hover:translate-y-[22%] group-hover:will-change-transform'

interface FaceProps {
  member: Member
  photo: string
  cvLink: string
}

/** Satu sisi kartu. Foto dipotong (track matte) oleh kotak abu-abu bersudut rounded. */
function CardFace({ member, photo, cvLink }: FaceProps) {
  return (
    <>
      {/* Bayangan hover: lapisan statis yang hanya dianimasikan opacity-nya */}
      <div className="absolute inset-0 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Track matte: overflow-hidden + radius yang sama dengan kotak abu-abu */}
      <div className="w-full h-full relative rounded-xl bg-slate-100/70 overflow-hidden [isolation:isolate]">
        <a
          href={cvLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Buka CV ${member.name}`}
          className="absolute top-2.5 right-2.5 z-40 inline-flex items-center gap-1 bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3 py-1 rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors duration-200 no-underline cursor-pointer"
          title={`Buka CV ${member.name}`}
        >
          <span>CV</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-900" />
        </a>

        <div className="w-full h-full flex items-end justify-center pointer-events-none relative z-10">
          <img
            src={photo}
            alt={member.name}
            width={600}
            height={800}
            className={PHOTO_CLASS}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* Nama & prodi muncul saat hover (opacity + transform saja) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 pointer-events-none translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 ease-out">
          <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
            <span className="font-montserrat font-bold text-xs sm:text-[13.2px] text-white truncate max-w-full leading-snug">
              {member.name}
            </span>
            <span className="font-inter text-[10.4px] text-slate-300 font-medium truncate max-w-full mt-0.5 leading-snug">
              {member.major}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ThreeDMemberCard({ member }: ThreeDMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotationY, setRotationY] = useState(0)

  const cvLink = member.cvUrl || DEFAULT_CV_URL
  // Sisi depan dan belakang memakai foto yang sama
  const photo = member.photo || '/members/placeholder.svg'

  // Flip 1 arah (+180deg) tiap 2 detik, hanya berjalan selagi di-hover
  useEffect(() => {
    if (!isHovered) {
      // Kembali ke sisi depan dengan putaran searah maju (tidak berbalik arah)
      setRotationY((prev) => (prev % 360 === 0 ? prev : Math.ceil(prev / 360) * 360))
      return
    }

    const interval = setInterval(() => setRotationY((prev) => prev + 180), 2000)
    return () => clearInterval(interval)
  }, [isHovered])

  const faceClass =
    'absolute inset-0 bg-white p-2 rounded-2xl border border-white shadow-md flex flex-col justify-between h-full'

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group w-full max-w-[265px] h-[375px] flex flex-col justify-between select-none hover:z-30 [perspective:1000px] ${
        isHovered ? 'animate-card-jiggle' : ''
      }`}
    >
      {/* Stacked Paper Backdrops */}
      {/* Layer 1 (Bottom) */}
      <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl transition-transform duration-500 ease-out origin-bottom-left rotate-[2.5deg] translate-x-1.5 group-hover:rotate-[5deg] group-hover:translate-x-3 group-hover:-translate-y-1.5 z-0" />

      {/* Layer 2 (Middle) */}
      <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl transition-transform duration-500 ease-out origin-bottom-right -rotate-[1.5deg] -translate-x-1.5 group-hover:-rotate-[3deg] group-hover:-translate-x-3 group-hover:-translate-y-1 z-0" />

      {/* 3D Flip Container: 1 arah lanjut terus menerus */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: `rotateY(${rotationY}deg)`,
        }}
        className="w-full h-full relative z-10 transition-transform duration-700 ease-in-out"
      >
        {/* SISI DEPAN */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className={faceClass}
        >
          <CardFace member={member} photo={photo} cvLink={cvLink} />
        </div>

        {/* SISI BELAKANG: foto yang sama */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className={faceClass}
        >
          <CardFace member={member} photo={photo} cvLink={cvLink} />
        </div>
      </div>
    </div>
  )
}
