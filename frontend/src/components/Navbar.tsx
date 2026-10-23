import React, { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Beranda', href: '/', isAvailable: true },
  { label: 'Anggota', href: '/anggota', isAvailable: true },
  { label: 'Program Kerja', href: '/proker', isAvailable: false },
  { label: 'Wisata Sumba', href: '/wisata', isAvailable: false },
  { label: 'Jurnal Cerita', href: '/cerita', isAvailable: false },
]

export default function Navbar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [currentPath])

  const isActive = (path: string) => currentPath === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-5xl bg-white/85 backdrop-blur-md pl-4 pr-2 py-2 rounded-full border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">

        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 no-underline group">
          <div className="w-8 h-8 rounded-full bg-[#3057a6] flex items-center justify-center text-white font-montserrat font-black text-xs group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-montserrat font-bold text-sm text-slate-900 leading-none">
              Nawadaya<span className="text-[#3057a6]">.</span>
            </span>
            <span className="font-inter text-[10.4px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
              KKN UGM Sumba
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-1 rounded-full">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`px-3.5 py-1.5 rounded-full font-inter text-xs leading-5 transition-colors duration-200 no-underline whitespace-nowrap ${active
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : item.isAvailable
                    ? 'text-slate-600 font-medium hover:text-slate-900 hover:bg-white/60'
                    : 'text-slate-400 font-medium hover:text-slate-600'
                  }`}
                title={item.isAvailable ? undefined : 'Halaman belum tersedia'}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/#guestbook"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#ffab2f] hover:bg-[#e69b2a] text-slate-900 font-inter font-semibold text-xs leading-5 px-4 py-1.5 rounded-full transition-all hover:-translate-y-0.5 no-underline whitespace-nowrap"
          >
            <span>Buku Tamu</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            className="lg:hidden w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="pointer-events-auto lg:hidden absolute top-[76px] left-4 right-4 max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200 shadow-2xl flex flex-col gap-1">
          <span className="text-[10.4px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-2 pb-1">
            Navigasi
          </span>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-inter text-sm font-semibold transition-colors no-underline ${active
                  ? 'bg-[#3057a6] text-white'
                  : item.isAvailable
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-50'
                  }`}
              >
                <span>{item.label}</span>
                {!item.isAvailable && (
                  <span className="text-[10.4px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full border border-slate-200 whitespace-nowrap">
                    Segera Hadir
                  </span>
                )}
              </Link>
            )
          })}
          <a
            href="/#guestbook"
            onClick={() => setMobileOpen(false)}
            className="sm:hidden mt-2 flex items-center justify-center gap-1.5 bg-[#ffab2f] hover:bg-[#e69b2a] text-slate-900 font-inter font-semibold text-sm py-3 rounded-full no-underline"
          >
            <span>Isi Buku Tamu & Doa</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  )
}
