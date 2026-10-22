import React, { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowUpRight, Menu, X } from 'lucide-react'

export default function Navbar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Beranda', href: '/beranda', isAvailable: false },
    { label: 'Anggota', href: '/anggota', isAvailable: true },
    { label: 'Program Kerja', href: '/proker', isAvailable: false },
    { label: 'Wisata Sumba', href: '/wisata', isAvailable: false },
    { label: 'Jurnal Cerita', href: '/cerita', isAvailable: false },
  ]

  const isActive = (path: string) => {
    return currentPath === path
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4 px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-3 bg-[#f8fafc]/90 backdrop-blur-md px-3 py-2 rounded-full border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] max-w-4xl w-full">
        
        {/* Brand / Logo */}
        <Link to="/anggota" className="flex items-center gap-2 pl-2 no-underline group">
          <div className="w-7 h-7 rounded-full bg-[#3057a6] flex items-center justify-center text-white font-montserrat font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-montserrat font-bold text-xs sm:text-sm text-slate-800 leading-none">
              Nawadaya<span className="text-[#3057a6]">.</span>
            </span>
            <span className="font-inter text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              KKN UGM Sumba
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 p-1 rounded-full">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`relative px-4 py-1.5 rounded-full font-inter text-xs md:text-sm transition-all duration-200 no-underline whitespace-nowrap ${
                  active
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : item.isAvailable === false
                    ? 'text-slate-400 hover:text-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                title={item.isAvailable === false ? 'Halaman belum tersedia (404)' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2 pr-1">
          <Link
            to="/cerita"
            className="hidden sm:inline-flex items-center gap-1.5 bg-slate-200/90 hover:bg-slate-300 border border-slate-200 text-slate-500 font-inter font-medium text-xs md:text-sm px-4 py-1.5 rounded-full shadow-2xs transition-all hover:-translate-y-0.5 no-underline"
            title="Halaman belum tersedia (404)"
          >
            <span>Buku Tamu</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            className="md:hidden w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
            Navigasi Website
          </span>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-2xl font-inter text-sm font-semibold transition-all no-underline ${
                  active
                    ? 'bg-[#3057a6] text-white shadow-sm'
                    : item.isAvailable === false
                    ? 'text-slate-400 hover:text-slate-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.isAvailable === false && (
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                      Belum Tersedia
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-slate-100 mt-1">
            <Link
              to="/cerita"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-200 text-slate-500 font-inter font-medium text-sm py-3 rounded-full shadow-2xs no-underline"
            >
              <span>Isi Buku Tamu & Doa</span>
              <ArrowUpRight className="w-4 h-4 opacity-60" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
