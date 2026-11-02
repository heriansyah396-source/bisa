# BISA (Butir Instrumen Soal Analitik)

> **Tagline:** *"Analisis Soal Mudah, Evaluasi Lebih Berkualitas."*  
> **Pesan Utama:** *"Semua Guru BISA Menganalisis Soal."*  
> **Pengembang / Inisiator:** Heriansyah, S.Si., S.Pd., M.Pd.  
> **Kategori:** Educational Technology (EdTech) — Evaluasi Pembelajaran SD & SMP  

---

## 🌟 1. Tentang Aplikasi BISA

**BISA (Butir Instrumen Soal Analitik)** adalah platform digital berbasis web yang dirancang khusus untuk membebaskan guru Sekolah Dasar (SD) dan Sekolah Menengah Pertama (SMP) dari kerumitan perhitungan statistik manual saat melakukan analisis butir soal ujian. 

Tanpa perlu menguasai rumus statistik yang rumit atau mengolah tabel Excel bertingkat secara manual, BISA secara otomatis mengolah data respon peserta didik, menghitung parameter psikometrik terstandar berdasarkan **Classical Test Theory (CTT)**, memberikan rekomendasi pedagogis otomatis (**PERTAHANKAN**, **REVISI**, **BUANG**), serta menghasilkan **Laporan Resmi Siap Cetak A4 (PDF)** lengkap dengan KOP Sekolah dan tanda tangan pengesahan.

---

## 🚀 2. Fitur-Fitur Utama (Sesuai Master Spesifikasi)

1. **Dashboard Manajemen Proyek Terintegrasi**:
   - Memantau total proyek evaluasi, status analisis selesai, dan jumlah butir soal.
   - 1 proyek mewakili: 1 kelas, 1 mata pelajaran, dan 1 periode ujian (SAS, ATS, Ulangan Harian, Try Out).
   - Dilengkapi tombol cepat *🌟 Coba Sampel AKM (8 Format Lengkap)*, *⚡ Sampel SMP (IPA)*, dan *⚡ Sampel SD (Matematika)*.

2. **Dukungan 8 Format Instrumen Asesmen Lengkap (AKM & Asesmen Nasional)**:
   - **Pilihan Ganda Biasa (A-E)**: 1 kunci jawaban benar, penilaian dikotomis (1/0).
   - **Pilihan Ganda Kompleks (Multi-Select)**: Lebih dari 1 jawaban benar (misal: `A, C`), penskoran proporsional berbobot parsial.
   - **Pilihan Ganda Kompleks Kategori (Tabel Benar/Salah)**: Evaluasi multi-pernyataan (misal: `B, S, B`), penskoran proporsional.
   - **Soal Menjodohkan (Matching)**: Memasangkan premis kiri dan respon kanan (misal: `1-B, 2-C, 3-A`).
   - **Soal Isian Singkat**: Jawaban angka perhitungan pasti (misal: `24`) atau kata kunci pasti (misal: `fotosintesis`).
   - **Pilihan Ganda Asosiatif (Sebab-Akibat)**: Standar opsi A–E kausalitas hubungan dua kalimat (Pernyataan & Alasan).
   - **Soal Analisis Informasi (Pernyataan 1 & 2)**: Standar opsi A–E uji kecukupan data informasi pendukung matematika/logika.
   - **Soal Esai / Uraian**: Penskoran berkesinambungan (*continuous*) dari rubrik perolehan nilai guru dengan normalisasi otomatis.

3. **Input Data Siswa Multi-Metode**:
   - **Metode A — Interactive Grid**: Tabel respon interaktif dengan fitur tambah/hapus siswa, edit cepat, serta fitur **Tempel dari Excel (`Ctrl+V`)** langsung dari clipboard.
   - **Metode B — Template Resmi Excel BISA**: Tombol unduh template resmi `.xlsx`/`.csv`, upload file, parser otomatis, validasi struktur & sel kosong, dan pratinjau konfirmasi sebelum disimpan.

