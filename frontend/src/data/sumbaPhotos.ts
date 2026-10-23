// Foto placeholder dari Wikimedia Commons (lisensi CC). Kredit wajib tampil,
// lihat HomePhotoCredits. Ganti dengan dokumentasi tim saat sudah tersedia.

export interface SumbaPhoto {
  src: string
  alt: string
  caption: string
  author: string
  license: string
  source: string
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`

export const SUMBA_PHOTOS = {
  pantaiSbd: {
    src: '/images/sumba/hero/pantai-sbd-1280.webp',
    alt: 'Teluk berpasir putih dan laut toska dibingkai pohon kelapa di pesisir Sumba Barat Daya',
    caption: 'Pesisir Sumba Barat Daya',
    author: 'Bimantara.prawoto',
    license: 'CC BY-SA 4.0',
    source: commons('Beach_of_Sumba.jpg'),
  },
  gobakSodor: {
    src: '/images/sumba/gobak-sodor-sbd.jpg',
    alt: 'Anak-anak bermain gobak sodor di lapangan desa, Sumba Barat Daya',
    caption: 'Gobak Sodor di Sumba Barat Daya',
    author: 'Sofi Solihah',
    license: 'CC BY-SA 4.0',
    source: commons('Bermain_Gobak_Sodor_di_Sumba_Barat_Daya.jpg'),
  },
  katedralWeetebula: {
    src: '/images/sumba/katedral-weetebula.jpg',
    alt: 'Fasad Katedral Roh Kudus Weetebula di Tambolaka',
    caption: 'Katedral Weetebula',
    author: 'Avemundi',
    license: 'CC BY-SA 4.0',
    source: commons('Cattedrale_di_Weetebula.jpg'),
  },
  bandaraTambolaka: {
    src: '/images/sumba/bandara-tambolaka.jpg',
    alt: 'Terminal Bandara Lede Kalumbang (dulu Bandara Tambolaka) beratap merah',
    caption: 'Bandara Lede Kalumbang, Tambolaka',
    author: 'nu9i',
    license: 'CC BY-SA 3.0',
    source: commons('Radamata,_Loura,_Southwest_Sumba_Regency,_East_Nusa_Tenggara,_Indonesia_-_panoramio_(5).jpg'),
  },
  pltsEnde: {
    src: '/images/sumba/plts-ende.jpg',
    alt: 'Panel surya PLTS di atas tebing Pulau Ende, Nusa Tenggara Timur',
    caption: 'PLTS Pulau Ende, NTT',
    author: 'Selisik',
    license: 'CC BY-SA 4.0',
    source: commons('Pembangkit_Listrik_Tenaga_Surya_(PLTS)_di_Pulau_Ende,_Nusa_Tenggara_Timur_(NTT)._Pasokan_listrik_hanya_untuk_mencukup_kebutuhan_masyarakat_pulau_tersebut..jpg'),
  },
  membacaBersama: {
    src: '/images/sumba/membaca-bersama.jpg',
    alt: 'Anak-anak membaca buku cerita bersama pendamping di atas tikar',
    caption: 'Membaca Bersama',
    author: 'Moh. Ali Zaenal',
    license: 'CC BY-SA 4.0',
    source: commons('Membaca_Bersama.jpg'),
  },
  posyandu: {
    src: '/images/sumba/posyandu-timbang.jpg',
    alt: 'Kegiatan penimbangan balita di posyandu desa',
    caption: 'Timbang Balita di Posyandu',
    author: 'Yansen Ricco',
    license: 'CC BY-SA 4.0',
    source: commons('Timbang_Balita_di_Posyandu_Porendeang.jpg'),
  },
  seribuBukit: {
    src: '/images/sumba/seribu-bukit.jpg',
    alt: 'Hamparan bukit-bukit hijau Pulau Sumba',
    caption: 'Pulau Seribu Bukit',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Sumba_Pulau_Seribu_Bukit.jpg'),
  },
  weekuri: {
    src: '/images/sumba/weekuri.jpg',
    alt: 'Danau Weekuri berair toska dikelilingi karang dan hutan',
    caption: 'Danau Weekuri',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Danau_Weekuri,_Sumba_Barat_Daya.jpg'),
  },
  weekuriLaguna: {
    src: '/images/sumba/weekuri-laguna.jpg',
    alt: 'Laguna Weekuri di bawah langit biru',
    caption: 'Laguna Weekuri',
    author: 'Bimantara.prawoto',
    license: 'CC BY-SA 4.0',
    source: commons('Weekuri_Lagoon.jpg'),
  },
  ratenggaroKampung: {
    src: '/images/sumba/ratenggaro-kampung.jpg',
    alt: 'Deretan rumah adat beratap menara di Kampung Ratenggaro',
    caption: 'Kampung Adat Ratenggaro',
    author: 'Allwyn Wawyn',
    license: 'CC BY-SA 4.0',
    source: commons('Rumah_Kampung_Adat_Ratenggaro_-_Sumba_Barat_Daya.jpg'),
  },
  ratenggaroKuburBatu: {
    src: '/images/sumba/ratenggaro-kubur-batu.jpg',
    alt: 'Kubur batu megalitikum di depan rumah adat Ratenggaro',
    caption: 'Kubur Batu Ratenggaro',
    author: 'Allwyn Wawyn',
    license: 'CC BY-SA 4.0',
    source: commons('Kampung_Adat_Ratenggaro_-_Sumba_Barat_Daya.jpg'),
  },
  pantaiMandorak: {
    src: '/images/sumba/pantai-mandorak.jpg',
    alt: 'Tebing karang dan air biru Pantai Mandorak',
    caption: 'Pantai Mandorak',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Pantai_Mandorak,_Sumba_Barat_Daya.jpg'),
  },
  pantaiMbawana: {
    src: '/images/sumba/pantai-mbawana.jpg',
    alt: 'Gerbang batu alami di Pantai Mbawana',
    caption: 'Pantai Mbawana',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Pantai_Mbawana,_Sumba_Barat_Daya.jpg'),
  },
  kudaSandalwood: {
    src: '/images/sumba/kuda-sandalwood.jpg',
    alt: 'Kuda Sandalwood merumput di padang Sumba',
    caption: 'Kuda Sandalwood',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Kuda-kuda_Pulau_Sumba.jpg'),
  },
  kudaSavana: {
    src: '/images/sumba/kuda-savana.jpg',
    alt: 'Kawanan kuda berlari di savana',
    caption: 'Kuda di Savana',
    author: 'Zahrasrtn',
    license: 'CC BY-SA 4.0',
    source: commons('Kuda_Pulau_Sumba.jpg'),
  },
  tenunKodi: {
    src: '/images/sumba/tenun-kodi.jpg',
    alt: 'Penenun memamerkan tenun ikat khas Kodi',
    caption: 'Tenun Ikat Kodi',
    author: 'Rintobili',
    license: 'CC BY-SA 3.0',
    source: commons('Tenun_Ikat_Kodi,_SBD,_NTT.jpg'),
  },
  pasola: {
    src: '/images/sumba/pasola.jpg',
    alt: 'Penunggang kuda melempar lembing dalam tradisi Pasola',
    caption: 'Tradisi Pasola',
    author: 'RaiyaniM',
    license: 'CC BY-SA 4.0',
    source: commons('Pasola.jpg'),
  },
  senjaSumba: {
    src: '/images/sumba/senja-sumba.jpg',
    alt: 'Siluet tiga orang di atas bukit saat senja di Sumba',
    caption: 'Senja di Sumba',
    author: 'Nickoasmara',
    license: 'CC BY-SA 4.0',
    source: commons('The_Magnificent_Sunset_from_Sumba_Island.jpg'),
  },
} satisfies Record<string, SumbaPhoto>
