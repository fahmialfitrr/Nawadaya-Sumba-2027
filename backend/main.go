package main

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"
)

// Data Models
type InfoResponse struct {
	Name           string   `json:"name"`
	Tagline        string   `json:"tagline"`
	Theme          string   `json:"theme"`
	Period         string   `json:"period"`
	Duration       string   `json:"duration"`
	Location       string   `json:"location"`
	Regency        string   `json:"regency"`
	Province       string   `json:"province"`
	University     string   `json:"university"`
	DPL            string   `json:"dpl"`
	Kormanit       string   `json:"kormanit"`
	TotalMembers   int      `json:"totalMembers"`
	TotalProker    int      `json:"totalProker"`
	ClustersCount  int      `json:"clustersCount"`
	TargetVillages []string `json:"targetVillages"`
	Description    string   `json:"description"`
	Philosophy     string   `json:"philosophy"`
}

type SocialLinks struct {
	LinkedIn  string `json:"linkedin,omitempty"`
	Instagram string `json:"instagram,omitempty"`
	GitHub    string `json:"github,omitempty"`
}

type Member struct {
	ID        string      `json:"id"`
	Name      string      `json:"name"`
	Role      string      `json:"role"`
	Hierarchy string      `json:"hierarchy"` // "dpl", "kormanit", "kormater", "member"
	Cluster   string      `json:"cluster"`   // "dpl", "unit", "saintek", "soshum", "medika", "agro"
	Faculty   string      `json:"faculty"`
	Major     string      `json:"major"`
	Photo     string      `json:"photo"`
	Quote     string      `json:"quote"`
	FunFact   string      `json:"funFact"`
	Bio       string      `json:"bio"`
	Skills    []string    `json:"skills"`
	Socials   SocialLinks `json:"socials"`
}

type Cluster struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	FullName    string   `json:"fullName"`
	LeaderName  string   `json:"leaderName"`
	Color       string   `json:"color"`
	AccentBg    string   `json:"accentBg"`
	Icon        string   `json:"icon"`
	Description string   `json:"description"`
	ProkerCount int      `json:"prokerCount"`
	MemberCount int      `json:"memberCount"`
	KeyFocus    []string `json:"keyFocus"`
}

type Proker struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Cluster       string   `json:"cluster"`
	ClusterName   string   `json:"clusterName"`
	Category      string   `json:"category"`
	Location      string   `json:"location"`
	Status        string   `json:"status"` // "Selesai 100%", "Sedang Berjalan", "Rencana Berkelanjutan"
	Progress      int      `json:"progress"`
	Targets       string   `json:"targets"`
	Timeline      string   `json:"timeline"`
	SDGs          []string `json:"sdgs"`
	ShortDesc     string   `json:"shortDesc"`
	FullDesc      string   `json:"fullDesc"`
	Outputs       []string `json:"outputs"`
	ImpactMetrics string   `json:"impactMetrics"`
	Images        []string `json:"images"`
}

type LocationPoint struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Category    string   `json:"category"` // "posko", "adat", "alam", "faskes", "desa"
	ClusterTags []string `json:"clusterTags"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
	Altitude    string   `json:"altitude"`
	Description string   `json:"description"`
	Activities  []string `json:"activities"`
	Image       string   `json:"image"`
	Distance    string   `json:"distance"`
}

type MemoryItem struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Date     string `json:"date"`
	Location string `json:"location"`
	Cluster  string `json:"cluster"`
	Image    string `json:"image"`
	Caption  string `json:"caption"`
	Rotate   int    `json:"rotate"`
	AudioTag string `json:"audioTag"`
	Mood     string `json:"mood"`
	Likes    int    `json:"likes"`
}

type Partner struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"` // "sponsor_utama", "sponsor_pendukung", "pemerintah", "media_partner"
	Tier     string `json:"tier"`     // "Platinum", "Gold", "Partner", "Media"
	LogoText string `json:"logoText"`
	Subtitle string `json:"subtitle"`
	Link     string `json:"link"`
}

type TourismSpot struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Type        string   `json:"type"`
	Location    string   `json:"location"`
	Distance    string   `json:"distance"`
	Description string   `json:"description"`
	Highlights  []string `json:"highlights"`
	AdatRules   []string `json:"adatRules"`
	Image       string   `json:"image"`
	BestTime    string   `json:"bestTime"`
}

type Story struct {
	ID          string   `json:"id"`
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Excerpt     string   `json:"excerpt"`
	Content     string   `json:"content"`
	Author      string   `json:"author"`
	Cluster     string   `json:"cluster"`
	Date        string   `json:"date"`
	ReadTime    string   `json:"readTime"`
	CoverImage  string   `json:"coverImage"`
	Tags        []string `json:"tags"`
}

