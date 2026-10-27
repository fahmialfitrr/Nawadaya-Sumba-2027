import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, MousePointerClick, Pointer } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import AsciiReveal from './AsciiReveal'
import { ScrambleText } from './ScrambleText'
import { HERO_OVERSCAN, HERO_SCENES, type HeroScene } from '../data/heroScenes'
import { KKN_LOCATION, distanceFromKkn } from '../data/places'

const HeroSceneCanvas = lazy(() => import('./HeroScene'))

const WIPE_LOCK_MS = 2000
/** Judul tetap dimunculkan bila WebGL belum siap dalam waktu ini */
const REVEAL_FALLBACK_MS = 1800
/**
 * Petunjuk "klik untuk ganti lanskap" di dekat kursor: muncul 3 dtk setelah kuda & bunga
 * selesai terurai dari ASCII, tampil 4 dtk, lalu berulang tiap 20 dtk. Siklusnya mulai
 * lagi dari awal setiap kali beranda dibuka (refresh atau datang dari halaman lain).
 */
const HINT = { firstDelay: 3000, show: 4000, every: 20000 }

const ART = {
  wordmark: { src: '/images/hero/wordmark.webp', w: 1170, h: 641 },
  horse: { src: '/images/hero/horse.webp', w: 928, h: 1002 },
  flower: { src: '/images/art/flower.webp', w: 720, h: 922 },
}

