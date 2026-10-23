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

function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Sampul 3D (sticky): tetap diam sementara tirai di bawah naik menutupinya */}
      <HomeHero />

      {/* Tirai: seluruh konten berikutnya, bersudut bulat dengan bayangan ke arah sampul */}
      <div className="relative z-10 w-full overflow-clip rounded-t-[28px] md:rounded-t-[44px] bg-[#f4f5f7] shadow-[0_-30px_80px_-10px_rgba(2,6,23,0.6)]">
        <HomePlaceMarquee />

        {/* 01 Tentang */}
        <div className="w-full bg-dot-grid flex flex-col items-center overflow-x-clip">
          <HomeAbout />
        </div>

        {/* 02 Galeri Sumba: scroll vertikal menggeser foto horizontal */}
        <HomeSumbaGallery />

        {/* 03 Program kerja, 04 Peta, 05 Jurnal */}
        <div className="w-full bg-dot-grid flex flex-col items-center overflow-x-clip">
          <HomeProkerGrid />
          <HomeMapSection />
          <HomeArticles />
        </div>

        {/* Jeda: kutipan dengan foto parallax */}
        <HomeQuoteBanner />

        {/* 06 Buku tamu + kredit foto */}
        <div className="w-full bg-dot-grid flex flex-col items-center overflow-x-clip">
          <HomeGuestbook />
          <HomePhotoCredits />
        </div>
      </div>
    </div>
  )
}
