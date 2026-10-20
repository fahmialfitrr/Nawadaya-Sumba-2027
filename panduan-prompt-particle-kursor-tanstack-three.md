# Panduan Prompt: Efek Particle Kursor untuk Halaman Anggota KKN

**Stack:** TanStack Start (React) + three.js. Backend Go tidak terlibat karena efek ini sepenuhnya di sisi klien.
**Cakupan:** hanya efek partikel. Background dan layout halaman yang sudah ada tidak diubah.

> **Catatan keakuratan:** deskripsi efek berasal dari screenshot hero antigravity.google, bukan dari kode aslinya. Detail reaksi terhadap kursor adalah dugaan.

---

## 1. Deskripsi efek

| Aspek | Pengamatan |
|---|---|
| Bentuk | Goresan pendek berujung bulat (kapsul) + titik debu kecil pucat |
| Warna | Biru, ungu, magenta-merah, sedikit oranye; opasitas bervariasi |
| Distribusi | Rapat di tepi, menipis ke tengah |
| Orientasi | Tiap goresan menghadap radial ke kursor (dugaan) |
| Interaksi | Berotasi menghadap kursor, terdorong menjauh, kembali dengan easing |

---

## 2. Hal khusus TanStack Start + three.js

- **SSR:** TanStack Start merender di server, sedangkan three.js membutuhkan `window`/`document`/WebGL. Komponen partikel harus **client-only** (bungkus dengan `<ClientOnly>` dari `@tanstack/react-router`, atau inisialisasi three.js hanya di dalam `useEffect`).
- **Lifecycle React:** renderer, geometry, material, dan listener harus di-dispose/dilepas saat unmount, termasuk saat navigasi antar-route (agar tidak ada WebGL context yang bocor).
- **Performa:** gunakan `InstancedMesh` agar ratusan goresan hanya satu draw call.
- **Posisi:** canvas menumpang di atas halaman yang sudah ada (transparan, `pointer-events: none`), jangan mengganggu klik pada kartu anggota.

---

## 3. Prompt utama (siap pakai)

