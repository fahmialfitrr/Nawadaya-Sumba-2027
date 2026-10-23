import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X, CheckCircle2 } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'

type Cluster = 'Saintek' | 'Soshum' | 'Medika' | 'Agro'

const CLUSTER_COLOR: Record<Cluster, string> = {
  Saintek: '#0e9aa5',
  Soshum: '#a2258d',
  Medika: '#e0475b',
  Agro: '#e2703f',
}

interface ProkerItem {
  id: string
  title: string
  cluster: Cluster
  category: string
  photo: SumbaPhoto
  description: string
  goals: string[]
  target: string
}

// Rencana program (placeholder) — ganti dengan data final tim
const FEATURED_PROKER: ProkerItem[] = [
  {
    id: 'pk-1',
    title: 'Lampu Tenaga Surya Dusun',
    cluster: 'Saintek',
    category: 'Energi Terbarukan',
    photo: SUMBA_PHOTOS.pltsEnde,
    description: 'Pemasangan lampu tenaga surya di titik gelap jalan dusun dan fasilitas umum Desa Rada Mata, disertai pelatihan perawatan untuk pemuda desa.',
    goals: ['Titik lampu di jalan dusun yang gelap', 'Pelatihan perawatan panel untuk pemuda', 'Panduan perawatan yang mudah diikuti'],
    target: '6 titik lampu',
  },
  {
    id: 'pk-2',
    title: 'Pojok Baca Anak Dusun',
    cluster: 'Soshum',
    category: 'Literasi',
    photo: SUMBA_PHOTOS.membacaBersama,
    description: 'Pojok baca berisi buku cerita bergambar dan kegiatan membaca bersama setiap sore untuk anak-anak Rada Mata.',
    goals: ['Koleksi buku bacaan anak', 'Jadwal membaca bersama mingguan', 'Pendampingan oleh pemuda desa'],
    target: '2 pojok baca',
  },
  {
    id: 'pk-3',
    title: 'Posyandu & Gizi Balita',
    cluster: 'Medika',
    category: 'Kesehatan Masyarakat',
    photo: SUMBA_PHOTOS.posyandu,
    description: 'Pendampingan posyandu: penimbangan balita, edukasi gizi berbahan pangan lokal seperti daun kelor, dan pelatihan kader.',
    goals: ['Pemantauan tumbuh kembang balita', 'Demo menu MP-ASI berbahan kelor', 'Pelatihan kader posyandu'],
    target: '120 warga terlayani',
  },
  {
    id: 'pk-4',
    title: 'Silase Pakan Ternak Kemarau',
    cluster: 'Agro',
    category: 'Peternakan',
    photo: SUMBA_PHOTOS.kudaSavana,
    description: 'Pelatihan fermentasi hijauan menjadi silase sebagai cadangan pakan ternak selama musim kemarau panjang.',
    goals: ['Demonstrasi pembuatan silase', 'Pendampingan kelompok peternak', 'Cadangan pakan musim kemarau'],
    target: '15 drum silase',
  },
  {
    id: 'pk-5',
    title: 'Peta Digital Desa',
    cluster: 'Saintek',
    category: 'Spasial',
    photo: SUMBA_PHOTOS.seribuBukit,
    description: 'Pemetaan batas dusun, fasilitas umum, dan sumber air Desa Rada Mata ke dalam peta digital interaktif untuk pemerintah desa.',
    goals: ['Peta batas dusun & fasilitas umum', 'Data titik sumber air bersih', 'Pelatihan operator desa'],
    target: 'Seluruh dusun terpetakan',
  },
  {
    id: 'pk-6',
    title: 'Bank Sampah Desa',
    cluster: 'Soshum',
    category: 'Lingkungan',
    photo: SUMBA_PHOTOS.pantaiMbawana,
    description: 'Edukasi pilah sampah rumah tangga dan pembentukan unit bank sampah desa, ditutup dengan aksi bersih pesisir bersama warga.',
    goals: ['Unit bank sampah desa', 'Edukasi pilah sampah di sekolah', 'Aksi bersih pesisir'],
    target: '1 unit bank sampah',
  },
]

const FILTERS: Array<'Semua' | Cluster> = ['Semua', 'Saintek', 'Soshum', 'Medika', 'Agro']

