import { PLACES, type Place } from './places'

// Lanskap untuk hero 3D. Depth map dibuat dari foto (Depth Anything V2),
// lalu tepi objek depan dilebarkan sedikit agar efek parallax tidak "melar".

/** Permukaan foto dibuat lebih besar dari layar agar tepinya tak terlihat saat kamera bergerak */
export const HERO_OVERSCAN = 1.2

export interface HeroScene {
  id: string
  name: string
  region: string
  place?: Place
  image: { lg: string; sm: string; lgWidth: number }
  depth: string
  aspect: number
  /** Kedalaman (0 = jauh, 1 = dekat) yang diam saat kamera bergerak */
  focus: number
  /** Titik fokus foto [x, y] (0..1) saat layar memotong foto, mis. di HP */
  focal?: [number, number]
  /** Objek paling khas di foto [x, y] (0..1 dari kiri atas), dipamerkan di titik pancingan */
  peek: [number, number]
  /** Goyangan angin pada objek terdekat (daun, rumput) */
  wind: number
  /** Bayangan awan yang melintas di daratan */
  shadow: number
  /** Kosong untuk aset milik tim sendiri */
  credit?: { author: string; license: string; source: string }
}

const hero = (id: string, lgWidth = 2560) => ({
  image: { lg: `/images/sumba/hero/${id}-${lgWidth}.webp`, sm: `/images/sumba/hero/${id}-1280.webp`, lgWidth },
  depth: `/images/sumba/hero/${id}-depth.png`,
})

export const HERO_SCENES: HeroScene[] = [
  {
    // Aset tim (sampul utama); lokasi persis foto tidak disebutkan
    id: 'sabana-senja',
    name: 'Senja di Sabana Sumba',
    region: 'Perbukitan sabana',
    ...hero('sabana-senja', 1920),
    aspect: 1280 / 707,
    focus: 0.3,
    focal: [0.5, 0.55],
    peek: [0.3, 0.6],
    wind: 0.8,
    shadow: 0.12,
  },
  {
    id: 'pantai-sbd',
    name: 'Pesisir Sumba Barat Daya',
    region: 'Teluk berpasir putih',
    ...hero('pantai-sbd'),
    aspect: 2560 / 1248,
    focus: 0.3,
    focal: [0.6, 0.5],
    peek: [0.66, 0.42],
    wind: 1,
    shadow: 0,
    credit: { author: 'Bimantara.prawoto', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Beach_of_Sumba.jpg' },
  },
  {
    id: 'ratenggaro',
    name: 'Kampung Adat Ratenggaro',
    region: 'Kodi Bangedo',
    place: PLACES.ratenggaro,
    ...hero('ratenggaro'),
    aspect: 2560 / 1707,
    focus: 0.35,
    peek: [0.62, 0.52],
    wind: 0.35,
    shadow: 0.14,
    credit: { author: 'Allwyn Wawyn', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Rumah_Kampung_Adat_Ratenggaro_-_Sumba_Barat_Daya.jpg' },
  },
  {
    id: 'weekuri',
    name: 'Danau Weekuri',
    region: 'Kodi Utara',
    place: PLACES.weekuri,
    ...hero('weekuri'),
    aspect: 2560 / 1707,
    focus: 0.32,
    peek: [0.6, 0.6],
    wind: 0.7,
    shadow: 0.08,
    credit: { author: 'Zahrasrtn', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Danau_Weekuri,_Sumba_Barat_Daya.jpg' },
  },
  {
    id: 'mandorak',
    name: 'Pantai Mandorak',
    region: 'Kodi Utara',
    place: PLACES.mandorak,
    ...hero('mandorak'),
    aspect: 2560 / 1707,
    focus: 0.32,
    peek: [0.5, 0.48],
    wind: 0,
    shadow: 0,
    credit: { author: 'Zahrasrtn', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Pantai_Mandorak,_Sumba_Barat_Daya.jpg' },
  },
]
