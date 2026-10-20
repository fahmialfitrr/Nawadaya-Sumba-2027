import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import { ScrambleText } from './ScrambleText'

interface ProkerItem {
  id: string
  title: string
  cluster: string
  category: string
  image: string
  description: string
  goals: string[]
  metrics: string
}

const FEATURED_PROKER: ProkerItem[] = [
  {
    id: 'pk-1',
    title: 'Instalasi PLTS Dermaga Pero',
    cluster: 'Saintek',
    category: 'Energi Terbarukan',
    image: '/hero_img.jpg',
    description: 'Pemasangan panel surya mandiri 1200Wp untuk penerangan aktivitas nelayan malam dan pompa air bersih desa.',
    goals: ['6 Titik lampu terpasang', 'Pemberdayaan 45 nelayan pesisir', 'Kemandirian energi malam'],
    metrics: '1200 Wp Daya Terpasang',
  },
  {
    id: 'pk-2',
    title: 'Pojok Baca & Kurasi Tenun Kodi',
    cluster: 'Soshum',
    category: 'Literasi & Budaya',
    image: '/images/ratenggaro.jpg',
    description: 'Penyediaan 300+ buku bacaan bergambar anak dusun dan digitalisasi storytelling motif tenun ikat mama Ratenggaro.',
    goals: ['45+ Anak binaan aktif', '15 Dokumentasi filosofi motif tenun', 'Kemitraan UMKM tenun'],
    metrics: '2 Pojok Baca Berdiri',
  },
  {
    id: 'pk-3',
    title: 'Aksi Bebas Stunting Balita',
    cluster: 'Medika',
    category: 'Kesehatan Masyarakat',
    image: '/images/kkn_community.jpg',
    description: 'Skrining antropometri balita, penyuluhan gizi daun kelor (Moringa oleifera), dan posyandu lansia desa terpadu.',
    goals: ['120+ Balita & lansia terperiksa', 'Demonstrasi MP-ASI kelor', 'Pelatihan kader posyandu'],
    metrics: '120+ Warga Terlayani',
  },
  {
    id: 'pk-4',
    title: 'Silase Pakan Ternak Kemarau',
    cluster: 'Agro',
    category: 'Peternakan Berkelanjutan',
    image: '/images/savana_sunset.jpg',
    description: 'Pelatihan fermentasi anaerob drum hijauan rumput gajah untuk stok nutrisi ternak kuda Sandalwood saat musim kemarau.',
    goals: ['15 Drum silase terfermentasi', 'Transfer teknologi ke 3 kelompok tani', 'Pencegahan bobot susut ternak'],
    metrics: '15 Drum Kapasitas 200L',
  },
  {
    id: 'pk-5',
    title: 'WebGIS Pemetaan Batas Dusun',
    cluster: 'Saintek',
    category: 'Spasial & Geodesi',
    image: '/hero_img.jpg',
    description: 'Perekaman koordinat batas dusun, infrastruktur desa, dan zonasi rawan kekeringan terintegrasi WebGIS interaktif.',
    goals: ['Peta digital skala 1:5000', 'Buku saku spasial pamong praja', 'Sosialisasi mitigasi bencana'],
    metrics: '7 Titik Dusun Terpetakan',
  },
  {
    id: 'pk-6',
    title: 'Pemberdayaan Bank Sampah Pesisir',
    cluster: 'Soshum',
    category: 'Lingkungan Hidup',
    image: '/images/weekuri.jpg',
    description: 'Edukasi pilah sampah anorganik di sekitar laguna Weekuri dan pantai Pero untuk menjaga kelestarian ekosistem bahari.',
    goals: ['Pembersihan berkala pesisir', 'Unit bank sampah dusun', 'Papan edukasi ramah turis'],
    metrics: '2 Titik Pilah Sampah',
  },
]

