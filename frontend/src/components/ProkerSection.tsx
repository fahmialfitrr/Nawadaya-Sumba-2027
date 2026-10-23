import { useState } from 'react'
import { Search, ArrowUpRight, X, CheckCircle2, MapPin, Calendar } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import { PROKER_DATA } from '../data/prokerData'

export interface Proker {
  id: string
  title: string
  cluster: string
  clusterName: string
  category: string
  location: string
  status: string
  progress: number
  targets: string
  timeline: string
  sdgs: string[]
  shortDesc: string
  fullDesc: string
  outputs: string[]
  impactMetrics: string
  images: string[]
}

export default function ProkerSection() {
  const prokers: Proker[] = PROKER_DATA
  const loading = false
  const [activeCluster, setActiveCluster] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProker, setSelectedProker] = useState<Proker | null>(null)

  const filtered = prokers.filter((p) => {
    const matchCluster = activeCluster === 'all' || p.cluster.toLowerCase() === activeCluster.toLowerCase()
    const matchSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCluster && matchSearch
  })

  return (
    <div className="w-full min-h-screen bg-dot-grid pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mb-12 space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center">
          <span className="font-montserrat font-bold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none">
            Katalog
          </span>
          <div className="bg-[#ea580c] border-2 border-[#c2410c] flex items-center justify-center px-4 py-1.5 shadow-[0_2px_10px_rgba(234,88,12,0.22)] -rotate-1 rounded-sm">
            <span className="font-montserrat font-black text-[34.6px] sm:text-[44px] md:text-[56px] text-white leading-none tracking-tight">
              <ScrambleText text="Program Kerja" />
            </span>
          </div>
        </div>

        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
          Dokumentasi aksi nyata dan inovasi multidisiplin mahasiswa KKN UGM di 7 dusun Kecamatan Kodi Bangedo.
        </p>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari program kerja..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-200/50 p-1 rounded-full">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'saintek', label: 'Saintek' },
              { id: 'soshum', label: 'Soshum' },
              { id: 'medika', label: 'Medika' },
              { id: 'agro', label: 'Agro' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCluster(tab.id)}
                type="button"
                className={`px-3.5 py-1.5 rounded-full font-inter text-xs transition-all cursor-pointer ${
                  activeCluster === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-[#3057a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-montserrat text-xs font-semibold">Memuat katalog program...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 max-w-sm">
          <p className="font-montserrat font-bold text-sm text-slate-700">Tidak ada program yang cocok</p>
          <p className="font-inter text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {filtered.map((proker) => (
            <div key={proker.id} className="relative group w-full h-full">
              {/* Stacked Paper Layers */}
              <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl rotate-[2deg] translate-x-1 group-hover:rotate-[3deg] group-hover:translate-x-2 transition-transform duration-300 z-[-2]" />
              <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 transition-transform duration-300 z-[-1]" />

              {/* Front Card */}
              <div className="bg-[#f9fafb] p-3.5 pb-4 rounded-2xl border border-white shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={proker.images[0] || '/hero_img.jpg'}
                      alt={proker.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.4px] font-bold bg-[#3057a6] text-white">
                      {proker.cluster}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10.4px] font-bold bg-white/90 text-slate-800">
                      {proker.status}
                    </span>
                  </div>

                  <div className="space-y-1 px-1">
                    <span className="text-[10.4px] font-bold text-slate-400 uppercase tracking-wider block">
                      {proker.category} • {proker.location}
                    </span>
                    <h3 className="font-montserrat font-bold text-sm sm:text-base text-slate-800 line-clamp-1">
                      {proker.title}
                    </h3>
                    <p className="font-inter text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {proker.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-auto border-t border-slate-200/80 flex items-center justify-between px-1">
                  <span className="text-[10.4px] font-semibold text-slate-500">
                    {proker.impactMetrics}
                  </span>

                  <button
                    onClick={() => setSelectedProker(proker)}
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
      )}

      {/* Modal Detail */}
      {selectedProker && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img
                src={selectedProker.images[0] || '/hero_img.jpg'}
                alt={selectedProker.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProker(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fdde09] text-slate-900 inline-block mb-1">
                  {selectedProker.cluster} • {selectedProker.category}
                </span>
                <h3 className="font-montserrat font-bold text-lg text-white">
                  {selectedProker.title}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-3.5 text-left">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#3057a6]" />
                  {selectedProker.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#fdde09]" />
                  {selectedProker.timeline}
                </span>
              </div>

              <p className="font-inter text-xs text-slate-600 leading-relaxed">
                {selectedProker.fullDesc || selectedProker.shortDesc}
              </p>

              {selectedProker.outputs && selectedProker.outputs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="font-montserrat font-bold text-xs text-slate-800 block">
                    Luaran / Output Program:
                  </span>
                  <ul className="space-y-1">
                    {selectedProker.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

    </div>
  )
}
