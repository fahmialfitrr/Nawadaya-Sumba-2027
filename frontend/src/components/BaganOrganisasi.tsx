import { useState, lazy, Suspense } from 'react'
import { Search } from 'lucide-react'
import { BrandFrame, ScriptWord } from './Brand'
import ThreeDMemberCard from './ThreeDMemberCard'
import { MEMBERS_DATA, type Member } from '../data/membersData'
import { BRAND, CLUSTER_THEME, type Cluster } from '../data/theme'

const ParticleCursor = lazy(() => import('./ParticleCursor'))

const CLUSTERS: Array<{ id: string; name: Cluster }> = [
  { id: 'saintek', name: 'Saintek' },
  { id: 'soshum', name: 'Soshum' },
  { id: 'medika', name: 'Medika' },
  { id: 'agro', name: 'Agro' },
]

/** Label jenjang (DPL, Kormanit, Kormater) */
function LevelLabel({ children, className = 'mb-4' }: { children: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full bg-brand-blue px-4 py-1.5 shadow-xs ${className}`}>
      <span className="font-mono font-bold text-[10.4px] text-brand-yellow">[#]</span>
      <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">{children}</span>
    </div>
  )
}

/** Banner "Anggota Kluster ___" ala slide judul brand kit */
function ClusterBanner({ name }: { name: Cluster }) {
  const t = CLUSTER_THEME[name]
  return (
    <div className="relative mb-10 flex items-end gap-1.5 bg-white px-[clamp(34px,4vw,56px)] py-[clamp(22px,2.6vw,34px)] shadow-[0_18px_40px_-26px_rgba(15,23,42,0.4)]">
      <BrandFrame color={t.frame} width="clamp(26px,2.8vw,40px)" className="absolute inset-0" />
      <h3 className="sr-only">Anggota Kluster {name}</h3>
      <span aria-hidden="true" className="font-montserrat font-extrabold text-base sm:text-lg text-slate-900 leading-none mb-[0.7em] whitespace-nowrap">
        Anggota Kluster
      </span>
      <ScriptWord text={name} color={t.text} className="h-[clamp(46px,5.4vw,72px)]" />
    </div>
  )
}

export default function BaganOrganisasi() {
  const members: Member[] = MEMBERS_DATA
  const [activeCluster, setActiveCluster] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const dpl = members.find((m) => m.hierarchy === 'dpl')
  const kormanit = members.find((m) => m.hierarchy === 'kormanit')
  const kormaters = members.filter((m) => m.hierarchy === 'kormater')

  const getClusterMembers = (clusterId: string) => {
    let list = members.filter((m) => m.hierarchy === 'member' && m.cluster === clusterId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.faculty.toLowerCase().includes(q) ||
          m.major.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
      )
    }
    return list
  }

  const leadershipMatches = searchQuery.trim()
    ? [dpl, kormanit, ...kormaters].filter(
        (m): m is Member =>
          !!m &&
          (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  const displayedClusters = CLUSTERS.filter(
    (c) => activeCluster === 'all' || activeCluster === c.id
  )

  const hasAnyResults =
    leadershipMatches.length > 0 ||
    displayedClusters.some((c) => getClusterMembers(c.id).length > 0)

  return (
    <div className="relative isolate w-full min-h-screen bg-paper-ascii overflow-hidden">
    <BrandFrame color="blue" className="absolute inset-1.5 sm:inset-2 z-[2]" />
    <div className="w-full pt-28 pb-24 px-[clamp(44px,6vw,96px)] max-w-7xl mx-auto flex flex-col items-center relative">
      {/* Particle Cursor Effect Three.js (Lazy loaded, isolated layer) */}
      <Suspense fallback={null}>
        <ParticleCursor className="opacity-90 z-[1]" />
      </Suspense>

      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mb-10 space-y-3 relative z-10">
        <span className="font-mono font-medium text-[10.4px] md:text-xs uppercase tracking-[0.2em] text-slate-500">
          <span className="font-bold text-brand-blue">[Tim]</span> ·:· Nawadaya Sumba
        </span>
        <h1 className="flex flex-col items-center">
          <span className="sr-only">Bagan Anggota</span>
          <span aria-hidden="true" className="font-montserrat font-extrabold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none tracking-tight">
            Bagan
          </span>
          <ScriptWord text="Anggota" color={BRAND.blue} className="h-[clamp(64px,9vw,120px)] -mt-[clamp(6px,1vw,14px)]" />
        </h1>

        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
          Struktur kepengurusan KKN-PPM UGM Nawadaya Sumba 2027, mengenal lebih dekat formasi tim mulai dari DPL, Kormanit, 4 Kormater, hingga anggota kluster.
        </p>

        {/* Filter Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, prodi, fakultas..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 shadow-2xs"
            />
          </div>

          {/* Cluster Filter Buttons */}
          <div className="flex flex-nowrap items-center justify-center gap-1.5 bg-slate-200/50 p-1 rounded-full">
            {[
              { id: 'all', label: `Semua (${members.length})`, bg: BRAND.blue, fg: '#ffffff' },
              ...CLUSTERS.map((c) => ({
                id: c.id,
                label: `${c.name} (${members.filter((m) => m.cluster === c.id).length})`,
                bg: CLUSTER_THEME[c.name].color,
                fg: '#0f172a',
              })),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCluster(tab.id)}
                type="button"
                className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full font-inter text-xs transition-colors cursor-pointer ${
                  activeCluster === tab.id
                    ? 'font-semibold shadow-xs'
                    : 'bg-white hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/70 shadow-2xs'
                }`}
                style={activeCluster === tab.id ? { backgroundColor: tab.bg, color: tab.fg } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HIERARCHICAL STRUCTURE & CLUSTERS */}
      <div className="w-full space-y-16 flex flex-col items-center relative z-10">
        {/* DPL (Dosen Pembimbing Lapangan) */}
        {activeCluster === 'all' && !searchQuery && dpl && (
          <div className="flex flex-col items-center w-full">
            <LevelLabel>Dosen Pembimbing Lapangan (DPL)</LevelLabel>
            <div className="relative z-10 w-full flex justify-center">
              <ThreeDMemberCard member={dpl} />
            </div>
            <div className="w-0.5 h-12 bg-brand-blue/30 my-2" />
          </div>
        )}

        {/* KORMANIT (Koordinator Mahasiswa Unit) */}
        {activeCluster === 'all' && !searchQuery && kormanit && (
          <div className="flex flex-col items-center w-full">
            <LevelLabel>Koordinator Mahasiswa Unit (Kormanit)</LevelLabel>
            <ThreeDMemberCard member={kormanit} />
            <div className="w-0.5 h-12 bg-brand-blue/30 my-2" />
          </div>
        )}

        {/* 4 KORMATER */}
        {activeCluster === 'all' && !searchQuery && kormaters.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <LevelLabel className="mb-6">Koordinator Kluster (Kormater)</LevelLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 sm:gap-x-12 lg:gap-x-14 gap-y-16 justify-items-center w-full max-w-7xl px-2">
              {kormaters.map((m) => (
                <ThreeDMemberCard key={m.id} member={m} />
              ))}
            </div>
            <div className="w-0.5 h-12 bg-brand-blue/30 my-4" />
          </div>
        )}

        {/* LEADERSHIP SEARCH RESULTS */}
        {searchQuery.trim() && leadershipMatches.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <LevelLabel className="mb-8">DPL & Koordinator</LevelLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 sm:gap-x-12 lg:gap-x-14 gap-y-16 justify-items-center w-full max-w-7xl px-2">
              {leadershipMatches.map((m) => (
                <ThreeDMemberCard key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        {/* EACH CLUSTER SEPARATED */}
        {displayedClusters.map((cluster) => {
          const clusterItems = getClusterMembers(cluster.id)
          if (clusterItems.length === 0) return null

          return (
            <div key={cluster.id} className="flex flex-col items-center w-full">
              <ClusterBanner name={cluster.name} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 sm:gap-x-12 lg:gap-x-14 gap-y-16 lg:gap-y-20 justify-items-center w-full max-w-7xl px-2">
                {clusterItems.map((m) => (
                  <ThreeDMemberCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          )
        })}

        {/* EMPTY SEARCH STATE */}
        {searchQuery.trim() && !hasAnyResults && (
          <div className="py-12 text-center text-slate-500 font-montserrat text-sm">
            Tidak ada anggota yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
