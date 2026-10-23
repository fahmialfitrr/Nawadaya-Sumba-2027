import { Clock } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'

interface ArticleItem {
  id: string
  title: string
  readTime: string
  date: string
  photo: SumbaPhoto
  author: string
  excerpt: string
}

// Contoh catatan lapangan (placeholder) — ganti dengan tulisan anggota tim
const ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Hari Pertama di Rada Mata: Belajar Menyapa dalam Bahasa Lokal',
    readTime: '4 menit baca',
    date: '14 Juli 2026',
    photo: SUMBA_PHOTOS.gobakSodor,
    author: 'Aisyah R. · FIB UGM',
    excerpt: 'Sore pertama kami habiskan di lapangan desa. Anak-anak mengajari kami permainan dan sapaan, jauh sebelum kami sempat memperkenalkan program apa pun.',
  },
  {
    id: 'art-2',
    title: 'Senja di Ratenggaro: Mendengar Kisah Rumah Beratap Menara',
    readTime: '5 menit baca',
    date: '22 Juli 2026',
    photo: SUMBA_PHOTOS.ratenggaroKampung,
    author: 'Falah A. · SV UGM',
    excerpt: 'Akhir pekan pertama, kami berkunjung ke Kodi. Di antara kubur batu dan menara ilalang, kami belajar bahwa rumah adat adalah juga ruang ibadah.',
  },
  {
    id: 'art-3',
    title: 'Air Asin yang Jernih: Catatan dari Danau Weekuri',
    readTime: '6 menit baca',
    date: '30 Juli 2026',
    photo: SUMBA_PHOTOS.weekuriLaguna,
    author: 'Rahmat D. · Pertanian UGM',
    excerpt: 'Laguna ini terhubung ke laut lewat celah karang. Catatan kecil tentang air, musim kemarau, dan pentingnya menjaga sumber air di Sumba.',
  },
]

export default function HomeArticles() {
  return (
    <section className="w-full py-24 md:py-32 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
        <SectionHeading index="05" eyebrow="Cerita Lapangan" lead="Catatan &" highlight="Jurnal" color="#e11d48" border="#be123c">
          Refleksi 50 hari hidup berdampingan bersama warga Rada Mata dan Sumba Barat Daya.
        </SectionHeading>
        <Reveal delay={0.1}>
          <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-4 py-2 font-inter text-xs text-slate-500">
            Halaman jurnal lengkap segera hadir
          </span>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ARTICLES.map((art, idx) => (
          <Reveal key={art.id} delay={idx * 0.1} className="relative group w-full h-full">
            <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl rotate-[2deg] translate-x-1 group-hover:rotate-[3deg] group-hover:translate-x-2 transition-transform duration-300 z-[-2]" />
            <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 transition-transform duration-300 z-[-1]" />

            <article className="bg-[#f9fafb] p-4 rounded-2xl border border-white shadow-lg group-hover:shadow-xl transition-shadow flex flex-col h-full">
              <ScrollPhoto src={art.photo.src} alt={art.photo.alt} strength={6} delay={idx * 0.1} className="aspect-[16/10] w-full rounded-xl">
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10.4px] font-bold bg-white/90 text-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#3057a6]" />
                  <span>{art.readTime}</span>
                </div>
              </ScrollPhoto>

              <div className="pt-4 flex-1 flex flex-col">
                <span className="font-inter text-[10.4px] font-semibold uppercase tracking-wider text-slate-400">
                  {art.date} · {art.author}
                </span>
                <h3 className="font-montserrat font-bold text-lg text-slate-900 leading-snug mt-2">{art.title}</h3>
                <p className="font-inter text-xs text-slate-600 leading-relaxed mt-2 line-clamp-4">{art.excerpt}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

    </section>
  )
}
