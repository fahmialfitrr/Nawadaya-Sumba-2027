import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/Button'
import SectionHeading from './SectionHeading'
import { Reveal } from './ScrollPhoto'
import { CONTACT_EMAIL } from '../data/places'
import { Slide } from './Brand'
import HomePhotoCredits from './HomePhotoCredits'
import { BRAND } from '../data/theme'

const inputClass =
  'w-full px-4 py-3 rounded-xl font-inter text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition'

const labelClass = 'block font-mono font-medium text-[10.4px] uppercase tracking-[0.16em] text-slate-600 mb-1.5'

export default function HomeGuestbook() {
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSubmit = (e: FormEvent) => {
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
    <Slide
      id="guestbook"
      frame="green"
      photo="/images/sumba/hero/pantai-sbd-1280.webp"
      blooms={[
        { kind: 'garland', color: 'mint', className: 'left-[-3%] top-[-5%] w-[clamp(180px,20vw,340px)] rotate-[170deg]' },
        { kind: 'rose', color: 'yellow', className: 'right-[-2%] bottom-[-3%] w-[clamp(130px,15vw,250px)] rotate-[200deg]', dir: [-1, -1] },
      ]}
    >
    <div className="w-full max-w-4xl mx-auto">

      <SectionHeading index="06" eyebrow="Buku Tamu" lead="Kirim" highlight="Pesan & Doa" accent={BRAND.green} align="center" className="mb-12">
        Kirimkan salam, aspirasi, atau doa untuk tim mahasiswa KKN UGM di Rada Mata, Sumba Barat Daya.
      </SectionHeading>

      <Reveal delay={0.1} className="relative w-full">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)]">
          <p aria-hidden="true" className="font-mono text-[10.4px] text-slate-400 mb-6 select-none">
            <span className="text-brand-green font-bold">&gt;</span> buku_tamu --tulis <span className="animate-pulse text-slate-700">_</span>
          </p>

          {status === 'success' && (
            <div role="status" className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-inter text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aplikasi email Anda terbuka dengan pesan yang sudah terisi. Tinggal tekan kirim, terima kasih!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="gb-name" className={labelClass}>
                  Nama lengkap <span className="text-brand-coral">*</span>
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
                Pesan atau harapan <span className="text-brand-coral">*</span>
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
              <span className="block text-right mt-1 font-mono text-[10.4px] text-slate-400 tabular-nums">{message.length}/1000</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-mono text-[10.4px] text-slate-400">Kolom bertanda * wajib diisi.</p>
              <Button type="submit" variant="yellow" icon={Send} className="w-full sm:w-auto px-8">
                Kirim Pesan & Doa
              </Button>
            </div>
          </form>
        </div>
      </Reveal>

      <HomePhotoCredits />
    </div>
    </Slide>
  )
}
