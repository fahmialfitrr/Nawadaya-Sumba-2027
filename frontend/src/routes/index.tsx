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

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Sampul 3D (sticky): tetap diam sementara tirai di bawah naik menutupinya */}
      <HomeHero />

      {/* Tirai: section berikutnya tersusun seperti slide brand kit, dipisah celah gelap tipis */}
      <div className="relative z-10 w-full bg-ink-900 flex flex-col gap-2">
        <HomePlaceMarquee />
        <HomeAbout />
        <HomeSumbaGallery />
        <HomeProkerGrid />
        <HomeMapSection />
        <HomeArticles />
        <HomeQuoteBanner />
        <HomeGuestbook />
      </div>
    </div>
  )
}
