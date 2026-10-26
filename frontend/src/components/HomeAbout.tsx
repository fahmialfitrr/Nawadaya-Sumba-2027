import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { MapPin, Mail, Globe } from 'lucide-react'
import SectionHeading from './SectionHeading'
import AsciiReveal from './AsciiReveal'
import { Slide } from './Brand'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'
import { KKN_LOCATION, formatCoords } from '../data/places'
import { BRAND, CLUSTER_THEME, type Cluster } from '../data/theme'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const CLUSTERS: Array<{ name: Cluster; focus: string }> = [
  { name: 'Saintek', focus: 'Energi surya & pemetaan desa' },
  { name: 'Soshum', focus: 'Literasi anak & lingkungan' },
  { name: 'Medika', focus: 'Gizi & kesehatan keluarga' },
  { name: 'Agro', focus: 'Pakan ternak & pertanian' },
]

const FACTS = [
  { label: 'Desa', value: 'Rada Mata' },
  { label: 'Kecamatan', value: 'Kota Tambolaka' },
  { label: 'Kabupaten', value: 'Sumba Barat Daya' },
  { label: 'Provinsi', value: 'Nusa Tenggara Timur' },
]

const STATS = [
  ['30', 'Mahasiswa'],
  ['4', 'Kluster'],
  ['2', 'Wilayah kerja'],
  ['50', 'Hari'],
]

// Posisi Kantor Desa Rada Mata pada siluet pulau (proyeksi yang sama dengan LOCATOR_PATHS)
const RADA_MATA_ON_ISLAND = { left: '18.1%', top: '16.2%' }

