import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { MoveRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { PLACES, distanceFromKkn, type Place } from '../data/places'

interface GalleryItem {
  photo: SumbaPhoto
  region: string
  place?: Place
  title: string
  desc: string
  wide?: boolean
}

const ITEMS: GalleryItem[] = [
  {
    photo: SUMBA_PHOTOS.bandaraTambolaka,
    region: 'Kota Tambolaka',
    title: 'Bandara Lede Kalumbang',
    desc: 'Gerbang udara Sumba Barat Daya di Tambolaka. Dulu bernama Bandara Tambolaka, berganti nama menjadi Lede Kalumbang pada 2022.',
    wide: true,
  },
  {
    photo: SUMBA_PHOTOS.katedralWeetebula,
    region: 'Weetebula, Kota Tambolaka',
    place: PLACES.weetebula,
    title: 'Katedral Weetebula',
    desc: 'Gereja Katedral Roh Kudus, pusat Keuskupan Weetebula, di jantung Kota Tambolaka.',
  },
  {
    photo: SUMBA_PHOTOS.ratenggaroKuburBatu,
    region: 'Kodi Bangedo',
    place: PLACES.ratenggaro,
    title: 'Kampung Adat Ratenggaro',
    desc: 'Rumah adat beratap menara dan kubur batu megalitikum yang masih dirawat penganut Marapu.',
    wide: true,
  },
  {
    photo: SUMBA_PHOTOS.tenunKodi,
    region: 'Kodi, Sumba Barat Daya',
    title: 'Tenun Ikat Kodi',
    desc: 'Setiap motif menyimpan silsilah dan doa, ditenun berbulan-bulan dengan pewarna alam.',
  },
  {
    photo: SUMBA_PHOTOS.weekuri,
    region: 'Kodi Utara',
    place: PLACES.weekuri,
    title: 'Danau Weekuri',
    desc: 'Laguna air asin sebening kristal yang terhubung ke laut lewat celah karang.',
    wide: true,
  },
  {
    photo: SUMBA_PHOTOS.pasola,
    region: 'Kodi · Lamboya · Wanokaka · Gaura',
    title: 'Tradisi Pasola',
    desc: 'Permainan ketangkasan berkuda dan lembing kayu dalam rangkaian upacara Marapu, digelar sekitar Februari–Maret.',
  },
  {
    photo: SUMBA_PHOTOS.pantaiMandorak,
    region: 'Kodi Utara',
    place: PLACES.mandorak,
    title: 'Pantai Mandorak',
    desc: 'Teluk mungil berpasir putih yang diapit tebing karang di pesisir barat daya Sumba.',
    wide: true,
  },
  {
    photo: SUMBA_PHOTOS.kudaSandalwood,
    region: 'Padang sabana Sumba',
    title: 'Kuda Sandalwood',
    desc: 'Kuda tangguh khas Sumba, simbol status dan bagian penting dari adat perkawinan.',
  },
]

/** Nama tempat untuk lapisan latar yang bergerak lebih lambat dari kartu */
const BACKDROP_NAMES = ['Humba', 'Tambolaka', 'Rada Mata', 'Weetebula', 'Kodi', 'Ratenggaro', 'Weekuri', 'Mandorak', 'Marapu']

/** Warna latar section; dipakai juga oleh tirai piksel agar menyatu */
const BG = '#020617'

const pad = (n: number) => String(n).padStart(2, '0')

/** Jarak kiri elemen terhadap lintasan galeri (track), menembus wadah yang ber-position */
function offsetInTrack(el: HTMLElement) {
  let left = 0
  let node: HTMLElement | null = el
  while (node && !node.dataset.track) {
    left += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }
  return left
}
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isDesktop
}

/**
 * Tirai piksel di atas foto: piksel-piksel berwarna latar yang hilang mengikuti
 * gradien kiri-ke-kanan + acak, sama seperti gradient wipe berpiksel di sampul.
 * progress 0 = foto tertutup penuh, 1 = foto terbuka penuh.
 */
function PixelVeil({ progress, seed }: { progress: MotionValue<number>; seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    let thresholds = new Float32Array(0)
    let last = -1

    const rand = (i: number) => {
      const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
      return s - Math.floor(s)
    }

    const draw = (p: number) => {
      last = p
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (p >= 1) return
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const t = thresholds[y * cols + x]
          if (p >= t) continue
          // Piksel yang hampir terbuka tampil tipis, memberi kesan mosaik
          const edge = t - p < 0.07
          ctx.fillStyle = edge ? 'rgba(2, 6, 23, 0.5)' : BG
          ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1)
          if (edge && rand(y * cols + x + 7) > 0.7) {
            ctx.fillStyle = 'rgba(253, 222, 9, 0.16)'
            ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch))
          }
        }
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const cell = 36
      cols = Math.max(6, Math.round(w / cell))
      rows = Math.max(4, Math.round(h / cell))
      cw = canvas.width / cols
      ch = canvas.height / rows
      thresholds = new Float32Array(cols * rows)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          thresholds[y * cols + x] = 0.55 * (x / Math.max(1, cols - 1)) + 0.45 * rand(y * cols + x)
        }
      }
      draw(progress.get())
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    const unsub = progress.on('change', (p) => {
      if (Math.abs(p - last) > 0.002 || (p >= 1 && last < 1)) draw(p)
    })
    return () => {
      ro.disconnect()
      unsub()
    }
  }, [progress, seed])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />
}

