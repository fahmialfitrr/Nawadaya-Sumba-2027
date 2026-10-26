import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/Button'
import SectionHeading from './SectionHeading'
import { Reveal } from './ScrollPhoto'
import { CONTACT_EMAIL } from '../data/places'

const inputClass =
  'w-full px-4 py-3 rounded-xl font-inter text-xs sm:text-sm bg-ink-900/80 border border-white/15 text-cream placeholder:text-dusk focus:outline-none focus:border-senja-gold focus:ring-4 focus:ring-senja-gold/15 transition'

const labelClass = 'block font-mono font-medium text-[10.4px] uppercase tracking-[0.16em] text-mist mb-1.5'

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

      <SectionHeading index="06" eyebrow="Buku Tamu" lead="Kirim" highlight="Pesan & Doa" align="center" className="mb-12">
        Kirimkan salam, aspirasi, atau doa untuk tim mahasiswa KKN UGM di Rada Mata, Sumba Barat Daya.
      </SectionHeading>

      <Reveal delay={0.1} className="relative w-full">
        <div className="frame-corners bg-ink-850/85 p-6 sm:p-10 rounded-3xl border border-white/10">
          <p aria-hidden="true" className="font-mono text-[10.4px] text-dusk mb-6 select-none">
            <span className="text-senja-gold">&gt;</span> buku_tamu --tulis <span className="animate-pulse text-cream">_</span>
          </p>

          {status === 'success' && (
            <div role="status" className="mb-6 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 font-inter text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Aplikasi email Anda terbuka dengan pesan yang sudah terisi. Tinggal tekan kirim, terima kasih!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="gb-name" className={labelClass}>
                  Nama lengkap <span className="text-senja-coral">*</span>
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
                <label htmlFor="gb-affiliation" className={labelClass}>
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
              <label htmlFor="gb-message" className={labelClass}>
                Pesan atau harapan <span className="text-senja-coral">*</span>
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
              <span className="block text-right mt-1 font-mono text-[10.4px] text-dusk tabular-nums">{message.length}/1000</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-mono text-[10.4px] text-dusk">Kolom bertanda * wajib diisi.</p>
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