4. **Mesin Analisis Psikometri CTT (Classical Test Theory)**:
   - **Tingkat Kesukaran ($P$)**: Klasifikasi Mudah ($P \ge 0.70$), Sedang ($0.30 \le P < 0.70$), dan Sukar ($P < 0.30$).
   - **Daya Pembeda ($D$)**: Metode kelompok 27% atas-bawah ($D = P_A - P_B$) dengan penanganan tie-breaking skor seri secara konsisten.
   - **Validitas Butir**: Korelasi Point-Biserial dan Pearson dengan koreksi Guilford (*Corrected Item-Total Correlation*) dibandingkan nilai signifikansi kritis $r$-tabel ($\alpha = 0.05$).
   - **Reliabilitas Tes**: Formula KR-20 (*Kuder-Richardson 20*) untuk pilihan ganda murni dan *Cronbach's Alpha* untuk soal esai atau campuran.
   - **Analisis Pengecoh (Distraktor)**: Deteksi opsi kunci, distraktor efektif, distraktor mati (0 pemilih), pemilih $< 5\%$, dan distraktor menyesatkan (*misleading* di mana kelompok atas lebih banyak terkecoh).

5. **Sistem Rekomendasi Pedagogis Otomatis (Rule-Based)**:
   - **PERTAHANKAN**: Butir berkualitas tinggi, diskriminasi tajam, dan valid. Siap disimpan ke Bank Soal Sekolah.
   - **REVISI**: Butir berpotensi tetapi memerlukan penyempurnaan redaksi kalimat atau penggantian opsi distraktor tertentu.
   - **BUANG**: Butir cacat konseptual, daya pembeda negatif / diskriminasi terbalik, atau kunci jawaban keliru.
   - Menampilkan alasan statistik spesifik, indikator pemicu, dan saran tindak lanjut guru.

6. **Laporan Resmi Siap Cetak A4 / PDF**:
   - Format standar dokumen dinas pendidikan dengan KOP Sekolah resmi, NPSN, dan alamat.
   - Ringkasan KPI dan koefisien reliabilitas instrumen.
   - Tabel matriks analisis butir komprehensif.
   - Rincian telaah butir yang perlu revisi beserta pola distribusi jawaban siswa.
   - Lembar tanda tangan Kepala Sekolah dan Guru Mata Pelajaran lengkap dengan NIP.

7. **Penyimpanan Data & Keamanan**:
   - Penyimpanan lokal berkinerja tinggi (*IndexedDB*) dan backend database relasional (*SQLite*).
   - Menghindari kehilangan data (*data loss protection*).
   - Privasi siswa terjaga dengan opsi kode/nomor identitas anonim.

---

## 📐 3. Landasan Teori & Rumus Psikometri (CTT)

### A. Tingkat Kesukaran (Item Difficulty, $P$)
- **Pilihan Ganda:**
  $$P = \frac{B}{N}$$
  *(B = jumlah siswa yang menjawab benar, N = jumlah siswa valid)*
- **Esai / Uraian:**
  $$P = \frac{\sum X - N \cdot X_{min}}{N \cdot (X_{max} - X_{min})}$$

### B. Daya Pembeda (Item Discrimination, $D$)
- **Metode Kelompok 27% Atas & Bawah (Kelley, 1939):**
  $$D = P_A - P_B = \frac{B_A - B_B}{n_{group}}$$
  *($n_{group} = \text{round}(0.27 \times N)$)*
- **Klasifikasi Daya Pembeda:**
  - $D \ge 0.40$ : Sangat Baik
  - $0.30 \le D < 0.40$ : Baik
  - $0.20 \le D < 0.30$ : Cukup (Perlu perbaikan)
  - $0.00 \le D < 0.20$ : Buruk (Dibuang / diganti)
  - $D < 0.00$ : Sangat Buruk (Negatif / Anomali kunci)

### C. Validitas Butir (Corrected Item-Total Correlation)
Untuk mencegah inflasi buatan karena butir mengorelasikan dirinya sendiri dalam skor total, digunakan koreksi Guilford:
$$r_{j(Total-j)} = \frac{r_{jX} \cdot S_X - S_j}{\sqrt{S_X^2 + S_j^2 - 2 \cdot r_{jX} \cdot S_X \cdot S_j}}$$
Butir dinyatakan **VALID** jika $r_{hitung} > r_{tabel}$ ($\alpha = 0.05, df = N - 2$) dan bernilai positif.

