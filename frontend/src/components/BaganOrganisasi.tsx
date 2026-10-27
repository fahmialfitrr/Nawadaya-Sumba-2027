import { useState } from 'react'
import { Search } from 'lucide-react'
import { AsciiBloom, BrandFrame, ScriptWord, Slide } from './Brand'
import SectionHeading from './SectionHeading'
import { Reveal } from './ScrollPhoto'
import ThreeDMemberCard from './ThreeDMemberCard'
import { MEMBERS_DATA, type Member } from '../data/membersData'
import { SUMBA_PHOTOS, type SumbaPhoto } from '../data/sumbaPhotos'
import { BRAND, CLUSTER_THEME, type Cluster } from '../data/theme'

/** Foto banner tiap kluster, mengikuti contoh slide brand kit */
const CLUSTERS: Array<{ id: string; name: Cluster; photo: SumbaPhoto; focus: string }> = [
  { id: 'saintek', name: 'Saintek', photo: SUMBA_PHOTOS.kudaSavana, focus: 'Energi surya & pemetaan desa' },
  { id: 'soshum', name: 'Soshum', photo: SUMBA_PHOTOS.pantaiMbawana, focus: 'Literasi anak & lingkungan' },
  { id: 'medika', name: 'Medika', photo: SUMBA_PHOTOS.ratenggaroKampung, focus: 'Gizi & kesehatan keluarga' },
  { id: 'agro', name: 'Agro', photo: SUMBA_PHOTOS.seribuBukit, focus: 'Pakan ternak & pertanian' },
]

const CLUSTER_NAME: Record<string, Cluster> = { saintek: 'Saintek', soshum: 'Soshum', medika: 'Medika', agro: 'Agro' }

const matches = (m: Member, q: string) =>
  m.name.toLowerCase().includes(q) ||
  m.faculty.toLowerCase().includes(q) ||
  m.major.toLowerCase().includes(q) ||
  m.role.toLowerCase().includes(q)

/** Kartu 3D + nama & prodi yang selalu terbaca di bawahnya */
function MemberTile({ member }: { member: Member }) {
  const cluster = CLUSTER_NAME[member.cluster]
  const accent = cluster ? CLUSTER_THEME[cluster] : null
  const lead = member.hierarchy !== 'member'
  return (
    <div className="w-full max-w-[265px] flex flex-col items-center">
      <ThreeDMemberCard member={member} />
      <div className="mt-4 sm:mt-5 w-full px-0.5 sm:px-1 text-center">
        {lead && (
          <span
            className="inline-block mb-1.5 rounded-md px-1.5 sm:px-2 py-0.5 font-mono text-[9px] sm:text-[10.4px] font-bold uppercase tracking-wider"
            style={accent ? { backgroundColor: accent.color, color: '#0f172a' } : { backgroundColor: BRAND.blue, color: '#ffffff' }}
          >
            {member.hierarchy === 'kormater' ? member.role : member.hierarchy === 'dpl' ? 'DPL' : 'Kormanit'}
          </span>
        )}
        <p className="font-montserrat font-bold text-xs sm:text-[13.2px] leading-snug text-slate-900 line-clamp-2">{member.name}</p>
        <p className="mt-0.5 font-inter text-[10.4px] leading-snug text-slate-500 line-clamp-2">
          {member.major} · {member.faculty.replace(/^Fakultas /, 'F. ')}
        </p>
      </div>
    </div>
  )
}