```
Project-ku memakai TanStack Start (React + TypeScript) dan three.js.
Aku ingin menambahkan efek particle interaktif yang mengikuti kursor
pada halaman "Anggota KKN" (route: [isi path route, mis. /anggota]).

Buatkan HANYA komponen efek partikelnya. Jangan membuat atau mengubah
background, layout, kartu anggota, atau styling halaman. Canvas harus
transparan dan menumpang di atas halaman yang sudah ada.

BENTUK PARTIKEL
- Goresan pendek berujung bulat (kapsul): panjang 6–10px (variasi acak
  ±30%), tebal 2–3px.
- Titik debu kecil, radius 0.5–1px, abu-abu pucat, opasitas 0.2–0.4.
- Palet goresan: #4285F4, #6C5CE7, #EA4335, #E84393, #FB8C00, dipilih
  acak per partikel, opasitas 0.5–1.
- Jumlah 600–900, diskalakan menurut luas container.
- Distribusi: rapat di tepi, menipis ke tengah (area tengah dikosongkan
  sekitar 25% lebar container).

PERILAKU
- Setiap goresan berotasi agar sumbunya mengarah ke posisi kursor,
  dengan rotasi dihaluskan (lerp/easing).
- Dalam radius ±150px dari kursor, partikel terdorong menjauh dengan
  halus sehingga terbentuk area kosong di sekitar kursor.
- Setelah kursor menjauh, partikel kembali ke posisi asal
  (spring + damping).
- Gerakan idle sangat halus (floating ±2px).
- Perangkat sentuh: gunakan posisi sentuhan atau idle saja.

IMPLEMENTASI THREE.JS
- Gunakan OrthographicCamera dengan satuan piksel (1 unit = 1px),
  WebGLRenderer dengan alpha: true dan setClearAlpha(0), antialias aktif.
- Goresan memakai satu InstancedMesh (geometri kapsul 2D atau
  CapsuleGeometry yang diratakan), titik debu memakai Points.
- Warna per instance lewat instanceColor; untuk opasitas per instance
  gunakan atribut instance + ShaderMaterial sederhana (atau jelaskan
  alternatif yang lebih ringan).
- Update posisi/rotasi per frame dengan satu objek dummy Object3D
  yang dipakai ulang; tandai instanceMatrix.needsUpdate.
- Simpan homeX/homeY, posisi sekarang, dan kecepatan dalam typed array
  (Float32Array), bukan array objek.
- Kursor dilacak di container, koordinat dikonversi ke ruang kamera.

INTEGRASI TANSTACK START
- Komponen harus client-only: tidak boleh mengakses window/document/
  WebGL saat SSR. Tunjukkan cara membungkusnya dengan ClientOnly
  atau pola yang setara, dan cara memasangnya di route halaman anggota.
- Canvas: position absolute, inset 0, pointer-events none, z-index di
  bawah konten sehingga kartu/tombol tetap bisa diklik.
- Ukuran canvas mengikuti container lewat ResizeObserver, pixel ratio
  dibatasi maksimal 2.
- Hormati prefers-reduced-motion (matikan interaksi dan idle).
- Pause render saat tab tidak aktif atau container di luar viewport
  (IntersectionObserver).
- Cleanup lengkap saat unmount: cancelAnimationFrame, lepas listener,
  dispose geometry/material, renderer.dispose().

KODE
- TypeScript, bersih dan terstruktur, tanpa kode atau import yang tidak
  terpakai, komentar singkat seperlunya.
- Semua parameter (jumlah, radius pengaruh, kekuatan dorong, damping,
  stiffness, palet) dikumpulkan dalam satu objek CONFIG di atas file.

OUTPUT
- Satu file komponen (mis. ParticleCursor.tsx) dan contoh pemasangan di
  route halaman anggota (beberapa baris saja).
- Penjelasan singkat parameter CONFIG untuk kepadatan, kekuatan tolak,
  dan kecepatan kembali.
```

---

## 4. Prompt iterasi (satu perubahan per prompt)

| Masalah | Prompt |
|---|---|
| Error `window is not defined` | "Perbaiki komponen agar aman untuk SSR di TanStack Start: inisialisasi three.js hanya di klien dan jangan mengakses browser API saat render server." |
| Bentuk kurang mirip | "Buat goresan lebih pendek dan tebal dengan ujung bulat, variasi panjang acak ±30%." |
| Distribusi terlalu merata | "Buat kepadatan mengikuti gradien radial: rapat di tepi, kosong di tengah dengan radius 25% lebar container." |
| Gerakan kaku | "Ganti lerp dengan spring physics (stiffness 0.08, damping 0.85) untuk posisi dan rotasi." |
| Kurang dramatis | "Tambahkan skala 1 → 1.4 dan kenaikan opasitas pada partikel dekat kursor." |
| Berat di HP | "Kurangi jumlah partikel otomatis berdasarkan lebar layar dan batasi pixel ratio maksimal 1.5 pada perangkat sentuh." |
| Menghalangi klik | "Pastikan canvas tidak menangkap event pointer; kartu anggota dan tombol harus tetap bisa diklik dan di-hover." |
| WebGL context bocor saat pindah route | "Audit cleanup: pastikan renderer, geometry, material, dan listener dibersihkan saat unmount." |

---

## 5. Tips

1. Sebutkan **path route** dan **nama file** tempat efek dipasang agar contoh integrasinya tepat.
2. Tegaskan batasan **"hanya partikel, jangan ubah halaman"** di awal prompt.
3. Beri tahu versi paket (`three`, `@tanstack/react-start`) jika ada perbedaan API.
4. Minta **satu perubahan per iterasi** agar mudah melacak penyebab masalah.
5. Untuk kartu anggota yang dekat dengan tepi layar, pertimbangkan partikel yang menipis di area konten (bukan hanya di tengah) agar teks tetap terbaca.
