import { useState, lazy, Suspense } from 'react'
import { Search } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import ThreeDMemberCard from './ThreeDMemberCard'
import { MEMBERS_DATA, type Member } from '../data/membersData'

const ParticleCursor = lazy(() => import('./ParticleCursor'))

const CLUSTERS = [
  { id: 'saintek', title: 'Anggota Kluster Saintek', bg: 'bg-[#0891b2]' },
  { id: 'soshum', title: 'Anggota Kluster Soshum', bg: 'bg-[#a2258d]' },
  { id: 'medika', title: 'Anggota Kluster Medika', bg: 'bg-[#e11d48]' },
  { id: 'agro', title: 'Anggota Kluster Agro', bg: 'bg-[#ea580c]' },
] as const

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
    <div className="w-full min-h-screen bg-dot-grid pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center relative isolate">
      {/* Particle Cursor Effect Three.js (Lazy loaded, isolated layer) */}
      <Suspense fallback={null}>
        <ParticleCursor className="opacity-90 z-[1]" />
      </Suspense>

      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mb-10 space-y-3 relative z-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center">
          <span className="font-montserrat font-bold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none">
            Bagan
          </span>
          <div className="bg-[#2563eb] border-2 border-[#1d4ed8] flex items-center justify-center px-4 py-1.5 shadow-[0_2px_10px_rgba(37,99,235,0.25)] -rotate-1 rounded-sm">
            <span className="font-montserrat font-black text-[34.6px] sm:text-[44px] md:text-[56px] text-white leading-none tracking-tight">
              <ScrambleText text="Anggota" />
            </span>
          </div>
        </div>

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
              className="w-full pl-9 pr-4 py-2.5 rounded-full text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#2563eb] shadow-2xs"
            />
          </div>

          {/* Cluster Filter Buttons */}
          <div className="flex flex-nowrap items-center justify-center gap-1.5 bg-slate-200/50 p-1 rounded-full">
            {[
              { id: 'all', label: `Semua (${members.length})`, activeBg: 'bg-[#2563eb] text-white' },
              { id: 'saintek', label: `Saintek (${members.filter((m) => m.cluster === 'saintek').length})`, activeBg: 'bg-[#0891b2] text-white' },
              { id: 'soshum', label: `Soshum (${members.filter((m) => m.cluster === 'soshum').length})`, activeBg: 'bg-[#a2258d] text-white' },
              { id: 'medika', label: `Medika (${members.filter((m) => m.cluster === 'medika').length})`, activeBg: 'bg-[#e11d48] text-white' },
              { id: 'agro', label: `Agro (${members.filter((m) => m.cluster === 'agro').length})`, activeBg: 'bg-[#ea580c] text-white' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCluster(tab.id)}
                type="button"
                className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full font-inter text-xs transition-all cursor-pointer ${
                  activeCluster === tab.id
                    ? `${tab.activeBg} font-semibold shadow-xs`
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/70 shadow-2xs backdrop-blur-xs'
                }`}
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
            <div className="bg-[#2563eb] border border-[#1d4ed8] flex items-center justify-center px-4 py-1.5 mb-4 shadow-xs relative z-0">
              <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                Dosen Pembimbing Lapangan (DPL)
              </span>
            </div>
            <div className="relative z-10 w-full flex justify-center">
              <ThreeDMemberCard member={dpl} />
            </div>
            <div className="w-0.5 h-12 bg-slate-300 my-2" />
          </div>
        )}

        {/* KORMANIT (Koordinator Mahasiswa Unit) */}
        {activeCluster === 'all' && !searchQuery && kormanit && (
          <div className="flex flex-col items-center w-full">
            <div className="bg-[#2563eb] border border-[#1d4ed8] flex items-center justify-center px-4 py-1.5 mb-4 shadow-xs">
              <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                Koordinator Mahasiswa Unit (Kormanit)
              </span>
            </div>
            <ThreeDMemberCard member={kormanit} />
            <div className="w-0.5 h-12 bg-slate-300 my-2" />
          </div>
        )}

        {/* 4 KORMATER */}
        {activeCluster === 'all' && !searchQuery && kormaters.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="bg-[#2563eb] border border-[#1d4ed8] flex items-center justify-center px-4 py-1.5 mb-6 shadow-xs">
              <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                Koordinator Kluster (Kormater)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 sm:gap-x-12 lg:gap-x-14 gap-y-16 justify-items-center w-full max-w-7xl px-2">
              {kormaters.map((m) => (
                <ThreeDMemberCard key={m.id} member={m} />
              ))}
            </div>
            <div className="w-0.5 h-12 bg-slate-300 my-4" />
          </div>
        )}

        {/* LEADERSHIP SEARCH RESULTS */}
        {searchQuery.trim() && leadershipMatches.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="bg-[#3b72db] flex items-center justify-center px-4 py-1.5 mb-8 shadow-xs">
              <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                DPL & Koordinator
              </span>
            </div>
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
              <div className={`${cluster.bg} flex items-center justify-center px-4 py-1.5 mb-8 shadow-xs`}>
                <span className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                  {cluster.title}
                </span>
              </div>

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
  )
}