/** Panel DPL: dosen pembimbing berdiri di luar rantai mahasiswa, jadi tampil sebagai panel tersendiri */
function MentorPanel({ member }: { member: Member }) {
  return (
    <Reveal className="relative w-full">
      <div className="relative bg-white px-[clamp(30px,3.4vw,48px)] py-[clamp(30px,3.2vw,44px)] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
        <BrandFrame color="blue" width="clamp(26px,2.6vw,40px)" className="absolute inset-0" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8">
          <div className="w-[min(220px,70%)] sm:w-[clamp(170px,16vw,220px)] shrink-0 flex justify-center">
            <ThreeDMemberCard member={member} />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-3 py-1 font-mono text-[10.4px] font-bold uppercase tracking-wider text-white">
              <span className="text-brand-yellow">[*]</span> Dosen Pembimbing Lapangan
            </span>
            <p className="mt-3 font-montserrat font-extrabold text-lg sm:text-xl leading-snug text-slate-900">{member.name}</p>
            <p className="mt-1 font-inter text-xs text-slate-500">
              {member.major} · {member.faculty}
            </p>
            <p className="mt-3 pt-3 border-t border-dashed border-slate-200 font-inter text-xs text-slate-600 leading-relaxed">
              Mendampingi dan membimbing seluruh tim selama masa pengabdian di Desa Rada Mata, Kota Tambolaka.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/** Label jenjang (DPL, Kormanit, Kormater) */
function LevelLabel({ children, className = 'mb-5' }: { children: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full bg-brand-blue px-3 sm:px-4 py-1.5 shadow-xs ${className}`}>
      <span className="font-mono font-bold text-[10.4px] text-brand-yellow">[#]</span>
      <span className="font-montserrat font-bold text-xs text-white tracking-wider uppercase whitespace-nowrap">{children}</span>
    </div>
  )
}

/** Garis penghubung bagan dari karakter ASCII */
function Connector({ horizontal = false }: { horizontal?: boolean }) {
  if (horizontal)
    return (
      <span aria-hidden="true" className="flex items-center gap-1 font-mono font-bold text-xs text-brand-blue/50 select-none">
        ·:·:·<span className="text-brand-blue/80">&gt;</span>
      </span>
    )
  return (
    <span aria-hidden="true" className="flex flex-col items-center font-mono font-bold text-xs leading-[0.9] text-brand-blue/45 select-none">
      <span>·</span>
      <span>:</span>
      <span>·</span>
      <span className="text-brand-blue/70">v</span>
    </span>
  )
}

/** Banner foto "Kluster ___": melebar di layar kecil, jadi kolom tegak di samping kartu pada desktop */
function ClusterBanner({ cluster, members, kormater }: { cluster: (typeof CLUSTERS)[number]; members: number; kormater: number }) {
  const t = CLUSTER_THEME[cluster.name]
  return (
    <Reveal className="w-full lg:sticky lg:top-28">
      <div className="relative isolate overflow-hidden h-[clamp(200px,34vw,280px)] lg:h-[clamp(440px,36vw,520px)]">
        <img src={cluster.photo.src} alt={cluster.photo.alt} loading="lazy" decoding="async" className="absolute inset-0 -z-10 w-full h-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r lg:bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent" />
        <AsciiBloom kind="garland" color={t.bloom} className="absolute z-[1] right-[-8%] top-[-6%] w-[clamp(160px,18vw,280px)] rotate-[175deg]" />
        <BrandFrame color={t.frame} width="clamp(28px,2.8vw,44px)" className="absolute inset-0 z-[2]" />

        <div className="relative z-[3] h-full flex flex-col justify-center lg:justify-end px-[clamp(40px,4vw,56px)] py-[clamp(40px,4vw,60px)]">
          <h2 className="flex flex-col items-start">
            <span className="sr-only">Kluster {cluster.name}</span>
            <span aria-hidden="true" className="font-montserrat font-extrabold text-2xl sm:text-3xl text-white leading-none tracking-tight [text-shadow:_0_2px_14px_rgb(0_0_0_/_45%)]">
              Kluster
            </span>
            <ScriptWord
              text={cluster.name}
              color="#ffffff"
              className="h-[clamp(60px,7vw,96px)] -mt-[clamp(4px,0.6vw,10px)] ml-[clamp(8px,1.4vw,22px)] drop-shadow-[0_3px_14px_rgba(0,0,0,0.45)]"
            />
          </h2>
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[10.4px] uppercase tracking-[0.14em] text-white/90">
            <span className="rounded-md px-2 py-0.5 font-bold text-slate-900" style={{ backgroundColor: t.color }}>
              {members + kormater} orang
            </span>
            <span>
              {kormater} kormater + {members} anggota
            </span>
          </p>
          <p className="hidden lg:block mt-2 font-inter text-xs text-white/80">{cluster.focus}</p>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10.4px] text-slate-400">
        Foto: {cluster.photo.author}, {cluster.photo.license}
      </p>
    </Reveal>
  )
}

export default function BaganOrganisasi() {
  const members: Member[] = MEMBERS_DATA
  const [activeCluster, setActiveCluster] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const q = searchQuery.trim().toLowerCase()

  const dpl = members.find((m) => m.hierarchy === 'dpl')
  const kormanit = members.find((m) => m.hierarchy === 'kormanit')
  const kormaters = members.filter((m) => m.hierarchy === 'kormater')

  const getClusterMembers = (clusterId: string) => {
    const list = members.filter((m) => m.hierarchy === 'member' && m.cluster === clusterId)
    return q ? list.filter((m) => matches(m, q)) : list
  }

  const leadershipMatches = q ? [dpl, kormanit].filter((m): m is Member => !!m && matches(m, q)) : []
  const showStructure = activeCluster === 'all' && !q
  const displayedClusters = CLUSTERS.filter((c) => activeCluster === 'all' || activeCluster === c.id)
  const hasAnyResults =
    leadershipMatches.length > 0 ||
    displayedClusters.some((c) => getClusterMembers(c.id).length > 0 || kormaters.some((m) => m.cluster === c.id && matches(m, q)))

  const tabs = [
    { id: 'all', label: `Semua (${members.length})`, bg: BRAND.blue, fg: '#ffffff' },
    ...CLUSTERS.map((c) => ({
      id: c.id,
      label: `${c.name} (${members.filter((m) => m.cluster === c.id).length})`,
      bg: CLUSTER_THEME[c.name].color,
      fg: '#0f172a',
    })),
  ]

  return (
    <div className="w-full bg-ink-900 flex flex-col gap-2">
      {/* Sampul halaman: judul di kiri, angka & penyaring di kanan */}
      <Slide
        frame="blue"
        photo={SUMBA_PHOTOS.kudaSandalwood.src}
        compact
        className="pt-[clamp(108px,10vw,136px)]"
        blooms={[
          { kind: 'flower', color: 'teal', className: 'left-[-2%] top-[-8%] w-[clamp(130px,15vw,250px)] -scale-x-100 -rotate-[22deg]' },
          { kind: 'rose', color: 'peach', className: 'right-[-1%] bottom-[-8%] w-[clamp(110px,12vw,200px)] rotate-[175deg]', dir: [-1, -1] },
        ]}
      >
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="font-mono font-medium text-[10.4px] md:text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">
              <span className="font-bold text-brand-blue">[Tim]</span> ·:· Nawadaya Sumba
            </span>
            <h1 className="flex flex-col items-center lg:items-start">
              <span className="sr-only">Bagan Anggota</span>
              <span aria-hidden="true" className="font-montserrat font-extrabold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none tracking-tight">
                Bagan
              </span>
              <ScriptWord text="Anggota" color={BRAND.blue} className="h-[clamp(64px,8vw,110px)] -mt-[clamp(6px,1vw,14px)] lg:ml-[clamp(10px,2vw,30px)]" />
            </h1>
            <p className="mt-4 font-inter text-sm text-slate-600 max-w-lg leading-relaxed">
              Struktur tim KKN-PPM UGM Nawadaya Sumba, mulai dari DPL, Kormanit, empat Kormater, hingga anggota tiap kluster yang mengabdi di Desa Rada Mata.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xl mx-auto lg:mx-0">
            <dl className="grid grid-cols-4 gap-3 rounded-2xl bg-brand-blue text-white px-5 py-4">
              {[
                [members.length, 'Anggota'],
                [4, 'Kluster'],
                [kormaters.length, 'Kormater'],
                [1, 'DPL'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="order-2 font-mono text-[10.4px] text-white/70 leading-tight">{label}</dt>
                  <dd className="order-1 font-montserrat font-extrabold text-xl leading-none">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, prodi, fakultas..."
                aria-label="Cari anggota"
                className="w-full pl-9 pr-4 py-2.5 rounded-full text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5" role="group" aria-label="Saring berdasarkan kluster">
              {tabs.map((tab) => {
                const on = activeCluster === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCluster(tab.id)}
                    type="button"
                    aria-pressed={on}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-inter text-xs transition-colors cursor-pointer ${
                      on ? 'font-semibold shadow-xs' : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs'
                    }`}
                    style={on ? { backgroundColor: tab.bg, color: tab.fg } : undefined}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <p className="font-mono text-[10.4px] text-slate-400 text-center lg:text-left">
              Foto latar: {SUMBA_PHOTOS.kudaSandalwood.caption} — {SUMBA_PHOTOS.kudaSandalwood.author}, {SUMBA_PHOTOS.kudaSandalwood.license}
            </p>
          </div>
        </div>
      </Slide>

      {/* Struktur: DPL sebagai pembimbing (panel tersendiri), lalu rantai mahasiswa Kormanit -> Kormater */}
      {showStructure && (
        <Slide
          frame="peach"
          compact
          blooms={[
            { kind: 'garland', color: 'teal', className: 'left-[-3%] top-[-6%] w-[clamp(160px,17vw,290px)] rotate-[170deg]' },
            { kind: 'flower', color: 'teal', className: 'right-[-2%] bottom-[10%] w-[clamp(100px,10vw,170px)] rotate-[200deg]' },
          ]}
        >
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-12 items-center">
              <SectionHeading index="01" eyebrow="Struktur Tim" lead="Para" highlight="Koordinator" accent={BRAND.blue}>
                Dosen pembimbing lapangan mendampingi seluruh tim. Di bawahnya, koordinator mahasiswa unit memimpin empat koordinator kluster yang masing-masing membawahi anggotanya.
              </SectionHeading>
              {dpl && <MentorPanel member={dpl} />}
            </div>

            {/* Garis bimbingan dari DPL ke tim mahasiswa */}
            <div aria-hidden="true" className="my-6 flex items-center gap-3 font-mono text-[10.4px] uppercase tracking-[0.18em] text-brand-blue/60 select-none">
              <span className="flex-1 border-t border-dashed border-brand-blue/30" />
              <span>membimbing</span>
              <span className="text-brand-blue/80">v</span>
              <span className="flex-1 border-t border-dashed border-brand-blue/30" />
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-5 lg:gap-6">
              {kormanit && (
                <div className="flex flex-col items-center shrink-0 w-[min(230px,62%)] md:w-[clamp(190px,18vw,240px)]">
                  <LevelLabel className="mb-4">Kormanit</LevelLabel>
                  <MemberTile member={kormanit} />
                </div>
              )}
              <span className="md:self-start md:mt-[calc(52px_+_clamp(190px,18vw,240px)_*_0.707)]">
                <span className="md:hidden">
                  <Connector />
                </span>
                <span className="hidden md:flex">
                  <Connector horizontal />
                </span>
              </span>
              {kormaters.length > 0 && (
                <div className="flex-1 min-w-0 w-full flex flex-col items-center">
                  <LevelLabel className="mb-4">Kormater</LevelLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8 justify-items-center w-full">
                    {kormaters.map((m) => (
                      <div key={m.id} className="w-full max-w-[170px] flex justify-center">
                        <MemberTile member={m} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Slide>
      )}

      {/* Hasil pencarian untuk DPL & Kormanit */}
      {q && leadershipMatches.length > 0 && (
        <Slide frame="peach" compact>
          <div className="flex flex-col items-center">
            <LevelLabel className="mb-8">DPL & Kormanit</LevelLabel>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
              {leadershipMatches.map((m) => (
                <MemberTile key={m.id} member={m} />
              ))}
            </div>
          </div>
        </Slide>
      )}

      {/* Satu slide per kluster: banner di kiri, kartu di kanan (desktop) */}
      {displayedClusters.map((cluster) => {
        const leads = kormaters.filter((m) => m.cluster === cluster.id)
        const shownLeads = showStructure ? [] : q ? leads.filter((m) => matches(m, q)) : leads
        const items = [...shownLeads, ...getClusterMembers(cluster.id)]
        if (items.length === 0) return null
        const t = CLUSTER_THEME[cluster.name]
        const totalMembers = members.filter((m) => m.hierarchy === 'member' && m.cluster === cluster.id).length
        return (
          <Slide
            key={cluster.id}
            id={`kluster-${cluster.id}`}
            frame={t.frame}
            compact
            blooms={[{ kind: 'rose', color: t.bloom, className: 'right-[-2%] bottom-[-4%] w-[clamp(110px,12vw,200px)] rotate-[190deg]', dir: [-1, -1] }]}
          >
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[clamp(270px,26vw,340px)_minmax(0,1fr)] gap-10 lg:gap-12 items-start">
              <ClusterBanner cluster={cluster} members={totalMembers} kormater={leads.length} />
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-12 justify-items-center">
                {items.map((m) => (
                  <MemberTile key={m.id} member={m} />
                ))}
              </div>
            </div>
          </Slide>
        )
      })}

      {/* Pencarian tanpa hasil */}
      {q && !hasAnyResults && (
        <Slide frame="rose" compact>
          <div className="py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              <span className="text-brand-coral font-bold">&gt;_</span> 0 hasil
            </p>
            <p className="font-montserrat text-sm text-slate-600">Tidak ada anggota yang cocok dengan pencarian "{searchQuery}".</p>
          </div>
        </Slide>
      )}
    </div>
  )
}
