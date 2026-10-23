import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, MousePointerClick, Pointer } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ScrambleText } from './ScrambleText'
import type { LensState } from './HeroScene'
import { HERO_OVERSCAN, HERO_SCENES, type HeroScene } from '../data/heroScenes'
import { KKN_LOCATION, distanceFromKkn, formatCoords } from '../data/places'

const HeroSceneCanvas = lazy(() => import('./HeroScene'))

const SCENE_MS = 9000
const WIPE_LOCK_MS = 1700

const STATS = [
  { value: '30', label: 'Mahasiswa' },
  { value: '4', label: 'Kluster' },
  { value: '2', label: 'Wilayah kerja' },
  { value: '50', label: 'Hari' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const sceneMeta = (s: HeroScene) => (s.place ? `${s.region} · ${distanceFromKkn(s.place)} dari Rada Mata` : s.region)
const UI_SELECTOR = '[data-hero-ui], a, button'

function supportsWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export default function HomeHero() {
  const heroRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending')
  const [ready3d, setReady3d] = useState(false)
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState(0)
  const [inView, setInView] = useState(true)
  const [exploring, setExploring] = useState(false)
  const [hinted, setHinted] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const lensRef = useRef<LensState>({ x: 0, y: 0, mode: 'rest' })
  const restRef = useRef({ x: 0, y: 0 })
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const lockRef = useRef(0)
  const heroHeight = useRef(1)
  const scrollRef = useRef(0)

  useEffect(() => {
    setMode(!reduce && supportsWebGL() ? '3d' : 'static')
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [reduce])

  // Titik pancingan: efek wipe berdenyut di area foto yang kosong dari teks
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const place = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      heroHeight.current = h
      const desktop = w >= 1024
      restRef.current = desktop ? { x: w * 0.74, y: h * 0.4 } : { x: w * 0.64, y: Math.max(170, h * 0.25) }
      if (lensRef.current.mode !== 'follow') {
        lensRef.current.x = restRef.current.x
        lensRef.current.y = restRef.current.y
      }
      const o = overlayRef.current
      if (o && mode !== '3d') {
        o.style.setProperty('--lx', `${restRef.current.x}px`)
        o.style.setProperty('--ly', `${restRef.current.y}px`)
        o.style.setProperty('--lf', '0')
        o.style.setProperty('--lo', '1')
      }
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  // Hero diam (sticky); konten berikutnya naik menutupinya seperti tirai
  const { scrollY } = useScroll()
  const cover = useTransform(scrollY, (v) => Math.min(1, Math.max(0, v / heroHeight.current)))
  useMotionValueEvent(cover, 'change', (v) => {
    scrollRef.current = v
    const visible = v < 0.6
    if (visible !== inView) setInView(visible)
    // Petunjuk kursor disembunyikan begitu tirai mulai naik
    const L = lensRef.current
    if (v > 0.12 && L.mode !== 'off') L.mode = 'off'
    else if (v <= 0.12 && L.mode === 'off') {
      L.mode = 'rest'
      L.x = restRef.current.x
      L.y = restRef.current.y
    }
  })
  const contentY = useTransform(cover, [0, 1], ['0%', '-12%'])
  const contentScale = useTransform(cover, [0, 1], [1, 0.94])
  const contentOpacity = useTransform(cover, [0, 0.65], [1, 0])
  const darken = useTransform(cover, [0, 1], [0, 0.75])

  const scene = HERO_SCENES[active]
  const nextScene = HERO_SCENES[(active + 1) % HERO_SCENES.length]
  const autoplay = !reduce && (mode === 'static' || ready3d)
  const paused = !autoplay || !inView || exploring
  const ease = [0.22, 1, 0.36, 1] as const

  const goNext = (x?: number, y?: number) => {
    const now = performance.now()
    if (now < lockRef.current) return
    lockRef.current = now + WIPE_LOCK_MS
    const origin = x !== undefined && y !== undefined ? { x, y } : null
    originRef.current = origin
    setPrev(active)
    setActive((a) => (a + 1) % HERO_SCENES.length)
  }

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = heroRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || scrollRef.current > 0.12) return
    const overUi = !!(e.target as Element).closest(UI_SELECTOR)
    const L = lensRef.current
    if (overUi) {
      L.mode = 'rest'
      L.x = restRef.current.x
      L.y = restRef.current.y
    } else {
      const p = localPoint(e)
      L.mode = 'follow'
      L.x = p.x
      L.y = p.y
    }
    if (overUi === exploring) setExploring(!overUi)
  }

  const onPointerLeave = () => {
    const L = lensRef.current
    L.mode = 'rest'
    L.x = restRef.current.x
    L.y = restRef.current.y
    setExploring(false)
  }

  const onClick = (e: ReactMouseEvent<HTMLElement>) => {
    if ((e.target as Element).closest(UI_SELECTOR)) return
    if (window.getSelection()?.toString()) return
    const p = localPoint(e)
    setHinted(true)
    goNext(p.x, p.y)
  }

  const onNextButton = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = localPoint({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 })
    setHinted(true)
    goNext(p.x, p.y)
  }


  return (
    <section
      ref={heroRef}
      aria-label="Sampul: lanskap Sumba Barat Daya"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      className="sticky top-0 z-0 w-full h-[100svh] min-h-[640px] lg:min-h-[720px] max-h-[1100px] overflow-hidden bg-[#0b1220] text-white select-none"
    >
      {/* Lapisan visual */}
      <div className="absolute inset-0">
        {mode !== 'static' && (
          <img
            src={HERO_SCENES[0].image.sm}
            srcSet={`${HERO_SCENES[0].image.sm} 1280w, ${HERO_SCENES[0].image.lg} 2560w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{
              opacity: ready3d ? 0 : 1,
              transform: `scale(${HERO_OVERSCAN})`,
              objectPosition: `${(HERO_SCENES[0].focal?.[0] ?? 0.5) * 100}% ${(HERO_SCENES[0].focal?.[1] ?? 0.5) * 100}%`,
            }}
          />
        )}

        {mode === 'static' && (
          <>
            <img
              src={HERO_SCENES[prev].image.sm}
              srcSet={`${HERO_SCENES[prev].image.sm} 1280w, ${HERO_SCENES[prev].image.lg} 2560w`}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: `${(HERO_SCENES[prev].focal?.[0] ?? 0.5) * 100}% 50%` }}
            />
            <motion.img
              key={active}
              src={scene.image.sm}
              srcSet={`${scene.image.sm} 1280w, ${scene.image.lg} 2560w`}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              initial={reduce || active === prev ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: `${(scene.focal?.[0] ?? 0.5) * 100}% 50%` }}
            />
          </>
        )}

        {mode === '3d' && (
          <Suspense fallback={null}>
            <HeroSceneCanvas
              scenes={HERO_SCENES}
              active={active}
              scrollRef={scrollRef}
              lensRef={lensRef}
              originRef={originRef}
              overlayRef={overlayRef}
              onReady={() => setReady3d(true)}
              onError={() => {
                setReady3d(false)
                setMode('static')
              }}
              className={`absolute inset-0 transition-opacity duration-500 ${ready3d ? 'opacity-100' : 'opacity-0'}`}
            />
          </Suspense>
        )}
      </div>

      {/* Gradasi agar teks terbaca */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b1220]/80 via-[#0b1220]/10 to-[#0b1220]/45" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0b1220]/65 via-[#0b1220]/15 to-transparent" />

      {/* Label pancingan (posisi dikirim kanvas lewat CSS variable); saat kursor di foto,
          piksel yang terbalik di sekitarnya sudah cukup jadi petunjuk */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ opacity: mode === 'pending' ? 0 : 1 }}
      >
        <div
          className="absolute left-0 top-0 transition-opacity duration-500"
          style={{
            transform: 'translate3d(var(--lx, -999px), var(--ly, -999px), 0)',
            opacity: hinted ? 0 : 'calc((1 - var(--lf, 0)) * var(--lo, 0))',
          }}
        >
          <span
            className="absolute left-0 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full bg-[#0b1220]/55 backdrop-blur-md border border-white/25 px-3 py-1.5 font-inter text-[10.4px] font-semibold tracking-wide"
            style={{ top: 22 }}
          >
            {isTouch ? <Pointer className="w-3.5 h-3.5" /> : <MousePointerClick className="w-3.5 h-3.5" />}
            {isTouch ? 'Ketuk foto untuk berpindah' : 'Klik foto untuk berpindah lanskap'}
          </span>
        </div>
      </div>

      <motion.div style={{ opacity: darken }} className="absolute inset-0 z-[6] pointer-events-none bg-[#0b1220]" />

      {/* Konten */}
      <motion.div
        style={reduce ? undefined : { y: contentY, scale: contentScale, opacity: contentOpacity }}
        className="relative z-10 h-full w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-end lg:justify-between pt-28 lg:pt-[clamp(132px,21vh,220px)] pb-6 lg:pb-10 pointer-events-none"
      >
        <div className="max-w-[46rem]">
          <motion.span
            data-hero-ui
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="pointer-events-auto inline-flex items-center bg-white/10 backdrop-blur-md border border-white/25 font-inter font-semibold text-[10.4px] md:text-xs uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full mb-5"
          >
            KKN-PPM UGM 2026 · Periode 2
          </motion.span>

          <motion.h1
            data-hero-ui
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease }}
            className="pointer-events-auto font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl leading-[1.06] tracking-tight mb-5 [text-shadow:_0_2px_18px_rgb(0_0_0_/_35%)]"
          >
            Pengabdian{' '}
            <span className="font-doto font-black inline-block bg-white/12 backdrop-blur-sm px-3 rounded-xl border border-white/30">
              <ScrambleText text="Nawadaya" />
            </span>
            <br />
            di Tanah Marapu
          </motion.h1>

          <motion.p
            data-hero-ui
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease }}
            className="pointer-events-auto font-inter text-sm md:text-lg text-white/85 leading-relaxed max-w-xl mb-7"
          >
            Tiga puluh mahasiswa UGM lintas kluster Saintek, Soshum, Medika, dan Agro, tinggal dan bekerja bersama warga{' '}
            <strong className="font-semibold text-white">{KKN_LOCATION.desa}, Kota Tambolaka</strong>, Sumba Barat Daya.
          </motion.p>

          <motion.div
            data-hero-ui
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65, ease }}
            className="pointer-events-auto inline-flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-2 bg-[#ffab2f] hover:bg-[#e69b2a] text-slate-900 font-inter font-semibold text-xs md:text-sm px-5 md:px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 no-underline"
            >
              <span className="sm:hidden">Program Kerja</span>
              <span className="hidden sm:inline">Eksplorasi Program Kerja</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <Link
              to="/anggota"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/40 text-white font-inter font-semibold text-xs md:text-sm px-5 md:px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 no-underline"
            >
              <span className="sm:hidden">Anggota</span>
              <span className="hidden sm:inline">Kenali Anggota KKN</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease }}
          className="mt-9 lg:mt-0 flex items-end justify-between gap-8"
        >
          {/* Keterangan foto yang sedang tampil */}
          <div data-hero-ui className="pointer-events-auto w-full sm:w-[320px]">
            <div className="flex items-center gap-3">
              <span className="font-inter text-xs tabular-nums text-white/55">{pad(active + 1)}</span>
              <div className="relative flex-1 min-w-0 h-5 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={scene.id}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="absolute inset-0 font-inter text-xs font-semibold truncate leading-5"
                  >
                    {scene.name}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={onNextButton}
                aria-label={`Lanskap berikutnya: ${nextScene.name}`}
                className="shrink-0 w-8 h-8 rounded-full border border-white/35 flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative mt-3 h-[2px] rounded-full bg-white/20 overflow-hidden">
              {autoplay ? (
                <span
                  key={`p-${active}`}
                  onAnimationEnd={() => goNext()}
                  className="hero-progress absolute inset-0 bg-white"
                  style={{ animationDuration: `${SCENE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                />
              ) : (
                <span className="absolute inset-0 bg-white/70" />
              )}
            </div>
            <p className="mt-2 font-inter text-[10.4px] text-white/55 leading-relaxed">
              {sceneMeta(scene)}
              <br />
              Foto:{' '}
              <a href={scene.credit.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline hover:text-white/80">
                {scene.credit.author}
              </a>
              , {scene.credit.license}
            </p>
          </div>

          {/* Kartu lokasi & angka */}
          <div data-hero-ui className="pointer-events-auto hidden lg:block w-[340px] rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-montserrat font-semibold text-xs">{KKN_LOCATION.desa}</p>
                <p className="font-inter text-[10.4px] text-white/60 mt-0.5">Kota Tambolaka, Sumba Barat Daya</p>
              </div>
              <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
            </div>
            <p className="font-inter text-[10.4px] text-white/45 tabular-nums mt-1">{formatCoords(KKN_LOCATION)}</p>
            <dl className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/15">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <dt className="order-2 font-inter text-[10.4px] text-white/60 leading-tight">{s.label}</dt>
                  <dd className="order-1 font-montserrat font-bold text-xl leading-none">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
