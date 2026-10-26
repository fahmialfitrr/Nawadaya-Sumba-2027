import { ChevronDown } from 'lucide-react'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'

export default function HomePhotoCredits() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
      <details className="group rounded-2xl border border-white/10 bg-ink-850/60 open:bg-ink-850/90">
        <summary className="flex items-center justify-between gap-4 px-5 py-4 list-none [&::-webkit-details-marker]:hidden cursor-pointer">
          <span className="font-inter text-xs text-mist">
            <strong className="font-semibold text-cream">Kredit foto & peta.</strong> Sebagian besar foto adalah placeholder dari Wikimedia Commons.
          </span>
          <ChevronDown className="w-4 h-4 text-dusk shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 pt-1">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {Object.values(SUMBA_PHOTOS).map((p) => (
              <li key={p.src} className="font-inter text-[10.4px] text-dusk leading-relaxed">
                <a href={p.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-mist hover:text-senja-gold underline-offset-2 hover:underline">
                  {p.caption}
                </a>
                {' '}— {p.author}, {p.license}
              </li>
            ))}
          </ul>
          <p className="mt-4 pt-4 border-t border-dashed border-white/10 font-inter text-[10.4px] text-dusk leading-relaxed">
            Foto senja di sampul, bingkai ornamen, kuda ASCII, wordmark, dan motif bunga adalah aset desain tim Nawadaya.
            Foto diperkecil dan dikompresi untuk web. Efek 3D di sampul memakai peta kedalaman yang dibuat dari foto-foto tersebut dengan model Depth Anything V2.
            Siluet Pulau Sumba dan data peta © kontributor OpenStreetMap, lisensi ODbL.
          </p>
        </div>
      </details>
    </section>
  )
}
