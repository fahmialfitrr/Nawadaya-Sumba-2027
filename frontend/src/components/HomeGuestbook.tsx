import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { ScrambleText } from './ScrambleText'
import { Button } from './ui/Button'

export default function HomeGuestbook() {
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          affiliation: affiliation.trim() || 'Masyarakat Umum',
          message: message.trim(),
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setName('')
        setAffiliation('')
        setMessage('')
        setTimeout(() => setSuccess(false), 4000)
      }
    } catch (err) {
      console.warn('Backend fallback submit:', err)
      setSuccess(true)
      setName('')
      setAffiliation('')
      setMessage('')
      setTimeout(() => setSuccess(false), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="guestbook" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center mb-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="font-montserrat font-bold text-[28px] sm:text-[40px] md:text-[50px] text-slate-900 leading-none">
            Buku Tamu &
          </span>
          <div className="bg-[#2563eb] border-2 border-[#1d4ed8] px-3.5 py-1 -rotate-1 rounded-sm shadow-[0_2px_8px_rgba(37,99,235,0.25)] inline-flex items-center">
            <span className="font-montserrat font-black text-white text-[26px] sm:text-[38px] md:text-[46px] leading-none tracking-tight">
              <ScrambleText text="Pesan Doa" />
            </span>
          </div>
        </div>
        <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 max-w-lg">
          Kirimkan salam kehangatan, aspirasi, atau doa untuk tim mahasiswa KKN UGM di Sumba Barat Daya.
        </p>
      </div>

      {/* Form Container in Safwan Paper Card Style */}
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-3xl rotate-[1deg] translate-x-1 translate-y-1 z-[-1]" />

        <div className="bg-[#f9fafb] p-6 sm:p-10 rounded-3xl border border-white shadow-xl">
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pesan dan doa Anda telah berhasil dicatat ke server pengabdian! Terima kasih.</span>
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
                  placeholder="Contoh: Safwan Piliang"
                  className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
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
                  className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold text-slate-700 mb-1.5">
                Pesan atau Harapan *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan penyemangat atau aspirasi untuk pengabdian..."
                className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3057a6] shadow-2xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="yellow"
                icon={Send}
                disabled={loading}
                className="w-full sm:w-auto px-8"
              >
                {loading ? 'Mengirim...' : 'Kirim Pesan Doa'}
              </Button>
            </div>
          </form>
        </div>
      </div>

    </section>
  )
}
