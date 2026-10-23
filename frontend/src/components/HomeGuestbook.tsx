import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/Button'
import SectionHeading from './SectionHeading'
import { Reveal } from './ScrollPhoto'
import { CONTACT_EMAIL } from '../data/places'

const inputClass =
  'w-full px-4 py-3 rounded-xl font-inter text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3057a6] focus:ring-4 focus:ring-[#3057a6]/10 transition'

export default function HomeGuestbook() {
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    // Situs statis: pesan dikirim lewat aplikasi email pengunjung
    const subject = encodeURIComponent('Pesan untuk KKN Nawadaya Sumba')
    const text = encodeURIComponent(`${message.trim()}

— ${name.trim()}, ${affiliation.trim() || 'Masyarakat Umum'}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${text}`
    setStatus('success')
    setName('')
    setAffiliation('')
    setMessage('')
  }

  return (
    <section id="guestbook" className="w-full py-24 md:py-32 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto scroll-mt-20">

      <SectionHeading
        index="06"
        eyebrow="Buku Tamu"
        lead="Kirim"
        highlight="Pesan & Doa"
        color="#2563eb"
        border="#1d4ed8"
        align="center"
        className="mb-12"
      >
        Kirimkan salam, aspirasi, atau doa untuk tim mahasiswa KKN UGM di Rada Mata, Sumba Barat Daya.
      </SectionHeading>

      <Reveal delay={0.1} className="relative w-full">
        <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-3xl rotate-[1deg] translate-x-1 translate-y-1 z-[-1]" />

        <div className="bg-[#f9fafb] p-6 sm:p-10 rounded-3xl border border-white shadow-xl">
          {status === 'success' && (
            <div role="status" className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-inter text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aplikasi email Anda terbuka dengan pesan yang sudah terisi. Tinggal tekan kirim, terima kasih!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="gb-name" className="block font-montserrat font-bold text-xs text-slate-700 mb-1.5">
                  Nama lengkap <span className="text-[#e11d48]">*</span>
                </label>
                <input
                  id="gb-name"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tulis nama lengkap Anda"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="gb-affiliation" className="block font-montserrat font-bold text-xs text-slate-700 mb-1.5">
                  Asal / instansi
                </label>
                <input
                  id="gb-affiliation"
                  type="text"
                  maxLength={150}
                  autoComplete="organization"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="Contoh: Alumni UGM / Warga SBD"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gb-message" className="block font-montserrat font-bold text-xs text-slate-700 mb-1.5">
                Pesan atau harapan <span className="text-[#e11d48]">*</span>
              </label>
              <textarea
                id="gb-message"
                rows={4}
                required
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan penyemangat atau aspirasi untuk pengabdian..."
                className={`${inputClass} resize-y min-h-[120px]`}
              />
              <span className="block text-right mt-1 font-inter text-[10.4px] text-slate-400 tabular-nums">{message.length}/1000</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-inter text-[10.4px] text-slate-400">Kolom bertanda * wajib diisi.</p>
              <Button type="submit" variant="yellow" icon={Send} className="w-full sm:w-auto px-8">
                Kirim Pesan & Doa
              </Button>
            </div>
          </form>
        </div>
      </Reveal>

    </section>
  )
}
