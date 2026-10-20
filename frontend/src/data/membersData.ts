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
const DEFAULT_PHOTO = '/hipster.svg'

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
    photo: DEFAULT_PHOTO,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-kormater-soshum',
    name: 'Mumtaz Ayyasy',
    role: 'Kormater Soshum',
    hierarchy: 'kormater',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Pembangunan Sosial dan Kesejahteraan (PSDK)',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-kormater-medika',
    name: 'Vania Husna',
    role: 'Kormater Medika',
    hierarchy: 'kormater',
    cluster: 'medika',
    faculty: 'Fakultas Kedokteran Gigi',
    major: 'Kedokteran Gigi',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-kormater-agro',
    name: 'Fausta Ryanda',
    role: 'Kormater Agro',
    hierarchy: 'kormater',
    cluster: 'agro',
    faculty: 'Fakultas Teknologi Pertanian',
    major: 'Teknologi Industri Pertanian',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-st-2',
    name: 'Falah Auladi',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Sekolah Vokasi',
    major: 'Rekayasa Perangkat Lunak',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-st-3',
    name: 'Rafa Ghifari',
    role: 'Anggota Kluster Saintek',
    hierarchy: 'member',
    cluster: 'saintek',
    faculty: 'Fakultas Teknik',
    major: 'Teknik Sipil',
    photo: DEFAULT_PHOTO,
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
    photo: DEFAULT_PHOTO,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-so-3',
    name: 'Emil Rahadian',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Manajemen dan Kebijakan Publik',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-so-6',
    name: 'Pramuraya Wisesa',
    role: 'Anggota Kluster Soshum',
    hierarchy: 'member',
    cluster: 'soshum',
    faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    major: 'Ilmu Komunikasi',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
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
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
  {
    id: 'm-me-2',
    name: 'Azzahra Aurelya',
    role: 'Anggota Kluster Medika',
    hierarchy: 'member',
    cluster: 'medika',
    faculty: 'Fakultas Farmasi',
    major: 'Farmasi',
    photo: DEFAULT_PHOTO,
    cvUrl: DEFAULT_CV,
  },
]
