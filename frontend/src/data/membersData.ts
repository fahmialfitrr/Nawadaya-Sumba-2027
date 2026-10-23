export interface Member {
  id: string
  name: string
  role: string
  hierarchy: 'dpl' | 'kormanit' | 'kormater' | 'member'
  cluster: 'dpl' | 'unit' | 'saintek' | 'soshum' | 'medika' | 'agro'
  faculty: string
  major: string
  photo: string
  cvUrl?: string
}

const DEFAULT_CV = 'https://drive.google.com/file/d/1dERAkdjWsF8jG6lda6rb7cPX7UDnDH_8/view?usp=sharing'
const DEFAULT_PHOTO = '/members/placeholder.svg'

export const MEMBERS_DATA: Member[] = [
  // ==========================================
  // LEVEL 1: DOSEN PEMBIMBING LAPANGAN (1 ORANG)
  // ==========================================
  {
    id: 'm-dpl',
    name: 'Dr. R.A. Antari Innaka Turingsih, S.H., M.H.',
    role: 'Dosen Pembimbing Lapangan (DPL)',
    hierarchy: 'dpl',
    cluster: 'dpl',
    faculty: 'Fakultas Hukum',
    major: 'Ilmu Hukum',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },

  // ==========================================
  // LEVEL 2: KOORDINATOR MAHASISWA UNIT (1 ORANG)
  // ==========================================
  {
    id: 'm-kormanit',
    name: 'Nabiel S. Rajasa',
    role: 'Koordinator Mahasiswa Unit (Kormanit)',
    hierarchy: 'kormanit',
    cluster: 'unit',
    faculty: 'Fakultas Filsafat',
    major: 'Filsafat',
    photo: '/members/nabiel-s-rajasa.webp',
    cvUrl: DEFAULT_CV,
  },

  // ==========================================
  // LEVEL 3: 4 KORMATER (SAINTEK, SOSHUM, MEDIKA, AGRO)
  // ==========================================
  {
    id: 'm-kormater-saintek',
    name: 'Ananda Constelline',
    role: 'Kormater Saintek',
    hierarchy: 'kormater',
    cluster: 'saintek',
    faculty: 'Fakultas Teknik',
    major: 'Teknik Industri',
    photo: '/members/ananda-constelline.webp',
    cvUrl: 'https://drive.google.com/file/d/1axtH46Urm4idqQ5Wh0jAw313MPD9CQMI/view?usp=sharing',
  },
  {
    id: 'm-kormater-soshum',
    name: 'Mumtaz Ayyasy',
    role: 'Kormater Soshum',
    hierarchy: 'kormater',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Pembangunan Sosial dan Kesejahteraan (PSDK)',
    photo: '/members/mumtaz-ayyasy.webp',
    cvUrl: 'https://drive.google.com/file/d/1Abg0-WYozouCcJYP6x3ggGy9y_PGPy4H/view?usp=sharing',
  },
  {
    id: 'm-kormater-medika',
    name: 'Vania Husna',
    role: 'Kormater Medika',
    hierarchy: 'kormater',
    cluster: 'medika',
    faculty: 'Fakultas Kedokteran Gigi',
    major: 'Kedokteran Gigi',
    photo: '/members/vania-husna.webp',
    cvUrl: 'https://drive.google.com/file/d/1NEv4JqYZX-cydZUSJ19z2Q36hgT1ZAqj/view?usp=sharing',
  },
  {
    id: 'm-kormater-agro',
    name: 'Fausta Ryanda',
    role: 'Kormater Agro',
    hierarchy: 'kormater',
    cluster: 'agro',
    faculty: 'Fakultas Teknologi Pertanian',
    major: 'Teknologi Industri Pertanian',
    photo: '/members/fausta-ryanda.webp',
    cvUrl: 'https://drive.google.com/file/d/1pRl4SQm0DDLzYU0h1tVBraAxcI1w0rRU/view?usp=sharing',
  },

  // ==========================================
  // LEVEL 4: ANGGOTA KLUSTER SAINTEK (6 ORANG)
  // ==========================================
  {
    id: 'm-st-1',
    name: 'Rachel Zalika',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Fakultas Geografi',
    major: 'Pembangunan Wilayah',
    photo: '/members/rachel-zalika.webp',
    cvUrl: 'https://drive.google.com/file/d/1YvRVoj-8iyPAJP0uhJH894V2Up8UN8wj/view?usp=sharing',
  },
  {
    id: 'm-st-2',
    name: 'Falah Auladi',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Sekolah Vokasi',
    major: 'Rekayasa Perangkat Lunak',
    photo: '/members/falah-auladi.webp',
    cvUrl: 'https://drive.google.com/file/d/18g94URDf4aNPkHJIFkiYnPF_pw9gz73F/view?usp=sharing',
  },
  {
    id: 'm-st-3',
    name: 'Rafa Ghifari',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Fakultas Teknik',
    major: 'Teknik Sipil',
    photo: '/members/rafa-ghifari.webp',
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-st-4',
    name: 'Vera Yustifa',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Fakultas Biologi',
    major: 'Biologi',
    photo: '/members/vera-yustifa.webp',
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-st-5',
    name: 'Ahmad Rizwan',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Sekolah Vokasi',
    major: 'Rekayasa Perangkat Lunak',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-st-6',
    name: 'Fahmi Alfitra',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Fakultas MIPA',
    major: 'Elektronika dan Instrumentasi',
    photo: '/members/fahmi-alfitra.webp',
    cvUrl: 'https://drive.google.com/file/d/1wWS0N9aQH9_TbM9RP_o2yy0sr10C1G6k/view?usp=sharing',
  },

  // ==========================================
  // LEVEL 5: ANGGOTA KLUSTER SOSHUM (6 ORANG)
  // ==========================================
  {
    id: 'm-so-1',
    name: 'Venussyela Ayumi',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Ilmu Komunikasi',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-so-2',
    name: 'Hilkia Rahadyanta',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Hubungan Internasional',
    photo: '/members/hilkia-rahadyanta.webp',
    cvUrl: 'https://drive.google.com/file/d/1kLSq1RpVoyr6njIR5mWorAFcH8ESKbGQ/view?usp=sharing',
  },
  {
    id: 'm-so-3',
    name: 'Emil Rahadian',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Manajemen dan Kebijakan Publik',
    photo: '/members/emil-rahadian.webp',
    cvUrl: 'https://drive.google.com/file/d/1okcYDxnhKFhmcYwUlDFyxk_Rv9tb6abQ/view?usp=sharing',
  },
  {
    id: 'm-so-4',
    name: 'Naura Hanifika',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Psikologi',
    major: 'Psikologi',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-so-5',
    name: 'Pradytya Andri',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Ilmu Komunikasi',
    photo: '/members/pradytya-andri.webp',
    cvUrl: 'https://drive.google.com/file/d/12gPE3necBZlR3TZ6NyCZ-nEj38pynd9E/view?usp=sharing',
  },
  {
    id: 'm-so-6',
    name: 'Pramuraya Wisesa',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Ilmu Komunikasi',
    photo: '/members/pramuraya-wisesa.webp',
    cvUrl: 'https://drive.google.com/file/d/1dC7PoggYiJyRBUpwy-mvK4C6K9Yck4EB/view?usp=sharing',
  },

  // ==========================================
  // LEVEL 6: ANGGOTA KLUSTER MEDIKA (2 ORANG)
  // ==========================================
  {
    id: 'm-me-1',
    name: 'Tsani Nur Fauziah',
    role: 'Anggota Kluster Medika',
    hierarchy: 'member',
    cluster: 'medika',
    faculty: 'Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan',
    major: 'Ilmu Keperawatan',
    photo: '/members/tsani-nur-fauziah.webp',
    cvUrl: 'https://drive.google.com/file/d/1WfpH4cv9_Mq-aDAuljOyNgcWYKze8hb7/view?usp=sharing',
  },
  {
    id: 'm-me-2',
    name: 'Azzahra Aurelya',
    role: 'Anggota Kluster Medika',
    hierarchy: 'member',
    cluster: 'medika',
    faculty: 'Fakultas Farmasi',
    major: 'Farmasi',
    photo: '/members/azzahra-aurelya.webp',
    cvUrl: 'https://drive.google.com/file/d/15ECy_YF7sUu6ljGMZ3ECQLF3ztBOc6bB/view?usp=sharing',
  },

  // ==========================================
  // KLUSTER AGRO
  // ==========================================
  {
    id: 'm-ag-1',
    name: 'Ikko Rahmat',
    role: 'Anggota Kluster Agro',
    hierarchy: 'member',
    cluster: 'agro',
    faculty: 'Fakultas Teknologi Pertanian',
    major: 'Manajemen Sumber Daya Akuatik',
    photo: DEFAULT_PHOTO,
    cvUrl: 'https://drive.google.com/file/d/1TjYj1NseyxVFujN1OI7sN68JZS3zufO9/view?usp=sharing',
  },
]