function SectionIntro({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <SectionHeading index="02" eyebrow="Humba Hammu" lead="Mengenal" highlight="Tanah Sumba" color="#16b8c5" border="#0e9aa5" dark>
        Dari Rada Mata dan Kota Tambolaka hingga pesisir Kodi: budaya Marapu, tenun ikat, dan lanskap yang menjadi rumah bagi warga Sumba Barat Daya.
      </SectionHeading>
    </div>
  )
}

interface CardMotion {
  rotateY: MotionValue<number>
  scale: MotionValue<number>
  photoX: MotionValue<string>
  captionX: MotionValue<number>
  reveal: MotionValue<number>
}

function GalleryCard({
  item,
  index,
  motionStyle,
  reveal,
}: {
  item: GalleryItem
  index: number
  motionStyle?: Omit<CardMotion, 'reveal'>
  reveal?: MotionValue<number>
}) {
  return (
    <motion.figure
      style={motionStyle ? { rotateY: motionStyle.rotateY, scale: motionStyle.scale, transformPerspective: 1500 } : undefined}
      className={`shrink-0 flex flex-col gap-4 ${item.wide ? 'w-[82vw] sm:w-[60vw] lg:w-[44vw]' : 'w-[68vw] sm:w-[42vw] lg:w-[25vw]'}`}
    >
      <div className="relative h-[52vh] lg:h-[58vh] min-h-[320px] rounded-3xl overflow-hidden bg-slate-800">
        <motion.img
          src={item.photo.src}
          alt={item.photo.alt}
          loading="lazy"
          decoding="async"
          style={motionStyle ? { x: motionStyle.photoX, scale: 1.3 } : undefined}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 font-montserrat font-bold text-xs text-white/90 bg-slate-950/40 backdrop-blur-sm px-3 py-1 rounded-full">
          {pad(index + 1)}
        </span>
        <span className="absolute bottom-3 right-4 font-inter text-[10.4px] text-white/70">
          {item.photo.author} • {item.photo.license}
        </span>
        {reveal && <PixelVeil progress={reveal} seed={index + 1} />}
      </div>
      <motion.figcaption style={motionStyle ? { x: motionStyle.captionX } : undefined} className="pr-6">
        <span className="font-inter text-[10.4px] font-semibold uppercase tracking-wider text-[#fdde09]">
          {item.region}
          {item.place && <span className="text-slate-400 normal-case tracking-normal font-medium"> · {distanceFromKkn(item.place)} dari Rada Mata</span>}
        </span>
        <h3 className="font-montserrat font-bold text-lg text-white mt-1 mb-1.5">{item.title}</h3>
        <p className="font-inter text-xs text-slate-400 leading-relaxed max-w-md">{item.desc}</p>
      </motion.figcaption>
    </motion.figure>
  )
}

/**
 * Gerak kartu di dinding melengkung: kartu menghadap ke tengah layar, mengecil di tepi,
 * fotonya bergeser lebih kuat (parallax), dan fotonya terbentuk dari piksel saat masuk.
 */
function useCardMotion(ref: React.RefObject<HTMLDivElement | null>, x: MotionValue<number>, vw: MotionValue<number>): CardMotion {
  const rel = useTransform(() => {
    const el = ref.current
    const w = vw.get()
    if (!el || !w) return 0
    return (offsetInTrack(el) + el.offsetWidth / 2 + x.get() - w / 2) / w
  })
  const left = useTransform(() => {
    const el = ref.current
    const w = vw.get()
    if (!el || !w) return 0
    return (offsetInTrack(el) + x.get()) / w
  })
  return {
    rotateY: useTransform(rel, (r) => clamp(-r * 22, -16, 16)),
    scale: useTransform(rel, (r) => 1 - Math.min(Math.abs(r), 1) * 0.1),
    photoX: useTransform(rel, (r) => `${clamp(-r * 16, -14, 14)}%`),
    captionX: useTransform(rel, (r) => clamp(r * 60, -60, 60)),
    reveal: useTransform(left, (l) => clamp((1.02 - l) / 0.42)),
  }
}

function MotionCard({ item, index, x, vw }: { item: GalleryItem; index: number; x: MotionValue<number>; vw: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null)
  const m = useCardMotion(ref, x, vw)
  return (
    <div ref={ref} className="shrink-0">
      <GalleryCard item={item} index={index} motionStyle={m} reveal={m.reveal} />
    </div>
  )
}

