import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react'
import { ScrambleText } from './ScrambleText'

interface ArticleItem {
  id: string
  title: string
  readTime: string
  date: string
  image: string
  author: string
  excerpt: string
}

const ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Senja Pertama di Ratenggaro: Menenun Asa di Bawah Menara Adat',
    readTime: '4 min baca',
    date: '14 Juli 2026',
    image: '/images/ratenggaro.jpg',
    author: 'Aisyah R. • FIB UGM',
    excerpt: 'Matahari perlahan tenggelam di balik batu megalitikum. Kami duduk bersama Mama penenun, mendengarkan kisah leluhur yang diwariskan turun-temurun.',
  },
  {
    id: 'art-2',
    title: 'Tawa Ceria di Pojok Baca Kodi: Saat Buku Cerita Membuka Cakrawala',
    readTime: '5 min baca',
    date: '22 Juli 2026',
    image: '/images/kkn_community.jpg',
    author: 'Falah A. • SV UGM',
    excerpt: 'Lebih dari 40 anak dusun berkumpul di posko sore ini. Binar mata mereka saat mengeja huruf pertama menjadi bahan bakar semangat pengabdian.',
  },
  {
    id: 'art-3',
    title: 'Kesejukan Kristal Danau Weekuri & Konservasi Sumber Air Tawar',
    readTime: '6 min baca',
    date: '30 Juli 2026',
    image: '/images/weekuri.jpg',
    author: 'Rahmat D. • Pertanian UGM',
    excerpt: 'Meneliti salinitas dan kejernihan laguna air asin Weekuri sembari mengedukasi warga tentang perlindungan mata air di musim kemarau Sumba.',
  },
]

export default function HomeArticles() {
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-montserrat font-bold text-[28px] sm:text-[40px] md:text-[50px] text-slate-900 leading-none">
              Catatan &
            </span>
            <div className="bg-[#e11d48] border-2 border-[#be123c] px-3.5 py-1 -rotate-1 rounded-sm shadow-[0_2px_8px_rgba(225,29,72,0.22)] inline-flex items-center">
              <span className="font-montserrat font-black text-white text-[26px] sm:text-[38px] md:text-[46px] leading-none tracking-tight">
                <ScrambleText text="Jurnal" />
              </span>
            </div>
          </div>
          <p className="font-montserrat font-medium text-xs sm:text-sm text-slate-500 mt-2">
            Refleksi dan pengalaman otentik 50 hari hidup berdampingan bersama masyarakat Kodi Bangedo.
          </p>
        </div>

        <Link
          to="/cerita"
          className="bg-[#ffab2f] hover:bg-[#e69b2a] border border-[#ffab2f] text-slate-900 font-inter font-medium text-xs md:text-sm px-4 py-2 rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] flex items-center gap-1.5 transition-all hover:-translate-y-0.5 no-underline shrink-0"
        >
          <span>Semua Cerita</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Article Cards Grid in Safwan Paper Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ARTICLES.map((art) => (
          <div key={art.id} className="relative group w-full h-full">
            
            {/* Paper stack layers */}
            <div className="absolute inset-0 bg-slate-300 border border-slate-300 rounded-2xl rotate-[2deg] translate-x-1 group-hover:rotate-[3deg] group-hover:translate-x-2 transition-transform duration-300 z-[-2]" />
            <div className="absolute inset-0 bg-slate-200 border border-slate-200 rounded-2xl -rotate-[1deg] -translate-x-1 group-hover:-rotate-[2deg] group-hover:-translate-x-2 transition-transform duration-300 z-[-1]" />

            {/* Front Card */}
            <div className="bg-[#f9fafb] p-4 rounded-2xl border border-white shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
              
              <div className="space-y-3">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={art.image}
                    alt={art.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#3057a6]" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    {art.date} • {art.author}
                  </span>
                  <h3 className="font-montserrat font-bold text-sm sm:text-base text-slate-800 line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="font-inter text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-slate-200/80 flex justify-end">
                <Link
                  to="/cerita"
                  className="font-inter font-bold text-xs text-[#3057a6] hover:underline flex items-center gap-1 no-underline"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        ))}
      </div>

    </section>
  )
}