/** Pulau Sumba dari karakter ASCII; Kabupaten Sumba Barat Daya disorot peach */
function AsciiIsland() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className="relative rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-2 font-mono text-[10.4px] uppercase tracking-[0.18em] mb-3">
        <span className="text-slate-700 font-bold">Pulau Sumba</span>
        <span className="text-slate-400">· NTT</span>
      </div>
      <div className="relative">
        <AsciiReveal
          src="/images/ascii/sumba-island.svg"
          width={1280}
          height={724}
          mode="ascii"
          cell={8}
          duration={1500}
          dir={[1, 0]}
          play={inView}
          color="#94a3b8"
          className="w-full opacity-70"
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
            color={BRAND.peach}
            className="w-full"
          />
        </div>
        <span style={RADA_MATA_ON_ISLAND} className="absolute -translate-x-1/2 -translate-y-1/2">
          <span className="relative flex w-3 h-3 transition-opacity duration-700" style={{ opacity: inView ? 1 : 0 }}>
            <span className="absolute inset-0 rounded-full bg-brand-coral/60 animate-ping" />
            <span className="relative w-3 h-3 rounded-full bg-brand-coral border-2 border-white" />
          </span>
          <span
            className="absolute left-4 top-3 sm:-top-[3.2rem] whitespace-nowrap rounded-lg bg-brand-blue px-2.5 py-1.5 font-mono text-[10.4px] leading-tight text-white shadow-lg transition-opacity duration-700"
            style={{ opacity: inView ? 1 : 0 }}
          >
            <span className="block text-brand-yellow uppercase tracking-wider">{KKN_LOCATION.desa}</span>
            Kota Tambolaka
          </span>
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-dashed border-slate-200 w-[44%] min-w-[150px] flex flex-col items-start gap-1.5 font-mono text-[10.4px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="font-bold" style={{ color: BRAND.peach }}>#</span> Kab. Sumba Barat Daya
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">:</span> Pulau Sumba
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-coral" /> Wilayah KKN
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
    <Slide
      id="about"
      frame="peach"
      photo="/images/sumba/hero/sabana-senja-1280.webp"
      blooms={[
        { kind: 'flower', color: 'teal', className: 'right-[-3%] top-[-4%] w-[clamp(150px,20vw,330px)] rotate-[200deg]' },
        { kind: 'rose', color: 'teal', className: 'left-[-2%] bottom-[-3%] w-[clamp(130px,16vw,260px)] -rotate-12', dir: [1, -1] },
      ]}
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
        {/* Kiri: peta ASCII + foto warga */}
        <div className="lg:col-span-6 relative w-full max-w-xl mx-auto lg:mx-0 pb-28 sm:pb-32">
          <AsciiIsland />

          <div className="absolute right-0 bottom-0 w-[54%]">
            <ScrollPhoto
              src={SUMBA_PHOTOS.gobakSodor.src}
              alt={SUMBA_PHOTOS.gobakSodor.alt}
              strength={10}
              delay={0.2}
              veil={BRAND.paper}
              className="w-full aspect-[4/3] rounded-2xl border-[6px] border-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
            />
            <span className="block mt-2 pl-2 font-mono text-[10.4px] text-slate-500">Gobak sodor · Sumba Barat Daya</span>
          </div>

          <Reveal delay={0.4} className="absolute -top-5 right-3 sm:right-6">
            <div className="bg-brand-yellow text-slate-900 rounded-xl px-3.5 py-2.5 shadow-[0_10px_30px_rgba(253,222,9,0.35)] rotate-3">
              <span className="block font-montserrat font-extrabold text-xl leading-none">50</span>
              <span className="block font-mono text-[10.4px] font-bold uppercase tracking-wider mt-1">Hari Kerja</span>
            </div>
          </Reveal>
        </div>

        {/* Kanan: teks */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <SectionHeading index="01" eyebrow="Tentang Kami" lead="Tentang" highlight="Nawadaya" accent={BRAND.blue} />

          <Reveal delay={0.1}>
            <p className="font-inter text-sm text-slate-600 leading-[1.75]">
              Kami adalah <strong className="font-semibold text-slate-900">30 mahasiswa Universitas Gadjah Mada</strong> yang mengabdi di{' '}
              <strong className="font-semibold text-slate-900">Desa Rada Mata, Kecamatan Kota Tambolaka</strong>, ibu kota Kabupaten Sumba Barat Daya. Misi kami: berjalan berdampingan bersama warga untuk membangun kemandirian energi surya, penguatan literasi anak, ketahanan pakan ternak, dan perbaikan gizi keluarga.
            </p>
          </Reveal>

          <Reveal delay={0.11}>
            <dl className="grid grid-cols-4 gap-3 rounded-2xl bg-brand-blue text-white p-4">
              {STATS.map(([value, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="order-2 font-mono text-[10.4px] text-white/70 leading-tight">{label}</dt>
                  <dd className="order-1 font-montserrat font-extrabold text-xl leading-none">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4">
              {FACTS.map((f) => (
                <div key={f.label} className="border-l-2 pl-3" style={{ borderColor: BRAND.peach }}>
                  <dt className="font-mono text-[10.4px] uppercase tracking-wider text-slate-400">{f.label}</dt>
                  <dd className="font-montserrat font-semibold text-xs text-slate-900 mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 font-mono text-[10.4px] text-slate-400 tabular-nums">{formatCoords(KKN_LOCATION)}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {CLUSTERS.map((c) => {
                const t = CLUSTER_THEME[c.name]
                return (
                  <div key={c.name} className="p-3 rounded-2xl bg-white border border-slate-200 border-l-4" style={{ borderLeftColor: t.color }}>
                    <span className="block font-montserrat font-bold text-xs" style={{ color: t.text }}>
                      Kluster {c.name}
                    </span>
                    <span className="block font-inter text-[10.4px] text-slate-500 leading-snug mt-1">{c.focus}</span>
                  </div>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h3 className="font-mono font-medium text-[10.4px] uppercase tracking-[0.18em] text-slate-500 mb-2">Posko & Kontak</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2.5 p-2 -ml-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors no-underline group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 group-hover:bg-brand-blue flex items-center justify-center text-brand-blue group-hover:text-white shrink-0 transition-colors">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="font-inter text-xs text-slate-700 group-hover:text-brand-blue transition-colors truncate">{link.name}</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Slide>
  )
}
