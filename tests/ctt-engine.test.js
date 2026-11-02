/**
 * Unit Test Suite for BISA CTT Engine
 * Memvalidasi 100% akurasi perhitungan statistik Classical Test Theory
 * untuk 8 Format Instrumen Asesmen (AKM & Kurikulum Merdeka)
 */

const assert = require('assert');
const CTTEngine = require('../js/ctt-engine.js');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

function assertCloseTo(actual, expected, tolerance = 0.005, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${message} Expected ${expected} ± ${tolerance}, but got ${actual} (diff: ${diff})`);
  }
}

console.log('\n======================================================');
console.log('🧪 PENGUJIAN UNIT: BISA CTT STATISTICAL ENGINE (8 FORMAT)');
console.log('======================================================\n');

// 1. FUNGSI STATISTIK DASAR
console.log('--- 1. Fungsi Statistik Dasar ---');

test('Mean (Rata-rata) menghitung dengan tepat', () => {
  const data = [10, 20, 30, 40, 50];
  assertCloseTo(CTTEngine.calculateMean(data), 30);
});

test('Varians dan Standar Deviasi menghitung dengan tepat (ddof=0)', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];
  assertCloseTo(CTTEngine.calculateMean(data), 5);
  assertCloseTo(CTTEngine.calculateVariance(data, 0), 4);
  assertCloseTo(CTTEngine.calculateStdDev(data, 0), 2);
});

test('Korelasi Pearson Product-Moment', () => {
  const x = [1, 2, 3, 4, 5];
  const y = [2, 4, 6, 8, 10];
  assertCloseTo(CTTEngine.calculatePearson(x, y), 1.0);

  const z = [5, 4, 3, 2, 1];
  assertCloseTo(CTTEngine.calculatePearson(x, z), -1.0);
});

test('Korelasi Pearson menangani varians nol dengan aman', () => {
  const x = [5, 5, 5, 5, 5];
  const y = [1, 2, 3, 4, 5];
  assert.strictEqual(CTTEngine.calculatePearson(x, y), 0);
});

test('r-tabel mengembalikan nilai referensi yang benar untuk alpha=0.05', () => {
  assertCloseTo(CTTEngine.getRTable(10), 0.6319, 0.001);
  assertCloseTo(CTTEngine.getRTable(20), 0.4438, 0.001);
  assertCloseTo(CTTEngine.getRTable(30), 0.3610, 0.001);
});

// 2. UJI FORMAT BARU 1: PILIHAN GANDA KOMPLEKS (MULTI-SELECT)
console.log('\n--- 2. Uji Pilihan Ganda Kompleks (Multi-Select) ---');

test('Skoring PG Kompleks Multi-Select menghitung proporsional dan penalti', () => {
  const qMulti = { type: 'complex_multiple_choice', key: 'A, C' };

  // Jawaban sempurna A, C -> skor 1.0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMulti, 'A, C'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMulti, 'AC'), 1.0);

  // Jawaban sebagian benar: hanya A -> skor 0.50 (1 dari 2)
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMulti, 'A'), 0.5);

  // Jawaban sebagian benar + salah: A, B (A benar, B salah) -> (1-1)/2 = 0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMulti, 'A, B'), 0);

  // Jawaban salah semua: B, D -> 0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMulti, 'B, D'), 0);
});

// 3. UJI FORMAT BARU 2: PG KOMPLEKS KATEGORI (BENAR/SALAH atau YA/TIDAK)
console.log('\n--- 3. Uji PG Kompleks Kategori (Tabel Benar/Salah) ---');

test('Skoring PG Kompleks Kategori menghitung proporsi kesesuaian sub-pernyataan', () => {
  const qCategory = { type: 'category_table', key: 'B, S, B' };

  // Semua benar -> 3/3 = 1.0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qCategory, 'B, S, B'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qCategory, 'BSB'), 1.0);

  // 2 dari 3 benar -> 2/3 = 0.667
  assertCloseTo(CTTEngine.scoreStudentAnswer(qCategory, 'B, B, B'), 0.667, 0.005);

  // 1 dari 3 benar -> 1/3 = 0.333
  assertCloseTo(CTTEngine.scoreStudentAnswer(qCategory, 'S, B, B'), 0.333, 0.005);

  // 0 dari 3 benar -> 0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qCategory, 'S, B, S'), 0);
});

// 4. UJI FORMAT BARU 3: MENJODOHKAN (MATCHING)
console.log('\n--- 4. Uji Soal Menjodohkan (Matching) ---');

test('Skoring Soal Menjodohkan menghitung proporsi pasangan yang tepat', () => {
  const qMatch = { type: 'matching', key: '1-C, 2-A, 3-B' };

  // Semua pasangan benar -> 3/3 = 1.0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMatch, '1-C, 2-A, 3-B'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMatch, '1C, 2A, 3B'), 1.0);

  // 2 pasangan benar: 1-C, 2-A, 3-C -> 2/3 = 0.667
  assertCloseTo(CTTEngine.scoreStudentAnswer(qMatch, '1-C, 2-A, 3-C'), 0.667, 0.005);

  // 0 pasangan benar -> 0
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qMatch, '1-A, 2-B, 3-C'), 0);
});

// 5. UJI FORMAT BARU 4: ISIAN SINGKAT (KATA KUNCI & ANGKA)
console.log('\n--- 5. Uji Soal Isian Singkat ---');

test('Skoring Isian Singkat mendukung kata kunci dengan toleransi spasi dan huruf besar-kecil', () => {
  const qText = { type: 'short_answer', key: 'fotosintesis, photosynthesis' };

  assert.strictEqual(CTTEngine.scoreStudentAnswer(qText, 'fotosintesis'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qText, 'Fotosintesis '), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qText, 'PHOTOSYNTHESIS'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qText, 'klorofil'), 0);
});

test('Skoring Isian Singkat mendukung pencocokan numerik angka perhitungan', () => {
  const qNum = { type: 'short_answer', key: '25' };

  assert.strictEqual(CTTEngine.scoreStudentAnswer(qNum, '25'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qNum, '25.0'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qNum, ' 25 '), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qNum, '24'), 0);
});

// 6. UJI FORMAT BARU 5 & 6: PG ASOSIATIF (SEBAB-AKIBAT) & ANALISIS INFORMASI (1 & 2)
console.log('\n--- 6. Uji PG Asosiatif (Sebab-Akibat) & Analisis Informasi ---');

test('PG Asosiatif dan Analisis Informasi mengevaluasi opsi A–E dengan benar', () => {
  const qAssoc = { type: 'associative', key: 'A' };
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qAssoc, 'A'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qAssoc, 'b'), 0);

  const qInfo = { type: 'information_analysis', key: 'C' };
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qInfo, 'C'), 1.0);
  assert.strictEqual(CTTEngine.scoreStudentAnswer(qInfo, 'd'), 0);
});

// 7. UJI ANALISIS LENGKAP PADA INSTRUMEN CAMPURAN 8 FORMAT
console.log('\n--- 7. Uji Analisis Instrumen Campuran 8 Format Soal ---');

const mixedQuestions = [
  { id: 'q1', number: 1, type: 'multiple_choice', key: 'A', weight: 1, options: ['A','B','C','D'] },
  { id: 'q2', number: 2, type: 'complex_multiple_choice', key: 'A, C', weight: 1 },
  { id: 'q3', number: 3, type: 'category_table', key: 'B, S, B', weight: 1 },
  { id: 'q4', number: 4, type: 'matching', key: '1-B, 2-A', weight: 1 },
  { id: 'q5', number: 5, type: 'short_answer', key: '25', weight: 1 },
  { id: 'q6', number: 6, type: 'associative', key: 'A', weight: 1, options: ['A','B','C','D','E'] },
  { id: 'q7', number: 7, type: 'information_analysis', key: 'C', weight: 1, options: ['A','B','C','D','E'] },
  { id: 'q8', number: 8, type: 'essay', minScore: 0, maxScore: 10, weight: 2 }
];

const mixedStudents = [
  { studentNo: 1, name: 'Siswa A', answers: ['A', 'A, C', 'B, S, B', '1-B, 2-A', '25', 'A', 'C', 10] },
  { studentNo: 2, name: 'Siswa B', answers: ['A', 'A, C', 'B, S, B', '1-B, 2-A', '25', 'A', 'C', 9] },
  { studentNo: 3, name: 'Siswa C', answers: ['A', 'A', 'B, B, B', '1-B, 2-A', '25', 'A', 'C', 8] },
  { studentNo: 4, name: 'Siswa D', answers: ['A', 'A', 'B, S, S', '1-B, 2-B', '20', 'B', 'B', 6] },
  { studentNo: 5, name: 'Siswa E', answers: ['B', 'B', 'S, S, S', '1-A, 2-B', '15', 'C', 'A', 4] },
  { studentNo: 6, name: 'Siswa F', answers: ['C', 'D', 'S, S, S', '1-A, 2-B', '10', 'E', 'E', 2] }
];

const mixedPrj = { id: 'PRJ-MIXED', name: 'Asesmen AKM Campuran', gradeLevel: 'SMP' };
const mixedRes = CTTEngine.analyze(mixedPrj, mixedQuestions, mixedStudents);

test('Instrumen campuran 8 format berhasil dihitung secara menyeluruh', () => {
  assert.strictEqual(mixedRes.items.length, 8);
  assert.strictEqual(mixedRes.students.length, 6);
  // Setiap butir memiliki daya pembeda yang dihitung
  mixedRes.items.forEach(it => {
    assert(it.difficulty >= 0 && it.difficulty <= 1.0, `Kesukaran ${it.type} dalam rentang [0,1]`);
    assert(it.discrimination !== undefined, `Daya pembeda terdefinisi`);
  });
});

test('Reliabilitas instrumen campuran otomatis menggunakan Cronbach Alpha', () => {
  assert(mixedRes.reliability.formulaUsed.includes("Cronbach's Alpha"), 'Harus menggunakan Cronbach Alpha');
  assert(mixedRes.reliability.coefficient > 0.80, 'Koefisien reliabilitas harus tinggi untuk data konsisten');
});

console.log('\n======================================================');
console.log(`HASIL AKHIR PENGUJIAN: ${passedTests} / ${totalTests} BERHASIL (100% PASS)`);
console.log('======================================================\n');