type GuestbookEntry struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Affiliation string  `json:"affiliation"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
	Likes     int       `json:"likes"`
}

// In-Memory Store
type ServerStore struct {
	mu         sync.RWMutex
	guestbook  []GuestbookEntry
}

var store = &ServerStore{
	guestbook: []GuestbookEntry{
		{
			ID:          "gb-1",
			Name:        "Mama Marta Lali",
			Affiliation: "Tokoh Masyarakat Desa Kodi Bangedo",
			Message:     "Terima kasih adik-adik KKN UGM Nawadaya Sumba, sudah mau berbaur dan mengajarkan anak-anak kami dengan penuh kasih sayang. Pintu rumah kami selalu terbuka untuk kalian.",
			CreatedAt:   time.Now().Add(-72 * time.Hour),
			Likes:       34,
		},
		{
			ID:          "gb-2",
			Name:        "Bapa Thomas Kii",
			Affiliation: "Kelompok Tani Savana Makmur",
			Message:     "Pelatihan silase dan pupuk kompos sangat berguna bagi peternak kuda dan sapi kami di musim kemarau. Sukses terus para mahasiswa calon pemimpin bangsa!",
			CreatedAt:   time.Now().Add(-48 * time.Hour),
			Likes:       28,
		},
		{
			ID:          "gb-3",
			Name:        "KAGAMA NTT",
			Affiliation: "Alumni Universitas Gadjah Mada",
			Message:     "Bangga melihat adik-adik mengabdi di tanah Marapu Sumba Barat Daya. Kibarkan terus panji kerakyatan UGM sampai ke pelosok nusantara!",
			CreatedAt:   time.Now().Add(-24 * time.Hour),
			Likes:       45,
		},
	},
}

// Sanitizer & Security against SQL Injection and XSS
var sqlInjectionPattern = regexp.MustCompile(`(?i)(--|;|\b(union\s+select|insert\s+into|delete\s+from|drop\s+table|drop\s+database|exec\s*\(|alter\s+table|select\s+.*\s+from)\b)`)

func sanitizeInput(s string) string {
	s = strings.TrimSpace(s)
	return html.EscapeString(s)
}

// CORS Middleware with Security Headers
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		next(w, r)
	}
}

// Sample Data Generators
func getInfoData() InfoResponse {
	return InfoResponse{
		Name:         "KKN-PPM UGM Nawadaya Sumba",
		Tagline:      "Menenun Asa, Mengabdi Sepenuh Hati di Tanah Marapu",
		Theme:        "Pemberdayaan Berkelanjutan Berbasis Kearifan Lokal Menuju Kemandirian Masyarakat Sumba Barat Daya",
		Period:       "Periode 2 Tahun 2026",
		Duration:     "50 Hari Pengabdian Lapangan",
		Location:     "Kecamatan Kodi Bangedo & Sekitarnya",
		Regency:      "Kabupaten Sumba Barat Daya",
		Province:     "Nusa Tenggara Timur (NTT)",
		University:   "Universitas Gadjah Mada",
		DPL:          "Dr. Ir. Wahyu Supartono",
		Kormanit:     "Muhammad Falah",
		TotalMembers: 30,
		TotalProker:  18,
		ClustersCount: 4,
		TargetVillages: []string{
			"Desa Kodi Bangedo",
			"Desa Tema Tana",
			"Kampung Adat Ratenggaro",
			"Kawasan Danau Weekuri",
		},
		Description: "Nawadaya Sumba adalah kontingen KKN-PPM UGM yang bertugas mendedikasikan ilmu pengetahuan, teknologi, kesehatan, dan kepekaan sosial untuk mendampingi masyarakat Sumba Barat Daya dalam membangun kemandirian ekonomi, konservasi alam, dan ketahanan sosial.",
		Philosophy:  "Nawadaya berasal dari perpaduan kata 'Nawa' (sembilan nilai kebajikan) dan 'Daya' (energi pemberdayaan dan kekuatan kolektif). Simbol tekad tak kenal lelah mengabdi untuk kejayaan bumi Flobamora.",
	}
}

func getMembersData() []Member {
	// Standard photo dummy: /Hispter_Falah_opt.jpg as specified by user
	photoDummy := "/Hispter_Falah_opt.jpg"

	return []Member{
		// DPL (1)
		{
			ID:        "m-dpl",
			Name:      "Dr. Ir. Wahyu Supartono",
			Role:      "Dosen Pembimbing Lapangan (DPL)",
			Hierarchy: "dpl",
			Cluster:   "dpl",
			Faculty:   "Fakultas Teknologi Pertanian",
			Major:     "Teknologi Industri Pertanian",
			Photo:     photoDummy,
			Quote:     "Pengabdian sejati adalah saat ilmu pengetahuan bertemu dengan ketulusan hati masyarakat.",
			FunFact:   "Telah membimbing lebih dari 15 angkatan KKN ke Indonesia Timur.",
			Bio:       "Dosen senior UGM dengan kepakaran rantai pasok agroindustri dan pemberdayaan masyarakat pedesaan berkelanjutan.",
			Skills:    []string{"Pemberdayaan Masyarakat", "Evaluasi Kebijakan", "Agroindustri"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		// Kormanit (1)
		{
			ID:        "m-kormanit",
			Name:      "Muhammad Falah",
			Role:      "Koordinator Mahasiswa Unit (Kormanit)",
			Hierarchy: "kormanit",
			Cluster:   "unit",
			Faculty:   "Sekolah Vokasi",
			Major:     "Teknologi Rekayasa Perangkat Lunak (TRPL)",
			Photo:     photoDummy,
			Quote:     "Di tanah Sumba kita bukan hanya belajar mengabdi, tetapi belajar memanusiakan manusia.",
			FunFact:   "Suka coding di teras posko berteman deburan ombak Kodi dan teh manis hangat.",
			Bio:       "Mahasiswa TRPL UGM angkatan 2023, penggerak tim Nawadaya Sumba dengan fokus integrasi solusi digital pedesaan dan koordinasi multisektoral.",
			Skills:    []string{"Project Leadership", "Fullstack Engineering", "Public Speaking", "Community Mapping"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com", GitHub: "https://github.com", Instagram: "https://instagram.com"},
		},
		// 4 Kormater
		// 1. Kormater Saintek
		{
			ID:        "m-kormater-saintek",
			Name:      "Fikri Ramadhan",
			Role:      "Koordinator Mahasiswa Kluster Saintek",
			Hierarchy: "kormater",
			Cluster:   "saintek",
			Faculty:   "Fakultas Teknik",
			Major:     "Teknik Sipil & Lingkungan",
			Photo:     photoDummy,
			Quote:     "Infrastruktur terbaik adalah yang dibangun dengan kearifan lokal dan dijaga oleh warganya.",
			FunFact:   "Bisa menghitung debit air dan kemiringan kontur tanah hanya dengan selang air dan meteran kayu.",
			Bio:       "Memimpin program kerja infrastruktur tepat guna, filtrasi air bersih, dan pemetaan kontur desa di Sumba Barat Daya.",
			Skills:    []string{"Water Engineering", "Survey Kontur", "CAD Modeling", "Disaster Mitigation"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com", Instagram: "https://instagram.com"},
		},
		// 2. Kormater Soshum
		{
			ID:        "m-kormater-soshum",
			Name:      "Anindya Putri Saraswati",
			Role:      "Koordinator Mahasiswa Kluster Soshum",
			Hierarchy: "kormater",
			Cluster:   "soshum",
			Faculty:   "Fakultas Ilmu Sosial & Ilmu Politik",
			Major:     "Manajemen & Kebijakan Publik (MKP)",
			Photo:     photoDummy,
			Quote:     "Mendengarkan kisah mama-mama di bale adat adalah kuliah sosiologi paling bermakna dalam hidup saya.",
			FunFact:   "Kolektor kain tenun ikat asli Kodi dan fasih menyapa dalam bahasa daerah Wewewa.",
			Bio:       "Fokus pada penguatan kelembagaan BUMDes, edukasi literasi anak sekolah dasar, dan digitalisasi UMKM tenun ikat.",
			Skills:    []string{"Community Facilitation", "Policy Analysis", "Digital Branding", "Creative Writing"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com", Instagram: "https://instagram.com"},
		},
		// 3. Kormater Medika
		{
			ID:        "m-kormater-medika",
			Name:      "drg. Nurul Izzati",
			Role:      "Koordinator Mahasiswa Kluster Medika",
			Hierarchy: "kormater",
			Cluster:   "medika",
			Faculty:   "Fakultas Kedokteran Gigi",
			Major:     "Pendidikan Dokter Gigi",
			Photo:     photoDummy,
			Quote:     "Senyuman sehat anak-anak Sumba adalah mutiara berharga yang layak kita perjuangkan.",
			FunFact:   "Paling disukai anak-anak SD Kodi karena selalu membawa boneka peraga gigi berkumis lucu.",
			Bio:       "Memimpin inisiatif promotif preventif kesehatan gigi, skrining stunting balita, dan edukasi PHBS di pedukuhan terpencil.",
			Skills:    []string{"Dental Health Promotion", "Stunting Screening", "First Aid Training", "Community Health"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com", Instagram: "https://instagram.com"},
		},
		// 4. Kormater Agro
		{
			ID:        "m-kormater-agro",
			Name:      "Dimas Arya Pratama",
			Role:      "Koordinator Mahasiswa Kluster Agro",
			Hierarchy: "kormater",
			Cluster:   "agro",
			Faculty:   "Fakultas Pertanian",
			Major:     "Agronomi & Hortikultura",
			Photo:     photoDummy,
			Quote:     "Tanah savanna bukan tentang keterbatasan, melainkan potensi ketangguhan pangan masa depan.",
			FunFact:   "Bisa membedakan jenis tanah kapur dan tingkat kelembapan rumput pakan kuda hanya dari aromanya.",
			Bio:       "Mengawal inovasi silase pakan ternak musim kemarau, pemanfaatan biopori, dan kebun gizi hidroponik adaptif.",
			Skills:    []string{"Silage Formulation", "Dryland Agriculture", "Composting", "Livestock Nutrition"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com", Instagram: "https://instagram.com"},
		},

		// Anggota Kluster Saintek (Bawahan Kormater Saintek)
		{
			ID:        "m-st-1",
			Name:      "Bagas Raditya",
			Role:      "Anggota Kluster Saintek",
			Hierarchy: "member",
			Cluster:   "saintek",
			Faculty:   "Fakultas Teknik",
			Major:     "Teknik Geodesi",
			Photo:     photoDummy,
			Quote:     "Setiap koordinat di Sumba memiliki cerita peradaban yang patut kita abadikan.",
			FunFact:   "Pilot drone andalan tim yang berhasil memetakan seluruh lanskap Desa Kodi.",
			Bio:       "Bertanggung jawab atas WebGIS desa dan pemetaan batas wilayah administratif.",
			Skills:    []string{"Drone Mapping", "ArcGIS", "Photogrammetry"},
			Socials:   SocialLinks{GitHub: "https://github.com"},
		},
		{
			ID:        "m-st-2",
			Name:      "Clara Angelina",
			Role:      "Anggota Kluster Saintek",
			Hierarchy: "member",
			Cluster:   "saintek",
			Faculty:   "Fakultas Teknik",
			Major:     "Teknik Elektro",
			Photo:     photoDummy,
			Quote:     "Lampu yang menyala di balai desa adalah simbol harapan yang tak pernah padam.",
			FunFact:   "Bisa merakit modul solar panel surya sambil bernyanyi lagu daerah Sumba.",
			Bio:       "Perancang instalasi lampu tenaga surya mandiri di fasilitas umum dan dermaga nelayan Pero.",
			Skills:    []string{"Solar PV System", "Microcontrollers", "Electrical Safety"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-st-3",
			Name:      "Dian Permana",
			Role:      "Anggota Kluster Saintek",
			Hierarchy: "member",
			Cluster:   "saintek",
			Faculty:   "Fakultas Teknik",
			Major:     "Arsitektur",
			Photo:     photoDummy,
			Quote:     "Menara Uma Mbatangu membuktikan kehebatan struktur vernakular nusantara melampaui zaman.",
			FunFact:   "Menggambar sketsa arsitektur rumah adat Ratenggaro di buku catatan setiap sore.",
			Bio:       "Mendokumentasikan kearifan arsitektur lokal dan mendesain papan informasi wisata ramah lingkungan.",
			Skills:    []string{"Architectural Sketching", "3D Modeling", "Eco-Design"},
			Socials:   SocialLinks{Instagram: "https://instagram.com"},
		},
		{
			ID:        "m-st-4",
			Name:      "Eko Wicaksono",
			Role:      "Anggota Kluster Saintek",
			Hierarchy: "member",
			Cluster:   "saintek",
			Faculty:   "Sekolah Vokasi",
			Major:     "Teknik Pengelolaan & Perawatan Alat Berat",
			Photo:     photoDummy,
			Quote:     "Perawatan mesin pompa air desa adalah jaminan keberlangsungan hidup warga.",
			FunFact:   "Tukang serba bisa di posko, dari memperbaiki genset hingga filter pompa air.",
			Bio:       "Memimpin revitalisasi instalasi pompa air sumur bor dan mekanika penampung air hujan.",
			Skills:    []string{"Hydraulic Maintenance", "Pump Repair", "Workshop Tools"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},

		// Anggota Kluster Soshum (Bawahan Kormater Soshum)
		{
			ID:        "m-sh-1",
			Name:      "Farhan Maulana",
			Role:      "Anggota Kluster Soshum",
			Hierarchy: "member",
			Cluster:   "soshum",
			Faculty:   "Fakultas Hukum",
			Major:     "Ilmu Hukum",
			Photo:     photoDummy,
			Quote:     "Hukum adat dan hukum nasional dapat berjalan harmonis melindungi hak masyarakat.",
			FunFact:   "Sering diajak musyawarah oleh para tetua adat karena pembawaannya yang santun.",
			Bio:       "Mengawal penyuluhan tertib administrasi kependudukan dan perlindungan hak cipta motif tenun lokal.",
			Skills:    []string{"Legal Drafting", "Customary Law Advocacy", "Mediation"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-sh-2",
			Name:      "Gita Maharani",
			Role:      "Anggota Kluster Soshum",
			Hierarchy: "member",
			Cluster:   "soshum",
			Faculty:   "Fakultas Ekonomika dan Bisnis",
			Major:     "Akuntansi",
			Photo:     photoDummy,
			Quote:     "Pencatatan keuangan yang transparan adalah fondasi kemandirian usaha mama penenun.",
			FunFact:   "Buku kas posko KKN selalu seimbang sampai ke rupiah terakhir berkat ketelitiannya.",
			Bio:       "Pelatih pembukuan kas sederhana dan literasi pengelolaan keuangan keluarga bagi kelompok perempuan pengrajin tenun.",
			Skills:    []string{"Financial Literacy", "Bookkeeping", "Cost Accounting"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-sh-3",
			Name:      "Hanif Pratama",
			Role:      "Anggota Kluster Soshum",
			Hierarchy: "member",
			Cluster:   "soshum",
			Faculty:   "Fakultas Ilmu Sosial & Ilmu Politik",
			Major:     "Ilmu Komunikasi",
			Photo:     photoDummy,
			Quote:     "Setiap senyum masyarakat Sumba layak disuarakan ke seluruh penjuru dunia.",
			FunFact:   "Master of ceremony acara 17 Agustusan desa yang paling heboh dan disukai warga.",
			Bio:       "Fotografer dan narator dokumenter KKN Nawadaya Sumba, pencipta konten promosi wisata adat lokal.",
			Skills:    []string{"Visual Storytelling", "Social Media Management", "Audio Production"},
			Socials:   SocialLinks{Instagram: "https://instagram.com"},
		},
		{
			ID:        "m-sh-4",
			Name:      "Indah Kusuma",
			Role:      "Anggota Kluster Soshum",
			Hierarchy: "member",
			Cluster:   "soshum",
			Faculty:   "Fakultas Psikologi",
			Major:     "Psikologi",
			Photo:     photoDummy,
			Quote:     "Masa depan anak-anak Sumba dimulai dari rasa percaya diri dan ruang berekspresi.",
			FunFact:   "Pendongeng ulung yang selalu dikerubungi anak-anak Kodi setiap pukul 4 sore.",
			Bio:       "Penggagas program 'Rumah Ceria Kodi', bimbingan belajar kreatif, dan penguatan motivasi belajar anak usia dini.",
			Skills:    []string{"Child Psychology", "Counseling", "Expressive Arts Therapy"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},

		// Anggota Kluster Medika (Bawahan Kormater Medika)
		{
			ID:        "m-md-1",
			Name:      "Jessica Natalie",
			Role:      "Anggota Kluster Medika",
			Hierarchy: "member",
			Cluster:   "medika",
			Faculty:   "Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan (FK-KMK)",
			Major:     "Pendidikan Dokter",
			Photo:     photoDummy,
			Quote:     "Kesehatan adalah anugerah terbesar yang harus bisa diakses hingga ke tapal batas.",
			FunFact:   "Hafal dosis obat dan sigap memeriksa puluhan pasien warga tanpa mengeluh lelah.",
			Bio:       "Memimpin layanan pemeriksaan tensi, skrining asam urat & gula darah, serta pertolongan pertama lapangan.",
			Skills:    []string{"Clinical Examination", "Hypertension Management", "Emergency Medicine"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-md-2",
			Name:      "Kevin Alamsyah",
			Role:      "Anggota Kluster Medika",
			Hierarchy: "member",
			Cluster:   "medika",
			Faculty:   "FK-KMK",
			Major:     "Ilmu Keperawatan",
			Photo:     photoDummy,
			Quote:     "Merawat dengan empati adalah jembatan paling kokoh menyembuhkan luka batin dan fisik.",
			FunFact:   "Juara senam lansia desa yang selalu membuat mama dan bapa tertawa riang di posyandu.",
			Bio:       "Fasilitator posyandu lansia, perawatan luka higienis, dan edukasi sanitasi lingkungan rumah tinggal.",
			Skills:    []string{"Wound Care", "Geriatric Care", "Community Nursing"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-md-3",
			Name:      "Larasati Dewi",
			Role:      "Anggota Kluster Medika",
			Hierarchy: "member",
			Cluster:   "medika",
			Faculty:   "Fakultas Farmasi",
			Major:     "Farmasi Klinik & Komunitas",
			Photo:     photoDummy,
			Quote:     "Pemanfaatan tanaman obat keluarga adalah kemandirian farmasi yang lahir dari tanah sendiri.",
			FunFact:   "Ahli meracik jamu herbal temulawak dan daun kelor yang segar disukai teman-teman posko.",
			Bio:       "Edukator penggunaan obat yang rasional (DAGUSIBU) dan pengembangan kebun Tanaman Obat Keluarga (TOGA).",
			Skills:    []string{"Herbal Formulation", "Pharmacology", "Drug Safety Education"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-md-4",
			Name:      "Mutiara Safitri",
			Role:      "Anggota Kluster Medika",
			Hierarchy: "member",
			Cluster:   "medika",
			Faculty:   "FK-KMK",
			Major:     "Gizi Kesehatan",
			Photo:     photoDummy,
			Quote:     "Gizi terbaik bagi anak Sumba ada pada pangan lokal di sekeliling halaman mereka.",
			FunFact:   "Bisa membuat puding daun kelor dan biskuit ubi ungu yang lezat bergizi tinggi.",
			Bio:       "Inisiator demo masak MP-ASI berbahan dasar pangan lokal bergizi seimbang untuk balita cegah stunting.",
			Skills:    []string{"Nutritional Assessment", "Menu Engineering", "Stunting Prevention"},
			Socials:   SocialLinks{Instagram: "https://instagram.com"},
		},

		// Anggota Kluster Agro (Bawahan Kormater Agro)
		{
			ID:        "m-ag-1",
			Name:      "Naufal Hidayat",
			Role:      "Anggota Kluster Agro",
			Hierarchy: "member",
			Cluster:   "agro",
			Faculty:   "Fakultas Peternakan",
			Major:     "Ilmu & Industri Peternakan",
			Photo:     photoDummy,
			Quote:     "Kuda Sandalwood dan sapi Sumba Ongole adalah kebanggaan dan harga diri peternak Sumba.",
			FunFact:   "Sangat akrab dengan kuda pacu Sumba dan gemar menunggangi kuda savanna.",
			Bio:       "Penyuluh kesehatan reproduksi ternak, sanitasi kandang komunal, dan formulasi pakan konsentrat fermentasi.",
			Skills:    []string{"Animal Nutrition", "Livestock Management", "Pasture Management"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-ag-2",
			Name:      "Oktavia Rahma",
			Role:      "Anggota Kluster Agro",
			Hierarchy: "member",
			Cluster:   "agro",
			Faculty:   "Fakultas Pertanian",
			Major:     "Ilmu Tanah",
			Photo:     photoDummy,
			Quote:     "Menyuburkan tanah gersang adalah melipatgandakan rezeki bagi generasi masa depan.",
			FunFact:   "Mengantongi sampel tanah dari setiap sudut Kodi untuk diuji pH dan bahan organiknya.",
			Bio:       "Peneliti uji kesuburan tanah kapur, inisiator biopori konservasi air hujan, dan pembuatan biochar sekam padi.",
			Skills:    []string{"Soil Fertility Analysis", "Biochar Production", "Water Retention Techniques"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-ag-3",
			Name:      "Putra Wijaya",
			Role:      "Anggota Kluster Agro",
			Hierarchy: "member",
			Cluster:   "agro",
			Faculty:   "Fakultas Kehutanan",
			Major:     "Konservasi Sumberdaya Hutan",
			Photo:     photoDummy,
			Quote:     "Pohon cendana dan mangrove adalah benteng pelindung pesisir pulau Sumba.",
			FunFact:   "Sanggup memanjat bukit batu terjal untuk memetakan flora endemik Sumba.",
			Bio:       "Penggerak reboisasi bibit bakau di muara Sungai Pero dan penanaman pohon peneduh di sekitar sumber mata air.",
			Skills:    []string{"Agroforestry", "Mangrove Restoration", "Biodiversity Survey"},
			Socials:   SocialLinks{LinkedIn: "https://linkedin.com"},
		},
		{
			ID:        "m-ag-4",
			Name:      "Qonita Az-Zahra",
			Role:      "Anggota Kluster Agro",
			Hierarchy: "member",
			Cluster:   "agro",
			Faculty:   "Fakultas Teknologi Pertanian",
			Major:     "Teknologi Pangan dan Hasil Pertanian",
			Photo:     photoDummy,
			Quote:     "Nilai tambah olahan jagung dan jambu mete meningkatkan martabat pangan lokal.",
			FunFact:   "Berhasil mengolah kacang mete Sumba menjadi selai premium yang laris manis dicicipi warga.",
			Bio:       "Fasilitator pengolahan pascapanen jagung pulut dan jambu mete menjadi camilan kemasan tahan lama.",
			Skills:    []string{"Food Processing", "Packaging & Preservation", "HACCP Principles"},
			Socials:   SocialLinks{Instagram: "https://instagram.com"},
		},
	}
}

func getClustersData() []Cluster {
	return []Cluster{
		{
			ID:          "saintek",
			Name:        "Saintek",
			FullName:    "Kluster Sains & Teknologi",
			LeaderName:  "Fikri Ramadhan (Teknik Sipil)",
			Color:       "#00A3B4", // Turquoise Lagoon Teal from copal
			AccentBg:    "rgba(0, 163, 180, 0.12)",
			Icon:        "Cpu",
			Description: "Inovasi rekayasa tepat guna, elektrifikasi tenaga surya, filtrasi air bersih, dan pemetaan geospasial digital berbasis WebGIS.",
			ProkerCount: 4,
			MemberCount: 5,
			KeyFocus:    []string{"Energi Terbarukan Surya", "Filter Air Bersih", "WebGIS & Pemetaan Drone", "Infrastruktur Posko & Desa"},
		},
		{
			ID:          "soshum",
			Name:        "Soshum",
			FullName:    "Kluster Sosial & Humaniora",
			LeaderName:  "Anindya Putri Saraswati (MKP FISIPOL)",
			Color:       "#F3586E", // Warm Coral from copal
			AccentBg:    "rgba(243, 88, 110, 0.12)",
			Icon:        "BookOpen",
			Description: "Penguatan literasi anak usia dini, revitalisasi kelembagaan desa, pendampingan legalitas adat, serta digital marketing UMKM tenun ikat.",
			ProkerCount: 5,
			MemberCount: 5,
			KeyFocus:    []string{"E-Commerce Tenun Ikat", "Literasi Anak SD Kodi", "Tertib Administrasi Desa", "Branding Wisata Budaya"},
		},
		{
			ID:          "medika",
			Name:        "Medika",
			FullName:    "Kluster Kedokteran & Kesehatan",
			LeaderName:  "drg. Nurul Izzati (FKG)",
			Color:       "#7C1B83", // Violet from copal
			AccentBg:    "rgba(124, 27, 131, 0.12)",
			Icon:        "HeartPulse",
			Description: "Pencegahan stunting balita, skrining penyakit tidak menular (hipertensi/diabetes), penyuluhan kesehatan gigi, dan posyandu integratif.",
			ProkerCount: 4,
			MemberCount: 5,
			KeyFocus:    []string{"Cegah Stunting Balita", "Pemeriksaan Gigi Siswa", "Posyandu Lansia & Tensi", "Edukasi PHBS & Sanitasi"},
		},
		{
			ID:          "agro",
			Name:        "Agro",
			FullName:    "Kluster Agrokompleks",
			LeaderName:  "Dimas Arya Pratama (Faperta)",
			Color:       "#E6A100", // Sunny Yellow / Warm Gold from copal
			AccentBg:    "rgba(230, 161, 0, 0.15)",
			Icon:        "Sprout",
			Description: "Kemandirian pakan ternak silase musim kemarau, konservasi tanah lahan kering, kebun gizi pekarangan, dan pengolahan pascapanen mete.",
			ProkerCount: 5,
			MemberCount: 5,
			KeyFocus:    []string{"Teknologi Silase Pakan", "Kebun Sayur Hidroponik", "Biochar & Pupuk Kompos", "Olahan Pascapanen Mete"},
		},
	}
}

func getProkerData() []Proker {
	return []Proker{
		// Saintek Prokers
		{
			ID:            "prk-st-1",
			Title:         "Instalasi Lampu Penerangan Mandiri Tenaga Surya di Titik Rawan Desa",
			Cluster:       "saintek",
			ClusterName:   "Kluster Sains & Teknologi",
			Category:      "Energi Terbarukan",
			Location:      "Desa Kodi Bangedo & Dermaga Nelayan Pero",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Masyarakat desa, nelayan lokal, dan fasilitas umum balai pertemuan",
			Timeline:      "Minggu ke-2 & ke-3 Pengabdian",
			SDGs:          []string{"SDG 7: Energi Bersih & Terjangkau", "SDG 11: Kota & Komunitas Berkelanjutan"},
			ShortDesc:     "Pemasangan sistem solar cell mandiri untuk menerangi akses jalan dermaga dan balai pertemuan desa tanpa ketergantungan jaringan listrik.",
			FullDesc:      "Program ini merespons kendala pemadaman bergilir dan minimnya penerangan di akses dermaga nelayan Desa Pero. Tim Saintek merancang sistem panel surya 150 Wp dengan aki deep cycle dan lampu LED 30 Watt otomatis sensor gelap-terang. Dilengkapi modul pelatihan perawatan bagi pemuda karang taruna setempat.",
			Outputs:       []string{"5 Titik Lampu Jalan Tenaga Surya Otomatis", "Buku Panduan Perawatan Mandiri untuk Warga", "10 Pemuda Desa Terlatih Teknisi Surya Dasar"},
			ImpactMetrics: "Menerangi akses 120+ keluarga nelayan saat melaut di malam hari.",
			Images:        []string{"/images/savana_sunset.jpg", "/images/weekuri.jpg"},
		},
		{
			ID:            "prk-st-2",
			Title:         "Pembuatan WebGIS Geospasial Batas Desa & Potensi Kebudayaan Kodi",
			Cluster:       "saintek",
			ClusterName:   "Kluster Sains & Teknologi",
			Category:      "Teknologi Digital & Pemetaan",
			Location:      "Kecamatan Kodi Bangedo",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Pemerintah Desa, Dinas Pariwisata SBD, dan wisatawan",
			Timeline:      "Minggu ke-1 sampai ke-6",
			SDGs:          []string{"SDG 9: Industri, Inovasi, & Infrastruktur", "SDG 11: Komunitas Berkelanjutan"},
			ShortDesc:     "Digitalisasi peta batas wilayah administratif dan titik sebaran cagar budaya megalitik melalui pemotretan udara drone dan platform WebGIS interaktif.",
			FullDesc:      "Mengintegrasikan survei GPS geodetik dan foto udara fotogrametri drone untuk memetakan batas desa, lokasi kubur batu megalitikum Kampung Ratenggaro, sumber mata air, serta fasilitas publik ke dalam peta digital interaktif berbasis web yang dapat diakses secara publik.",
			Outputs:       []string{"Peta Cetak Resolusi Tinggi Skala 1:5.000", "Dashboard WebGIS Interaktif Berbasis Cloud", "Buku Profil Potensi Geospasial Desa"},
			ImpactMetrics: "Mendokumentasikan 18 titik situs megalitikum dan batas 4 dusun secara presisi.",
			Images:        []string{"/images/ratenggaro.jpg", "/images/weekuri.jpg"},
		},
		{
			ID:            "prk-st-3",
			Title:         "Rancang Bangun Prototipe Filter Air Bersih Bertingkat Berbahan Alami",
			Cluster:       "saintek",
			ClusterName:   "Kluster Sains & Teknologi",
			Category:      "Sanitasi Lingkungan",
			Location:      "Dusun Tema Tana",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Warga dusun yang mengandalkan air sumur kapur",
			Timeline:      "Minggu ke-3 & ke-4",
			SDGs:          []string{"SDG 6: Air Bersih & Sanitasi Layak"},
			ShortDesc:     "Teknologi filtrasi air bertingkat dengan media pasir silika, arang aktif kelapa, zeolit, dan spons untuk menurunkan kekeruhan dan kadar kapur air sumur.",
			FullDesc:      "Karakteristik tanah karst di Sumba Barat Daya menyebabkan air tanah memiliki tingkat kesadahan dan kekeruhan tinggi. Prototipe filtrasi gravitasi bertingkat ini dirancang menggunakan bahan-bahan lokal yang murah dan mudah diganti berkala oleh warga rumah tangga.",
			Outputs:       []string{"2 Unit Demplot Filtrasi Air di Sekolah dan Mushola", "Penurunan Kekeruhan Air hingga 85%", "Poster Infografis Cara Cuci Media Filter"},
			ImpactMetrics: "Menyediakan akses air siap masak jernih untuk 60+ anak sekolah dan guru.",
			Images:        []string{"/images/weekuri.jpg", "/images/kkn_community.jpg"},
		},

		// Soshum Prokers
		{
			ID:            "prk-sh-1",
			Title:         "Digitalisasi & Katalog E-Commerce Tenun Ikat Khas Sumba Kodi",
			Cluster:       "soshum",
			ClusterName:   "Kluster Sosial & Humaniora",
			Category:      "Pemberdayaan Ekonomi",
			Location:      "Kelompok Tenun Mama-Mama Ratenggaro",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "25 Mama Penenun Tradisional Sumba",
			Timeline:      "Minggu ke-2 sampai ke-5",
			SDGs:          []string{"SDG 5: Kesetaraan Gender", "SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi"},
			ShortDesc:     "Pemberdayaan mama penenun tenun ikat melalui pembuatan katalog foto profesional, narasi filosofi motif adat, dan akun marketplace digital.",
			FullDesc:      "Kain tenun ikat Sumba memiliki nilai estetika dan filosofi adat yang sangat tinggi namun seringkali dihargai rendah oleh tengkulak. Tim Soshum membantu mendokumentasikan setiap motif (Mamuli, Kuda, Burung Kakatua), menyusun sertifikat keaslian produk, dan membukakan etalase penjualan online langsung kepada pembeli nasional.",
			Outputs:       []string{"Katalog Produk Digital Bilingual (ID-EN)", "Website Etalase Karya Mama Penenun", "Pelatihan Foto Produk Menggunakan Ponsel"},
			ImpactMetrics: "Meningkatkan margin pendapatan bersih pengrajin hingga 40% tanpa potongan perantara.",
			Images:        []string{"/images/kkn_community.jpg", "/images/ratenggaro.jpg"},
		},
		{
			ID:            "prk-sh-2",
			Title:         "Program 'Rumah Ceria Kodi': Literasi Kreatif & Bahasa Inggris Anak",
			Cluster:       "soshum",
			ClusterName:   "Kluster Sosial & Humaniora",
			Category:      "Pendidikan Anak",
			Location:      "SD Inpres Kodi & Balai Desa",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "80+ Siswa Sekolah Dasar kelas 1-6",
			Timeline:      "Rutin Setiap Sore Senin - Jumat",
			SDGs:          []string{"SDG 4: Pendidikan Berkualitas"},
			ShortDesc:     "Pendampingan belajar membaca menyenangkan, dongeng interaktif, pengenalan bahasa Inggris dasar, dan pembentukan pojok baca buku bergambar.",
			FullDesc:      "Membuka ruang belajar inklusif sepulang sekolah untuk menumbuhkan minat baca siswa di daerah pelosok. Dilengkapi 150 buku cerita donasi mahasiswa UGM, modul mewarnai pahlawan nasional, dan permainan edukatif berbasis sains sederhana.",
			Outputs:       []string{"1 Pojok Baca Ramah Anak 'Nawadaya'", "150 Buku Cerita & Ensiklopedia Anak Tersalurkan", "Festival Mewarnai & Pentas Seni Anak Kodi"},
			ImpactMetrics: "Meningkatkan kelancaran membaca 45 anak kelas awal dan motivasi belajar sekolah.",
			Images:        []string{"/images/kkn_community.jpg", "/images/savana_sunset.jpg"},
		},
		{
			ID:            "prk-sh-3",
			Title:         "Sosialisasi Perlindungan Hukum Adat & Administrasi Kependudukan",
			Cluster:       "soshum",
			ClusterName:   "Kluster Sosial & Humaniora",
			Category:      "Hukum & Tata Kelola",
			Location:      "Rumah Adat Uma Mbatangu Ratenggaro",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Aparatur Desa dan Warga Masyarakat",
			Timeline:      "Minggu ke-4",
			SDGs:          []string{"SDG 16: Perdamaian, Keadilan, & Kelembagaan Tangguh"},
			ShortDesc:     "Fasilitasi pembuatan akta kelahiran, KTP-el, serta pencatatan hak kekayaan intelektual komunal atas motif adat Sumba.",
			FullDesc:      "Kolaborasi bersama Disdukcapil SBD menghadirkan loket jemput bola pelayanan administrasi kependudukan bagi warga yang tinggal jauh dari ibukota kabupaten. Dilanjutkan dengan forum curah pendapat harmonisasi hukum adat Marapu dan regulasi perlindungan cagar budaya.",
			Outputs:       []string{"50+ Berkas Permohonan Akta Kelahiran Anak Terfasilitasi", "Draft Peraturan Desa Pelestarian Kawasan Adat"},
			ImpactMetrics: "Memberikan kepastian identitas kependudukan bagi 50 anak untuk akses pendidikan formal.",
			Images:        []string{"/images/ratenggaro.jpg", "/images/kkn_community.jpg"},
		},

		// Medika Prokers
		{
			ID:            "prk-md-1",
			Title:         "Aksi Gemas (Gerakan Masyarakat Bebas Gigi Berlubang) Siswa SD",
			Cluster:       "medika",
			ClusterName:   "Kluster Kedokteran & Kesehatan",
			Category:      "Kesehatan Gigi & Mulut",
			Location:      "SD Inpres Kodi Bangedo",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "120 Siswa Sekolah Dasar",
			Timeline:      "Minggu ke-3",
			SDGs:          []string{"SDG 3: Kehidupan Sehat & Sejahtera"},
			ShortDesc:     "Penyuluhan teknik menyikat gigi yang benar dengan model rahang 3D, pembagian sikat gigi gratis, dan skrining karies anak.",
			FullDesc:      "Prevalensi karies gigi pada anak-anak di Kodi tergolong tinggi karena minimnya kebiasaan menyikat gigi malam hari. Program ini mengemas edukasi lewat lagu ceria, praktik sikat gigi massal di halaman sekolah, serta pemeriksaan individual rongga mulut siswa.",
			Outputs:       []string{"120 Paket Sikat Gigi & Pasta Gigi Anak Dibagikan", "Buku Rapor Kesehatan Gigi Siswa", "Poster Edukasi Sikat Gigi di Dinding Kelas"},
			ImpactMetrics: "100% siswa memahami waktu menyikat gigi yang tepat dan mendemonstrasikannya dengan baik.",
			Images:        []string{"/images/kkn_community.jpg", "/images/weekuri.jpg"},
		},
		{
			ID:            "prk-md-2",
			Title:         "Skrining Penyakit Tidak Menular & Posyandu Lansia 'Sehat Marapu'",
			Cluster:       "medika",
			ClusterName:   "Kluster Kedokteran & Kesehatan",
			Category:      "Layanan Kesehatan Komunitas",
			Location:      "Posyandu Desa Tema Tana",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "75 Lansia dan Warga Dewasa",
			Timeline:      "Minggu ke-2 & ke-4",
			SDGs:          []string{"SDG 3: Kehidupan Sehat & Sejahtera"},
			ShortDesc:     "Pemeriksaan tekanan darah, gula darah sewaktu, asam urat gratis, serta senam kebugaran lansia ceria.",
			FullDesc:      "Banyak warga usia lanjut mengonsumsi sirih pinang dan garam tinggi tanpa pernah memeriksakan kondisi tekanan darah ke puskesmas. Program ini mendekatkan layanan medis dasar, konsultasi pola makan sehat dengan dokter muda, dan konseling gaya hidup aktif.",
			Outputs:       []string{"75 Warga Terperiksa Kesehatan Komprehensif", "Kartu Menuju Sehat Lansia Terbarukan", "Senam Lansia Rutin Mingguan"},
			ImpactMetrics: "Mendeteksi 28 kasus hipertensi baru untuk dirujuk dan dipantau bidan desa setempat.",
			Images:        []string{"/images/kkn_community.jpg", "/images/savana_sunset.jpg"},
		},
		{
			ID:            "prk-md-3",
			Title:         "Dapur Sehat Atasi Stunting (DASHAT) Berbasis Pangan Lokal Daun Kelor",
			Cluster:       "medika",
			ClusterName:   "Kluster Kedokteran & Kesehatan",
			Category:      "Gizi & Pencegahan Stunting",
			Location:      "Balai Desa Kodi Bangedo",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "40 Ibu Balita, Ibu Hamil, dan Kader Posyandu",
			Timeline:      "Minggu ke-3 & ke-5",
			SDGs:          []string{"SDG 2: Tanpa Kelaparan", "SDG 3: Kehidupan Sehat & Sejahtera"},
			ShortDesc:     "Demo memasak makanan pendamping ASI (MP-ASI) padat gizi memanfaatkan daun kelor (moringa), ikan laut segar, dan jagung manis lokal.",
			FullDesc:      "Mengubah persepsi bahwa makanan bergizi harus mahal. Daun kelor yang melimpah di pekarangan warga Sumba kaya akan mikronutrien zat besi dan kalsium. Tim Medika melatih ibu-ibu meracik puding kelor, nugget ikan kelor, dan bubur tim bergizi tinggi.",
			Outputs:       []string{"Buku Resep MP-ASI Pangan Lokal Sumba", "Pelatihan 15 Kader Posyandu Pengukuran Antropometri", "Paket Pemberian Makanan Tambahan (PMT)"},
			ImpactMetrics: "Meningkatkan pemahaman gizi seimbang pada 40 ibu balita hingga 92%.",
			Images:        []string{"/images/kkn_community.jpg", "/images/weekuri.jpg"},
		},

		// Agro Prokers
		{
			ID:            "prk-ag-1",
			Title:         "Inovasi Silase Pakan Ternak Fermentasi untuk Ketahanan Musim Kemarau",
			Cluster:       "agro",
			ClusterName:   "Kluster Agrokompleks",
			Category:      "Peternakan Berkelanjutan",
			Location:      "Kandang Komunal Kelompok Peternak Kodi",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "35 Peternak Kuda Sandalwood & Sapi Ongole",
			Timeline:      "Minggu ke-2 sampai ke-4",
			SDGs:          []string{"SDG 1: Tanpa Kemiskinan", "SDG 12: Konsumsi & Produksi Bertanggung Jawab"},
			ShortDesc:     "Pelatihan teknik pengawetan rumput gajah dan jerami jagung dengan fermentasi anaerob dalam drum kedap udara agar tahan berbulan-bulan.",
			FullDesc:      "Saat musim kemarau panjang, peternak di Sumba kesulitan mencari hijauan segar sehingga ternak mengalami penurunan bobot drastis. Dengan teknologi silase berbahan tetes tebu/gula merah dan dedak, pakan hijauan dapat diawetkan dengan kandungan nutrisi yang tetap terjaga.",
			Outputs:       []string{"10 Drum Silase Percontohan Kapasitas 200 Liter", "Demplot Pakan Bernutrisi Tinggi", "Modul Praktis Pembuatan Silase Mandiri"},
			ImpactMetrics: "Menjamin ketersediaan pakan hijauan berkualitas bagi 60+ ekor ternak saat puncak kemarau.",
			Images:        []string{"/images/savana_sunset.jpg", "/images/kkn_community.jpg"},
		},
		{
			ID:            "prk-ag-2",
			Title:         "Pembuatan Biochar & Pupuk Kompos Organik dari Limbah Tongkol Jagung",
			Cluster:       "agro",
			ClusterName:   "Kluster Agrokompleks",
			Category:      "Kesuburan Tanah & Lingkungan",
			Location:      "Lahan Pertanian Desa Tema Tana",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Kelompok Tani Lahan Kering",
			Timeline:      "Minggu ke-3 & ke-5",
			SDGs:          []string{"SDG 13: Penanganan Perubahan Iklim", "SDG 15: Ekosistem Daratan"},
			ShortDesc:     "Pemanfaatan pirolisis drum sederhana untuk mengubah tongkol jagung menjadi biochar yang mampu menahan air dan unsur hara tanah kapur.",
			FullDesc:      "Limbah pascapanen jagung biasanya hanya dibakar percuma di ladang. Tim Agro melatih petani membuat biochar arang aktif yang dicampur pupuk kandang sapi sebagai soil conditioner untuk meningkatkan kapasitas simpan air tanah karst Sumba.",
			Outputs:       []string{"500 kg Pupuk Biochar Organik Siap Tabur", "2 Tungku Pirolisis Tongkol Jagung Ramah Lingkungan", "Petak Uji Coba Pertumbuhan Tanaman Sayur"},
			ImpactMetrics: "Mengurangi pembakaran limbah terbuka dan meningkatkan kelembapan tanah lahan kering.",
			Images:        []string{"/images/savana_sunset.jpg", "/images/weekuri.jpg"},
		},
		{
			ID:            "prk-ag-3",
			Title:         "Pengembangan Pekarangan Pangan Lestari (P2L) Sayuran Adaptif",
			Cluster:       "agro",
			ClusterName:   "Kluster Agrokompleks",
			Category:      "Ketahanan Pangan Keluarga",
			Location:      "Pekarangan Rumah Warga Dusun 2",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Kelompok Wanita Tani (KWT) Sumba",
			Timeline:      "Minggu ke-2 sampai ke-6",
			SDGs:          []string{"SDG 2: Tanpa Kelaparan", "SDG 12: Konsumsi Bertanggung Jawab"},
			ShortDesc:     "Budidaya sayuran sawi, kangkung, cabai, dan tomat dalam polybag dengan mulsa jerami untuk menghemat air siraman.",
			FullDesc:      "Memanfaatkan ruang pekarangan di samping rumah panggung adat untuk menanam aneka sayuran hijau kebutuhan harian. Program ini mengurangi ketergantungan belanja sayur dari pasar ibukota yang jaraknya puluhan kilometer.",
			Outputs:       []string{"200 Polybag Sayuran Produktif Terbagi ke Warga", "1 Rumah Bibit Sederhana Bambu Lokal", "Kemandirian Sayur Harian 25 Rumah Tangga"},
			ImpactMetrics: "Menghemat pengeluaran dapur warga rata-rata Rp 150.000 per bulan.",
			Images:        []string{"/images/kkn_community.jpg", "/images/weekuri.jpg"},
		},

		// Multidisiplin Prokers
		{
			ID:            "prk-multi-1",
			Title:         "Festival Kebudayaan & Gelar Karya Nawadaya Sumba Bersama Warga Adat",
			Cluster:       "unit",
			ClusterName:   "Kluster Unit Multidisiplin",
			Category:      "Pesta Rakyat & Budaya",
			Location:      "Pelataran Kampung Adat Ratenggaro",
			Status:        "Selesai 100%",
			Progress:      100,
			Targets:       "Seluruh Warga Kecamatan Kodi Bangedo & Tokoh Adat",
			Timeline:      "Penutupan KKN (Minggu ke-7)",
			SDGs:          []string{"SDG 11: Komunitas Berkelanjutan", "SDG 17: Kemitraan untuk Mencapai Tujuan"},
			ShortDesc:     "Malam keakraban, pameran hasil karya 4 kluster, peragaan busana tenun ikat anak-anak, dan tarian tradisional bersama tetua adat Marapu.",
			FullDesc:      "Sebagai penutup pengabdian 50 hari, KKN Nawadaya Sumba menggelar festival bersama masyarakat adat. Menampilkan pameran WebGIS, bazaar produk olahan pangan lokal, penghargaan kader posyandu terbaik, dan persembahan tarian Woleka sebagai bentuk ucapan syukur dan perpisahan yang mengharukan.",
			Outputs:       []string{"Pameran Capaian 18 Program Kerja KKN", "Pentas Seni Tradisional Anak-Anak Kodi", "Penyerahan Prasasti Kenang-kenangan Nawadaya Sumba"},
			ImpactMetrics: "Dihadiri 400+ warga desa, Camat Kodi Bangedo, dan Rato Adat Ratenggaro.",
			Images:        []string{"/images/ratenggaro.jpg", "/images/kkn_community.jpg", "/images/savana_sunset.jpg"},
		},
	}
}

func getLocationsData() []LocationPoint {
	return []LocationPoint{
		{
			ID:          "loc-posko",
			Name:        "Posko Utama KKN Nawadaya Sumba",
			Category:    "posko",
			ClusterTags: []string{"unit", "saintek", "soshum", "medika", "agro"},
			Latitude:    -9.5892,
			Longitude:   119.0623,
			Altitude:    "85 mdpl",
			Description: "Pusat komando dan tempat tinggal mahasiswa KKN Nawadaya Sumba di Desa Tema Tana, Kodi Bangedo. Tempat konsolidasi harian, rapat koordinasi bersama tokoh desa, dan pojok belajar anak-anak.",
			Activities:  []string{"Pusat Koordinasi Mahasiswa", "Pojok Baca Rumah Ceria", "Laboratorium Peracikan Silase"},
			Image:       "/images/kkn_community.jpg",
			Distance:    "0 km (Pusat Kegiatan)",
		},
		{
			ID:          "loc-ratenggaro",
			Name:        "Kampung Adat Ratenggaro",
			Category:    "adat",
			ClusterTags: []string{"soshum", "saintek", "unit"},
			Latitude:    -9.6231,
			Longitude:   119.0142,
			Altitude:    "15 mdpl (Tepi Samudera Hindia)",
			Description: "Situs perkampungan megalitikum bersejarah dengan rumah menara tradisional (Uma Mbatangu) setinggi hingga 25 meter dan kubur batu kuno menghadap deburan ombak laut lepas.",
			Activities:  []string{"Digitalisasi Tenun Mama Adat", "Pemetaan Situs Megalitikum Drone", "Festival Budaya Nawadaya"},
			Image:       "/images/ratenggaro.jpg",
			Distance:    "6.2 km dari Posko Utama",
		},
		{
			ID:          "loc-weekuri",
			Name:        "Danau Weekuri (Laguna Air Asin)",
			Category:    "alam",
			ClusterTags: []string{"saintek", "soshum"},
			Latitude:    -9.5518,
			Longitude:   119.0435,
			Altitude:    "8 mdpl",
			Description: "Danau laguna air asin alami dengan air toska sejernih kristal yang terhubung langsung dengan laut melalui gua karang bawah tanah. Surga tersembunyi Sumba Barat Daya.",
			Activities:  []string{"Papan Informasi Wisata Berkelanjutan", "Kampanye Sadar Bersih Sampah Wisata"},
			Image:       "/images/weekuri.jpg",
			Distance:    "8.5 km dari Posko Utama",
		},
		{
			ID:          "loc-mandorak",
			Name:        "Pantai Mandorak",
			Category:    "alam",
			ClusterTags: []string{"saintek", "agro"},
			Latitude:    -9.5501,
			Longitude:   119.0392,
			Altitude:    "12 mdpl",
			Description: "Pantai teluk berpasir putih berkilau yang diapit dua tebing karang terjal kokoh. Tempat bersandarnya perahu nelayan tradisional Kodi.",
			Activities:  []string{"Dokumentasi Potensi Pesisir", "Pemberdayaan Nelayan Tradisional"},
			Image:       "/images/weekuri.jpg",
			Distance:    "9.1 km dari Posko Utama",
		},
		{
			ID:          "loc-pero",
			Name:        "Pantai & Dermaga Nelayan Pero",
			Category:    "faskes",
			ClusterTags: []string{"saintek", "agro"},
			Latitude:    -9.6015,
			Longitude:   119.0287,
			Altitude:    "5 mdpl",
			Description: "Pusat pendaratan perahu nelayan ikan tangkap Kodi dan tempat berlangsungnya tradisi penangkapan ikan pesisir barat pulau Sumba.",
			Activities:  []string{"Instalasi Lampu Tenaga Surya Mandiri", "Penyuluhan Pengolahan Hasil Tangkap"},
			Image:       "/images/savana_sunset.jpg",
			Distance:    "4.8 km dari Posko Utama",
		},
		{
			ID:          "loc-puskesmas",
			Name:        "Puskesmas Pembantu Bangedo & Posyandu",
			Category:    "faskes",
			ClusterTags: []string{"medika"},
			Latitude:    -9.5841,
			Longitude:   119.0588,
			Altitude:    "78 mdpl",
			Description: "Pusat pelayanan kesehatan dasar masyarakat yang menjadi mitra utama Kluster Medika dalam menjalankan imunisasi, skrining stunting, dan senam lansia.",
			Activities:  []string{"Skrining Stunting Balita", "Posyandu Lansia Sehat", "Pemeriksaan Gigi Siswa SD"},
			Image:       "/images/kkn_community.jpg",
			Distance:    "1.2 km dari Posko Utama",
		},
		{
			ID:          "loc-tambolaka",
			Name:        "Kota Tambolaka (Ibukota Kabupaten)",
			Category:    "desa",
			ClusterTags: []string{"unit"},
			Latitude:    -9.4124,
			Longitude:   119.2435,
			Altitude:    "210 mdpl",
			Description: "Pusat administrasi pemerintahan Kabupaten Sumba Barat Daya dan gerbang masuk udara melalui Bandara Lede Kalumbang (TMC).",
			Activities:  []string{"Audiensi Bersama Bupati & Bappeda", "Koordinasi KAGAMA Pengda NTT"},
			Image:       "/hero_img.jpg",
			Distance:    "42 km dari Posko Utama",
		},
	}
}

func getMemoriesData() []MemoryItem {
	return []MemoryItem{
		{
			ID:       "mem-1",
			Title:    "Senja Menghangatkan Hati di Ratenggaro",
			Date:     "14 Juli 2026",
			Location: "Kampung Adat Ratenggaro, Kodi",
			Cluster:  "unit",
			Image:    "/images/ratenggaro.jpg",
			Caption:  "Ketika matahari perlahan tenggelam di balik menara Uma Mbatangu, bapa dan mama duduk bersama kami di atas batu megalit, menceritakan petuah leluhur yang tak tertulis di buku sejarah manapun.",
			Rotate:   -2,
			AudioTag: "Deburan Ombak & Angin Savana",
			Mood:     "Syahdu & Hangat",
			Likes:    128,
		},
		{
			ID:       "mem-2",
			Title:    "Tawa Riang Anak-Anak Kelas Ceria",
			Date:     "22 Juli 2026",
			Location: "Pelataran SD Inpres Kodi Bangedo",
			Cluster:  "soshum",
			Image:    "/images/kkn_community.jpg",
			Caption:  "Buku cerita bergambar membuka jendela dunia baru. Mata mereka berbinar cerah saat mengeja kata demi kata, mengajarkan kami arti ketulusan dalam belajar yang sesungguhnya.",
			Rotate:   3,
			AudioTag: "Canda Tawa Anak-Anak Kodi",
			Mood:     "Gembira & Inspiratif",
			Likes:    156,
		},
		{
			ID:       "mem-3",
			Title:    "Kejernihan Kristal Danau Weekuri",
			Date:     "28 Juli 2026",
			Location: "Danau Laguna Weekuri, SBD",
			Cluster:  "saintek",
			Image:    "/images/weekuri.jpg",
			Caption:  "Menikmati keteduhan air toska Weekuri setelah seharian memasang modul panel surya di dermaga Pero. Air asinnya menyejukkan letih dan mempererat ikatan persaudaraan tim.",
			Rotate:   -1,
			AudioTag: "Percikan Air & Kicau Burung Pesisir",
			Mood:     "Damai & Menyegarkan",
			Likes:    142,
		},
		{
			ID:       "mem-4",
			Title:    "Membelah Savanna Menuju Desa Binaan",
			Date:     "05 Agustus 2026",
			Location: "Perbukitan Savana Kodi",
			Cluster:  "agro",
			Image:    "/images/savana_sunset.jpg",
			Caption:  "Kuda-kuda Sumba berlari bebas di perbukitan berumput keemasan. Menempuh jalan tanah berdebu demi mengantarkan drum silase pakan ternak ke kandang kelompok tani binaan.",
			Rotate:   2,
			AudioTag: "Ringkikan Kuda & Deru Angin",
			Mood:     "Petualangan & Semangat",
			Likes:    119,
		},
		{
			ID:       "mem-5",
			Title:    "Belajar Menenun Kasih Bersama Mama",
			Date:     "11 Agustus 2026",
			Location: "Bale Panggung Desa Tema Tana",
			Cluster:  "soshum",
			Image:    "/images/ratenggaro.jpg",
			Caption:  "Benang demi benang dirajut penuh ketelitian menggunakan pewarna alami akar mengkudu dan tarum. Mama Sumba mengajarkan kesabaran tingkat tinggi yang melampaui algoritma apapun.",
			Rotate:   -3,
			AudioTag: "Dentang Kayu Tenun Tradisional",
			Mood:     "Khidmat & Penuh Cinta",
			Likes:    167,
		},
		{
			ID:       "mem-6",
			Title:    "Penyuluhan Gigi Sehat Penuh Sukacita",
			Date:     "18 Agustus 2026",
			Location: "Dusun Kodi Bangedo",
			Cluster:  "medika",
			Image:    "/images/kkn_community.jpg",
			Caption:  "Melihat mereka berbaris rapi sambil membawa sikat gigi warna-warni dan berbusa putih di pipi membuat seluruh rasa lelah hilang seketika.",
			Rotate:   1,
			AudioTag: "Lagu Sikat Gigi Bersama",
			Mood:     "Lucu & Menggemaskan",
			Likes:    134,
		},
	}
}

func getPartnersData() []Partner {
	return []Partner{
		{
			ID:       "part-1",
			Name:     "Universitas Gadjah Mada (UGM)",
			Category: "kampus",
			Tier:     "Institusi Utama",
			LogoText: "UGM YOGYAKARTA",
			Subtitle: "Direktorat Pengabdian kepada Masyarakat (DPkM)",
			Link:     "https://dppm.ugm.ac.id",
		},
		{
			ID:       "part-2",
			Name:     "Pemerintah Kabupaten Sumba Barat Daya",
			Category: "pemerintah",
			Tier:     "Mitra Strategis Daerah",
			LogoText: "PEMKAB SUMBA BARAT DAYA",
			Subtitle: "Badan Perencanaan, Penelitian & Pengembangan Daerah",
			Link:     "https://sumbabaratdayakab.go.id",
		},
		{
			ID:       "part-3",
			Name:     "KAGAMA (Keluarga Alumni UGM)",
			Category: "alumni",
			Tier:     "Platinum Sponsor",
			LogoText: "KAGAMA PENGDA NTT",
			Subtitle: "Guyub Rukun Migunani Tumraping Liyan",
			Link:     "https://kagama.id",
		},
		{
			ID:       "part-4",
			Name:     "Bank Pembangunan Daerah NTT",
			Category: "sponsor_utama",
			Tier:     "Platinum Sponsor",
			LogoText: "BANK NTT",
			Subtitle: "Melayani Lebih Sungguh untuk Sumba Sejahtera",
			Link:     "https://bpdntt.co.id",
		},
		{
			ID:       "part-5",
			Name:     "Yayasan Konservasi & Energi Bersih Sumba",
			Category: "sponsor_pendukung",
			Tier:     "Gold Sponsor",
			LogoText: "SUMBA ICONIC ISLAND",
			Subtitle: "Dukungan Panel Surya & Elektrifikasi Desa",
			Link:     "https://iesr.or.id",
		},
		{
			ID:       "part-6",
			Name:     "Kompas Gramedia & Bentara Budaya",
			Category: "media_partner",
			Tier:     "Official Media Partner",
			LogoText: "KOMPAS GRAMEDIA",
			Subtitle: "Liputan Dokumenter & Publikasi Nasional",
			Link:     "https://kompas.id",
		},
		{
			ID:       "part-7",
			Name:     "RRI Sumba & Radio Swara Kodi",
			Category: "media_partner",
			Tier:     "Official Media Partner",
			LogoText: "RRI SUMBA PRO 1",
			Subtitle: "Siaran Edukasi Masyarakat & Warta Pengabdian",
			Link:     "https://rri.co.id",
		},
		{
			ID:       "part-8",
			Name:     "Good News From Indonesia (GNFI)",
			Category: "media_partner",
			Tier:     "Media Partner Digital",
			LogoText: "GOOD NEWS FROM INDONESIA",
			Subtitle: "Cerita Kebaikan & Inspirasi dari Pelosok NTT",
			Link:     "https://goodnewsfromindonesia.id",
		},
	}
}

func getTourismData() []TourismSpot {
	return []TourismSpot{
		{
			ID:          "tour-1",
			Name:        "Danau Laguna Weekuri",
			Type:        "Laguna Air Asin Alami",
			Location:    "Desa Kalenarogo, Kodi Utara, Sumba Barat Daya",
			Distance:    "8.5 km dari Posko KKN (± 20 menit)",
			Description: "Laguna berair toska jernih yang terbentuk dari rembesan air laut yang menembus celah karang terjal. Memiliki gradasi kedalaman dari 0.5 meter hingga 3 meter, sangat aman dan menyegarkan untuk berenang santai.",
			Highlights:  []string{"Air Toska Sebening Kaca", "Tebing Karang Pembatas Samudera", "Jembatan Kayu Kanopi Keliling Laguna"},
			AdatRules:   []string{"Wajib mengenakan pakaian renang yang sopan", "Dilarang membuang sampah plastik sekecil apapun", "Izin ramah kepada penjaga tiket warga lokal"},
			Image:       "/images/weekuri.jpg",
			BestTime:    "Pukul 09.00 - 15.00 saat sinar matahari tegak menyinari dasar danau",
		},
		{
			ID:          "tour-2",
			Name:        "Kampung Adat Ratenggaro",
			Type:        "Situs Budaya Megalitikum",
			Location:    "Desa Umbu Ngedo, Kodi Bangedo, Sumba Barat Daya",
			Distance:    "6.2 km dari Posko KKN (± 15 menit)",
			Description: "Kampung adat paling ikonik di Sumba dengan jajaran rumah panggung beratap menara jerami menjulang 25 meter. Di pelataran kampung terdapat makam megalitik batu utuh berusia ratusan tahun tepat di bibir muara sungai dan pantai berombak biru.",
			Highlights:  []string{"Rumah Menara Uma Mbatangu Tertinggi", "304 Makam Batu Megalit Kuno", "Pesisir Muara Sungai & Pantai Ratenggaro"},
			AdatRules:   []string{"Membayar uang siri pinang sebagai tanda permisi adat kepada Rato", "Tidak menduduki makam batu leluhur tanpa izin", "Menghormati privasi rumah tinggal warga adat"},
			Image:       "/images/ratenggaro.jpg",
			BestTime:    "Sore hari pukul 16.30 - 18.00 untuk menikmati siluet senja spektakuler",
		},
		{
			ID:          "tour-3",
			Name:        "Pantai Mandorak",
			Type:        "Pantai Karang Pasir Putih",
			Location:    "Desa Pero Batang, Kodi, Sumba Barat Daya",
			Distance:    "9.1 km dari Posko KKN (± 25 menit)",
			Description: "Teluk kecil tersembunyi yang diapit oleh dua dinding tebing karang tinggi menjulang. Pasirnya sangat putih dan lembut, ombak yang masuk ke celah karang menciptakan semburan air memukau.",
			Highlights:  []string{"Celah Tebing Karang Eksotis", "Pasir Putih Berkilau Lembut", "Spot Foto Sunset Terbaik di Kodi"},
			AdatRules:   []string{"Hati-hati terhadap arus pasang di celah karang", "Jaga kebersihan area pantai"},
			Image:       "/images/weekuri.jpg",
			BestTime:    "Pagi hari pukul 08.00 atau sore hari menjelang matahari tenggelam",
		},
		{
			ID:          "tour-4",
			Name:        "Perbukitan Savana Sumba (Bukit Tenau / Wairinding)",
			Type:        "Savana Perbukitan Tanpa Batas",
			Location:    "Kawasan Savana Pulau Sumba",
			Distance:    "Jalur Lintas Sumba (Day Trip)",
			Description: "Hamparan bukit bergelombang sejauh mata memandang. Berwarna hijau segar di musim penghujan dan berubah menjadi hamparan keemasan magis seperti di film Lion King saat musim kemarau.",
			Highlights:  []string{"Kontur Bukit Bergelombang Tak Berujung", "Kawanan Kuda Liar Sumba Sandalwood", "Langit Berbintang Milky Way di Malam Hari"},
			AdatRules:   []string{"Tidak menyalakan api unggun sembarangan di rumput kering", "Jangan mengejutkan kuda yang sedang merumput"},
			Image:       "/images/savana_sunset.jpg",
			BestTime:    "Golden hour pukul 16.45 - 18.15 WIB",
		},
	}
}

func getStoriesData() []Story {
	return []Story{
		{
			ID:         "story-1",
			Slug:       "menyulam-senyum-di-bale-uma-mbatangu",
			Title:      "Menyulam Senyum di Bawah Menara Uma Mbatangu",
			Excerpt:    "Kisah tentang kehangatan mama-mama penenun Ratenggaro yang mengajarkan kami bahwa kesabaran bukanlah tentang menunggu, melainkan tentang mencintai setiap helaian benang kehidupan.",
			Content:    "Hari pertama kami menginjakkan kaki di Kampung Adat Ratenggaro, hembusan angin Samudera Hindia menyambut kami dengan deburan suara ombak yang megah. Menara-menara jerami menjulang gagah menantang langit biru. Di beranda rumah panggung yang tinggi, tampak Mama Maria sedang duduk menekuk kedua kakinya di atas tikar pandan, tangannya dengan lincah menggerakkan bilah kayu tenun ikat. 'Adik-adik dari Jawa datang jauh-jauh mau belajar apa di sini?' sapanya ramah sambil menyuguhkan pinang sirih. Selama berminggu-minggu, kami belajar bukan hanya tentang teknik pewarnaan alami atau merangkai motif mamuli, melainkan tentang bagaimana masyarakat Sumba merawat keharmonisan dengan alam dan leluhur. Di sini, kami menyadari bahwa pengabdian bukanlah tentang apa yang kami bawa, melainkan tentang bagaimana kami membuka hati untuk saling mengisi.",
			Author:     "Anindya Putri Saraswati (Kluster Soshum)",
			Cluster:    "soshum",
			Date:       "12 Agustus 2026",
			ReadTime:   "5 menit membaca",
			CoverImage: "/images/ratenggaro.jpg",
			Tags:       []string{"Budaya Adat", "Tenun Sumba", "Refleksi Pengabdian"},
		},
		{
			ID:         "story-2",
			Slug:       "malam-tanpa-sinyal-hangatnya-obrolan-kodi",
			Title:      "Malam Tanpa Sinyal, Sejuta Bintang di Langit Kodi",
			Excerpt:    "Ketika gawai kehilangan sinyal seluler, percakapan manusia justru menemukan kembali frekuensi terdalamnya di bawah selimut galaksi Bima Sakti.",
			Content:    "Di kota asal kami di Yogyakarta, layar ponsel adalah hal pertama yang dilihat saat bangun dan terakhir sebelum terpejam. Namun di posko KKN kami di Kodi Bangedo, ketika menara BTS padam dan listrik belum masuk merata, sesuatu yang menakjubkan terjadi. Warga desa datang berkumpul ke teras posko membawa ubi rebus dan ceret kopi panas. Ditemani lentera solar cell yang kami pasang di sudut balai, bapa-bapa desa bercerita tentang tradisi berburu kuda di padang savana, tentang ritual Pasola yang legendaris, dan tentang harapan mereka agar anak-anak mereka bisa mengenyam bangku kuliah. Malam tanpa sinyal internet itu menjadi malam paling terkoneksi yang pernah kami alami dalam hidup.",
			Author:     "Muhammad Falah (Kormanit KKN Nawadaya)",
			Cluster:    "unit",
			Date:       "19 Agustus 2026",
			ReadTime:   "4 menit membaca",
			CoverImage: "/images/savana_sunset.jpg",
			Tags:       []string{"Kehidupan Posko", "Persaudaraan", "Malam Sumba"},
		},
		{
			ID:         "story-3",
			Slug:       "cahaya-pertama-di-dermaga-nelayan-pero",
			Title:      "Ketika Cahaya Surya Menyala Pertama Kali di Dermaga Pero",
			Excerpt:    "Catatan teknis dari lapangan: perjuangan merakit panel surya mandiri hingga sorak sorai perahu nelayan yang berlabuh dengan aman.",
			Content:    "Pukul dua siang di pesisir Pantai Pero, terik matahari Sumba mencapai puncaknya hingga menyengat kulit. Tim Saintek bersama pemuda karang taruna sedang mengencangkan baut terakhir tiang lampu jalan tenaga surya. Selama bertahun-tahun, perahu nelayan tradisional yang pulang melaut menjelang fajar seringkali kesulitan menepi karena minimnya penerangan di karang dermaga. Ketika senja tiba dan sensor otomatis menyalakan lampu LED 30 Watt untuk pertama kalinya, menyinari bibir dermaga dengan cahaya putih benderang, sorak gembira bapa-bapa nelayan meledak seketika. 'Sekarang kami tidak takut lagi karang pecah!' seru Bapa Markus sambil memeluk kami erat. Ilmu rekayasa teknik yang kami pelajari di ruang kuliah akhirnya menemukan makna tertingginya di atas dermaga kayu ini.",
			Author:     "Fikri Ramadhan (Kluster Saintek)",
			Cluster:    "saintek",
			Date:       "24 Agustus 2026",
			ReadTime:   "6 menit membaca",
			CoverImage: "/images/weekuri.jpg",
			Tags:       []string{"Teknologi Tepat Guna", "Panel Surya", "Pemberdayaan Nelayan"},
		},
	}
}

func main() {
	mux := http.NewServeMux()

	// Global OPTIONS handler for CORS preflight
	mux.HandleFunc("OPTIONS /", enableCORS(func(w http.ResponseWriter, r *http.Request) {}))

	// 1. General Info
	mux.HandleFunc("GET /api/info", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getInfoData())
	}))

	// 2. Members (Hierarchical & Full)
	mux.HandleFunc("GET /api/members", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		members := getMembersData()
		json.NewEncoder(w).Encode(members)
	}))

	// 3. Clusters
	mux.HandleFunc("GET /api/clusters", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getClustersData())
	}))

	// 4. Proker
	mux.HandleFunc("GET /api/proker", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		prokers := getProkerData()
		json.NewEncoder(w).Encode(prokers)
	}))

	// 5. Locations (Interactive Map)
	mux.HandleFunc("GET /api/locations", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getLocationsData())
	}))

	// 6. Memories (biakelok-style gallery)
	mux.HandleFunc("GET /api/memories", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getMemoriesData())
	}))

	// 7. Partners & Sponsors
	mux.HandleFunc("GET /api/partners", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getPartnersData())
	}))

	// 8. Tourism
	mux.HandleFunc("GET /api/tourism", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getTourismData())
	}))

	// 9. Stories
	mux.HandleFunc("GET /api/stories", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(getStoriesData())
	}))

	// 10. Guestbook (GET & POST)
	mux.HandleFunc("GET /api/guestbook", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		store.mu.RLock()
		defer store.mu.RUnlock()
		json.NewEncoder(w).Encode(store.guestbook)
	}))

	mux.HandleFunc("POST /api/guestbook", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1048576) // Max 1MB request body limit
		var input struct {
			Name        string `json:"name"`
			Affiliation string `json:"affiliation"`
			Message     string `json:"message"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, `{"error":"Format data tidak valid atau melebihi batas ukuran"}`, http.StatusBadRequest)
			return
		}

		input.Name = strings.TrimSpace(input.Name)
		input.Affiliation = strings.TrimSpace(input.Affiliation)
		input.Message = strings.TrimSpace(input.Message)

		if input.Name == "" || input.Message == "" {
			http.Error(w, `{"error":"Nama dan pesan wajib diisi"}`, http.StatusBadRequest)
			return
		}

		// Length validation
		if len(input.Name) > 100 || len(input.Affiliation) > 150 || len(input.Message) > 1000 {
			http.Error(w, `{"error":"Input melebihi batas karakter yang diizinkan"}`, http.StatusBadRequest)
			return
		}

		// SQL injection / XSS pattern detection
		if sqlInjectionPattern.MatchString(input.Name) || sqlInjectionPattern.MatchString(input.Affiliation) || sqlInjectionPattern.MatchString(input.Message) {
			http.Error(w, `{"error":"Input mengandung karakter atau pola yang dilarang"}`, http.StatusBadRequest)
			return
		}

		newEntry := GuestbookEntry{
			ID:          fmt.Sprintf("gb-%d", time.Now().UnixNano()),
			Name:        sanitizeInput(input.Name),
			Affiliation: sanitizeInput(input.Affiliation),
			Message:     sanitizeInput(input.Message),
			CreatedAt:   time.Now(),
			Likes:       1,
		}

		store.mu.Lock()
		store.guestbook = append([]GuestbookEntry{newEntry}, store.guestbook...)
		store.mu.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newEntry)
	}))

	// Health check
	mux.HandleFunc("GET /api/health", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now(),
			"version":   "1.0.0",
			"service":   "KKN Nawadaya Sumba Go API Server",
		})
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	log.Printf("🌿 Nawadaya Sumba Go API Server listening on http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
