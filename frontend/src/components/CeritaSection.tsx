import React, { useState } from 'react'
import { Calendar, Clock, ArrowUpRight, Send, CheckCircle2, X } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import { Button } from './ui/Button'
import { STORIES_DATA } from '../data/storiesData'
import { CONTACT_EMAIL } from '../data/places'

export interface Story {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  cluster: string
  date: string
  readTime: string
  coverImage: string
  tags: string[]
}

export interface GuestbookEntry {
  id: string
  name: string
  affiliation: string
  message: string
  createdAt: string
}

export default function CeritaSection() {
  const stories: Story[] = STORIES_DATA
  const guestbook: GuestbookEntry[] = []
  const loading = false
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [message, setMessage] = useState('')
  const submitting = false
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    // Situs statis: pesan dikirim lewat aplikasi email pengunjung
    const subject = encodeURIComponent('Pesan untuk KKN Nawadaya Sumba')
    const body = encodeURIComponent(
      `${message.trim()}

— ${name.trim()}${affiliation.trim() ? `, ${affiliation.trim()}` : ''}`,
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setName('')
    setAffiliation('')
    setMessage('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="w-full min-h-screen bg-dot-grid pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mb-12 space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center">
          <span className="font-montserrat font-bold text-[34.6px] sm:text-[44px] md:text-[56px] text-slate-900 leading-none">
            Jurnal
          </span>
          <div className="bg-[#e11d48] border-2 border-[#be123c] flex items-center justify-center px-4 py-1.5 shadow-[0_2px_10px_rgba(225,29,72,0.22)] -rotate-1 rounded-sm">
            <span className="font-montserrat font-black text-[34.6px] sm:text-[44px] md:text-[56px] text-white leading-none tracking-tight">
              <ScrambleText text="Cerita Sumba" />
            </span>
          </div>
        </div>

        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
          Kumpulan refleksi, suka duka, dan catatan lapangan 30 mahasiswa KKN UGM selama 50 hari hidup berdampingan bersama warga Kodi Bangedo.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-[#3057a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-montserrat text-xs font-semibold">Memuat jurnal cerita...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl space-y-20">
          
          {/* Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <div key={story.id} className="relative group w-full h-full">
                {/* Stacked Paper Layers */}
                <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl rotate-[2deg] translate-x-1 group-hover:rotate-[3deg] group-hover:translate-x-2 transition-transform duration-300 z-[-2]" />
                <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 transition-transform duration-300 z-[-1]" />

                {/* Front Card */}
                <div className="bg-[#f9fafb] p-3.5 pb-4 rounded-2xl border border-white shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 relative">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.4px] font-bold bg-[#3057a6] text-white">
                        {story.cluster}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10.4px] font-bold bg-white/90 text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3057a6]" />
                        {story.readTime}
                      </span>
                    </div>

                    <div className="space-y-1 px-1">
                      <span className="text-[10.4px] font-semibold text-slate-400 block">
                        {story.date} • {story.author}
                      </span>
                      <h3 className="font-montserrat font-bold text-sm sm:text-base text-slate-800 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="font-inter text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {story.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-auto border-t border-slate-200/80 flex justify-end px-1">
                    <button
                      onClick={() => setSelectedStory(story)}
                      type="button"
                      className="bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Baca Jurnal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guestbook Section */}
          <div className="w-full max-w-4xl mx-auto space-y-8 pt-8 border-t border-slate-300">
            <div className="text-center space-y-2">
              <h3 className="font-montserrat font-bold text-2xl text-slate-800">
                Buku Tamu & Pesan Dukungan
              </h3>
              <p className="font-inter text-xs text-slate-500">
                Tinggalkan jejak ucapan atau doa untuk tim mahasiswa di Sumba Barat Daya.
              </p>
            </div>

            {/* Guestbook Form */}
            <div className="relative group w-full">
              <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-3xl rotate-[1deg] translate-x-1 translate-y-1 z-[-1]" />
              <div className="bg-[#f9fafb] p-6 sm:p-8 rounded-3xl border border-white shadow-xl">
                {success && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pesan Anda telah berhasil tercatat ke server! Terima kasih atas dukungannya.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-montserrat font-bold text-slate-700 mb-1.5">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tulis nama lengkap Anda"
                        className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-montserrat font-bold text-slate-700 mb-1.5">
                        Asal / Instansi
                      </label>
                      <input
                        type="text"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                        placeholder="Contoh: Alumni UGM / Warga SBD"
                        className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-bold text-slate-700 mb-1.5">
                      Pesan atau Doa *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tuliskan ucapan penyemangat untuk adik-adik mahasiswa..."
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="yellow"
                      icon={Send}
                      disabled={submitting}
                      className="w-full sm:w-auto px-8"
                    >
                      {submitting ? 'Mengirim...' : 'Kirim Pesan Doa'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Recent Guestbook Feed */}
            <div className="space-y-3 pt-4">
              <span className="font-montserrat font-bold text-xs text-slate-500 uppercase tracking-wider block text-center">
                Pesan Terbaru ({guestbook.length} Pesan Masuk):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guestbook.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <strong className="font-montserrat font-bold text-xs text-slate-900">{item.name}</strong>
                      <span className="text-[10.4px] font-semibold text-slate-400">{item.affiliation}</span>
                    </div>
                    <p className="font-inter text-xs text-slate-600 leading-relaxed italic">
                      "{item.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Story Reading Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img
                src={selectedStory.coverImage}
                alt={selectedStory.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fdde09] text-slate-900 inline-block mb-1">
                  {storyKlusterTitle(selectedStory.cluster)}
                </span>
                <h3 className="font-montserrat font-bold text-lg text-white">
                  {selectedStory.title}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-left">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-b border-slate-100 pb-3">
                <span>Penulis: {selectedStory.author}</span>
                <span>{selectedStory.date} • {selectedStory.readTime}</span>
              </div>

              <div className="font-inter text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {selectedStory.content}
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-5 py-2 rounded-full bg-slate-900 text-white font-inter font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup Cerita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function storyKlusterTitle(cluster: string) {
  switch (cluster) {
    case 'Saintek': return 'Kluster Sains & Teknologi'
    case 'Soshum': return 'Kluster Sosial Humaniora'
    case 'Medika': return 'Kluster Kedokteran & Kesehatan'
    case 'Agro': return 'Kluster Agrokompleks'
    default: return cluster
  }
}
