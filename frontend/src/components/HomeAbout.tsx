import { MapPin, Mail, Globe } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Reveal, ScrollPhoto } from './ScrollPhoto'
import { SUMBA_PHOTOS } from '../data/sumbaPhotos'
import { KKN_LOCATION, formatCoords } from '../data/places'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const CLUSTERS = [
  { name: 'Saintek', color: '#16b8c5', focus: 'Energi surya & pemetaan desa' },
  { name: 'Soshum', color: '#a2258d', focus: 'Literasi anak & lingkungan' },
  { name: 'Medika', color: '#f05b6e', focus: 'Gizi & kesehatan keluarga' },
  { name: 'Agro', color: '#f78d66', focus: 'Pakan ternak & pertanian' },
]

const FACTS = [
  { label: 'Desa', value: 'Rada Mata' },
  { label: 'Kecamatan', value: 'Kota Tambolaka' },
  { label: 'Kabupaten', value: 'Sumba Barat Daya' },
  { label: 'Provinsi', value: 'Nusa Tenggara Timur' },
]

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

        {/* Kiri: kolase foto dengan parallax */}
        <div className="lg:col-span-6 relative w-full max-w-xl mx-auto lg:mx-0 pb-16 sm:pb-20">
          <ScrollPhoto
            src={SUMBA_PHOTOS.ratenggaroKampung.src}
            alt={SUMBA_PHOTOS.ratenggaroKampung.alt}
            strength={10}
            className="w-[82%] aspect-[4/5] rounded-3xl shadow-2xl"
          >
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 font-inter font-semibold text-[10.4px] uppercase tracking-wider px-3 py-1 rounded-full">
              {SUMBA_PHOTOS.ratenggaroKampung.caption}
            </span>
          </ScrollPhoto>

          <div className="absolute right-0 bottom-0 w-[54%]">
            <ScrollPhoto
              src={SUMBA_PHOTOS.gobakSodor.src}
              alt={SUMBA_PHOTOS.gobakSodor.alt}
              strength={12}
              delay={0.2}
              className="w-full aspect-[4/3] rounded-3xl border-[6px] border-[#f4f5f7] shadow-2xl"
            />
            <span className="block mt-2 pl-2 font-inter text-[10.4px] text-slate-500">
              Anak-anak bermain gobak sodor, Sumba Barat Daya
            </span>
          </div>

          <Reveal delay={0.4} className="absolute top-6 right-0 sm:right-4">
            <div className="bg-[#fdde09] text-slate-900 rounded-2xl px-4 py-3 shadow-lg rotate-3">
              <span className="block font-montserrat font-bold text-xl leading-none">50</span>
              <span className="block font-inter text-[10.4px] font-semibold uppercase tracking-wider mt-1">Hari Kerja</span>
            </div>
          </Reveal>
        </div>

        {/* Kanan: teks */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <SectionHeading index="01" eyebrow="Tentang Kami" lead="Tentang" highlight="Nawadaya" color="#2563eb" border="#1d4ed8" />

          <Reveal delay={0.1}>
            <p className="font-inter text-sm text-slate-600 leading-[1.75]">
              Kami adalah <strong className="font-semibold text-slate-900">30 mahasiswa Universitas Gadjah Mada</strong> yang mengabdi di{' '}
              <strong className="font-semibold text-slate-900">Desa Rada Mata, Kecamatan Kota Tambolaka</strong>, ibu kota Kabupaten Sumba Barat Daya. Misi kami: berjalan berdampingan bersama warga untuk membangun kemandirian energi surya, penguatan literasi anak, ketahanan pakan ternak, dan perbaikan gizi keluarga.
            </p>
          </Reveal>

          {/* Angka singkat (di desktop tampil di kartu sampul) */}
          <Reveal delay={0.11} className="lg:hidden">
            <dl className="grid grid-cols-4 gap-3 rounded-2xl bg-white border border-slate-200/80 p-4">
              {[
                ['30', 'Mahasiswa'],
                ['4', 'Kluster'],
                ['2', 'Wilayah kerja'],
                ['50', 'Hari'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="order-2 font-inter text-[10.4px] text-slate-500 leading-tight">{label}</dt>
                  <dd className="order-1 font-montserrat font-bold text-xl text-slate-900 leading-none">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Fakta lokasi */}
          <Reveal delay={0.12}>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4">
              {FACTS.map((f) => (
                <div key={f.label} className="border-l-2 border-[#2563eb]/25 pl-3">
                  <dt className="font-inter text-[10.4px] font-semibold uppercase tracking-wider text-slate-400">{f.label}</dt>
                  <dd className="font-montserrat font-semibold text-xs text-slate-900 mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 font-inter text-[10.4px] text-slate-400 tabular-nums">{formatCoords(KKN_LOCATION)}</p>
          </Reveal>

          {/* Kluster */}
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {CLUSTERS.map((c) => (
                <div key={c.name} className="p-3 rounded-2xl bg-white border border-slate-200/80">
                  <span className="block font-montserrat font-bold text-xs" style={{ color: c.color }}>{c.name}</span>
                  <span className="block font-inter text-[10.4px] text-slate-500 leading-snug mt-0.5">{c.focus}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Kontak */}
          <Reveal delay={0.2}>
            <h3 className="font-montserrat font-bold text-[10.4px] uppercase tracking-[0.18em] text-slate-500 mb-2">
              Posko & Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2.5 p-2 -ml-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all no-underline group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#3057a6]/10 group-hover:bg-[#3057a6] flex items-center justify-center text-[#3057a6] group-hover:text-white shrink-0 transition-colors">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="font-inter text-xs text-slate-700 group-hover:text-[#3057a6] transition-colors truncate">
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