const pad = (n: number) => String(n).padStart(2, '0')
const sceneMeta = (s: HeroScene) => (s.place ? `${s.region} · ${distanceFromKkn(s.place)} dari Rada Mata` : s.region)
const srcSet = (s: HeroScene) => `${s.image.sm} 1280w, ${s.image.lg} ${s.image.lgWidth}w`
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
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending')
  const [ready3d, setReady3d] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState(0)
  const [atTop, setAtTop] = useState(true)
  const [assetsDone, setAssetsDone] = useState(false)
  const [hintOn, setHintOn] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const hintRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)

  const lockRef = useRef(0)
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const heroHeight = useRef(1)
  const scrollRef = useRef(0)

  useEffect(() => {
    setMode(!reduce && supportsWebGL() ? '3d' : 'static')
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [reduce])

  // Judul & ornamen ASCII terurai setelah lanskap tampil
  useEffect(() => {
    if (mode === 'static' || ready3d) setRevealed(true)
  }, [mode, ready3d])
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), REVEAL_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!revealed) return
    const t = setTimeout(() => setAssetsDone(true), 4000)
    return () => clearTimeout(t)
  }, [revealed])

  useEffect(() => {
    if (!assetsDone) return
    let t: ReturnType<typeof setTimeout>
    const show = () => {
      setHintOn(true)
      t = setTimeout(hide, HINT.show)
    }
    const hide = () => {
      setHintOn(false)
      t = setTimeout(show, HINT.every - HINT.show)
    }
    t = setTimeout(show, HINT.firstDelay)
    return () => clearTimeout(t)
  }, [assetsDone])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const measure = () => {
      heroHeight.current = el.clientHeight || 1
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Parallax lapisan ornamen: makin dekat ke penonton, makin jauh bergeser melawan kursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const spring = { stiffness: 55, damping: 18, mass: 0.7 }
  const sx = useSpring(mx, spring)
  const sy = useSpring(my, spring)
  const markX = useTransform(sx, (v) => v * -9)
  const markY = useTransform(sy, (v) => v * -6)
  const horseX = useTransform(sx, (v) => v * -20)
  const horseY = useTransform(sy, (v) => v * -12)
  const nearX = useTransform(sx, (v) => v * -32)
  const nearY = useTransform(sy, (v) => v * -20)

  // Hero diam (sticky); konten berikutnya naik menutupinya seperti tirai
  const { scrollY } = useScroll()
  const cover = useTransform(scrollY, (v) => Math.min(1, Math.max(0, v / heroHeight.current)))
  useMotionValueEvent(cover, 'change', (v) => {
    scrollRef.current = v
    const top = v < 0.1
    if (top !== atTop) setAtTop(top)
  })
  // Keluar dari sampul: judul mendekat lalu memudar, bingkai melebar seolah kamera
  // melewatinya, bunga terbang ke tepi, teks pendukung pergi lebih dulu.
  // Sementara itu lanskapnya terurai jadi ASCII dari tepi tirai (lihat HeroScene).
  const titleScale = useTransform(cover, [0, 1], [1, 1.24])
  const titleY = useTransform(cover, [0, 1], ['0%', '-7%'])
  const titleOpacity = useTransform(cover, [0.04, 0.58], [1, 0])
  const horseLift = useTransform(cover, [0, 1], [0, -110])
  const horseYAll = useTransform(() => horseY.get() + horseLift.get())
  const uiOpacity = useTransform(cover, [0, 0.28], [1, 0])
  const uiY = useTransform(cover, [0, 0.35], [0, 40])
  const pillY = useTransform(cover, [0, 0.35], [0, -30])
  const frameScale = useTransform(cover, [0, 0.7], [1, 1.18])
  const frameOpacity = useTransform(cover, [0.08, 0.62], [1, 0])
  const fly = useTransform(cover, [0, 0.8], [0, 1])
  const flyTL = { x: useTransform(fly, (v) => `${v * -16}vw`), y: useTransform(fly, (v) => `${v * -18}vh`) }
  const flyBR = { x: useTransform(fly, (v) => `${v * 16}vw`), y: useTransform(fly, (v) => `${v * 18}vh`) }
  const flyR = { x: useTransform(fly, (v) => `${v * 20}vw`), y: useTransform(fly, (v) => `${v * -6}vh`) }
  const darken = useTransform(cover, [0, 1], [0, 0.5])

  const scene = HERO_SCENES[active]
  const nextScene = HERO_SCENES[(active + 1) % HERO_SCENES.length]
  const ease = [0.22, 1, 0.36, 1] as const

  // Gelombang ASCII memancar dari titik (x, y); tanpa titik = dari tengah layar
  const goNext = (x?: number, y?: number) => {
    const now = performance.now()
    if (now < lockRef.current) return
    lockRef.current = now + WIPE_LOCK_MS
    originRef.current = x !== undefined && y !== undefined ? { x, y } : null
    setPrev(active)
    setActive((a) => (a + 1) % HERO_SCENES.length)
  }

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = heroRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  // Petunjuk mengikuti kursor; tanpa kursor (layar sentuh) tampil di tengah atas judul
  const placeHint = () => {
    const el = hintRef.current
    const hero = heroRef.current
    if (!el || !hero) return
    const p = pointerRef.current
    if (!p) {
      el.style.transform = `translate3d(${hero.clientWidth / 2}px, ${hero.clientHeight * 0.3}px, 0) translateX(-50%)`
      return
    }
    const flip = p.x > hero.clientWidth - 300
    el.style.transform = flip
      ? `translate3d(${p.x - 16}px, ${p.y + 22}px, 0) translateX(-100%)`
      : `translate3d(${p.x + 18}px, ${p.y + 22}px, 0)`
  }
  useEffect(() => {
    if (hintOn) placeHint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintOn])

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    pointerRef.current = localPoint(e)
    placeHint()
    if (reduce) return
    mx.set((e.clientX / window.innerWidth) * 2 - 1)
    my.set((e.clientY / window.innerHeight) * 2 - 1)
  }

  const onPointerLeave = () => {
    pointerRef.current = null
    placeHint()
    mx.set(0)
    my.set(0)
  }

  // Klik di area foto (bukan tombol/teks) berganti lanskap
  const onClick = (e: ReactMouseEvent<HTMLElement>) => {
    if ((e.target as Element).closest(UI_SELECTOR)) return
    if (window.getSelection()?.toString()) return
    const p = localPoint(e)
    goNext(p.x, p.y)
  }

  const onNextButton = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = localPoint({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 })
    goNext(p.x, p.y)
  }

  return (
    <section
      ref={heroRef}
      aria-label="Sampul: lanskap Sumba Barat Daya"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      className="sticky top-0 z-0 w-full h-[100svh] min-h-[600px] max-h-[1100px] overflow-hidden bg-[#0b1220] text-white select-none"
    >
      {/* Lapisan visual */}
      <div className="absolute inset-0">
        {mode !== 'static' && (
          <img
            src={HERO_SCENES[0].image.sm}
            srcSet={srcSet(HERO_SCENES[0])}
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
              srcSet={srcSet(HERO_SCENES[prev])}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: `${(HERO_SCENES[prev].focal?.[0] ?? 0.5) * 100}% 50%` }}
            />
            <motion.img
              key={active}
              src={scene.image.sm}
              srcSet={srcSet(scene)}
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
              originRef={originRef}
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

      {/* Gradasi agar judul & teks terbaca */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_58%_at_50%_54%,rgba(11,18,32,0.5),rgba(11,18,32,0)_72%)]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b1220]/80 via-[#0b1220]/0 to-[#0b1220]/40" />

      {/* Bunga ASCII di sudut, lapisan paling dekat ke penonton */}
      <motion.div
        aria-hidden="true"
        style={{ x: nearX, y: nearY }}
        className="absolute inset-[-40px] z-[4] pointer-events-none"
      >
        <motion.div style={reduce ? undefined : flyTL} className="absolute left-[-3%] top-[-9%] w-[clamp(190px,29vw,500px)]">
        <div className="-scale-x-100 -rotate-[24deg]">
          <AsciiReveal
            src={ART.flower.src}
            width={ART.flower.w}
            height={ART.flower.h}
            mode="image"
            idle="fall"
            idlePaused={!atTop}
            cell={11}
            delay={500}
            duration={1600}
            dir={[-1, 1]}
            play={revealed}
            glitchKey={active}
            color="#f8fafc"
            className="w-full"
          />
        </div>
        </motion.div>
        <motion.div style={reduce ? undefined : flyBR} className="absolute right-[-2%] bottom-[-10%] w-[clamp(190px,27vw,470px)]">
        <div className="rotate-[160deg]">
          <AsciiReveal
            src={ART.flower.src}
            width={ART.flower.w}
            height={ART.flower.h}
            mode="image"
            idle="fall"
            idlePaused={!atTop}
            cell={11}
            delay={750}
            duration={1600}
            dir={[1, 1]}
            play={revealed}
            glitchKey={active}
            color="#f8fafc"
            className="w-full"
          />
        </div>
        </motion.div>
        <motion.div style={reduce ? undefined : flyR} className="hidden lg:block absolute right-[1.5%] top-[22%] w-[clamp(110px,12vw,210px)]">
        <div className="rotate-[205deg]">
          <AsciiReveal
            src={ART.flower.src}
            width={ART.flower.w}
            height={ART.flower.h}
            mode="image"
            idle="fall"
            idlePaused={!atTop}
            cell={9}
            delay={1000}
            duration={1200}
            dir={[0, 1]}
            play={revealed}
            color="#f8fafc"
            className="w-full opacity-80"
          />
        </div>
        </motion.div>
      </motion.div>

      {/* Bingkai ornamen */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { scale: frameScale, opacity: frameOpacity }}
        className="hero-frame absolute inset-1.5 sm:inset-2.5 z-[7] pointer-events-none"
      />

      <motion.div style={{ opacity: darken }} className="absolute inset-0 z-[8] pointer-events-none bg-ink-900" />

      {/* Petunjuk di dekat kursor: klik foto untuk ganti lanskap */}
      <div ref={hintRef} aria-hidden="true" className="absolute left-0 top-0 z-20 pointer-events-none will-change-transform">
        <AnimatePresence>
          {hintOn && atTop && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.3, ease }}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white text-slate-900 pl-1.5 pr-3.5 py-1.5 font-mono text-[10.4px] font-bold uppercase tracking-wider shadow-[0_10px_30px_rgba(11,18,32,0.35)]"
            >
              <span className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center">
                {isTouch ? <Pointer className="w-3.5 h-3.5" /> : <MousePointerClick className="w-3.5 h-3.5" />}
              </span>
              <ScrambleText text={isTouch ? 'Ketuk untuk ganti lanskap' : 'Klik untuk ganti lanskap'} duration={700} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Konten */}
      <div
        className="relative z-10 h-full w-full flex flex-col items-center px-[clamp(24px,5.5vw,104px)] pt-[clamp(80px,11vh,120px)] pb-[clamp(32px,4.4vw,80px)] pointer-events-none"
      >
        <motion.div style={reduce ? undefined : { y: pillY, opacity: uiOpacity }} className="relative z-[2] shrink-0">
        <motion.div
          data-hero-ui
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="pointer-events-auto relative z-[2] shrink-0 inline-flex items-center gap-3 rounded-full bg-[#0b1220]/30 border border-white/70 pl-4 pr-3.5 py-1.5"
        >
          <img src="/images/brand/ugm-white.png" alt="Universitas Gadjah Mada" width={421} height={120} className="h-5 md:h-6 w-auto" />
          <span className="w-px h-4 bg-white/50" />
          <span className="font-inter font-semibold text-[10.4px] md:text-xs uppercase tracking-[0.16em] whitespace-nowrap">
            KKN-PPM 2026 · Periode 2
          </span>
        </motion.div>
        </motion.div>

        {/* Judul: kuda ASCII dan wordmark sama-sama di tengah. Ukurannya mengikuti tinggi
            ruang yang tersisa (cqh), jadi kuda tidak pernah menabrak navbar atau teks di bawah. */}
        <motion.div
          style={reduce ? undefined : { scale: titleScale, y: titleY, opacity: titleOpacity }}
          className="relative flex-1 min-h-[180px] w-full my-[clamp(8px,2vh,20px)] [container-type:size]"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              style={{ x: horseX, y: horseYAll }}
              className="shrink-0 h-[min(100cqh,640px)] aspect-[928/1002] pointer-events-none"
            >
              <AsciiReveal
                src={ART.horse.src}
                width={ART.horse.w}
                height={ART.horse.h}
                mode="image"
                cell={11}
                delay={450}
                duration={2400}
                dir={[1, -1.2]}
                play={revealed}
                glitchKey={active}
                onDone={() => setAssetsDone(true)}
                idle="shimmer"
                idlePaused={!atTop}
                className="w-full h-full opacity-[0.82]"
              />
            </motion.div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1 style={{ x: markX, y: markY }} className="shrink-0 w-[min(112cqh,86vw,660px)] pointer-events-none">
              <span className="sr-only">Nawadaya Sumba</span>
              <AsciiReveal
                src={ART.wordmark.src}
                width={ART.wordmark.w}
                height={ART.wordmark.h}
                mode="image"
                cell={9}
                delay={0}
                duration={1200}
                dir={[1, 0.25]}
                play={revealed}
                className="w-full"
              />
            </motion.h1>
          </div>
        </motion.div>

        {/* Bawah: keterangan foto | ajakan */}
        <motion.div style={reduce ? undefined : { y: uiY, opacity: uiOpacity }} className="shrink-0 w-full flex justify-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 16 }}
          transition={{ duration: 1, delay: 0.9, ease }}
          className="shrink-0 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,37rem)_minmax(0,1fr)] items-end gap-5 lg:gap-8"
        >
          {/* Keterangan foto yang sedang tampil */}
          <div data-hero-ui className="order-2 lg:order-1 pointer-events-auto w-full lg:max-w-[290px] justify-self-start">
            <div className="flex items-center gap-3">
              <span className="font-inter text-xs tabular-nums text-white/60">{pad(active + 1)}</span>
              <div className="relative flex-1 min-w-0 h-5 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={scene.id}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="absolute inset-0 font-inter text-xs font-semibold truncate leading-5 text-left"
                  >
                    {scene.name}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={onNextButton}
                aria-label={`Lanskap berikutnya: ${nextScene.name}`}
                className="shrink-0 w-8 h-8 rounded-full border border-white/40 bg-[#0b1220]/30 flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {HERO_SCENES.map((s, i) => (
                <span key={s.id} className={`h-[2px] flex-1 rounded-full transition-colors duration-500 ${i === active ? 'bg-white' : 'bg-white/25'}`} />
              ))}
            </div>
            <p className="mt-2 font-inter text-[10.4px] text-white/60 leading-relaxed text-left">
              {sceneMeta(scene)}
              {scene.credit && (
                <>
                  <br />
                  Foto:{' '}
                  <a href={scene.credit.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline hover:text-white/85">
                    {scene.credit.author}
                  </a>
                  , {scene.credit.license}
                </>
              )}
            </p>
            <p className="sr-only">Klik atau ketuk foto untuk berganti lanskap.</p>
          </div>

          <div className="order-1 lg:order-2 flex flex-col items-center text-center">
            <p
              data-hero-ui
              className="pointer-events-auto font-inter text-xs sm:text-sm text-white/90 leading-relaxed mb-[clamp(10px,2vh,16px)] [text-shadow:_0_1px_14px_rgb(11_18_32_/_70%)]"
            >
              Tiga puluh mahasiswa UGM lintas kluster tinggal dan mengabdi bersama warga{' '}
              <strong className="font-semibold text-white">{KKN_LOCATION.desa}, Kota Tambolaka</strong>, Sumba Barat Daya.
            </p>
            <div data-hero-ui className="pointer-events-auto inline-flex flex-wrap justify-center gap-2.5">
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-1.5 bg-[#ffab2f] hover:bg-[#e69b2a] text-slate-900 font-inter font-semibold text-xs px-4 sm:px-5 py-2.5 rounded-full transition-colors no-underline"
              >
                <span className="sm:hidden">Program Kerja</span>
                <span className="hidden sm:inline">Eksplorasi Program Kerja</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/anggota"
                className="inline-flex items-center justify-center gap-1.5 bg-[#0b1220]/35 hover:bg-white/15 border border-white/60 text-white font-inter font-semibold text-xs px-4 sm:px-5 py-2.5 rounded-full transition-colors no-underline"
              >
                <span className="sm:hidden">Anggota</span>
                <span className="hidden sm:inline">Kenali Anggota KKN</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
