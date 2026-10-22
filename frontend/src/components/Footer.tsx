import React from 'react'

export default function Footer() {
  return (
    <footer className="relative z-20 w-full flex flex-col items-center justify-center py-8 md:py-12 mt-20 border-t border-slate-300 bg-[#f1f5f9]">
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <p className="font-inter text-slate-500 text-xs sm:text-sm font-medium">
          © {new Date().getFullYear()} Tim KKN-PPM UGM Nawadaya Sumba. All rights reserved.
        </p>
        <p className="font-inter text-slate-400 text-[11px]">
          Kodi Bangedo, Kabupaten Sumba Barat Daya • Direktorat Pengabdian kepada Masyarakat (DPkM) UGM
        </p>
      </div>
    </footer>
  )
}
