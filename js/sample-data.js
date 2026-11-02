/**
 * BISA (Butir Instrumen Soal Analitik)
 * Realistic Educational Test Datasets for SD, SMP & AKM Modern Formats
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BISASampleData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // DATASET 1: Asesmen Sumatif IPA SMP Kelas VIII (25 Siswa, 15 Butir PG)
  // =========================================================================
  const sampleProjectSMP = {
    id: 'PRJ-SMP-IPA-01',
    name: 'Asesmen Sumatif Akhir Semester IPA Kelas VIII',
    schoolName: 'SMP Negeri 1 Sidrap',
    npsn: '40301234',
    gradeLevel: 'SMP',
    gradeClass: 'VIII-A',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    semester: 'Ganjil',
    academicYear: '2025/2026',
    examType: 'Asesmen Sumatif Akhir Semester (SAS)',
    teacherName: 'Heriansyah, S.Si., S.Pd., M.Pd.',
    teacherNip: '198205142008011007',
    headmasterName: 'Drs. H. Muhammad Aris, M.Pd.',
    headmasterNip: '196803121994031005',
    examDate: '2026-11-02',
    schoolCity: 'Kab. Sidenreng Rappang',
    optionsCount: 4
  };

  const sampleQuestionsSMP = [
    { id: 'q1', number: 1, type: 'multiple_choice', key: 'A', weight: 1, text: 'Organ tubuh yang berfungsi memompa darah ke seluruh tubuh adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q2', number: 2, type: 'multiple_choice', key: 'C', weight: 1, text: 'Satuan Sistem Internasional (SI) untuk besaran gaya adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q3', number: 3, type: 'multiple_choice', key: 'B', weight: 1, text: 'Zat makanan yang berfungsi sebagai sumber energi utama bagi tubuh adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q4', number: 4, type: 'multiple_choice', key: 'D', weight: 1, text: 'Peristiwa perpindahan panas tanpa memerlukan zat perantara disebut...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q5', number: 5, type: 'multiple_choice', key: 'A', weight: 1, text: 'Hukum Newton I menyatakan bahwa benda yang diam akan tetap diam jika...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q6', number: 6, type: 'multiple_choice', key: 'B', weight: 1, text: 'Enzim yang dihasilkan oleh lambung dan berfungsi mencerna protein adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q7', number: 7, type: 'multiple_choice', key: 'C', weight: 1, text: 'Pesawat sederhana yang memanfaatkan prinsip tuas jenis pertama adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q8', number: 8, type: 'multiple_choice', key: 'A', weight: 1, text: 'Pembuluh darah yang membawa darah kaya oksigen dari paru-paru ke jantung adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q9', number: 9, type: 'multiple_choice', key: 'D', weight: 1, text: 'Upaya pencegahan penyakit aterosklerosis yang tepat adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q10', number: 10, type: 'multiple_choice', key: 'B', weight: 1, text: 'Energi potensial gravitasi suatu benda dipengaruhi oleh...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q11', number: 11, type: 'multiple_choice', key: 'C', weight: 1, text: 'Bagian mata yang mengatur banyaknya cahaya yang masuk adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q12', number: 12, type: 'multiple_choice', key: 'A', weight: 1, text: 'Gelombang bunyi tidak dapat merambat melalui medium berupa...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q13', number: 13, type: 'multiple_choice', key: 'D', weight: 1, text: 'Soal anomali distraktor (opsi C misleading): Bagian ginjal tempat filtrasi darah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q14', number: 14, type: 'multiple_choice', key: 'B', weight: 1, text: 'Soal daya pembeda negatif (kunci terbalik/ambigu): Cahaya putih diuraikan oleh prisma...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q15', number: 15, type: 'multiple_choice', key: 'C', weight: 1, text: 'Cermin yang digunakan sebagai kaca spion kendaraan bermotor adalah cermin...', options: ['A', 'B', 'C', 'D'] }
  ];

  const sampleStudentsSMP = [
    { studentNo: 1, nisn: '0081234501', name: 'Ahmad Faiz Ramadhan', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','D','D','C'] },
    { studentNo: 2, nisn: '0081234502', name: 'Aisyah Putri Azzahra', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','D','D','C'] },
    { studentNo: 3, nisn: '0081234503', name: 'Alif Kurniawan', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','D','C','C'] },
    { studentNo: 4, nisn: '0081234504', name: 'Andi Batari Toja', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','C','D','C'] },
    { studentNo: 5, nisn: '0081234505', name: 'Anugrah Pratama', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','C','A','C'] },
    { studentNo: 6, nisn: '0081234506', name: 'Aqila Salsabila', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','D','A','C'] },
    { studentNo: 7, nisn: '0081234507', name: 'Bagus Setiawan', answers: ['A','C','B','D','A','B','C','A','D','B','B','A','D','B','C'] },
    { studentNo: 8, nisn: '0081234508', name: 'Cahya Kamila', answers: ['A','C','B','D','A','B','C','A','D','B','C','A','C','D','C'] },
    { studentNo: 9, nisn: '0081234509', name: 'Danial Saputra', answers: ['A','C','B','D','A','B','A','A','D','B','C','A','C','C','C'] },
    { studentNo: 10, nisn: '0081234510', name: 'Dian Permatasari', answers: ['A','C','B','D','A','B','C','A','B','B','C','A','C','A','C'] },
    { studentNo: 11, nisn: '0081234511', name: 'Fikri Haikal', answers: ['A','C','B','D','A','A','C','A','D','A','C','A','D','D','B'] },
    { studentNo: 12, nisn: '0081234512', name: 'Hafiz Al-Ghifari', answers: ['A','C','B','D','B','B','C','B','D','B','C','A','C','C','C'] },
    { studentNo: 13, nisn: '0081234513', name: 'Intan Nuraini', answers: ['A','C','B','D','A','B','C','A','A','B','C','B','C','B','C'] },
    { studentNo: 14, nisn: '0081234514', name: 'Keysha Zahra', answers: ['A','C','B','D','A','C','C','A','D','B','B','A','D','A','C'] },
    { studentNo: 15, nisn: '0081234515', name: 'M. Rizky Hidayat', answers: ['A','C','B','C','A','B','C','A','D','C','C','A','C','A','C'] },
    { studentNo: 16, nisn: '0081234516', name: 'Mutia Amanda', answers: ['A','C','B','D','C','B','A','A','D','B','C','B','A','B','C'] },
    { studentNo: 17, nisn: '0081234517', name: 'Nabila Syahrani', answers: ['A','C','A','D','A','B','C','B','D','A','C','A','B','A','C'] },
    { studentNo: 18, nisn: '0081234518', name: 'Rafi Ahmad', answers: ['A','C','B','A','A','B','B','A','D','B','A','B','B','B','C'] },
    { studentNo: 19, nisn: '0081234519', name: 'Rehan Maulana', answers: ['A','B','B','D','A','C','C','A','B','B','B','B','A','B','C'] },
    { studentNo: 20, nisn: '0081234520', name: 'Salsabila Putri', answers: ['A','C','B','D','B','A','A','B','D','A','C','B','A','B','C'] },
    { studentNo: 21, nisn: '0081234521', name: 'Teguh Prakoso', answers: ['A','A','B','C','A','D','A','A','C','B','A','B','A','B','C'] },
    { studentNo: 22, nisn: '0081234522', name: 'Umar Wirahadi', answers: ['B','C','C','D','C','B','B','B','D','C','C','B','B','B','A'] },
    { studentNo: 23, nisn: '0081234523', name: 'Wahyu Ramadhan', answers: ['A','B','A','C','B','C','B','A','B','A','B','B','A','B','C'] },
    { studentNo: 24, nisn: '0081234524', name: 'Zahra Amelia', answers: ['B','A','B','C','C','D','A','B','A','C','A','B','B','B','C'] },
    { studentNo: 25, nisn: '0081234525', name: 'Zulham Efendi', answers: ['B','B','C','B','C','C','B','B','C','C','A','B','B','B','A'] }
  ];

  // =========================================================================
  // DATASET 2: Asesmen Matematika SD Kelas V (20 Siswa, 10 PG + 2 Esai)
  // =========================================================================
  const sampleProjectSD = {
    id: 'PRJ-SD-MTK-01',
    name: 'Asesmen Formatif Matematika Pecahan & Desimal',
    schoolName: 'SD Negeri 2 Pangkajene',
    npsn: '40309876',
    gradeLevel: 'SD',
    gradeClass: 'V-B',
    subject: 'Matematika',
    semester: 'Ganjil',
    academicYear: '2025/2026',
    examType: 'Ulangan Harian / Asesmen Formatif',
    teacherName: 'Siti Rahmawati, S.Pd., Gr.',
    teacherNip: '199008202014022003',
    headmasterName: 'H. Sudirman, S.Pd., M.Si.',
    headmasterNip: '196504101988031012',
    examDate: '2026-10-28',
    schoolCity: 'Kab. Sidenreng Rappang',
    optionsCount: 4
  };

  const sampleQuestionsSD = [
    { id: 'q1', number: 1, type: 'multiple_choice', key: 'B', weight: 1, text: 'Bentuk pecahan paling sederhana dari 12/18 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q2', number: 2, type: 'multiple_choice', key: 'A', weight: 1, text: 'Hasil dari 1/2 + 1/4 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q3', number: 3, type: 'multiple_choice', key: 'C', weight: 1, text: 'Bentuk desimal dari 3/5 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q4', number: 4, type: 'multiple_choice', key: 'D', weight: 1, text: 'Ibu memiliki 3/4 kg gula, digunakan 1/2 kg. Sisa gula ibu adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q5', number: 5, type: 'multiple_choice', key: 'A', weight: 1, text: 'Nilai dari 2,5 x 0,4 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q6', number: 6, type: 'multiple_choice', key: 'B', weight: 1, text: 'Urutan pecahan dari yang terkecil: 1/2, 2/3, 1/4 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q7', number: 7, type: 'multiple_choice', key: 'C', weight: 1, text: 'Hasil pembagian 4/5 : 2 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q8', number: 8, type: 'multiple_choice', key: 'D', weight: 1, text: 'Bentuk persen dari 7/20 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q9', number: 9, type: 'multiple_choice', key: 'A', weight: 1, text: 'Pecahan senilai dengan 2/3 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q10', number: 10, type: 'multiple_choice', key: 'C', weight: 1, text: 'Hasil dari 3 1/2 - 1 1/4 adalah...', options: ['A', 'B', 'C', 'D'] },
    { id: 'q11', number: 11, type: 'essay', minScore: 0, maxScore: 10, weight: 2, text: 'Uraikan langkah penyelesaian: Paman membagikan 24 buku kepada 6 anak secara merata...' },
    { id: 'q12', number: 12, type: 'essay', minScore: 0, maxScore: 10, weight: 2, text: 'Sebuah kolam berbentuk persegi panjang dengan panjang 8 meter dan lebar 5 meter. Hitung luasnya!' }
  ];

  const sampleStudentsSD = [
    { studentNo: 1, nisn: '0112345001', name: 'Adit Pratama', answers: ['B','A','C','D','A','B','C','D','A','C', 10, 10] },
    { studentNo: 2, nisn: '0112345002', name: 'Bella Safitri', answers: ['B','A','C','D','A','B','C','D','A','C', 9, 10] },
    { studentNo: 3, nisn: '0112345003', name: 'Chandra Wijaya', answers: ['B','A','C','D','A','B','C','D','A','C', 9, 9] },
    { studentNo: 4, nisn: '0112345004', name: 'Dira Kirana', answers: ['B','A','C','D','A','B','C','D','A','A', 9, 9] },
    { studentNo: 5, nisn: '0112345005', name: 'Edo Kurnia', answers: ['B','A','C','D','A','B','C','B','A','C', 8, 8] },
    { studentNo: 6, nisn: '0112345006', name: 'Fani Azzahra', answers: ['B','A','C','D','A','B','A','D','A','C', 8, 8] },
    { studentNo: 7, nisn: '0112345007', name: 'Gilang Ramadhan', answers: ['B','A','C','D','B','B','C','D','A','C', 8, 7] },
    { studentNo: 8, nisn: '0112345008', name: 'Hana Marwah', answers: ['B','A','C','D','A','A','C','D','A','B', 7, 8] },
    { studentNo: 9, nisn: '0112345009', name: 'Irfan Hakim', answers: ['B','A','C','B','A','B','C','D','B','C', 7, 7] },
    { studentNo: 10, nisn: '0112345010', name: 'Jelita Sari', answers: ['B','A','B','D','A','B','C','C','A','C', 7, 7] },
    { studentNo: 11, nisn: '0112345011', name: 'Kurnia Sandy', answers: ['B','A','C','D','C','B','B','D','A','A', 6, 6] },
    { studentNo: 12, nisn: '0112345012', name: 'Luthfi Hasan', answers: ['B','A','C','C','A','C','C','A','A','C', 6, 6] },
    { studentNo: 13, nisn: '0112345013', name: 'Maya Anggraini', answers: ['B','B','C','D','A','B','A','D','C','C', 6, 5] },
    { studentNo: 14, nisn: '0112345014', name: 'Nino Saputra', answers: ['A','A','C','D','B','B','C','B','A','A', 5, 5] },
    { studentNo: 15, nisn: '0112345015', name: 'Olivia Putri', answers: ['B','A','A','B','A','D','C','D','B','B', 5, 4] },
    { studentNo: 16, nisn: '0112345016', name: 'Panji Perkasa', answers: ['B','C','C','D','C','B','A','C','A','A', 4, 4] },
    { studentNo: 17, nisn: '0112345017', name: 'Qonita Nailah', answers: ['A','A','B','A','A','A','C','A','C','C', 4, 3] },
    { studentNo: 18, nisn: '0112345018', name: 'Rangga Buana', answers: ['C','B','C','B','B','B','B','B','A','B', 3, 3] },
    { studentNo: 19, nisn: '0112345019', name: 'Salsa Bila', answers: ['A','B','A','C','C','C','A','A','B','A', 2, 2] },
    { studentNo: 20, nisn: '0112345020', name: 'Taufik Hidayat', answers: ['C','C','D','A','D','D','B','C','C','B', 1, 1] }
  ];

  // =========================================================================
  // DATASET 3: Asesmen Nasional / AKM Lengkap (Mendukung Seluruh 8 Format Soal)
  // =========================================================================
  const sampleProjectAKM = {
    id: 'PRJ-AKM-LENGKAP-01',
    name: 'Asesmen Literasi & Numerasi Terstandar AKM (8 Format Instrumen)',
    schoolName: 'SMP Negeri 1 Sidrap',
    npsn: '40301234',
    gradeLevel: 'SMP',
    gradeClass: 'VIII-Unggulan',
    subject: 'Literasi & Numerasi (AKM)',
    semester: 'Ganjil',
    academicYear: '2025/2026',
    examType: 'Simulasi Asesmen Nasional (AKM)',
    teacherName: 'Heriansyah, S.Si., S.Pd., M.Pd.',
    teacherNip: '198205142008011007',
    headmasterName: 'Drs. H. Muhammad Aris, M.Pd.',
    headmasterNip: '196803121994031005',
    examDate: '2026-11-02',
    schoolCity: 'Kab. Sidenreng Rappang',
    optionsCount: 5
  };

  const sampleQuestionsAKM = [
    // 1. Pilihan Ganda Tunggal
    {
      id: 'akm_1',
      number: 1,
      type: 'multiple_choice',
      key: 'C',
      weight: 1,
      text: 'Pilihan Ganda Biasa: Satuan percepatan dalam Sistem Internasional (SI) adalah...',
      options: ['A', 'B', 'C', 'D', 'E']
    },
    // 2. Pilihan Ganda Kompleks (Multi-Select)
    {
      id: 'akm_2',
      number: 2,
      type: 'complex_multiple_choice',
      key: 'A, C',
      weight: 1.5,
      text: 'PG Kompleks Multi: Pilihlah organ pernapasan manusia yang berfungsi sebagai jalur masuk dan penyaringan udara! (Jawaban benar lebih dari satu)',
      options: ['A', 'B', 'C', 'D', 'E']
    },
    // 3. PG Kompleks Kategori (Tabel Benar/Salah)
    {
      id: 'akm_3',
      number: 3,
      type: 'category_table',
      key: 'B, S, B',
      weight: 1.5,
      text: 'PG Kompleks Kategori: Tentukan status (B) Benar atau (S) Salah untuk ketiga pernyataan tentang fotosintesis!'
    },
    // 4. Menjodohkan (Matching)
    {
      id: 'akm_4',
      number: 4,
      type: 'matching',
      key: '1-C, 2-A, 3-B',
      weight: 1.5,
      text: 'Menjodohkan: Pasangkanlah besaran fisika (1, 2, 3) dengan alat ukur yang sesuai (A, B, C)!'
    },
    // 5. Isian Singkat (Kata Kunci)
    {
      id: 'akm_5',
      number: 5,
      type: 'short_answer',
      key: 'mitokondria, mitochondrion',
      weight: 1,
      text: 'Isian Singkat (Kata Kunci): Organel sel yang bertindak sebagai tempat respirasi sel dan penghasil energi utama sel adalah...'
    },
    // 6. Isian Singkat (Nilai Angka Hasil Hitung)
    {
      id: 'akm_6',
      number: 6,
      type: 'short_answer',
      key: '48',
      weight: 1,
      text: 'Isian Singkat (Angka): Sebuah benda bermassa 6 kg didorong gaya 8 m/s^2. Berapakah besar gaya yang bekerja (Newton)?'
    },
    // 7. PG Asosiatif (Sebab-Akibat)
    {
      id: 'akm_7',
      number: 7,
      type: 'associative',
      key: 'A',
      weight: 1,
      text: 'PG Asosiatif (Sebab-Akibat): Logam memuai jika dipanaskan (Pernyataan). SEBAB partikel logam bergetar lebih cepat saat suhu naik (Alasan).',
      options: ['A', 'B', 'C', 'D', 'E']
    },
    // 8. Analisis Informasi (Kecukupan Data 1 dan 2)
    {
      id: 'akm_8',
      number: 8,
      type: 'information_analysis',
      key: 'C',
      weight: 1.5,
      text: 'Analisis Informasi: Berapakah luas segitiga ABC? (1) Panjang alas 12 cm. (2) Tinggi segitiga 8 cm.',
      options: ['A', 'B', 'C', 'D', 'E']
    },
    // 9. Esai / Uraian
    {
      id: 'akm_9',
      number: 9,
      type: 'essay',
      minScore: 0,
      maxScore: 10,
      weight: 2,
      text: 'Esai Penalaran: Analisislah dampak penebangan hutan secara liar terhadap siklus air dan pemanasan global!'
    }
  ];

  const sampleStudentsAKM = [
    { studentNo: 1, nisn: '008501', name: 'Ahmad Faiz (Juara 1)', answers: ['C', 'A, C', 'B, S, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'A', 'C', 10] },
    { studentNo: 2, nisn: '008502', name: 'Aisyah Putri', answers: ['C', 'A, C', 'B, S, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'A', 'C', 10] },
    { studentNo: 3, nisn: '008503', name: 'Alif Kurniawan', answers: ['C', 'A, C', 'B, S, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'A', 'C', 9] },
    { studentNo: 4, nisn: '008504', name: 'Andi Batari', answers: ['C', 'A, C', 'B, S, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'A', 'B', 9] },
    { studentNo: 5, nisn: '008505', name: 'Anugrah Pratama', answers: ['C', 'A', 'B, S, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'A', 'C', 8] },
    { studentNo: 6, nisn: '008506', name: 'Aqila Salsabila', answers: ['C', 'A, C', 'B, B, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'B', 'C', 8] },
    { studentNo: 7, nisn: '008507', name: 'Bagus Setiawan', answers: ['C', 'A', 'B, S, S', '1-C, 2-B, 3-A', 'mitokondria', '48', 'A', 'C', 7] },
    { studentNo: 8, nisn: '008508', name: 'Cahya Kamila', answers: ['C', 'A, C', 'B, B, B', '1-C, 2-A, 3-B', 'mitokondria', '40', 'A', 'C', 7] },
    { studentNo: 9, nisn: '008509', name: 'Danial Saputra', answers: ['C', 'A', 'B, S, B', '1-C, 2-A, 3-C', 'ribosom', '48', 'A', 'A', 6] },
    { studentNo: 10, nisn: '008510', name: 'Dian Permata', answers: ['B', 'A, C', 'B, B, B', '1-C, 2-A, 3-B', 'mitokondria', '48', 'C', 'C', 6] },
    { studentNo: 11, nisn: '008511', name: 'Fikri Haikal', answers: ['C', 'A', 'S, S, B', '1-A, 2-C, 3-B', 'mitokondria', '48', 'B', 'C', 6] },
    { studentNo: 12, nisn: '008512', name: 'Hafiz Al-Ghifari', answers: ['B', 'B', 'B, S, S', '1-C, 2-A, 3-B', 'kloroplas', '48', 'B', 'A', 5] },
    { studentNo: 13, nisn: '008513', name: 'Intan Nuraini', answers: ['C', 'A, B', 'B, B, B', '1-B, 2-A, 3-C', 'mitokondria', '24', 'A', 'D', 5] },
    { studentNo: 14, nisn: '008514', name: 'Keysha Zahra', answers: ['A', 'C', 'S, S, B', '1-C, 2-A, 3-B', 'vakuola', '48', 'C', 'B', 5] },
    { studentNo: 15, nisn: '008515', name: 'M. Rizky', answers: ['C', 'A', 'B, S, S', '1-A, 2-B, 3-C', 'nukleus', '48', 'B', 'C', 4] },
    { studentNo: 16, nisn: '008516', name: 'Mutia Amanda', answers: ['B', 'B', 'S, B, S', '1-C, 2-A, 3-B', 'mitokondria', '14', 'C', 'E', 4] },
    { studentNo: 17, nisn: '008517', name: 'Nabila Syahrani', answers: ['A', 'A', 'S, S, S', '1-A, 2-B, 3-C', 'ribosom', '48', 'D', 'C', 4] },
    { studentNo: 18, nisn: '008518', name: 'Rafi Ahmad', answers: ['B', 'B, D', 'S, B, S', '1-B, 2-C, 3-A', 'dinding sel', '12', 'D', 'A', 3] },
    { studentNo: 19, nisn: '008519', name: 'Rehan Maulana', answers: ['A', 'D', 'S, S, S', '1-A, 2-B, 3-C', 'klorofil', '48', 'E', 'B', 2] },
    { studentNo: 20, nisn: '008520', name: 'Zulham Efendi', answers: ['D', 'E', 'S, B, S', '1-A, 2-B, 3-C', 'sitoplasma', '10', 'E', 'E', 1] }
  ];

  return {
    sampleProjectSMP: sampleProjectSMP,
    sampleQuestionsSMP: sampleQuestionsSMP,
    sampleStudentsSMP: sampleStudentsSMP,
    sampleProjectSD: sampleProjectSD,
    sampleQuestionsSD: sampleQuestionsSD,
    sampleStudentsSD: sampleStudentsSD,
    sampleProjectAKM: sampleProjectAKM,
    sampleQuestionsAKM: sampleQuestionsAKM,
    sampleStudentsAKM: sampleStudentsAKM
  };
}));
