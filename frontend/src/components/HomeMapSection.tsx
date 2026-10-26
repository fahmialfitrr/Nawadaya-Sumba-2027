import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, MapPin } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal } from './ScrollPhoto'
import { Slide } from './Brand'
import { BRAND } from '../data/theme'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { PLACES, distanceFromKkn, formatCoords, type Place } from '../data/places'
import { LOCATOR_PATHS, LOCATOR_VIEW, projectLocator } from '../data/sumbaGeo'
import type { MapPin3D } from './TambolakaMap3D'

const TambolakaMap3D = lazy(() => import('./TambolakaMap3D'))

interface MapPoint {
  id: string
  name: string
  kind: MapPin3D['kind']
  category: string
  kecamatan?: string
  place: Place
  photo?: SumbaPhoto
  /** Bangunan yang dipakai sebagai titik di peta */
  anchor: string
  desc: string
}

// Tim hanya bertugas di Desa Rada Mata & Kota Tambolaka; titik lain hanya penanda arah.
const POINTS: MapPoint[] = [
  {
    id: 'radamata',
    name: 'Desa Rada Mata',
    kind: 'kkn',
    category: 'Wilayah KKN',
    kecamatan: 'Kota Tambolaka',
    place: PLACES.radaMata,
    anchor: 'Kantor Desa Rada Mata',
    desc: 'Wilayah pengabdian tim Nawadaya. Desa seluas sekitar 7,5 km² dengan 6.249 penduduk (data 2023).',
  },
  {
    id: 'tambolaka',
    name: 'Kota Tambolaka',
    kind: 'kkn',
    category: 'Wilayah KKN',
    kecamatan: 'Kota Tambolaka',
    place: PLACES.kecTambolaka,
    anchor: 'Kantor Kecamatan Kota Tambolaka',
    desc: 'Kecamatan yang menjadi ibu kota Kabupaten Sumba Barat Daya, seluas sekitar 117,8 km². Desa Rada Mata termasuk di dalamnya.',
  },
  {
    id: 'bandara',
    name: 'Bandara Lede Kalumbang',
    kind: 'landmark',
    category: 'Penanda',
    place: PLACES.bandara,
    photo: SUMBA_PHOTOS.bandaraTambolaka,
    anchor: 'Bandara Lede Kalumbang',
    desc: 'Bandara Sumba Barat Daya, dulu bernama Bandara Tambolaka dan berganti nama pada 2022. Landas pacunya 2.300 m.',
  },
  {
    id: 'weetebula',
    name: 'Katedral Weetebula',
    kind: 'landmark',
    category: 'Penanda',
    kecamatan: 'Kota Tambolaka',
    place: PLACES.weetebula,
    photo: SUMBA_PHOTOS.katedralWeetebula,
    anchor: 'Katedral Roh Kudus Weetebula',
    desc: 'Katedral Roh Kudus, pusat Keuskupan Weetebula, di Kota Tambolaka.',
  },
  {
    id: 'waikelo',
    name: 'Pelabuhan Waikelo',
    kind: 'landmark',
    category: 'Penanda',
    place: PLACES.waikelo,
    anchor: 'Pelabuhan Waikelo',
    desc: 'Pelabuhan di teluk pesisir utara, tidak jauh dari Tambolaka.',
  },
]

const PINS: MapPin3D[] = POINTS.map((p) => ({ id: p.id, name: p.name, lat: p.place.lat, lon: p.place.lon, kind: p.kind }))

// Bentang peta 3D, sama dengan aset /data/tambolaka-*.  [barat, selatan, timur, utara]
const BBOX = [119.15, -9.48, 119.33, -9.34] as const

function supportsWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/** Peta datar cadangan (tanpa WebGL): garis pantai & jalan yang sama, dalam SVG */
function FlatMap({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [paths, setPaths] = useState<Array<{ cls: number; d: string }>>([])
  const VW = 1000
  const VH = Math.round(VW / (((BBOX[2] - BBOX[0]) * Math.cos((9.41 * Math.PI) / 180)) / (BBOX[3] - BBOX[1])))
  useEffect(() => {
    fetch('/data/tambolaka-lines.json')
      .then((r) => r.json())
      .then((data: { classes: number[]; lines: number[][] }) => {
        setPaths(
          data.lines.map((flat, i) => {
            let d = ''
            for (let k = 0; k + 1 < flat.length; k += 2) d += `${k ? 'L' : 'M'}${(flat[k] * VW).toFixed(1)},${((1 - flat[k + 1]) * VH).toFixed(1)}`
            return { cls: data.classes[i], d }
          }),
        )
      })
      .catch(() => {})
  }, [VH])
  const stroke = ['#fdde09', 'rgba(226,232,240,0.5)', 'rgba(148,163,184,0.2)', '#ffffff', 'rgba(127,219,227,0.7)']
  return (
    <div className="absolute inset-0">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={stroke[p.cls]} strokeWidth={p.cls === 0 || p.cls === 3 ? 2.2 : 1} />
        ))}
      </svg>
      {POINTS.map((p) => {
        const u = (p.place.lon - BBOX[0]) / (BBOX[2] - BBOX[0])
        const v = (p.place.lat - BBOX[1]) / (BBOX[3] - BBOX[1])
        const on = p.id === selectedId
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            aria-pressed={on}
            style={{ left: `${u * 100}%`, top: `${(1 - v) * 100}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-inter text-[10.4px] font-semibold cursor-pointer ${
              on ? 'bg-[#fdde09] border-[#fdde09] text-slate-900' : p.kind === 'kkn' ? 'bg-slate-950/80 border-[#fdde09]/60 text-white' : 'bg-slate-950/70 border-white/15 text-white/85'
            }`}
          >
            <MapPin className="w-3 h-3" />
            {p.name}
          </button>
        )
      })}
    </div>
  )
}