### D. Reliabilitas Tes ($r_{11}$)
- **KR-20 (Pilihan Ganda):**
  $$r_{11} = \frac{K}{K-1} \left(1 - \frac{\sum p \cdot q}{S_t^2}\right)$$
- **Cronbach's Alpha (Esai & Campuran):**
  $$\alpha = \frac{K}{K-1} \left(1 - \frac{\sum S_i^2}{S_t^2}\right)$$

---

## 💻 4. Cara Menjalankan Aplikasi

Aplikasi BISA dapat dijalankan dalam **dua mode fleksibel**:

### Mode 1: Buka Langsung di Peramban (Zero-Setup / Standalone)
Karena aplikasi dibangun menggunakan arsitektur web modern dengan penyimpanan IndexedDB lokal:
1. Buka berkas `index.html` pada peramban web apa pun (Google Chrome, Microsoft Edge, Mozilla Firefox).
2. Seluruh fungsionalitas (input data, kalkulasi CTT, grafik, ekspor Excel, dan cetak PDF) langsung berjalan 100% tanpa perlu koneksi internet atau instalasi tambahan.

### Mode 2: Menjalankan Server Backend (Node.js & SQLite)
Untuk menjalankan server lokal terpusat dengan database SQLite:
```powershell
cd C:\Users\ASUS\.gemini\antigravity\scratch\bisa-app
agy-node server.js
```
Server akan aktif pada:
```
http://127.0.0.1:3000
```

---

## 🧪 5. Verifikasi Pengujian Kualitas (QA & Unit Testing)

Mesin analisis CTT telah diverifikasi melalui rangkaian pengujian unit otomatis pada berkas `tests/ctt-engine.test.js`.

Jalankan pengujian unit:
```powershell
agy-node tests/ctt-engine.test.js
```

### Hasil Verifikasi:
```
======================================================
🧪 PENGUJIAN UNIT: BISA CTT STATISTICAL ENGINE
======================================================

--- 1. Fungsi Statistik Dasar ---
  ✓ PASS: Mean (Rata-rata) menghitung dengan tepat
  ✓ PASS: Varians dan Standar Deviasi menghitung dengan tepat (ddof=0)
  ✓ PASS: Korelasi Pearson Product-Moment
  ✓ PASS: Korelasi Pearson menangani varians nol dengan aman

--- 2. R-Tabel & Signifikansi ---
  ✓ PASS: r-tabel mengembalikan nilai referensi yang benar untuk alpha=0.05

--- 3. Dataset Referensi Pilihan Ganda (10 Siswa, 5 Soal) ---
  ✓ PASS: Tingkat Kesukaran (P) Butir 1-5 sesuai nilai referensi teoritis
  ✓ PASS: Kategori Tingkat Kesukaran sesuai standar Crocker & Algina
  ✓ PASS: Daya Pembeda (D) 27% sesuai perhitungan kelompok atas dan bawah
  ✓ PASS: Validitas Butir (Corrected Item-Total & Point-Biserial) konsisten dan positif
  ✓ PASS: Reliabilitas KR-20 terhitung tinggi untuk data instrumen konsisten
  ✓ PASS: Analisis Distraktor menghitung persentase dan mendeteksi kunci dengan tepat

--- 4. Uji Deteksi Soal Rusak / Pembeda Negatif (Kriteria BUANG) ---
  ✓ PASS: Rekomendasi BUANG diberikan ketika Daya Pembeda negatif atau korelasi negatif

--- 5. Uji Soal Esai & Cronbach Alpha ---
  ✓ PASS: Tingkat Kesukaran Esai dinormalisasi dalam rentang minScore s/d maxScore
  ✓ PASS: Reliabilitas Esai dihitung menggunakan Cronbach Alpha

--- 6. Penanganan Kasus Batas (Edge Cases) ---
  ✓ PASS: Varians butir nol (semua siswa menjawab benar 100%) ditangani tanpa crash
  ✓ PASS: Sampel kecil (N < 5) menghasilkan status DATA KURANG secara edukatif

======================================================
HASIL AKHIR PENGUJIAN: 16 / 16 BERHASIL (100% PASS)
======================================================
```

---

