import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { MapPin, Mail, Globe } from 'lucide-react'
import SectionHeading from './SectionHeading'
import AsciiReveal from './AsciiReveal'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'
import { KKN_LOCATION, formatCoords } from '../data/places'
import { CLUSTER_COLOR, SENJA } from '../data/theme'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const CLUSTERS = [
  { name: 'Saintek', color: CLUSTER_COLOR.Saintek, focus: 'Energi surya & pemetaan desa' },
  { name: 'Soshum', color: CLUSTER_COLOR.Soshum, focus: 'Literasi anak & lingkungan' },
  { name: 'Medika', color: CLUSTER_COLOR.Medika, focus: 'Gizi & kesehatan keluarga' },
  { name: 'Agro', color: CLUSTER_COLOR.Agro, focus: 'Pakan ternak & pertanian' },
]

const FACTS = [
  { label: 'Desa', value: 'Rada Mata' },
  { label: 'Kecamatan', value: 'Kota Tambolaka' },
  { label: 'Kabupaten', value: 'Sumba Barat Daya' },
  { label: 'Provinsi', value: 'Nusa Tenggara Timur' },
]

// Posisi Kantor Desa Rada Mata pada siluet pulau (proyeksi yang sama dengan LOCATOR_PATHS)
const RADA_MATA_ON_ISLAND = { left: '18.1%', top: '16.2%' }

/** Pulau Sumba dari karakter ASCII; Kabupaten Sumba Barat Daya menyala emas */
function AsciiIsland() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className="frame-corners relative rounded-3xl border border-white/10 bg-ink-850/80 p-5 sm:p-6">
      <div className="flex items-center gap-2 font-mono text-[10.4px] uppercase tracking-[0.18em] mb-3">
        <span className="text-mist">Pulau Sumba</span>
        <span className="text-dusk">· NTT</span>
      </div>
      <div className="relative">
        <AsciiReveal
          src="/images/ascii/sumba-island.svg"
          width={1280}
          height={724}
          mode="ascii"
          cell={8}
          delay={0}
          duration={1500}
          dir={[1, 0]}
          play={inView}
          color={SENJA.mist}
          className="w-full opacity-40"
        />
        <div className="absolute inset-0">
          <AsciiReveal
            src="/images/ascii/sumba-sbd.svg"
            width={1280}
            height={724}
            mode="ascii"
            cell={8}
            delay={500}
            duration={900}
            dir={[1, 0.4]}
            play={inView}
            color={SENJA.gold}
            className="w-full"
          />
        </div>
        <span
          style={RADA_MATA_ON_ISLAND}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700"
        >
          <span className="relative flex w-3 h-3" style={{ opacity: inView ? 1 : 0 }}>
            <span className="absolute inset-0 rounded-full bg-senja-coral/70 animate-ping" />
            <span className="relative w-3 h-3 rounded-full bg-senja-coral border-2 border-cream" />
          </span>
          <span
            className="absolute left-4 top-3 sm:-top-[3.2rem] whitespace-nowrap rounded-lg bg-ink-900/90 border border-white/15 px-2.5 py-1.5 font-mono text-[10.4px] leading-tight text-cream"
            style={{ opacity: inView ? 1 : 0 }}
          >
            <span className="block text-senja-gold uppercase tracking-wider">{KKN_LOCATION.desa}</span>
            Kota Tambolaka
          </span>
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-white/10 w-[44%] min-w-[150px] flex flex-col items-start gap-1.5 font-mono text-[10.4px] text-mist">
        <span className="flex items-center gap-1.5">
          <span className="text-senja-gold font-bold">#</span> Kab. Sumba Barat Daya
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-dusk font-bold">:</span> Pulau Sumba
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-senja-coral" /> Wilayah KKN
        </span>
      </div>
    </div>
  )
}