export default function HomeProkerGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedProker, setSelectedProker] = useState<ProkerItem | null>(null)

  const filtered = activeCategory === 'All'
    ? FEATURED_PROKER
    : FEATURED_PROKER.filter(p => p.cluster === activeCategory)

  return (
    <section id="projects" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      
      {/* Section Header (Safwan Projects style) */}
      <div className="flex flex-col items-center gap-4 text-center mb-12">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="font-montserrat font-bold text-[30px] sm:text-[40px] md:text-[54px] text-slate-900 leading-none">
            Program Kerja
          </span>
          <div className="bg-[#ea580c] border-2 border-[#c2410c] px-3.5 py-1 -rotate-1 rounded-sm shadow-[0_2px_8px_rgba(234,88,12,0.22)] inline-flex items-center">
            <span className="font-montserrat font-black text-white text-[28px] sm:text-[38px] md:text-[50px] leading-none tracking-tight">
              <ScrambleText text="Unggulan" />
            </span>
          </div>
        </div>
        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-xl">
          Solusi terintegrasi mahasiswa UGM lintas disiplin ilmu untuk mempercepat kemandirian warga Kodi Bangedo.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center items-center mt-2">
          {['All', 'Saintek', 'Soshum', 'Medika', 'Agro'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${
                activeCategory === cat
                  ? 'bg-slate-300/40 text-slate-900 font-semibold shadow-xs'
                  : 'hover:bg-slate-300/20 text-slate-600'
              } font-inter text-xs md:text-sm px-4 py-2 rounded-full transition-colors cursor-pointer`}
            >
              {cat === 'All' ? 'Semua Kluster' : cat}
            </button>
          ))}

          <Link
            to="/proker"
            className="bg-[#ffab2f] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs md:text-sm px-4 py-2 rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] flex items-center gap-1.5 hover:bg-[#e69b2a] hover:border-[#e69b2a] transition-all hover:-translate-y-0.5 no-underline shrink-0"
          >
            <span>Katalog Lengkap</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stacked Paper Card Grid (Safwan signature) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {filtered.map((item) => (
          <div key={item.id} className="relative group w-full h-full">
            
            {/* Background Paper 1 (Bottom-most) */}
            <div className="absolute inset-0 bg-slate-300 border border-slate-300 transition-all duration-500 ease-out origin-bottom-left rotate-[2deg] translate-x-1 group-hover:rotate-[4deg] group-hover:translate-x-2 group-hover:-translate-y-1 z-[-2] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]" />

            {/* Background Paper 2 (Middle) */}
            <div className="absolute inset-0 bg-slate-200 border border-slate-200 transition-all duration-500 ease-out origin-bottom-right -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 group-hover:-translate-y-0.5 z-[-1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]" />

            {/* Front Card */}
            <div className="bg-[#f9fafb] p-3 sm:p-4 pb-5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-shadow duration-500 ease-out border border-white relative z-10 h-full">
              
              <div className="space-y-3">
                {/* Image Box */}
                <div className="w-full aspect-[16/10] overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3057a6] text-white">
                    {item.cluster} • {item.category}
                  </span>
                </div>

                {/* Text Content */}
                <div className="px-1 space-y-1">
                  <h3 className="font-montserrat font-bold text-sm sm:text-base md:text-lg text-slate-800 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="font-montserrat font-normal text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Pill */}
              <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-200/80 px-1">
                <span className="text-[11px] font-semibold text-slate-500">
                  {item.metrics}
                </span>

                <button
                  onClick={() => setSelectedProker(item)}
                  type="button"
                  className="bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Detail</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProker && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img
                src={selectedProker.image}
                alt={selectedProker.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProker(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#fdde09] text-slate-900">
                Kluster {selectedProker.cluster}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-montserrat font-bold text-xl text-slate-900">
                  {selectedProker.title}
                </h3>
                <p className="font-inter text-xs text-slate-500 mt-0.5">
                  Kategori: {selectedProker.category} • Capaian: {selectedProker.metrics}
                </p>
              </div>

              <p className="font-inter text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedProker.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-montserrat font-bold text-xs text-slate-800 block">
                  Indikator Keberhasilan Program:
                </span>
                <ul className="space-y-1.5">
                  {selectedProker.goals.map((g, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProker(null)}
                  className="px-5 py-2 rounded-full bg-slate-900 text-white font-inter font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}
