import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { KKN_LOCATION, formatCoords } from '../data/places'

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-[#0b1220] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-14 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <span className="w-9 h-9 rounded-full bg-[#3057a6] flex items-center justify-center font-montserrat font-black text-xs">N</span>
            <span className="font-montserrat font-bold text-lg leading-none">
              Nawadaya<span className="text-[#fdde09]">.</span>
            </span>
          </Link>
          <p className="mt-4 font-inter text-xs text-white/60 leading-relaxed max-w-sm">
            Tim KKN-PPM Universitas Gadjah Mada Periode 2 tahun 2026, mengabdi bersama warga {KKN_LOCATION.desa}, Kota Tambolaka, Sumba Barat Daya.
          </p>
        </div>

        <div className="md:col-span-4">
          <h3 className="font-inter text-[10.4px] font-semibold uppercase tracking-[0.18em] text-[#fdde09] mb-3">Lokasi</h3>
          <address className="not-italic font-inter text-xs text-white/75 leading-relaxed">
            {KKN_LOCATION.desa}
            <br />
            {KKN_LOCATION.kecamatan}
            <br />
            {KKN_LOCATION.kabupaten}, {KKN_LOCATION.provinsi}
          </address>
          <p className="mt-2 font-inter text-[10.4px] text-white/40 tabular-nums">{formatCoords(KKN_LOCATION)}</p>
        </div>

        <nav className="md:col-span-3" aria-label="Tautan footer">
          <h3 className="font-inter text-[10.4px] font-semibold uppercase tracking-[0.18em] text-[#fdde09] mb-3">Jelajahi</h3>
          <ul className="space-y-2 font-inter text-xs">
            <li>
              <Link to="/" className="text-white/75 hover:text-white no-underline transition-colors">Beranda</Link>
            </li>
            <li>
              <Link to="/anggota" className="text-white/75 hover:text-white no-underline transition-colors">Anggota KKN</Link>
            </li>
            <li>
              <a href="/#guestbook" className="text-white/75 hover:text-white no-underline transition-colors">Buku Tamu</a>
            </li>
            <li>
              <a href="https://kkn.ugm.ac.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/75 hover:text-white no-underline transition-colors">
                KKN-PPM UGM <ArrowUpRight className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 font-inter text-[10.4px] text-white/45">
          <p>© {new Date().getFullYear()} Tim KKN-PPM UGM Nawadaya Sumba.</p>
          <p>Direktorat Pengabdian kepada Masyarakat (DPkM) Universitas Gadjah Mada</p>
        </div>
      </div>
    </footer>
  )
}