export default function HomeProkerGrid() {
  const [activeCategory, setActiveCategory] = useState<'Semua' | Cluster>('Semua')
  const [selected, setSelected] = useState<ProkerItem | null>(null)

  const filtered = activeCategory === 'Semua' ? FEATURED_PROKER : FEATURED_PROKER.filter((p) => p.cluster === activeCategory)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <section id="projects" className="w-full py-24 md:py-32 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto scroll-mt-20">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
        <SectionHeading index="03" eyebrow="Program Kerja" lead="Program" highlight="Unggulan" color="#ea580c" border="#c2410c">
          Rencana kerja lintas kluster untuk Desa Rada Mata. Pilih kluster untuk menyaring program.
        </SectionHeading>

        <Reveal delay={0.1} className="lg:shrink-0">
          <div className="flex flex-wrap lg:flex-nowrap gap-2" role="group" aria-label="Saring berdasarkan kluster">
            {FILTERS.map((cat) => {
              const on = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={on}
                  className={`font-inter text-xs px-4 py-2 rounded-full border transition-colors cursor-pointer ${on
                    ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>

      {/* Kartu bertumpuk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item, idx) => (
          <Reveal key={item.id} delay={(idx % 3) * 0.1} className="relative group w-full h-full">
            <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl transition-transform duration-500 ease-out origin-bottom-left rotate-[2deg] translate-x-1 group-hover:rotate-[4deg] group-hover:translate-x-2 z-[-2]" />
            <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl transition-transform duration-500 ease-out origin-bottom-right -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 z-[-1]" />

            <article className="bg-[#f9fafb] p-3 sm:p-4 pb-5 rounded-2xl flex flex-col shadow-lg group-hover:shadow-2xl transition-shadow duration-500 border border-white relative z-10 h-full">
              <ScrollPhoto src={item.photo.src} alt={item.photo.alt} strength={6} delay={(idx % 3) * 0.1} className="w-full aspect-[16/10] rounded-xl">
                <span
                  className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.4px] font-bold text-white"
                  style={{ backgroundColor: CLUSTER_COLOR[item.cluster] }}
                >
                  {item.cluster} · {item.category}
                </span>
              </ScrollPhoto>

              <div className="px-1 pt-4 flex-1">
                <h3 className="font-montserrat font-bold text-lg text-slate-900 leading-snug">{item.title}</h3>
                <p className="font-inter text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-between gap-3 border-t border-slate-200/80 px-1">
                <span className="font-inter text-[10.4px] text-slate-500 leading-tight">
                  <span className="block uppercase tracking-wider font-semibold text-slate-400">Target</span>
                  <span className="font-semibold text-slate-800 text-xs">{item.target}</span>
                </span>
                <button
                  onClick={() => setSelected(item)}
                  type="button"
                  className="bg-[#ffab2f] hover:bg-[#e69b2a] text-slate-900 font-inter font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1 transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
                >
                  Detail
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Modal detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="proker-title"
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] w-full bg-slate-900">
                <img src={selected.photo.src} alt={selected.photo.alt} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelected(null)}
                  type="button"
                  aria-label="Tutup"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <span
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10.4px] font-bold text-white"
                  style={{ backgroundColor: CLUSTER_COLOR[selected.cluster] }}
                >
                  Kluster {selected.cluster}
                </span>
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                <div>
                  <h3 id="proker-title" className="font-montserrat font-bold text-xl text-slate-900 leading-tight">
                    {selected.title}
                  </h3>
                  <p className="font-inter text-[10.4px] uppercase tracking-wider font-semibold text-slate-400 mt-2">
                    {selected.category} · Target: {selected.target}
                  </p>
                </div>
                <p className="font-inter text-sm text-slate-600 leading-relaxed">{selected.description}</p>
                <div className="pt-4 border-t border-slate-100">
                  <span className="font-montserrat font-bold text-xs text-slate-800 block mb-3">Indikator keberhasilan</span>
                  <ul className="space-y-2">
                    {selected.goals.map((g) => (
                      <li key={g} className="flex items-start gap-2 font-inter text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-inter text-[10.4px] text-slate-400">
                  Foto ilustrasi: {selected.photo.caption} — {selected.photo.author}, {selected.photo.license}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
