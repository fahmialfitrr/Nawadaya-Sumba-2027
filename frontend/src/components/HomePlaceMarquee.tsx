import { KKN_LOCATION, formatCoords } from '../data/places'

// Hanya wilayah kerja tim (Desa Rada Mata, Kecamatan Kota Tambolaka) dan wilayah
// administratif di atasnya. Jumlah genap agar pola isi/garis tepi tetap bersambung.
const NAMES = ['Desa Rada Mata', 'Kota Tambolaka', 'Sumba Barat Daya', 'KKN-PPM UGM 2026']

const TICKER = [
  KKN_LOCATION.desa,
  KKN_LOCATION.kecamatan,
  KKN_LOCATION.kabupaten,
  KKN_LOCATION.provinsi,
  formatCoords(KKN_LOCATION),
  'KKN-PPM UGM Periode 2',
]

export default function HomePlaceMarquee() {
  const row = [...NAMES, ...NAMES, ...NAMES, ...NAMES]
  // Animasi menggeser 50%: kedua paruh deret harus identik
  const ticker = [...TICKER, ...TICKER, ...TICKER, ...TICKER]
  return (
    <div className="relative w-full bg-brand-blue py-5 md:py-7 overflow-hidden">
      <p className="sr-only">
        Wilayah pengabdian: {KKN_LOCATION.desa}, {KKN_LOCATION.kecamatan}, {KKN_LOCATION.kabupaten}, {KKN_LOCATION.provinsi}.
      </p>
      <div className="flex w-max items-center animate-marquee-left" style={{ animationDuration: '60s' }} aria-hidden="true">
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-6 md:gap-10 pr-6 md:pr-10">
            <span
              className={`font-montserrat font-extrabold text-2xl md:text-3xl leading-none tracking-tight whitespace-nowrap ${i % 2 ? 'text-outline' : 'text-white'}`}
            >
              {name}
            </span>
            <span className="font-mono font-bold text-sm md:text-lg text-brand-yellow whitespace-nowrap">·:*:·</span>
          </span>
        ))}
      </div>
      <div
        className="mt-4 md:mt-5 flex w-max items-center animate-marquee-right font-mono text-[10.4px] md:text-xs uppercase tracking-[0.18em] text-white/70"
        style={{ animationDuration: '80s' }}
        aria-hidden="true"
      >
        {ticker.map((t, i) => (
          <span key={i} className="flex items-center gap-4 pr-4 whitespace-nowrap">
            <span>{t}</span>
            <span className="text-brand-yellow/70">//</span>
          </span>
        ))}
      </div>
    </div>
  )
}