export default function HomeMapSection() {
  const [selectedId, setSelectedId] = useState(POINTS[0].id)
  const [mode, setMode] = useState<'pending' | '3d' | 'flat'>('pending')
  const selected = POINTS.find((p) => p.id === selectedId) ?? POINTS[0]

  useEffect(() => {
    setMode(supportsWebGL() ? '3d' : 'flat')
  }, [])

  const frameA = projectLocator(BBOX[0], BBOX[3])
  const frameB = projectLocator(BBOX[2], BBOX[1])

  return (
    <Slide
      id="map"
      frame="teal"
      photo="/images/sumba/seribu-bukit.jpg"
      blooms={[
        { kind: 'garland', color: 'peach', className: 'right-[-3%] top-[-5%] w-[clamp(180px,21vw,350px)] rotate-[190deg]' },
        { kind: 'flower', color: 'peach', className: 'left-[-2%] bottom-[-4%] w-[clamp(120px,13vw,220px)] -rotate-[20deg]', dir: [1, -1] },
      ]}
    >
      <div className="w-full max-w-6xl mx-auto">
      <SectionHeading index="04" eyebrow="Wilayah Pengabdian" lead="Peta" highlight="Pengabdian" accent={BRAND.teal} className="mb-12">
        Tim Nawadaya bertugas di Desa Rada Mata dan Kota Tambolaka. Peta 3D ini disusun dari data elevasi dan jalan yang nyata; pilih titik untuk melihat detailnya.
      </SectionHeading>

      <Reveal delay={0.1} className="relative w-full">
        <div className="bg-white p-3 sm:p-5 rounded-3xl border border-slate-200 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Peta */}
          <div className="lg:col-span-8 lg:self-start rounded-2xl overflow-hidden bg-[#0c1b33] border border-white/10">
            <div className="relative w-full aspect-[4/3.4] sm:aspect-[4/3]">
              {mode === '3d' && (
                <Suspense fallback={null}>
                  <TambolakaMap3D pins={PINS} selectedId={selectedId} onSelect={setSelectedId} onError={() => setMode('flat')} className="absolute inset-0" />
                </Suspense>
              )}
              {mode === 'flat' && <FlatMap selectedId={selectedId} onSelect={setSelectedId} />}

              {/* Arah utara & peta mini */}
              <div className="absolute top-3 left-3 flex flex-col items-center pointer-events-none" aria-hidden="true">
                <svg viewBox="0 0 20 28" className="w-4 h-5">
                  <path d="M10 0 L18 26 L10 20 L2 26 Z" fill="#fdde09" />
                </svg>
                <span className="font-inter text-[10.4px] font-bold text-white/70">U</span>
              </div>
              <div className="absolute bottom-3 right-3 w-[26%] min-w-[110px] max-w-[170px] rounded-lg bg-[#0a1629]/85 border border-white/10 p-1.5 pointer-events-none hidden sm:block">
                <svg viewBox={`0 0 ${LOCATOR_VIEW.width} ${LOCATOR_VIEW.height}`} className="w-full h-auto" aria-hidden="true">
                  <path d={LOCATOR_PATHS.island} fill="#334155" />
                  <path d={LOCATOR_PATHS.sbd} fill="#16b8c5" fillOpacity="0.55" />
                  <rect x={frameA.x - 2} y={frameA.y - 2} width={frameB.x - frameA.x + 4} height={frameB.y - frameA.y + 4} fill="none" stroke="#fdde09" strokeWidth="2.5" />
                </svg>
                <span className="block text-center font-inter text-[10.4px] text-white/55 mt-0.5">Pulau Sumba · area peta</span>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 border-t border-white/10 font-mono text-[10.4px] text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#ffab2f] flex items-center justify-center text-slate-900"><MapPin className="w-2.5 h-2.5" /></span>
                Wilayah KKN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#3057a6] flex items-center justify-center text-white"><MapPin className="w-2.5 h-2.5" /></span>
                Penanda
              </span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-[2px] bg-[#fdde09]" />Jalan utama</span>
              {mode !== 'flat' && <span className="flex items-center gap-1.5"><span className="w-4 border-t border-[#7fdbe3]/60" />Kontur tiap 25 m</span>}
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-white/30" />Kisi 0,02° (± 2,2 km)</span>
              <span className="basis-full text-white/40">
                Elevasi: Terrain Tiles (SRTM), diperbesar 3,6× · Data jalan & pantai © kontributor OpenStreetMap (ODbL)
              </span>
            </div>
          </div>

          {/* Detail titik */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0c1b33]">
              <AnimatePresence initial={false}>
                {selected.photo ? (
                  <motion.img
                    key={selected.id}
                    src={selected.photo.src}
                    alt={selected.photo.alt}
                    loading="lazy"
                    decoding="async"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60 bg-[radial-gradient(circle_at_30%_20%,#16304f,transparent_60%)]"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="font-inter text-xs">Foto dokumentasi tim menyusul</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md font-mono text-[10.4px] font-bold uppercase tracking-wider ${selected.kind === 'kkn' ? 'bg-brand-yellow text-slate-900' : 'bg-brand-blue text-white'}`}>
                [{selected.category}]
              </span>
            </div>
            {selected.photo && (
              <p className="mt-1.5 font-mono text-[10.4px] text-slate-400">
                Foto: {selected.photo.author}, {selected.photo.license}
              </p>
            )}

            <div className="pt-5 flex-1">
              <h3 className="font-montserrat font-bold text-xl text-slate-900 leading-tight">{selected.name}</h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-dashed border-slate-200 py-3">
                <div>
                  <dt className="font-mono text-[10.4px] uppercase tracking-wider text-slate-400">Kecamatan</dt>
                  <dd className="font-inter text-xs font-semibold text-slate-800">{selected.kecamatan ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10.4px] uppercase tracking-wider text-slate-400">Dari Kantor Desa Rada Mata</dt>
                  <dd className="font-inter text-xs font-semibold text-slate-800">
                    {selected.id === 'radamata' ? '—' : `${distanceFromKkn(selected.place)} (garis lurus)`}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-mono text-[10.4px] uppercase tracking-wider text-slate-400">Koordinat · {selected.anchor}</dt>
                  <dd className="font-mono text-xs font-medium text-slate-800 tabular-nums">{formatCoords(selected.place)}</dd>
                </div>
              </dl>
              <p className="font-inter text-xs sm:text-sm lg:text-xs text-slate-600 leading-relaxed mt-4">{selected.desc}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2" role="group" aria-label="Pilih titik">
              {POINTS.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedId(pt.id)}
                  aria-pressed={pt.id === selectedId}
                  className={`text-left px-3 py-2 rounded-xl border font-inter text-[10.4px] font-semibold transition-colors cursor-pointer ${
                    pt.id === selectedId ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {pt.name}
                  <span className={`block font-mono font-medium ${pt.id === selectedId ? 'text-white/70' : pt.kind === 'kkn' ? 'text-[#c4532b]' : 'text-slate-400'}`}>{pt.category}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10.4px] text-slate-400 leading-relaxed">
              Luas & penduduk: data Kemendagri (via Wikipedia). Titik di peta memakai lokasi kantor/bangunan di OpenStreetMap.
            </p>
          </div>
        </div>
      </Reveal>
      </div>
    </Slide>
  )
}
