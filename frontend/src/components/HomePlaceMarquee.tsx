// Jumlah genap agar pola isi/garis tepi tetap bersambung saat berulang
const NAMES = ['Sumba Barat Daya', 'Tambolaka', 'Rada Mata', 'Weetebula', 'Waikelo', 'Kodi', 'Weekuri', 'Ratenggaro', 'Mandorak', 'Nusa Tenggara Timur']

/** Motif belah ketupat sederhana, terinspirasi pola tenun ikat */
function IkatDiamond() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-6 md:h-6 shrink-0" aria-hidden="true">
      <path d="M12 1 23 12 12 23 1 12Z" fill="#fdde09" />
      <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill="#0f172a" />
    </svg>
  )
}

export default function HomePlaceMarquee() {
  const row = [...NAMES, ...NAMES]
  return (
    <div className="relative w-full bg-white border-b border-slate-200 py-5 md:py-7 overflow-hidden">
      <p className="sr-only">Wilayah pengabdian dan sekitarnya: {NAMES.join(', ')}.</p>
      <div className="flex w-max items-center animate-marquee-left" style={{ animationDuration: '70s' }} aria-hidden="true">
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-6 md:gap-10 pr-6 md:pr-10">
            <span
              className={`font-montserrat font-bold text-2xl md:text-3xl leading-none tracking-tight whitespace-nowrap ${i % 2 ? 'text-outline' : 'text-slate-900'}`}
            >
              {name}
            </span>
            <IkatDiamond />
          </span>
        ))}
      </div>
    </div>
  )
}
