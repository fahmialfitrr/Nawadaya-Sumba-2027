import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { CLUSTER_COLOR, SENJA, type Cluster } from '../data/theme'

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

/** Label kluster bergaya mono: [ SAINTEK ] dengan warna kluster */
function ClusterTag({ cluster, extra }: { cluster: Cluster; extra?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-ink-900/85 border px-2 py-0.5 font-mono text-[10.4px] font-bold uppercase tracking-wider"
      style={{ color: CLUSTER_COLOR[cluster], borderColor: `${CLUSTER_COLOR[cluster]}55` }}
    >
      [{cluster}]{extra && <span className="font-medium normal-case tracking-normal text-mist">{extra}</span>}
    </span>
  )
}

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
        <SectionHeading index="03" eyebrow="Program Kerja" lead="Program" highlight="Unggulan">
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
                  className={`font-mono text-xs px-3.5 py-2 rounded-full border transition-colors cursor-pointer ${on
                    ? 'bg-cream border-cream text-ink-900 font-bold'
                    : 'bg-ink-850/60 border-white/15 text-mist hover:text-cream hover:border-white/35'
                    }`}
                >
                  {on ? `[${cat}]` : cat}
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item, idx) => (
          <Reveal key={item.id} delay={(idx % 3) * 0.1} className="group w-full h-full">
            <article className="frame-corners h-full flex flex-col rounded-2xl bg-ink-850/85 border border-white/10 group-hover:border-white/20 p-3 sm:p-4 pb-5 transition-colors duration-300">
              <ScrollPhoto src={item.photo.src} alt={item.photo.alt} strength={6} delay={(idx % 3) * 0.1} veil={SENJA.ink850} className="w-full aspect-[16/10] rounded-xl">
                <span className="absolute top-2.5 left-2.5">
                  <ClusterTag cluster={item.cluster} extra={item.category} />
                </span>
              </ScrollPhoto>

              <div className="px-1 pt-4 flex-1">
                <h3 className="font-montserrat font-bold text-lg text-cream leading-snug">{item.title}</h3>
                <p className="font-inter text-xs text-mist leading-relaxed mt-2 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-between gap-3 border-t border-dashed border-white/15 px-1">
                <span className="leading-tight">
                  <span className="block font-mono text-[10.4px] uppercase tracking-wider text-dusk">Target</span>
                  <span className="font-inter font-semibold text-cream text-xs">{item.target}</span>
                </span>
                <button
                  onClick={() => setSelected(item)}
                  type="button"
                  className="bg-senja-amber hover:bg-senja-gold text-ink-900 font-inter font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer shrink-0"
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
            className="fixed inset-0 z-[60] bg-ink-950/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="proker-title"
              className="bg-ink-850 border border-white/10 text-cream rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] w-full bg-ink-800">
                <img src={selected.photo.src} alt={selected.photo.alt} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelected(null)}
                  type="button"
                  aria-label="Tutup"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink-900/85 border border-white/15 text-cream flex items-center justify-center hover:bg-ink-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3 left-3">
                  <ClusterTag cluster={selected.cluster} />
                </span>
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                <div>
                  <h3 id="proker-title" className="font-montserrat font-bold text-xl text-cream leading-tight">
                    {selected.title}
                  </h3>
                  <p className="font-mono text-[10.4px] uppercase tracking-wider text-senja-gold mt-2">
                    {selected.category} · Target: {selected.target}
                  </p>
                </div>
                <p className="font-inter text-sm text-mist leading-relaxed">{selected.description}</p>
                <div className="pt-4 border-t border-dashed border-white/15">
                  <span className="font-mono text-[10.4px] uppercase tracking-[0.18em] text-dusk block mb-3">Indikator keberhasilan</span>
                  <ul className="space-y-2">
                    {selected.goals.map((g) => (
                      <li key={g} className="flex items-start gap-2 font-inter text-xs text-cream/90">
                        <span className="font-mono font-bold text-senja-gold shrink-0">[+]</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-mono text-[10.4px] text-dusk">
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
