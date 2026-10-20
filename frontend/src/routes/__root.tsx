import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
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
        title: 'KKN-PPM UGM Nawadaya Sumba | Kodi Bangedo, Sumba Barat Daya',
      },
      {
        name: 'description',
        content: 'Website Profil Resmi KKN-PPM UGM Nawadaya Sumba Periode 2 di Kecamatan Kodi Bangedo, Kabupaten Sumba Barat Daya.',
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
})

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
