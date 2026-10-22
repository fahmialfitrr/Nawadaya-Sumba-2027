import { createFileRoute, redirect } from '@tanstack/react-router'
import HomeHero from '../components/HomeHero'
import HomeAbout from '../components/HomeAbout'
import HomeProkerGrid from '../components/HomeProkerGrid'
import HomeMapSection from '../components/HomeMapSection'
import HomeArticles from '../components/HomeArticles'
import HomeGuestbook from '../components/HomeGuestbook'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // ponytail: sementara hanya bagian anggota yang dibuka, redirect beranda ke /anggota
    throw redirect({
      to: '/anggota',
    })
  },
  component: HomePage,
})

function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. TOP SECTION (Hero with Sky Gradient + Scenic Frame + Double Marquee) */}
      <HomeHero />

      {/* 2. MAIN SECTIONS IN SAFWAN DOT-GRID CANVAS */}
      <div className="w-full bg-dot-grid flex flex-col items-center">
        {/* About Nawadaya (Safwan About style) */}
        <HomeAbout />

        {/* Selected Programs (Safwan Stacked Paper Cards) */}
        <HomeProkerGrid />

        {/* Interactive Geographic Information System */}
        <HomeMapSection />

        {/* Field Articles & Journals */}
        <HomeArticles />

        {/* Interactive Guestbook Form */}
        <HomeGuestbook />
      </div>
    </div>
  )
}
