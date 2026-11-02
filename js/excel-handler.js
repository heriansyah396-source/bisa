/**
 * BISA (Butir Instrumen Soal Analitik)
 * Excel & CSV Processing Engine (Template Generator, Parser & Validator)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BISAExcel = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BISAExcel = {
    /**
     * Memeriksa apakah pustaka SheetJS (XLSX) tersedia
     */
    isXLSXAvailable() {
      return typeof XLSX !== 'undefined';
    },

    /**
     * Menghasilkan Template Excel Resmi BISA
     */
    generateTemplate(project, questions) {
      const nQuestions = questions.length;
      const isXlsx = this.isXLSXAvailable();

      // Buat struktur baris template
      const rows = [];

      // Baris Header Informasi
      rows.push(['# TEMPLATE RESMI IMPORT DATA SISWA & JAWABAN - APLIKASI BISA']);
      rows.push(['# Sekolah', project.schoolName || 'SMP Negeri 1 Sidrap', '# Mata Pelajaran', project.subject || 'IPA']);
      rows.push(['# Kelas', project.gradeClass || 'VIII-A', '# Jenjang', project.gradeLevel || 'SMP']);
      rows.push(['# Semester', project.semester || 'Ganjil', '# Tahun Ajaran', project.academicYear || '2025/2026']);
      rows.push(['# Petunjuk: Baris KUNCI JAWABAN wajib diisi. Untuk PG isi huruf A-D/E, untuk Esai isi skor angka.']);
      rows.push([]); // Baris kosong pemisah

      // Header Kolom Tabel Utama
      const tableHeaders = ['No', 'NISN', 'Nama Siswa'];
      for (let i = 1; i <= nQuestions; i++) {
        tableHeaders.push(`Soal ${i}`);
      }
      rows.push(tableHeaders);

      // Baris Metadata 1: Kunci Jawaban
      const keyRow = ['*', '*', 'KUNCI_JAWABAN'];
      questions.forEach((q) => {
        keyRow.push(q.type === 'essay' ? '-' : (q.key || 'A'));
      });
      rows.push(keyRow);

      // Baris Metadata 2: Jenis Soal
      const typeRow = ['*', '*', 'JENIS_SOAL'];
      questions.forEach((q) => {
        const typeMap = {
          multiple_choice: 'PG',
          complex_multiple_choice: 'PGK-MULTI',
          category_table: 'PGK-KATEGORI',
          matching: 'MENJODOHKAN',
          short_answer: 'ISIAN',
          associative: 'SEBAB-AKIBAT',
          information_analysis: 'ANALISIS-INFO',
          essay: 'ESAI'
        };
        typeRow.push(typeMap[q.type] || 'PG');
      });
      rows.push(typeRow);

      // Baris Metadata 3: Skor Maksimum
      const maxScoreRow = ['*', '*', 'SKOR_MAKSIMUM'];
      questions.forEach((q) => {
        maxScoreRow.push(q.type === 'essay' ? (q.maxScore || 10) : 1);
      });
      rows.push(maxScoreRow);

      // Contoh baris siswa (5 baris contoh)
      for (let s = 1; s <= 5; s++) {
        const studentRow = [s, `008123450${s}`, `Nama Siswa Contoh 0${s}`];
        questions.forEach((q) => {
          studentRow.push(q.type === 'essay' ? 8 : (q.key || 'A'));
        });
        rows.push(studentRow);
      }

      const fileName = `Template_BISA_${(project.subject || 'Soal').replace(/\s+/g, '_')}_${(project.gradeClass || 'Kelas').replace(/\s+/g, '_')}`;

      if (isXlsx) {
        // Buat Workbook XLSX
        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Atur lebar kolom
        const colWidths = [{ wch: 6 }, { wch: 16 }, { wch: 30 }];
        for (let i = 0; i < nQuestions; i++) {
          colWidths.push({ wch: 10 });
        }
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Jawaban');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else {
        // Fallback CSV jika XLSX tidak aktif
        let csvContent = 'data:text/csv;charset=utf-8,';
        rows.forEach(row => {
          const processed = row.map(cell => {
            const str = cell !== undefined && cell !== null ? String(cell) : '';
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          });
          csvContent += processed.join(',') + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    /**
     * Membaca dan memvalidasi file Excel / CSV yang diunggah
     */
    async parseAndValidate(file, project, questions) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            let dataRows = [];

            if (this.isXLSXAvailable() && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              dataRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            } else {
              // Parse CSV / Text
              const text = e.target.result;
              const lines = text.split(/\r\n|\n/);
              dataRows = lines.filter(l => l.trim() !== '').map(line => {
                // Sederhana split koma atau tab
                const delimiter = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
                return line.split(delimiter).map(cell => cell.replace(/^"|"$/g, '').trim());
              });
            }

            const validation = this.validateImportedRows(dataRows, project, questions);
            resolve(validation);
          } catch (err) {
            reject(new Error(`Gagal membaca file: ${err.message}`));
          }
        };

        reader.onerror = () => reject(new Error('Gagal membaca file yang diunggah'));

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      });
    },

    /**
     * Validasi mendalam struktur baris dan sel
     */
    validateImportedRows(rows, project, questions) {
      const warnings = [];
      const errors = [];
      const parsedStudents = [];
      let detectedKeys = [];
      let headerRowIndex = -1;
      let questionColStartIndex = 3; // default: No (0), NISN (1), Nama (2), Soal (3+)

      // 1. Cari baris header tabel (yang memuat 'Nama Siswa' atau 'Nama' atau 'Soal 1')
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const rowText = row.join(' ').toLowerCase();
        if (rowText.includes('nama') || rowText.includes('soal 1') || rowText.includes('nisn')) {
          headerRowIndex = r;
          break;
        }
      }

      if (headerRowIndex === -1) {
        // Coba anggap baris 0 adalah header
        headerRowIndex = 0;
      }

      // Deteksi letak kolom soal pada baris header
      const headerRow = rows[headerRowIndex] || [];
      for (let c = 0; c < headerRow.length; c++) {
        const hVal = String(headerRow[c] || '').toLowerCase();
        if (hVal.includes('soal') || hVal.includes('butir') || hVal === '1' || hVal === 's1') {
          questionColStartIndex = c;
          break;
        }
      }

      // 2. Iterasi baris-baris setelah header
      let studentCounter = 1;
      const seenNames = new Set();
      const seenNisn = new Set();
      const nQuestionsExpected = questions.length;

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const firstCol = String(row[0] || '').trim();
        const thirdCol = String(row[2] || '').trim().toUpperCase();

        // Cek baris metadata khusus template BISA
        if (thirdCol.includes('KUNCI') || firstCol.includes('KUNCI')) {
          detectedKeys = row.slice(questionColStartIndex).map(k => String(k || '').trim().toUpperCase());
          continue;
        }
        if (thirdCol.includes('JENIS') || thirdCol.includes('SKOR_MAK')) {
          continue;
        }
        if (firstCol.startsWith('#') || firstCol === '*') {
          continue;
        }

        // Ini baris data siswa
        const nisnVal = String(row[1] || '').trim();
        const nameVal = String(row[2] || row[1] || '').trim();

        // Lewati jika nama kosong sama sekali dan tidak ada jawaban
        const rawAnswers = row.slice(questionColStartIndex);
        const hasAnyAnswer = rawAnswers.some(a => String(a || '').trim() !== '');

        if (!nameVal && !hasAnyAnswer) {
          continue;
        }

        const studentName = nameVal || `Siswa Baris ${r + 1}`;

        // Cek duplikasi
        if (nameVal && seenNames.has(nameVal.toLowerCase())) {
          warnings.push(`Baris ${r + 1}: Nama siswa "${nameVal}" terdeteksi ganda.`);
        }
        if (nameVal) seenNames.add(nameVal.toLowerCase());

        if (nisnVal && nisnVal !== '-' && seenNisn.has(nisnVal)) {
          warnings.push(`Baris ${r + 1}: NISN "${nisnVal}" terdeteksi ganda.`);
        }
        if (nisnVal && nisnVal !== '-') seenNisn.add(nisnVal);

        // Validasi respon butir per butir
        const processedAnswers = [];
        for (let qIdx = 0; qIdx < nQuestionsExpected; qIdx++) {
          const q = questions[qIdx];
          const raw = rawAnswers[qIdx] !== undefined ? String(rawAnswers[qIdx]).trim() : '';

          if (q.type === 'essay') {
            const minScore = Number(q.minScore) || 0;
            const maxScore = Number(q.maxScore) || 10;
            const numVal = Number(raw);

            if (raw === '') {
              warnings.push(`Baris ${r + 1} (${studentName}): Skor Esai Soal ${qIdx + 1} kosong (dianggap 0).`);
              processedAnswers.push(0);
            } else if (isNaN(numVal)) {
              errors.push(`Baris ${r + 1} (${studentName}): Skor Esai Soal ${qIdx + 1} bernilai non-numerik ("${raw}").`);
              processedAnswers.push(0);
            } else if (numVal < minScore || numVal > maxScore) {
              errors.push(`Baris ${r + 1} (${studentName}): Skor Esai Soal ${qIdx + 1} (${numVal}) di luar rentang [${minScore} - ${maxScore}].`);
              processedAnswers.push(Math.max(minScore, Math.min(maxScore, numVal)));
            } else {
              processedAnswers.push(numVal);
            }
          } else if (q.type === 'multiple_choice' || q.type === 'associative' || q.type === 'information_analysis') {
            // Pilihan Ganda Biasa, Sebab-Akibat, atau Analisis Informasi (Opsi A-E)
            const valUpper = raw.toUpperCase();
            const allowedOpts = new Set((q.options || ['A', 'B', 'C', 'D', 'E']).map(o => o.toUpperCase()));

            if (valUpper === '') {
              warnings.push(`Baris ${r + 1} (${studentName}): Jawaban Soal ${qIdx + 1} kosong (tidak dijawab).`);
              processedAnswers.push('');
            } else if (!allowedOpts.has(valUpper)) {
              warnings.push(`Baris ${r + 1} (${studentName}): Jawaban "${valUpper}" pada Soal ${qIdx + 1} tidak termasuk opsi yang valid [${Array.from(allowedOpts).join(', ')}].`);
              processedAnswers.push(valUpper);
            } else {
              processedAnswers.push(valUpper);
            }
          } else {
            // PG Kompleks, Kategori B/S, Menjodohkan, atau Isian Singkat
            if (raw === '') {
              warnings.push(`Baris ${r + 1} (${studentName}): Jawaban Soal ${qIdx + 1} (${q.type}) kosong.`);
            }
            processedAnswers.push(raw);
          }
        }

        parsedStudents.push({
          studentNo: studentCounter++,
          nisn: nisnVal || '-',
          name: studentName,
          answers: processedAnswers
        });
      }

      if (parsedStudents.length === 0) {
        errors.push('Tidak ditemukan baris data siswa yang valid pada file ini.');
      }

      return {
        isValid: errors.length === 0 && parsedStudents.length > 0,
        totalStudents: parsedStudents.length,
        totalQuestionsExpected: nQuestionsExpected,
        detectedKeys: detectedKeys,
        students: parsedStudents,
        warnings: warnings,
        errors: errors
      };
    },

    /**
     * Ekspor Laporan Analisis Lengkap ke Excel
     */
    exportResultsToExcel(project, analysisResult) {
      if (!this.isXLSXAvailable()) {
        alert('Pustaka SheetJS belum dimuat. Silakan gunakan cetak PDF.');
        return;
      }

      const wb = XLSX.utils.book_new();

      // Sheet 1: Rekapitulasi Butir Soal
      const itemRows = [
        ['REKAPITULASI ANALISIS BUTIR SOAL - APLIKASI BISA'],
        ['Sekolah:', project.schoolName, 'Mata Pelajaran:', project.subject],
        ['Kelas:', project.gradeClass, 'Semester/TA:', `${project.semester} / ${project.academicYear}`],
        ['Koefisien Reliabilitas:', `${analysisResult.reliability.coefficient} (${analysisResult.reliability.category})`, 'Metode:', analysisResult.reliability.formulaUsed],
        [],
        ['No', 'Tipe', 'Kunci', 'Tingkat Kesukaran (P)', 'Kategori Kesukaran', 'Daya Pembeda (D)', 'Kategori Pembeda', 'r-Hitung', 'r-Tabel', 'Status Validitas', 'Rekomendasi', 'Tindak Lanjut']
      ];

      analysisResult.items.forEach(it => {
        itemRows.push([
          it.number,
          it.type === 'essay' ? 'Esai' : 'Pilihan Ganda',
          it.type === 'essay' ? '-' : it.key,
          it.difficulty,
          it.difficultyCategory,
          it.discrimination,
          it.discriminationCategory,
          it.rCorrected,
          it.rTable,
          it.validityStatus,
          it.recommendation,
          it.recommendationAction
        ]);
      });

      const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
      XLSX.utils.book_append_sheet(wb, wsItems, 'Rekap Butir Soal');

      // Sheet 2: Data Nilai Siswa
      const studentRows = [
        ['DAFTAR NILAI SISWA HASIL ANALISIS'],
        ['No', 'NISN', 'Nama Siswa', 'Skor Mentah', 'Skor Terbobot', 'Nilai (Skala 100)']
      ];

      analysisResult.students.forEach(st => {
        studentRows.push([
          st.studentNo,
          st.nisn || '-',
          st.name,
          st.totalRawScore,
          st.totalWeightedScore,
          st.score100
        ]);
      });

      const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
      XLSX.utils.book_append_sheet(wb, wsStudents, 'Nilai Siswa');

      const fileName = `Analisis_BISA_${(project.subject || 'Soal').replace(/\s+/g, '_')}_${(project.gradeClass || 'Kelas').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }
  };

  return BISAExcel;
}));
