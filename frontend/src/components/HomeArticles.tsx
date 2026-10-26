import { Clock } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { SENJA } from '../data/theme'

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
        <SectionHeading index="05" eyebrow="Cerita Lapangan" lead="Catatan &" highlight="Jurnal">
          Refleksi 50 hari hidup berdampingan bersama warga Rada Mata dan Sumba Barat Daya.
        </SectionHeading>
        <Reveal delay={0.1}>
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/20 px-4 py-2 font-mono text-[10.4px] uppercase tracking-wider text-dusk">
            <span className="text-senja-gold">&gt;_</span> Halaman jurnal segera hadir
          </span>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ARTICLES.map((art, idx) => (
          <Reveal key={art.id} delay={idx * 0.1} className="group w-full h-full">
            <article className="frame-corners h-full flex flex-col rounded-2xl bg-ink-850/85 border border-white/10 group-hover:border-white/20 p-4 transition-colors duration-300">
              <ScrollPhoto src={art.photo.src} alt={art.photo.alt} strength={6} delay={idx * 0.1} veil={SENJA.ink850} className="aspect-[16/10] w-full rounded-xl">
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-ink-900/85 border border-white/15 font-mono text-[10.4px] text-cream flex items-center gap-1">
                  <Clock className="w-3 h-3 text-senja-gold" />
                  <span>{art.readTime}</span>
                </div>
              </ScrollPhoto>

              <div className="pt-4 flex-1 flex flex-col">
                <span className="font-mono text-[10.4px] uppercase tracking-wider text-dusk">
                  <span className="text-senja-gold">{String(idx + 1).padStart(2, '0')}</span> · {art.date} · {art.author}
                </span>
                <h3 className="font-montserrat font-bold text-lg text-cream leading-snug mt-2">{art.title}</h3>
                <p className="font-inter text-xs text-mist leading-relaxed mt-2 line-clamp-4">{art.excerpt}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

    </section>
  )
}
