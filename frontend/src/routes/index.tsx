import { createFileRoute } from '@tanstack/react-router'
import HomeHero from '../components/HomeHero'
import HomePlaceMarquee from '../components/HomePlaceMarquee'
import HomeAbout from '../components/HomeAbout'
import HomeSumbaGallery from '../components/HomeSumbaGallery'
import HomeProkerGrid from '../components/HomeProkerGrid'
import HomeMapSection from '../components/HomeMapSection'
import HomeArticles from '../components/HomeArticles'
import HomeQuoteBanner from '../components/HomeQuoteBanner'
import HomeGuestbook from '../components/HomeGuestbook'
import HomePhotoCredits from '../components/HomePhotoCredits'

export const Route = createFileRoute('/')({
  component: HomePage,
})

/** Cahaya senja samar di belakang section (gradien radial statis, tanpa filter blur) */
function Glow({ className, color }: { className: string; color: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute -z-10 pointer-events-none ${className}`}
      style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }}
    />
  )
}

function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Sampul 3D (sticky): tetap diam sementara tirai di bawah naik menutupinya */}
      <HomeHero />

      {/* Tirai: seluruh konten berikutnya. Saat naik, sampul di belakangnya terurai jadi ASCII */}
      <div className="relative z-10 w-full">
        <div className="relative w-full overflow-clip bg-ascii text-cream">
          <HomePlaceMarquee />

          {/* 01 Tentang */}
          <div className="relative isolate w-full flex flex-col items-center overflow-x-clip">
            <Glow className="w-[52rem] h-[36rem] -left-72 top-10" color="rgba(242,122,114,0.09)" />
            <HomeAbout />
          </div>

          {/* 02 Galeri Sumba: scroll vertikal menggeser foto horizontal */}
          <HomeSumbaGallery />

          {/* 03 Program kerja, 04 Peta, 05 Jurnal */}
          <div className="relative isolate w-full flex flex-col items-center overflow-x-clip">
            <Glow className="w-[56rem] h-[40rem] -right-80 top-24" color="rgba(155,134,224,0.1)" />
            <Glow className="w-[50rem] h-[36rem] -left-72 top-[50%]" color="rgba(99,199,201,0.07)" />
            <HomeProkerGrid />
            <HomeMapSection />
            <HomeArticles />
          </div>

          {/* Jeda: kutipan dalam bingkai ornamen */}
          <HomeQuoteBanner />

          {/* 06 Buku tamu + kredit foto */}
          <div className="relative isolate w-full flex flex-col items-center overflow-x-clip">
            <Glow className="w-[52rem] h-[34rem] left-1/2 -translate-x-1/2 top-0" color="rgba(255,171,47,0.07)" />
            <HomeGuestbook />
            <HomePhotoCredits />
          </div>
        </div>
      </div>
    </div>
  )
}