/** Desktop: scroll vertikal menggeser galeri secara horizontal (sticky) */
function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const [current, setCurrent] = useState(0)
  const distanceMV = useMotionValue(0)
  const vw = useMotionValue(0)

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return
      const d = Math.max(0, trackRef.current.scrollWidth - window.innerWidth)
      setDistance(d)
      distanceMV.set(d)
      vw.set(window.innerWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [distanceMV, vw])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(() => -scrollYProgress.get() * distanceMV.get())
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  // Lapisan latar bergerak jauh lebih lambat dari kartu: kesan jarak
  const backdropX = useTransform(x, (v) => v * 0.32)
  // Judul tertinggal sedikit lalu memudar, kartu melintas di depannya
  const introX = useTransform(x, (v) => -v * 0.3)
  const introOpacity = useTransform(() => {
    const el = introRef.current
    const w = vw.get()
    if (!el || !w) return 1
    const right = el.offsetLeft + el.offsetWidth + x.get() * 0.7
    return clamp((right / w - 0.08) / 0.3)
  })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(ITEMS.length - 1, Math.round(p * (ITEMS.length - 1)))
    if (i !== current) setCurrent(i)
  })

  const backdropRow = [...BACKDROP_NAMES, ...BACKDROP_NAMES]

  return (
    <section ref={sectionRef} id="sumba" className="relative w-full" style={{ height: `calc(100vh + ${distance}px)`, backgroundColor: BG }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Lapisan latar: nama-nama tempat bergaris tepi, bergerak lambat */}
        <motion.div
          aria-hidden="true"
          style={{ x: backdropX }}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-10 w-max pl-[30vw] pointer-events-none select-none"
        >
          {backdropRow.map((name, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-montserrat font-black text-[146px] leading-none tracking-tight whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.11)]">
                {name}
              </span>
              <svg viewBox="0 0 24 24" className="w-10 h-10 shrink-0" aria-hidden="true">
                <path d="M12 1 23 12 12 23 1 12Z" fill="rgba(253,222,9,0.16)" />
                <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill={BG} />
              </svg>
            </span>
          ))}
        </motion.div>

        <motion.div
          ref={trackRef}
          data-track="1"
          style={{ x }}
          className="relative flex items-center gap-8 lg:gap-12 w-max pl-8 lg:pl-[max(2rem,calc((100vw-72rem)/2))] pr-[12vw] pt-16"
        >
          <motion.div ref={introRef} style={{ x: introX, opacity: introOpacity }} className="relative z-0 w-[34vw] max-w-[440px] shrink-0 pr-4">
            <SectionIntro />
          </motion.div>
          <div className="relative z-10 flex items-center gap-8 lg:gap-12">
            {ITEMS.map((item, i) => (
              <MotionCard key={item.title} item={item} index={i} x={x} vw={vw} />
            ))}
          </div>
        </motion.div>

        {/* Penanda posisi */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[min(72rem,calc(100vw-4rem))] flex items-center gap-5">
          <span className="font-inter text-[10.4px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap flex items-center gap-2">
            Gulir untuk menjelajah <MoveRight className="w-3.5 h-3.5" />
          </span>
          <div className="h-[2px] flex-1 bg-white/15 rounded-full overflow-hidden">
            <motion.div style={{ width: progress }} className="h-full bg-[#fdde09]" />
          </div>
          <span className="font-inter text-xs tabular-nums text-white/80 whitespace-nowrap">
            <span className="text-[#fdde09] font-semibold">{pad(current + 1)}</span>
            <span className="text-white/40"> / {pad(ITEMS.length)}</span>
          </span>
          <span className="hidden xl:block w-40 truncate font-inter text-[10.4px] text-white/50">{ITEMS[current].title}</span>
        </div>
      </div>
    </section>
  )
}

/** Kartu mobile: foto terbentuk dari piksel saat masuk ke layar */
function SwipeCard({ item, index }: { item: GalleryItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reveal = useMotionValue(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        animate(reveal, 1, { duration: 1, ease: [0.22, 1, 0.36, 1] })
        io.disconnect()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reveal])
  return (
    <div ref={ref} className="snap-start">
      <GalleryCard item={item} index={index} reveal={reveal} />
    </div>
  )
}

/** Mobile / reduced motion: geser horizontal biasa dengan snap */
function SwipeGallery({ animated }: { animated: boolean }) {
  return (
    <section id="sumba" className="relative w-full py-20 md:py-28" style={{ backgroundColor: BG }}>
      <SectionIntro className="px-4 sm:px-6 md:px-8 max-w-6xl mx-auto mb-10" />
      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-8 px-4 sm:px-6 md:px-8 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((item, i) =>
          animated ? (
            <SwipeCard key={item.title} item={item} index={i} />
          ) : (
            <div key={item.title} className="snap-start">
              <GalleryCard item={item} index={i} />
            </div>
          ),
        )}
      </div>
      <p className="px-4 sm:px-6 md:px-8 mt-4 font-inter text-[10.4px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        Geser untuk melihat lainnya <MoveRight className="w-3.5 h-3.5" />
      </p>
    </section>
  )
}

export default function HomeSumbaGallery() {
  const isDesktop = useIsDesktop()
  const reduce = useReducedMotion()
  return isDesktop && !reduce ? <HorizontalGallery /> : <SwipeGallery animated={!reduce} />
}
