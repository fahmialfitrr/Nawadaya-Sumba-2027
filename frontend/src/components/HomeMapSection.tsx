import React, { useState } from 'react'
import { MapPin, Compass, ArrowUpRight } from 'lucide-react'
import { ScrambleText } from './ScrambleText'

interface Point {
  id: string
  name: string
  category: string
  distance: string
  coords: string
  desc: string
  image: string
  x: number
  y: number
}

const POINTS: Point[] = [
  {
    id: 'posko',
    name: 'Posko Utama Nawadaya',
    category: 'Posko Tim',
    distance: '0 km (Pusat Koordinasi)',
    coords: "9°35'21\" S, 119°03'44\" E",
    desc: 'Hunian 30 mahasiswa KKN di Desa Tema Tana, Kodi Bangedo. Pusat kegiatan pojok baca dan pelatihan pakan silase.',
    image: '/images/kkn_community.jpg',
    x: 30,
    y: 52,
  },
  {
    id: 'ratenggaro',
    name: 'Kampung Adat Ratenggaro',
    category: 'Situs Megalitikum',
    distance: '6.4 km dari Posko',
    coords: "9°38'15\" S, 118°58'24\" E",
    desc: 'Menara rumah adat Uma Kelada setinggi 20 meter dan kubur batu megalitikum. Lokasi program kurasi tenun ikat mama Sumba.',
    image: '/images/ratenggaro.jpg',
    x: 22,
    y: 65,
  },
  {
    id: 'weekuri',
    name: 'Laguna Danau Weekuri',
    category: 'Konservasi Bahari',
    distance: '14.2 km dari Posko',
    coords: "9°40'02\" S, 119°01'18\" E",
    desc: 'Danau air asin berair toska kristal yang dikelilingi karang laut. Wilayah studi salinitas air dan kebersihan pesisir.',
    image: '/images/weekuri.jpg',
    x: 35,
    y: 78,
  },
  {
    id: 'pero',
    name: 'Dermaga Pantai Pero',
    category: 'Pesisir Nelayan',
    distance: '5.1 km dari Posko',
    coords: "9°36'48\" S, 118°59'30\" E",
    desc: 'Pangkalan perahu nelayan tradisional. Titik pemasangan instalasi modul panel surya penerangan dermaga malam.',
    image: '/hero_img.jpg',
    x: 20,
    y: 45,
  },
]

export default function HomeMapSection() {
  const [selectedPoint, setSelectedPoint] = useState<Point>(POINTS[0])

  return (
    <section id="map" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center mb-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="font-montserrat font-bold text-[28px] sm:text-[40px] md:text-[50px] text-slate-900 leading-none">
            Sistem Informasi
          </span>
          <div className="bg-[#0891b2] border-2 border-[#0e7490] px-3.5 py-1 -rotate-1 rounded-sm shadow-[0_2px_8px_rgba(8,145,178,0.22)] inline-flex items-center">
            <span className="font-montserrat font-black text-white text-[26px] sm:text-[38px] md:text-[46px] leading-none tracking-tight">
              <ScrambleText text="Geografis" />
            </span>
          </div>
        </div>
        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-xl">
          Klik pin pada peta untuk melihat koordinat presisi dan program intervensi di setiap titik wilayah binaan.
        </p>
      </div>

      {/* Main Map Box in Safwan Paper Card Style */}
      <div className="relative group w-full">
        {/* Background Paper */}
        <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-3xl rotate-[1deg] translate-x-1 translate-y-1 z-[-1] shadow-sm" />

        {/* Front Panel */}
        <div className="bg-[#f9fafb] p-6 sm:p-8 rounded-3xl border border-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Map Canvas */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 relative min-h-[340px] flex items-center justify-center overflow-hidden border border-slate-800">
            <div className="absolute top-4 right-4 glass-pill px-3 py-1 rounded-xl text-[10px] text-slate-400 font-mono flex items-center gap-1.5 border border-white/10 bg-slate-800/80">
              <Compass className="w-3.5 h-3.5 text-[#fdde09]" />
              <span>SBD 9°S</span>
            </div>

            {/* Sumba Contour SVG */}
            <svg viewBox="0 0 500 300" className="w-full h-auto max-h-[260px] drop-shadow-xl select-none">
              <path
                d="M 50 140 Q 90 70 200 80 Q 320 90 440 180 Q 420 250 310 240 Q 200 230 110 220 Q 40 190 50 140 Z"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="2"
              />
              <path
                d="M 80 120 Q 140 100 210 110 Q 180 160 120 170 Z"
                fill="#0F172A"
                opacity="0.6"
              />
            </svg>

            {/* Interactive Pins */}
            {POINTS.map((pt) => {
              const isSelected = selectedPoint.id === pt.id
              return (
                <button
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  style={{ top: `${pt.y}%`, left: `${pt.x}%` }}
                  type="button"
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer group ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                  aria-label={pt.name}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    isSelected
                      ? 'bg-[#fdde09] border-white text-slate-900 ring-4 ring-[#fdde09]/40'
                      : 'bg-[#3057a6] border-white text-white'
                  }`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                    {pt.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right: Point Information Card */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-800 relative shadow-sm">
              <img
                src={selectedPoint.image}
                alt={selectedPoint.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3057a6] text-white">
                {selectedPoint.category}
              </span>
              <span className="absolute bottom-3 left-3 text-white font-montserrat font-bold text-base drop-shadow-sm">
                {selectedPoint.name}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-200 pb-2">
                <span>{selectedPoint.distance}</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedPoint.coords}</span>
              </div>
              <p className="font-inter text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedPoint.desc}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <span className="text-[11px] font-bold text-[#3057a6] flex items-center gap-1">
                <span>Terdata di Sistem Nawadaya</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}