export default function HomeAbout() {
  const links = [
    { name: `${KKN_LOCATION.desa}, Kota Tambolaka`, icon: MapPin, href: '#map' },
    { name: 'kkn.nawadaya.sumba@ugm.ac.id', icon: Mail, href: 'mailto:kkn.nawadaya.sumba@ugm.ac.id' },
    { name: '@kkn.nawadayasumba', icon: InstagramIcon, href: 'https://instagram.com' },
    { name: 'kkn.ugm.ac.id', icon: Globe, href: 'https://kkn.ugm.ac.id' },
  ]

  return (
    <section id="about" className="relative w-full py-24 md:py-32 px-4 sm:px-6 md:px-8 flex justify-center scroll-mt-20">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

        {/* Kiri: peta ASCII + foto warga */}
        <div className="lg:col-span-6 relative w-full max-w-xl mx-auto lg:mx-0 pb-28 sm:pb-32">
          <AsciiIsland />

          <div className="absolute right-0 bottom-0 w-[54%]">
            <ScrollPhoto
              src={SUMBA_PHOTOS.gobakSodor.src}
              alt={SUMBA_PHOTOS.gobakSodor.alt}
              strength={10}
              delay={0.2}
              veil={SENJA.ink}
              className="w-full aspect-[4/3] rounded-2xl border-[6px] border-ink-900 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            />
            <span className="block mt-2 pl-2 font-mono text-[10.4px] text-dusk">Gobak sodor · Sumba Barat Daya</span>
          </div>

          <Reveal delay={0.4} className="absolute -top-5 right-3 sm:right-6">
            <div className="bg-senja-gold text-ink-900 rounded-xl px-3.5 py-2.5 shadow-[0_10px_30px_rgba(255,197,107,0.25)] rotate-3">
              <span className="block font-montserrat font-extrabold text-xl leading-none">50</span>
              <span className="block font-mono text-[10.4px] font-bold uppercase tracking-wider mt-1">Hari Kerja</span>
            </div>
          </Reveal>
        </div>

        {/* Kanan: teks */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <SectionHeading index="01" eyebrow="Tentang Kami" lead="Tentang" highlight="Nawadaya" />

          <Reveal delay={0.1}>
            <p className="font-inter text-sm text-mist leading-[1.75]">
              Kami adalah <strong className="font-semibold text-cream">30 mahasiswa Universitas Gadjah Mada</strong> yang mengabdi di{' '}
              <strong className="font-semibold text-cream">Desa Rada Mata, Kecamatan Kota Tambolaka</strong>, ibu kota Kabupaten Sumba Barat Daya. Misi kami: berjalan berdampingan bersama warga untuk membangun kemandirian energi surya, penguatan literasi anak, ketahanan pakan ternak, dan perbaikan gizi keluarga.
            </p>
          </Reveal>

          {/* Angka singkat */}
          <Reveal delay={0.11}>
            <dl className="grid grid-cols-4 gap-3 rounded-2xl bg-ink-850/80 border border-white/10 p-4">
              {[
                ['30', 'Mahasiswa'],
                ['4', 'Kluster'],
                ['2', 'Wilayah kerja'],
                ['50', 'Hari'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="order-2 font-mono text-[10.4px] text-dusk leading-tight">{label}</dt>
                  <dd className="order-1 font-montserrat font-extrabold text-xl text-cream leading-none">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Fakta lokasi */}
          <Reveal delay={0.12}>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4">
              {FACTS.map((f) => (
                <div key={f.label} className="border-l border-senja-gold/40 pl-3">
                  <dt className="font-mono text-[10.4px] uppercase tracking-wider text-dusk">{f.label}</dt>
                  <dd className="font-montserrat font-semibold text-xs text-cream mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 font-mono text-[10.4px] text-dusk tabular-nums">{formatCoords(KKN_LOCATION)}</p>
          </Reveal>

          {/* Kluster */}
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {CLUSTERS.map((c) => (
                <div key={c.name} className="p-3 rounded-2xl bg-ink-850/70 border border-white/10">
                  <span className="flex items-center gap-2 font-montserrat font-bold text-xs" style={{ color: c.color }}>
                    <span className="font-mono">[#]</span>
                    {c.name}
                  </span>
                  <span className="block font-inter text-[10.4px] text-mist leading-snug mt-1">{c.focus}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Kontak */}
          <Reveal delay={0.2}>
            <h3 className="font-mono font-medium text-[10.4px] uppercase tracking-[0.18em] text-dusk mb-2">
              Posko & Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2.5 p-2 -ml-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors no-underline group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-senja-gold group-hover:border-senja-gold flex items-center justify-center text-senja-gold group-hover:text-ink-900 shrink-0 transition-colors">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="font-inter text-xs text-mist group-hover:text-cream transition-colors truncate">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
