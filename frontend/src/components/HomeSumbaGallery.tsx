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
import AsciiVeil from './AsciiVeil'
import { AsciiBloom, BrandFrame } from './Brand'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { BRAND, type BrandColor } from '../data/theme'
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

/** Lapisan latar yang bergerak lebih lambat dari kartu: hanya wilayah kerja tim + nama lokal Sumba */
const BACKDROP_NAMES = ['Rada Mata', 'Humba', 'Kota Tambolaka', 'Marapu']

/** Warna latar section; dipakai juga oleh tirai ASCII agar menyatu */
const BG = BRAND.deep

/** Bingkai mini tiap kartu bergiliran warna palet, seperti deretan slide brand kit */
const CARD_FRAMES: BrandColor[] = ['peach', 'yellow', 'teal', 'rose', 'mint', 'coral']

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

function SectionIntro({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <SectionHeading index="02" eyebrow="Humba Hammu" lead="Mengenal" highlight="Tanah Sumba" tone="dark" accent={BRAND.yellow}>
        Tim bertugas di Rada Mata dan Kota Tambolaka. Galeri ini mengenalkan budaya Marapu, tenun ikat, dan lanskap Sumba Barat Daya di sekitarnya.
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
      <div className="relative h-[52vh] lg:h-[58vh] min-h-[320px] overflow-hidden bg-brand-deep">
        <motion.img
          src={item.photo.src}
          alt={item.photo.alt}
          loading="lazy"
          decoding="async"
          style={motionStyle ? { x: motionStyle.photoX, scale: 1.3 } : undefined}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-transparent to-transparent" />
        <span className="absolute top-[clamp(22px,2.4vw,34px)] left-[clamp(22px,2.4vw,34px)] z-[2] font-mono font-bold text-xs text-slate-900 bg-white px-2.5 py-1 rounded-full">
          [{pad(index + 1)}]
        </span>
        <span className="absolute bottom-[clamp(20px,2.2vw,30px)] right-[clamp(22px,2.4vw,34px)] z-[2] font-mono text-[10.4px] text-white/75">
          {item.photo.author} · {item.photo.license}
        </span>
        <BrandFrame color={CARD_FRAMES[index % CARD_FRAMES.length]} width="clamp(26px,2.6vw,40px)" className="absolute inset-1 z-[1]" />
        {reveal && <AsciiVeil progress={reveal} seed={index + 1} color={BG} glyph={BRAND.yellow} cell={16} />}
      </div>
      <motion.figcaption style={motionStyle ? { x: motionStyle.captionX } : undefined} className="pr-6">
        <span className="font-mono text-[10.4px] font-medium uppercase tracking-wider text-brand-yellow">
          {item.region}
          {item.place && <span className="text-white/55 normal-case tracking-normal"> · {distanceFromKkn(item.place)} dari Rada Mata</span>}
        </span>
        <h3 className="font-montserrat font-bold text-lg text-white mt-1 mb-1.5">{item.title}</h3>
        <p className="font-inter text-xs text-white/70 leading-relaxed max-w-md">{item.desc}</p>
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
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center bg-deep-ascii">
        <BrandFrame color="white" className="absolute inset-1.5 sm:inset-2 z-20 opacity-80" />
        <AsciiBloom kind="garland" color="peach" className="absolute z-20 left-[-2%] top-[-6%] w-[clamp(200px,22vw,380px)] rotate-[160deg] opacity-80" />
        <AsciiBloom kind="rose" color="teal" dir={[-1, -1]} className="absolute z-20 right-[-1%] bottom-[-4%] w-[clamp(140px,14vw,240px)] rotate-[190deg] opacity-80" />
        {/* Lapisan latar: nama-nama tempat bergaris tepi, bergerak lambat */}
        <motion.div
          aria-hidden="true"
          style={{ x: backdropX }}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-10 w-max pl-[30vw] pointer-events-none select-none"
        >
          {backdropRow.map((name, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-montserrat font-black text-[146px] leading-none tracking-tight whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_rgba(246,239,228,0.1)]">
                {name}
              </span>
              <span className="font-mono font-bold text-5xl text-brand-yellow/20 whitespace-nowrap">·:*:·</span>
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
          <span className="font-mono text-[10.4px] uppercase tracking-wider text-white/60 whitespace-nowrap flex items-center gap-2">
            Gulir untuk menjelajah <MoveRight className="w-3.5 h-3.5" />
          </span>
          <div className="h-[2px] flex-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div style={{ width: progress }} className="h-full bg-brand-yellow" />
          </div>
          <span className="font-mono text-xs tabular-nums text-white/80 whitespace-nowrap">
            <span className="text-brand-yellow font-bold">{pad(current + 1)}</span>
            <span className="text-white/45"> / {pad(ITEMS.length)}</span>
          </span>
          <span className="hidden xl:block w-40 truncate font-mono text-[10.4px] text-white/55">{ITEMS[current].title}</span>
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
    <section id="sumba" className="relative isolate w-full py-24 md:py-28 bg-deep-ascii overflow-hidden">
      <BrandFrame color="white" className="absolute inset-1.5 z-20 opacity-80" />
      <SectionIntro className="px-[clamp(44px,7vw,72px)] max-w-6xl mx-auto mb-10" />
      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-[clamp(44px,7vw,72px)] px-[clamp(44px,7vw,72px)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      <p className="px-[clamp(44px,7vw,72px)] mt-4 font-mono text-[10.4px] uppercase tracking-wider text-white/60 flex items-center gap-2">
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
