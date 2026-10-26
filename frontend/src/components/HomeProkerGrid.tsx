import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { BrandFrame, ScriptWord, Slide } from './Brand'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { BRAND, CLUSTER_THEME, type Cluster } from '../data/theme'

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

/** Label kluster: blok warna kluster dengan teks gelap */
function ClusterTag({ cluster, extra }: { cluster: Cluster; extra?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10.4px] font-bold uppercase tracking-wider text-slate-900" style={{ backgroundColor: CLUSTER_THEME[cluster].color }}>
      {cluster}
      {extra && <span className="font-medium normal-case tracking-normal text-slate-900/75">· {extra}</span>}
    </span>
  )
}

export default function HomeProkerGrid() {
  const [activeCategory, setActiveCategory] = useState<'Semua' | Cluster>('Semua')
  const [selected, setSelected] = useState<ProkerItem | null>(null)
  // Modal dirender ke <body> agar berada di atas navbar & tirai
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const filtered = activeCategory === 'Semua' ? FEATURED_PROKER : FEATURED_PROKER.filter((p) => p.cluster === activeCategory)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <Slide
      id="projects"
      frame="yellow"
      blooms={[
        { kind: 'rose', color: 'rose', className: 'right-[-2%] top-[-3%] w-[clamp(140px,17vw,280px)] rotate-[160deg]' },
        { kind: 'garland', color: 'rose', className: 'left-[-3%] bottom-[-5%] w-[clamp(180px,20vw,340px)] rotate-[10deg]', dir: [1, -1] },
      ]}
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <SectionHeading index="03" eyebrow="Program Kerja" lead="Program" highlight="Unggulan" accent={BRAND.magenta}>
            Rencana kerja lintas kluster untuk Desa Rada Mata. Pilih kluster untuk menyaring program.
          </SectionHeading>

          <Reveal delay={0.1} className="lg:shrink-0">
            <div className="flex flex-wrap lg:flex-nowrap gap-2" role="group" aria-label="Saring berdasarkan kluster">
              {FILTERS.map((cat) => {
                const on = activeCategory === cat
                const c = cat === 'Semua' ? null : CLUSTER_THEME[cat]
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={on}
                    className={`font-inter text-xs px-4 py-2 rounded-full border transition-colors cursor-pointer ${
                      on ? 'font-semibold text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                    style={on ? { backgroundColor: c ? c.color : BRAND.yellow, borderColor: c ? c.color : BRAND.yellow } : undefined}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>

        {/* Banner "Kluster ___" ala slide brand kit saat satu kluster dipilih */}
        <AnimatePresence mode="wait">
          {activeCategory !== 'Semua' && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="relative mb-10 overflow-hidden"
            >
              <div className="relative flex items-end gap-1 px-[clamp(36px,4vw,56px)] py-[clamp(26px,3vw,40px)] bg-white">
                <BrandFrame color={CLUSTER_THEME[activeCategory].frame} width="clamp(28px,3vw,44px)" className="absolute inset-0" />
                <span className="font-montserrat font-extrabold text-lg sm:text-xl text-slate-900 leading-none mb-[0.6em]">Kluster</span>
                <ScriptWord key={activeCategory} text={activeCategory} color={CLUSTER_THEME[activeCategory].text} className="h-[clamp(52px,6vw,80px)]" />
                <span className="ml-auto self-center font-mono text-[10.4px] uppercase tracking-wider text-slate-500">
                  {filtered.length} program
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} delay={(idx % 3) * 0.1} className="group w-full h-full">
              <article
                className="h-full flex flex-col rounded-2xl bg-white border border-slate-200 border-t-4 p-3 sm:p-4 pb-5 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.35)] group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.45)] transition-[transform,box-shadow] duration-300"
                style={{ borderTopColor: CLUSTER_THEME[item.cluster].color }}
              >
                <ScrollPhoto src={item.photo.src} alt={item.photo.alt} strength={6} delay={(idx % 3) * 0.1} veil="#ffffff" className="w-full aspect-[16/10] rounded-xl">
                  <span className="absolute top-2.5 left-2.5">
                    <ClusterTag cluster={item.cluster} extra={item.category} />
                  </span>
                </ScrollPhoto>

                <div className="px-1 pt-4 flex-1">
                  <h3 className="font-montserrat font-bold text-lg text-slate-900 leading-snug">{item.title}</h3>
                  <p className="font-inter text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">{item.description}</p>
                </div>

                <div className="pt-4 mt-4 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 px-1">
                  <span className="leading-tight">
                    <span className="block font-mono text-[10.4px] uppercase tracking-wider text-slate-400">Target</span>
                    <span className="font-inter font-semibold text-slate-800 text-xs">{item.target}</span>
                  </span>
                  <button
                    onClick={() => setSelected(item)}
                    type="button"
                    className="bg-brand-blue hover:bg-[#254587] text-white font-inter font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    Detail
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Modal detail */}
      {mounted && createPortal(<AnimatePresence>
        {selected && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="proker-title"
              className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] w-full bg-slate-200">
                <img src={selected.photo.src} alt={selected.photo.alt} className="w-full h-full object-cover" />
                <BrandFrame color={CLUSTER_THEME[selected.cluster].frame} width="30px" className="absolute inset-1" />
                <button
                  onClick={() => setSelected(null)}
                  type="button"
                  aria-label="Tutup"
                  className="absolute top-4 right-4 z-[2] w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer shadow"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-4 left-4 z-[2]">
                  <ClusterTag cluster={selected.cluster} />
                </span>
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                <div>
                  <h3 id="proker-title" className="font-montserrat font-bold text-xl text-slate-900 leading-tight">
                    {selected.title}
                  </h3>
                  <p className="font-mono text-[10.4px] uppercase tracking-wider mt-2" style={{ color: CLUSTER_THEME[selected.cluster].text }}>
                    {selected.category} · Target: {selected.target}
                  </p>
                </div>
                <p className="font-inter text-sm text-slate-600 leading-relaxed">{selected.description}</p>
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <span className="font-mono text-[10.4px] uppercase tracking-[0.18em] text-slate-400 block mb-3">Indikator keberhasilan</span>
                  <ul className="space-y-2">
                    {selected.goals.map((g) => (
                      <li key={g} className="flex items-start gap-2 font-inter text-xs text-slate-700">
                        <span className="font-mono font-bold shrink-0" style={{ color: CLUSTER_THEME[selected.cluster].text }}>
                          [+]
                        </span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-mono text-[10.4px] text-slate-400">
                  Foto ilustrasi: {selected.photo.caption} — {selected.photo.author}, {selected.photo.license}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </Slide>
  )
}
