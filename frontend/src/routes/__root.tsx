import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'KKN-PPM UGM Nawadaya Sumba | Rada Mata, Tambolaka, Sumba Barat Daya',
      },
      {
        name: 'description',
        content: 'Website profil KKN-PPM UGM Nawadaya Sumba Periode 2 di Desa Rada Mata, Kecamatan Kota Tambolaka, Kabupaten Sumba Barat Daya, Nusa Tenggara Timur.',
      },
      {
        name: 'theme-color',
        content: '#3057a6',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/source_image/Logo UGM.svg',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 bg-dot-grid">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex flex-col items-center text-center">
        <span className="font-montserrat font-black text-[44px] sm:text-[56px] text-[#3057a6] tracking-tight mb-2">
          404
        </span>
        <h1 className="font-montserrat font-bold text-xl sm:text-2xl text-slate-800 mb-3">
          Halaman Belum Tersedia
        </h1>

        <p className="font-inter text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mb-8">
          Halaman ini belum dibuka untuk umum. Saat ini menu <span className="font-semibold text-slate-700">Beranda</span> dan <span className="font-semibold text-slate-700">Anggota KKN</span> yang dapat diakses.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-semibold text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0px_2px_4px_rgba(16,24,40,0.08)] transition-all hover:-translate-y-0.5 no-underline"
        >
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="font-inter antialiased min-h-screen flex flex-col justify-between bg-[#f4f5f7] text-[#0f172a] selection:bg-[#fdde09]/40 selection:text-slate-900 overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