## 📁 6. Struktur Direktori Proyek

```
bisa-app/
├── index.html                   # Antarmuka web modern & responsif BISA
├── package.json                 # Konfigurasi proyek & scripts
├── server.js                    # Server backend REST API dengan SQLite bawaan
├── bisa_app.db                  # Database SQLite relasional
├── README.md                    # Dokumentasi lengkap aplikasi
├── css/
│   └── style.css                # Desain sistem EdTech Teal & print-ready A4
├── js/
│   ├── ctt-engine.js            # Modul mesin perhitungan psikometrik CTT
│   ├── sample-data.js           # Dataset uji coba realistis SD & SMP
│   ├── db.js                    # Layer penyimpanan IndexedDB & sinkronisasi
│   ├── excel-handler.js         # Generator template resmi & parser Excel
│   ├── pdf-report.js            # Generator laporan resmi cetak A4/PDF
│   └── app.js                   # Kontroler aplikasi & perute tampilan
├── lib/
│   └── chart.umd.min.js         # Pustaka visualisasi grafik (Chart.js)
└── tests/
    ├── ctt-engine.test.js       # Unit test suite verifikasi akurasi rumus CTT
    └── test-server.js           # Skrip uji koneksi server
```

---

## ☁️ 7. Panduan Deploy ke Cloudflare Pages (100% Gratis & Online)

Aplikasi BISA dirancang dengan arsitektur web modern yang sangat ringan dan independen. Seluruh komputasi statistik CTT dan penyimpanan lokal (*IndexedDB*) berjalan langsung di browser pengguna. Oleh karena itu, aplikasi ini dapat di-*deploy* ke **Cloudflare Pages** secara gratis dengan performa ultra cepat (CDN global) dan keamanan HTTPS seumur hidup.

### Cara 1: Deploy Langsung via Dashboard Cloudflare (Paling Mudah — Tanpa Git/Koding)
1. Buka dan masuk ke akun Cloudflare di: [dash.cloudflare.com](https://dash.cloudflare.com).
2. Di menu samping kiri, klik **Workers & Pages** &rarr; klik tombol **Create application** &rarr; pilih tab **Pages**.
3. Pilih opsi **Upload assets** (Unggah aset langsung).
4. Masukkan **Project name** (contoh: `bisa-analisis-soal`).
5. Seret dan lepas (*drag & drop*) folder `bisa-app` ke area unggah, atau klik *Upload assets* dan pilih seluruh file dari folder ini.
6. Klik **Deploy site**.
7. Dalam waktu kurang dari 1 menit, aplikasi BISA sudah aktif dan dapat diakses publik di URL: `https://bisa-analisis-soal.pages.dev`.

### Cara 2: Deploy Otomatis via GitHub / GitLab (CI/CD Otomatis)
1. Unggah folder proyek `bisa-app` ke repositori GitHub Bapak/Ibu (misal: `github.com/username/bisa-app`).
2. Masuk ke **dash.cloudflare.com** &rarr; **Workers & Pages** &rarr; **Create application** &rarr; tab **Pages** &rarr; **Connect to Git**.
3. Pilih akun GitHub dan pilih repositori `bisa-app`.
4. Pada bagian **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: *(kosongkan)*
   - **Build output directory**: *(kosongkan atau isi `./`)*
5. Klik **Save and Deploy**.
6. Setiap kali Bapak/Ibu memperbarui kode di GitHub, Cloudflare akan otomatis mengupdate web dalam hitungan detik!

### Cara 3: Deploy via Terminal (Wrangler CLI)
Bagi pengguna CLI / developer, jalankan perintah berikut di folder proyek:
```powershell
npx wrangler pages deploy . --project-name=bisa-app
```

---

## 👥 8. Hak Cipta & Pengembang

Platform **BISA (Butir Instrumen Soal Analitik)** dikembangkan untuk meningkatkan mutu asesmen pembelajaran dan mempermudah tugas administrasi evaluasi para pendidik di seluruh Indonesia.

© 2026 **Heriansyah, S.Si., S.Pd., M.Pd.** &mdash; Pengawas Satuan Pendidikan Kab. Sidrap.  
*BISA &mdash; Semua Guru BISA Menganalisis Soal.*
