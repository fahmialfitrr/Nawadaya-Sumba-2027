import { ChevronDown } from 'lucide-react'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'

export default function HomePhotoCredits() {
  return (
    <section className="w-full mt-10">
      <details className="group rounded-2xl border border-slate-200 bg-white/80 open:bg-white">
        <summary className="flex items-center justify-between gap-4 px-5 py-4 list-none [&::-webkit-details-marker]:hidden cursor-pointer">
          <span className="font-inter text-xs text-slate-600">
            <strong className="font-semibold text-slate-800">Kredit foto & peta.</strong> Sebagian besar foto adalah placeholder dari Wikimedia Commons.
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 pt-1">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {Object.values(SUMBA_PHOTOS).map((p) => (
              <li key={p.src} className="font-inter text-[10.4px] text-slate-500 leading-relaxed">
                <a href={p.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-brand-blue underline-offset-2 hover:underline">
                  {p.caption}
                </a>
                {' '}— {p.author}, {p.license}
              </li>
            ))}
          </ul>
          <p className="mt-4 pt-4 border-t border-dashed border-slate-200 font-inter text-[10.4px] text-slate-500 leading-relaxed">
            Foto senja di sampul, bingkai ornamen, kuda ASCII, wordmark, motif bunga, ornamen, dan palet warna adalah aset desain tim Nawadaya.
            Foto diperkecil dan dikompresi untuk web. Efek 3D di sampul memakai peta kedalaman yang dibuat dari foto-foto tersebut dengan model Depth Anything V2.
            Siluet Pulau Sumba dan data peta © kontributor OpenStreetMap, lisensi ODbL.
          </p>
        </div>
      </details>
    </section>
  )
}
