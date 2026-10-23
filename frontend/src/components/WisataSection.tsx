import { useState } from 'react'
import { MapPin, Clock, ArrowUpRight, X, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import { TOURISM_DATA } from '../data/wisataData'

export interface TourismSpot {
  id: string
  name: string
  type: string
  location: string
  distance: string
  description: string
  highlights: string[]
  adatRules: string[]
  image: string
  bestTime: string
}

export default function WisataSection() {
  const spots: TourismSpot[] = TOURISM_DATA
  const loading = false
  const [selectedSpot, setSelectedSpot] = useState<TourismSpot | null>(null)

  return (
    <div className="w-full min-h-screen bg-dot-grid pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mb-12 space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center">
          <span className="font-montserrat font-bold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none">
            Eksplorasi
          </span>
          <div className="bg-[#0891b2] border-2 border-[#0e7490] flex items-center justify-center px-4 py-1.5 shadow-[0_2px_10px_rgba(8,145,178,0.22)] -rotate-1 rounded-sm">
            <span className="font-montserrat font-black text-[34.6px] sm:text-[44px] md:text-[56px] text-white leading-none tracking-tight">
              <ScrambleText text="Wisata Sumba" />
            </span>
          </div>
        </div>

        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
          Destinasi bahari eksotis, kampung adat megalitikum, serta panduan tata krama adat Marapu di sekitar wilayah binaan.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-[#3057a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-montserrat text-xs font-semibold">Memuat destinasi wisata...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {spots.map((spot) => (
            <div key={spot.id} className="relative group w-full h-full">
              {/* Stacked Paper Layers */}
              <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl rotate-[2deg] translate-x-1 group-hover:rotate-[3deg] group-hover:translate-x-2 transition-transform duration-300 z-[-2]" />
              <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 transition-transform duration-300 z-[-1]" />

              {/* Front Card */}
              <div className="bg-[#f9fafb] p-3.5 pb-4 rounded-2xl border border-white shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.4px] font-bold bg-[#3057a6] text-white">
                      {spot.type}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10.4px] font-bold bg-white/90 text-slate-800">
                      {spot.distance}
                    </span>
                  </div>

                  <div className="space-y-1 px-1">
                    <span className="text-[10.4px] font-bold text-slate-400 uppercase tracking-wider block">
                      {spot.location}
                    </span>
                    <h3 className="font-montserrat font-bold text-sm sm:text-base text-slate-800 line-clamp-1">
                      {spot.name}
                    </h3>
                    <p className="font-inter text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-auto border-t border-slate-200/80 flex items-center justify-between px-1">
                  <span className="text-[10.4px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#fdde09]" />
                    {spot.bestTime}
                  </span>

                  <button
                    onClick={() => setSelectedSpot(spot)}
                    type="button"
                    className="bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Panduan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Wisata */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img
                src={selectedSpot.image}
                alt={selectedSpot.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fdde09] text-slate-900 inline-block mb-1">
                  {selectedSpot.type} • {selectedSpot.distance}
                </span>
                <h3 className="font-montserrat font-bold text-lg text-white">
                  {selectedSpot.name}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-3.5 text-left">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#3057a6]" />
                  {selectedSpot.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#fdde09]" />
                  Waktu Terbaik: {selectedSpot.bestTime}
                </span>
              </div>

              <p className="font-inter text-xs text-slate-600 leading-relaxed">
                {selectedSpot.description}
              </p>

              {/* Highlights */}
              {selectedSpot.highlights && selectedSpot.highlights.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="font-montserrat font-bold text-xs text-slate-800 block">
                    Daya Tarik Utama:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSpot.highlights.map((h, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10.4px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Adat Rules */}
              {selectedSpot.adatRules && selectedSpot.adatRules.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="font-montserrat font-bold text-xs text-amber-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Tata Krama Adat Marapu yang Wajib Ditaati:
                  </span>
                  <ul className="space-y-1">
                    {selectedSpot.adatRules.map((r, idx) => (
                      <li key={idx} className="text-xs text-slate-600 list-disc list-inside">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="px-5 py-2 rounded-full bg-slate-900 text-white font-inter font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
