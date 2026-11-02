/**
 * BISA (Butir Instrumen Soal Analitik)
 * Classical Test Theory (CTT) Statistical Calculation Engine
 * 
 * Mendukung 8 Format Instrumen Asesmen Terstandar (AKM / Kurikulum Merdeka):
 * 1. Pilihan Ganda Biasa (Satu Jawaban Benar)
 * 2. Pilihan Ganda Kompleks (Lebih dari Satu Jawaban Benar / Multi-Select)
 * 3. PG Kompleks Kategori (Tabel Benar/Salah atau Ya/Tidak)
 * 4. Soal Menjodohkan (Matching)
 * 5. Soal Isian Singkat (Kata Kunci / Angka)
 * 6. PG Asosiatif (Hubungan Sebab-Akibat, Opsi A–E)
 * 7. Analisis Informasi (Kecukupan Data Pernyataan 1 & 2, Opsi A–E)
 * 8. Esai / Uraian
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CTTEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Kamus Metadata Format Soal
  const QUESTION_FORMATS = {
    multiple_choice: {
      id: 'multiple_choice',
      name: 'Pilihan Ganda',
      shortName: 'PG',
      badgeClass: 'badge-teal',
      hasDistractors: true,
      desc: 'Memilih satu jawaban benar dari opsi A–D atau A–E.'
    },
    complex_multiple_choice: {
      id: 'complex_multiple_choice',
      name: 'Pilihan Ganda Kompleks (Multi-Jawaban)',
      shortName: 'PGK-Multi',
      badgeClass: 'badge-primary',
      hasDistractors: false,
      desc: 'Memilih lebih dari satu opsi jawaban yang benar.'
    },
    category_table: {
      id: 'category_table',
      name: 'PG Kompleks Kategori (Benar/Salah)',
      shortName: 'PGK-B/S',
      badgeClass: 'badge-blue',
      hasDistractors: false,
      desc: 'Menentukan kategori Benar/Salah (B/S) atau Ya/Tidak (Y/T) pada sub-pernyataan.'
    },
    matching: {
      id: 'matching',
      name: 'Menjodohkan (Matching)',
      shortName: 'Menjodohkan',
      badgeClass: 'badge-teal',
      hasDistractors: false,
      desc: 'Menghubungkan premis lajur kiri dengan pasangan jawaban lajur kanan.'
    },
    short_answer: {
      id: 'short_answer',
      name: 'Isian Singkat',
      shortName: 'Isian',
      badgeClass: 'badge-warning',
      hasDistractors: false,
      desc: 'Mengetik jawaban pendek berupa angka pasti atau satu kata kunci materi.'
    },
    associative: {
      id: 'associative',
      name: 'PG Asosiatif (Sebab-Akibat)',
      shortName: 'Sebab-Akibat',
      badgeClass: 'badge-teal',
      hasDistractors: true,
      desc: 'Menganalisis kebenaran Pernyataan, Alasan, dan hubungan sebab-akibat (Opsi A–E).'
    },
    information_analysis: {
      id: 'information_analysis',
      name: 'Analisis Informasi (Pernyataan 1 & 2)',
      shortName: 'Analisis Info',
      badgeClass: 'badge-teal',
      hasDistractors: true,
      desc: 'Menentukan kecukupan informasi pernyataan 1 dan pernyataan 2 (Opsi A–E).'
    },
    essay: {
      id: 'essay',
      name: 'Esai / Uraian',
      shortName: 'Esai',
      badgeClass: 'badge-blue',
      hasDistractors: false,
      desc: 'Jawaban terbuka dengan rentang skor minimum hingga maksimum.'
    }
  };

  // Tabel nilai kritis r-tabel Pearson (alpha = 0.05, 2-tailed) untuk df = N - 2
  const R_TABLE_LOOKUP = {
    1: 0.9969, 2: 0.9500, 3: 0.8783, 4: 0.8114, 5: 0.7545,
    6: 0.7067, 7: 0.6664, 8: 0.6319, 9: 0.6021, 10: 0.5760,
    11: 0.5529, 12: 0.5324, 13: 0.5140, 14: 0.4973, 15: 0.4821,
    16: 0.4683, 17: 0.4555, 18: 0.4438, 19: 0.4329, 20: 0.4227,
    21: 0.4132, 22: 0.4044, 23: 0.3961, 24: 0.3882, 25: 0.3809,
    26: 0.3739, 27: 0.3673, 28: 0.3610, 29: 0.3550, 30: 0.3494,
    35: 0.3246, 40: 0.3044, 45: 0.2876, 50: 0.2732, 60: 0.2500,
    70: 0.2319, 80: 0.2172, 90: 0.2050, 100: 0.1946, 150: 0.1593, 200: 0.1381
  };

  function getRTable(n) {
    if (n < 3) return 0.9969;
    const df = n - 2;
    if (R_TABLE_LOOKUP[df]) return R_TABLE_LOOKUP[df];
    const t = df >= 30 ? 1.96 + (2.042 - 1.96) * Math.exp(-0.05 * (df - 30)) : 2.0;
    const rCrit = t / Math.sqrt(df + t * t);
    return Math.round(rCrit * 10000) / 10000;
  }

  function calculateMean(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + (Number(val) || 0), 0);
    return sum / arr.length;
  }

  function calculateVariance(arr, ddof = 0) {
    if (!arr || arr.length <= ddof) return 0;
    const mean = calculateMean(arr);
    const sumSqDiff = arr.reduce((acc, val) => {
      const diff = (Number(val) || 0) - mean;
      return acc + diff * diff;
    }, 0);
    return sumSqDiff / (arr.length - ddof);
  }

  function calculateStdDev(arr, ddof = 0) {
    return Math.sqrt(calculateVariance(arr, ddof));
  }

  function calculatePearson(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) return 0;
    const n = x.length;
    const meanX = calculateMean(x);
    const meanY = calculateMean(y);

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = (Number(x[i]) || 0) - meanX;
      const dy = (Number(y[i]) || 0) - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    if (den === 0) return 0;
    return num / den;
  }

  function calculateCorrectedItemTotal(itemScores, totalScores) {
    if (!itemScores || !totalScores || itemScores.length !== totalScores.length) {
      return { rItemTotal: 0, rCorrected: 0, warning: 'Ukuran data tidak sesuai' };
    }
    const n = itemScores.length;
    if (n < 3) {
      return { rItemTotal: 0, rCorrected: 0, warning: 'Sampel terlalu kecil (N < 3)' };
    }

    const restScores = [];
    for (let i = 0; i < n; i++) {
      restScores.push((Number(totalScores[i]) || 0) - (Number(itemScores[i]) || 0));
    }

    const sItem = calculateStdDev(itemScores, 0);
    const sTotal = calculateStdDev(totalScores, 0);
    const sRest = calculateStdDev(restScores, 0);

    if (sItem === 0) {
      return {
        rItemTotal: 0,
        rCorrected: 0,
        warning: 'Varians butir nol (semua siswa memperoleh skor yang sama)'
      };
    }

    if (sRest === 0 || sTotal === 0) {
      return {
        rItemTotal: 0,
        rCorrected: 0,
        warning: 'Varians total atau skor sisa nol'
      };
    }

    const rItemTotal = calculatePearson(itemScores, totalScores);
    const rCorrected = calculatePearson(itemScores, restScores);

    return {
      rItemTotal: Math.round(rItemTotal * 1000) / 1000,
      rCorrected: Math.round(rCorrected * 1000) / 1000,
      warning: null
    };
  }

  function classifyDifficulty(p, thresholds) {
    const t = thresholds || { easy: 0.70, hard: 0.30 };
    if (p >= t.easy) {
      return { category: 'Mudah', level: 'easy', badgeClass: 'badge-easy' };
    } else if (p >= t.hard) {
      return { category: 'Sedang', level: 'medium', badgeClass: 'badge-medium' };
    } else {
      return { category: 'Sukar', level: 'hard', badgeClass: 'badge-hard' };
    }
  }

  function classifyDiscrimination(d) {
    if (d >= 0.40) {
      return { category: 'Sangat Baik', level: 'very_good', badgeClass: 'badge-success' };
    } else if (d >= 0.30) {
      return { category: 'Baik', level: 'good', badgeClass: 'badge-teal' };
    } else if (d >= 0.20) {
      return { category: 'Cukup', level: 'sufficient', badgeClass: 'badge-warning' };
    } else if (d >= 0.0) {
      return { category: 'Buruk', level: 'poor', badgeClass: 'badge-danger' };
    } else {
      return { category: 'Sangat Buruk (Negatif)', level: 'very_poor', badgeClass: 'badge-negative' };
    }
  }

  function classifyReliability(r) {
    if (r >= 0.80) {
      return { category: 'Sangat Tinggi', level: 'very_high', badgeClass: 'badge-success' };
    } else if (r >= 0.60) {
      return { category: 'Tinggi', level: 'high', badgeClass: 'badge-teal' };
    } else if (r >= 0.40) {
      return { category: 'Cukup (Sedang)', level: 'medium', badgeClass: 'badge-warning' };
    } else if (r >= 0.20) {
      return { category: 'Rendah', level: 'low', badgeClass: 'badge-danger' };
    } else {
      return { category: 'Sangat Rendah', level: 'very_low', badgeClass: 'badge-negative' };
    }
  }

  /**
   * Fungsi Skoring Otomatis Berdasarkan Tipe Soal
   * @param {Object} q - Konfigurasi butir soal
   * @param {*} rawAns - Respon jawaban mentah siswa
   * @returns {number} Skor butir ternormalisasi [0.0 s/d 1.0] atau [minScore s/d maxScore]
   */
  function scoreStudentAnswer(q, rawAns) {
    const qType = q.type || 'multiple_choice';
    const rawStr = (rawAns !== undefined && rawAns !== null) ? String(rawAns).trim() : '';

    if (rawStr === '') return 0;

    // 1. Soal Esai / Uraian
    if (qType === 'essay') {
      const minScore = Number(q.minScore) || 0;
      const maxScore = Number(q.maxScore) || 10;
      let numVal = Number(rawStr);
      if (isNaN(numVal)) numVal = minScore;
      return Math.max(minScore, Math.min(maxScore, numVal));
    }

    // 2. Soal Isian Singkat (Kata Kunci atau Nilai Angka Pasti)
    if (qType === 'short_answer') {
      const studentClean = rawStr.toLowerCase().replace(/\s+/g, ' ');
      const rawKey = (q.key || '').toString();
      // Dukung multi-kunci yang dipisahkan koma, titik koma, atau garis miring
      const keysList = rawKey.split(/[,;|\n]/).map(k => k.trim().toLowerCase()).filter(Boolean);

      const studentNum = Number(studentClean);
      for (const k of keysList) {
        if (studentClean === k) return 1;
        const keyNum = Number(k);
        if (!isNaN(studentNum) && !isNaN(keyNum) && Math.abs(studentNum - keyNum) < 1e-6) {
          return 1;
        }
      }
      return 0;
    }

    // 3. Pilihan Ganda Kompleks (Multi-Jawaban Benar)
    if (qType === 'complex_multiple_choice') {
      const extractOpts = (str) => {
        if (Array.isArray(str)) return new Set(str.map(s => String(s).trim().toUpperCase()));
        const matches = String(str).toUpperCase().match(/[A-E]/g);
        return new Set(matches || []);
      };

      const keySet = extractOpts(q.key);
      const ansSet = extractOpts(rawStr);

      if (keySet.size === 0) return 0;

      let correctSelected = 0;
      let wrongSelected = 0;

      ansSet.forEach(opt => {
        if (keySet.has(opt)) correctSelected++;
        else wrongSelected++;
      });

      // Skoring proporsional standar AKM: (benar - salah) / total kunci benar
      const scoreFrac = Math.max(0, (correctSelected - wrongSelected) / keySet.size);
      return Math.round(scoreFrac * 1000) / 1000;
    }

    // 4. PG Kompleks Kategori (Tabel Benar/Salah atau Ya/Tidak)
    if (qType === 'category_table') {
      const parseTokens = (str) => {
        if (Array.isArray(str)) return str.map(s => String(s).trim().toUpperCase());
        const raw = String(str).trim().toUpperCase();
        let tokens = raw.replace(/[^BSYT01]/g, ' ').split(/\s+/).filter(Boolean);
        if (tokens.length === 1 && tokens[0].length > 1) {
          tokens = tokens[0].split('');
        }
        return tokens;
      };

      const keyTokens = parseTokens(q.key);
      const ansTokens = parseTokens(rawStr);

      if (keyTokens.length === 0) return 0;

      let matchCount = 0;
      for (let i = 0; i < keyTokens.length; i++) {
        if (ansTokens[i] && ansTokens[i] === keyTokens[i]) {
          matchCount++;
        }
      }
      const scoreFrac = matchCount / keyTokens.length;
      return Math.round(scoreFrac * 1000) / 1000;
    }

    // 5. Soal Menjodohkan (Matching)
    if (qType === 'matching') {
      const parsePairs = (str) => {
        const text = String(str).toUpperCase().replace(/[\s;]/g, ',');
        const items = text.split(',').filter(Boolean);
        const map = {};
        items.forEach(it => {
          const parts = it.split(/[-:=]/);
          if (parts.length >= 2) {
            map[parts[0].trim()] = parts[1].trim();
          } else {
            const m = it.match(/^(\d+|[A-Z])([A-Z]|\d+)$/);
            if (m) map[m[1]] = m[2];
          }
        });
        return map;
      };

      const keyPairs = parsePairs(q.key);
      const ansPairs = parsePairs(rawStr);
      const keyKeys = Object.keys(keyPairs);

      if (keyKeys.length === 0) return 0;

      let matchCount = 0;
      keyKeys.forEach(k => {
        if (ansPairs[k] && ansPairs[k] === keyPairs[k]) {
          matchCount++;
        }
      });

      const scoreFrac = matchCount / keyKeys.length;
      return Math.round(scoreFrac * 1000) / 1000;
    }

    // 6. Pilihan Ganda Tunggal, Sebab-Akibat (Asosiatif), & Analisis Informasi (1 & 2):
    // Membandingkan opsi tunggal A-E
    const key = (q.key || '').toString().trim().toUpperCase();
    const studentAns = rawStr.toUpperCase();
    return (studentAns !== '' && studentAns === key) ? 1 : 0;
  }

  /**
   * Mesin Analisis Lengkap CTT untuk 8 Format Soal
   */
  function analyze(project, questions, students, options = {}) {
    if (!questions || questions.length === 0) {
      throw new Error('Konfigurasi butir soal tidak boleh kosong.');
    }
    if (!students || students.length === 0) {
      throw new Error('Data respons siswa tidak boleh kosong.');
    }

    const nStudents = students.length;
    const nQuestions = questions.length;
    const groupPct = options.groupPercentage || 0.27; // Kelompok 27% standar CTT
    const rTableVal = getRTable(nStudents);

    // 1. Skoring Butir & Hitung Skor Total Setiap Siswa
    // ================================================
    const scoredStudents = students.map((student, sIdx) => {
      let totalRawScore = 0;
      let totalWeightedScore = 0;
      const itemScores = [];
      const itemRawAnswers = [];

      questions.forEach((q, qIdx) => {
        let rawAns = undefined;
        if (student.answers) {
          if (Array.isArray(student.answers)) {
            rawAns = student.answers[qIdx];
          } else if (q.id && student.answers[q.id] !== undefined) {
            rawAns = student.answers[q.id];
          } else if (student.answers[qIdx] !== undefined) {
            rawAns = student.answers[qIdx];
          } else if (student.answers[q.number] !== undefined) {
            rawAns = student.answers[q.number];
          }
        }
        itemRawAnswers.push(rawAns);

        const weight = Number(q.weight) || 1;
        const itemScore = scoreStudentAnswer(q, rawAns);

        itemScores.push(itemScore);
        totalRawScore += itemScore;
        totalWeightedScore += itemScore * weight;
      });

      return {
        id: student.id || `S${sIdx + 1}`,
        studentNo: student.studentNo || (sIdx + 1),
        name: student.name || `Siswa ${sIdx + 1}`,
        answers: itemRawAnswers,
        itemScores: itemScores,
        totalRawScore: Math.round(totalRawScore * 1000) / 1000,
        totalWeightedScore: Math.round(totalWeightedScore * 100) / 100
      };
    });

    // Urutkan siswa berdasarkan totalRawScore menurun untuk kelompok atas-bawah
    const sortedStudents = [...scoredStudents].sort((a, b) => {
      if (b.totalRawScore !== a.totalRawScore) {
        return b.totalRawScore - a.totalRawScore;
      }
      return a.studentNo - b.studentNo;
    });

    let nGroup = Math.round(nStudents * groupPct);
    if (nGroup < 1 && nStudents > 0) nGroup = 1;
    if (nStudents >= 4 && nGroup === 1) nGroup = 2;

    const upperGroup = sortedStudents.slice(0, nGroup);
    const lowerGroup = sortedStudents.slice(Math.max(0, nStudents - nGroup));

    const allTotalScores = scoredStudents.map(s => s.totalRawScore);
    const meanTotalScore = calculateMean(allTotalScores);
    const varTotalScore = calculateVariance(allTotalScores, 0);
    const stdDevTotalScore = Math.sqrt(varTotalScore);
    const maxTotalScore = Math.max(...allTotalScores);
    const minTotalScore = Math.min(...allTotalScores);

    // 2. Analisis Per Butir Soal (Item Analysis)
    // =========================================
    let sumItemVariance = 0;
    let sumPq = 0;
    let isAllPureDichotomous = true;

    const itemResults = questions.map((q, qIdx) => {
      const qNum = q.number || (qIdx + 1);
      const qType = q.type || 'multiple_choice';
      const typeInfo = QUESTION_FORMATS[qType] || QUESTION_FORMATS.multiple_choice;

      const itemScores = scoredStudents.map(s => s.itemScores[qIdx]);
      const rawAnswers = scoredStudents.map(s => s.answers[qIdx]);

      // Cek apakah ada skor pecahan / non-dikotomi
      const hasFractionalScores = itemScores.some(s => s > 0 && s < 1);
      if (qType === 'essay' || hasFractionalScores) {
        isAllPureDichotomous = false;
      }

      const itemVariance = calculateVariance(itemScores, 0);
      sumItemVariance += itemVariance;

      // Tingkat Kesukaran (P)
      let pValue = 0;
      let countFullCorrect = 0;
      const minScore = qType === 'essay' ? (Number(q.minScore) || 0) : 0;
      const maxScore = qType === 'essay' ? (Number(q.maxScore) || 10) : 1;
      const range = maxScore - minScore;

      const meanItem = calculateMean(itemScores);
      pValue = range > 0 ? ((meanItem - minScore) / range) : 0;

      if (qType !== 'essay') {
        countFullCorrect = itemScores.filter(s => s >= 0.99).length;
        if (isAllPureDichotomous) {
          const qVal = 1 - pValue;
          sumPq += (pValue * qVal);
        }
      }

      pValue = Math.round(pValue * 1000) / 1000;
      const diffClass = classifyDifficulty(pValue, options.difficultyThresholds);

      // Daya Pembeda (D) - Metode 27% Atas-Bawah
      const upperScores = upperGroup.map(s => s.itemScores[qIdx]);
      const lowerScores = lowerGroup.map(s => s.itemScores[qIdx]);

      const meanUpper = calculateMean(upperScores);
      const meanLower = calculateMean(lowerScores);
      let dValue = range > 0 ? ((meanUpper - meanLower) / range) : 0;
      dValue = Math.round(dValue * 1000) / 1000;
      const discClass = classifyDiscrimination(dValue);

      // Korelasi & Validitas Butir (Corrected Item-Total)
      const corrResult = calculateCorrectedItemTotal(itemScores, allTotalScores);
      const rHitung = corrResult.rCorrected;
      const isValid = (rHitung > rTableVal && rHitung > 0);

      // Analisis Distraktor & Pola Respon
      let distractorAnalysis = null;
      let distractorIssueDetected = false;

      // Tipe yang memiliki opsi pilihan terstandar A–E
      const hasStandardOptionSet = (qType === 'multiple_choice' || qType === 'associative' || qType === 'information_analysis');

      if (hasStandardOptionSet) {
        const optionsList = q.options && q.options.length > 0
          ? q.options
          : ((project.gradeLevel === 'SD' && qType === 'multiple_choice') ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']);

        const key = (q.key || '').toString().trim().toUpperCase();
        const upperRawAnswers = upperGroup.map(s => (s.answers[qIdx] || '').toString().trim().toUpperCase());
        const lowerRawAnswers = lowerGroup.map(s => (s.answers[qIdx] || '').toString().trim().toUpperCase());

        const optionStats = optionsList.map(opt => {
          const optCode = opt.toUpperCase();
          const totalCount = rawAnswers.filter(a => (a || '').toString().trim().toUpperCase() === optCode).length;
          const totalPct = nStudents > 0 ? Math.round((totalCount / nStudents) * 1000) / 10 : 0;

          const upperCount = upperRawAnswers.filter(a => a === optCode).length;
          const lowerCount = lowerRawAnswers.filter(a => a === optCode).length;
          const isKey = (optCode === key);

          let status = 'EFEKTIF';
          let statusNote = 'Pengecoh berfungsi dengan baik';
          let badgeClass = 'badge-teal';

          if (isKey) {
            status = 'KUNCI';
            statusNote = 'Kunci jawaban butir';
            badgeClass = 'badge-key';
          } else if (totalCount === 0) {
            status = 'TIDAK DIPILIH';
            statusNote = 'Pengecoh mati (0 pemilih)';
            badgeClass = 'badge-danger';
            distractorIssueDetected = true;
          } else if (totalPct < 5.0) {
            status = 'KURANG EFEKTIF';
            statusNote = `Dipilih < 5% peserta (${totalPct}%)`;
            badgeClass = 'badge-warning';
            distractorIssueDetected = true;
          } else if (upperCount > lowerCount) {
            status = 'MENYESATKAN';
            statusNote = 'Anomali: Lebih banyak dipilih kelompok atas';
            badgeClass = 'badge-negative';
            distractorIssueDetected = true;
          }

          return {
            option: optCode,
            isKey: isKey,
            totalCount: totalCount,
            percentage: totalPct,
            upperCount: upperCount,
            lowerCount: lowerCount,
            status: status,
            statusNote: statusNote,
            badgeClass: badgeClass
          };
        });

        const validOpts = new Set(optionsList.map(o => o.toUpperCase()));
        const blankCount = rawAnswers.filter(a => !a || !validOpts.has(a.toString().trim().toUpperCase())).length;

        distractorAnalysis = {
          formatType: qType,
          key: key,
          options: optionStats,
          blankCount: blankCount,
          issueDetected: distractorIssueDetected
        };
      } else if (qType !== 'essay') {
        // Analisis Pola Respon untuk PGK Multi, Kategori, Menjodohkan, dan Isian Singkat
        const fullScoreCount = itemScores.filter(s => s >= 0.99).length;
        const partialScoreCount = itemScores.filter(s => s > 0 && s < 0.99).length;
        const zeroScoreCount = itemScores.filter(s => s === 0).length;

        distractorAnalysis = {
          formatType: qType,
          key: String(q.key || ''),
          isAlternativeAnalysis: true,
          fullScoreCount: fullScoreCount,
          partialScoreCount: partialScoreCount,
          zeroScoreCount: zeroScoreCount,
          issueDetected: false
        };
      }

      return {
        id: q.id || `Q${qIdx + 1}`,
        number: qNum,
        type: qType,
        typeName: typeInfo.name,
        typeShort: typeInfo.shortName,
        typeBadge: typeInfo.badgeClass,
        key: q.key || '',
        weight: Number(q.weight) || 1,
        minScore: minScore,
        maxScore: maxScore,
        text: q.text || '',
        // Statistik Kesukaran
        difficulty: pValue,
        difficultyCategory: diffClass.category,
        difficultyLevel: diffClass.level,
        difficultyBadge: diffClass.badgeClass,
        countCorrect: countFullCorrect,
        // Statistik Daya Pembeda
        discrimination: dValue,
        discriminationCategory: discClass.category,
        discriminationLevel: discClass.level,
        discriminationBadge: discClass.badgeClass,
        // Statistik Validitas
        rBiserial: corrResult.rItemTotal,
        rCorrected: rHitung,
        rTable: rTableVal,
        isValid: isValid,
        validityStatus: isValid ? 'Valid' : 'Tidak Valid',
        validityBadge: isValid ? 'badge-success' : 'badge-danger',
        validityWarning: corrResult.warning,
        // Distraktor
        distractorAnalysis: distractorAnalysis,
        distractorIssue: distractorIssueDetected
      };
    });

    // 3. Reliabilitas Tes (KR-20 atau Cronbach's Alpha)
    // ===============================================
    let reliabilityCoeff = 0;
    let reliabilityFormula = '';

    if (nQuestions > 1 && varTotalScore > 0) {
      const kFactor = nQuestions / (nQuestions - 1);
      if (isAllPureDichotomous) {
        reliabilityCoeff = kFactor * (1 - (sumPq / varTotalScore));
        reliabilityFormula = 'KR-20 (Kuder-Richardson 20)';
      } else {
        reliabilityCoeff = kFactor * (1 - (sumItemVariance / varTotalScore));
        reliabilityFormula = "Cronbach's Alpha (Komposit / Campuran)";
      }
    } else {
      reliabilityCoeff = 0;
      reliabilityFormula = nQuestions <= 1 ? 'Butir ≤ 1 (Tidak Dihitung)' : 'Varians Total Nol';
    }

    reliabilityCoeff = Math.max(0, Math.min(1.0, reliabilityCoeff));
    reliabilityCoeff = Math.round(reliabilityCoeff * 1000) / 1000;
    const relClass = classifyReliability(reliabilityCoeff);

    // 4. Rekomendasi Otomatis (Rule-Based)
    // ====================================
    const recommendationSummary = { pertahankan: 0, revisi: 0, buang: 0 };

    const evaluatedItems = itemResults.map(item => {
      let recStatus = 'PERTAHANKAN';
      let recReasons = [];
      let recIndicators = [];
      let recAction = '';
      let badgeClass = 'badge-success';

      if (nStudents < 5) {
        recStatus = 'DATA KURANG';
        recReasons.push(`Jumlah siswa valid (${nStudents}) belum memadai untuk menghasilkan rekomendasi statistik yang dapat diandalkan.`);
        recAction = 'Tambahkan minimal 10-20 data siswa sebelum mengambil keputusan butir.';
        badgeClass = 'badge-neutral';
      } else {
        const d = item.discrimination;
        const p = item.difficulty;
        const r = item.rCorrected;
        const hasDistractorIssue = item.distractorIssue;

        // Kriteria BUANG
        if (d < 0.15 || r <= 0) {
          recStatus = 'BUANG';
          badgeClass = 'badge-danger';
          recommendationSummary.buang++;

          if (d < 0) {
            recReasons.push(`Daya pembeda negatif (D = ${d.toFixed(3)}). Siswa kelompok bawah justru mendapatkan skor lebih tinggi dari kelompok atas.`);
            recIndicators.push('Daya Pembeda Negatif (Diskriminasi Terbalik)');
          } else if (d < 0.15) {
            recReasons.push(`Daya pembeda sangat rendah (D = ${d.toFixed(3)} < 0.15). Butir gagal membedakan kemampuan siswa.`);
            recIndicators.push('Daya Pembeda Tidak Memadai');
          }

          if (r <= 0) {
            recReasons.push(`Korelasi butir dengan skor total tidak positif (r = ${r.toFixed(3)}). Butir tidak mengukur konstruk yang sama.`);
            recIndicators.push('Validitas Tidak Memenuhi');
          }

          recAction = 'Jangan digunakan kembali. Buang butir ini atau rekonstruksi total materi dan opsi jawabannya.';
        }
        // Kriteria REVISI
        else if (d < 0.30 || p < 0.25 || p > 0.75 || !item.isValid || hasDistractorIssue) {
          recStatus = 'REVISI';
          badgeClass = 'badge-warning';
          recommendationSummary.revisi++;

          if (d >= 0.15 && d < 0.30) {
            recReasons.push(`Daya pembeda tergolong cukup (D = ${d.toFixed(3)}), perlu ditingkatkan agar lebih tajam.`);
            recIndicators.push('Daya Pembeda Cukup');
          }

          if (p < 0.25) {
            recReasons.push(`Tingkat kesukaran terlalu sukar (P = ${p.toFixed(3)}). Hanya sedikit siswa yang mampu menjawab.`);
            recIndicators.push('Soal Terlalu Sukar');
          } else if (p > 0.75) {
            recReasons.push(`Tingkat kesukaran terlalu mudah (P = ${p.toFixed(3)}). Sebagian besar siswa menjawab benar.`);
            recIndicators.push('Soal Terlalu Mudah');
          }

          if (!item.isValid) {
            recReasons.push(`Nilai validitas r = ${r.toFixed(3)} belum melampaui r-tabel (${rTableVal.toFixed(3)}).`);
            recIndicators.push('Validitas Belum Signifikan');
          }

          if (hasDistractorIssue && item.distractorAnalysis && item.distractorAnalysis.options) {
            const badOpts = item.distractorAnalysis.options.filter(o => !o.isKey && (o.status === 'MENYESATKAN' || o.status === 'TIDAK DIPILIH'));
            if (badOpts.length > 0) {
              const optDetails = badOpts.map(o => `Opsi ${o.option} (${o.statusNote})`).join(', ');
              recReasons.push(`Pengecoh perlu perbaikan: ${optDetails}.`);
              recIndicators.push('Efektivitas Pengecoh Perlu Ditingkatkan');
            }
          }

          recAction = 'Revisi kalimat soal, stimulus, atau alternatif opsi jawaban sebelum digunakan pada evaluasi mendatang.';
        }
        // Kriteria PERTAHANKAN
        else {
          recStatus = 'PERTAHANKAN';
          badgeClass = 'badge-success';
          recommendationSummary.pertahankan++;

          recReasons.push(`Seluruh parameter psikometrik memenuhi standar: Kesukaran proporsional (P = ${p.toFixed(3)}), Daya Pembeda tajam (D = ${d.toFixed(3)}), dan Valid (r = ${r.toFixed(3)}).`);
          recIndicators.push('Memenuhi Semua Kriteria Kualitas');
          recAction = 'Pertahankan butir ini dan simpan ke dalam Bank Soal sekolah.';
        }
      }

      return {
        ...item,
        recommendation: recStatus,
        recommendationReasons: recReasons,
        recommendationIndicators: recIndicators,
        recommendationAction: recAction,
        recommendationBadge: badgeClass
      };
    });

    // Ringkasan
    const difficultySummary = {
      mudah: evaluatedItems.filter(i => i.difficultyLevel === 'easy').length,
      sedang: evaluatedItems.filter(i => i.difficultyLevel === 'medium').length,
      sukar: evaluatedItems.filter(i => i.difficultyLevel === 'hard').length
    };

    const discriminationSummary = {
      sangatBaik: evaluatedItems.filter(i => i.discriminationLevel === 'very_good').length,
      baik: evaluatedItems.filter(i => i.discriminationLevel === 'good').length,
      cukup: evaluatedItems.filter(i => i.discriminationLevel === 'sufficient').length,
      buruk: evaluatedItems.filter(i => i.discriminationLevel === 'poor' || i.discriminationLevel === 'very_poor').length
    };

    // Nilai Akhir Konversi Skala 100
    const maxPossibleScore = questions.reduce((acc, q) => {
      const w = Number(q.weight) || 1;
      const m = q.type === 'essay' ? (Number(q.maxScore) || 10) : 1;
      return acc + (m * w);
    }, 0);

    const studentScoreOverview = scoredStudents.map(s => {
      const score100 = maxPossibleScore > 0
        ? Math.round((s.totalWeightedScore / maxPossibleScore) * 10000) / 100
        : 0;
      return {
        ...s,
        score100: score100
      };
    });

    const scores100List = studentScoreOverview.map(s => s.score100);
    const meanScore100 = calculateMean(scores100List);
    const maxScore100 = Math.max(...scores100List);
    const minScore100 = Math.min(...scores100List);
    const stdDevScore100 = calculateStdDev(scores100List, 0);

    return {
      analyzedAt: new Date().toISOString(),
      metadata: {
        nStudents: nStudents,
        nQuestions: nQuestions,
        groupSize: nGroup,
        groupPercentage: groupPct,
        rTable: rTableVal,
        maxPossibleScore: maxPossibleScore
      },
      classSummary: {
        meanRawScore: Math.round(meanTotalScore * 100) / 100,
        stdDevRawScore: Math.round(stdDevTotalScore * 100) / 100,
        maxRawScore: maxTotalScore,
        minRawScore: minTotalScore,
        meanScore100: Math.round(meanScore100 * 100) / 100,
        maxScore100: Math.round(maxScore100 * 100) / 100,
        minScore100: Math.round(minScore100 * 100) / 100,
        stdDevScore100: Math.round(stdDevScore100 * 100) / 100
      },
      reliability: {
        coefficient: reliabilityCoeff,
        category: relClass.category,
        level: relClass.level,
        badgeClass: relClass.badgeClass,
        formulaUsed: reliabilityFormula
      },
      summary: {
        difficulty: difficultySummary,
        discrimination: discriminationSummary,
        recommendation: recommendationSummary
      },
      items: evaluatedItems,
      students: studentScoreOverview,
      upperGroupSample: upperGroup.map(s => ({ id: s.id, name: s.name, total: s.totalRawScore })),
      lowerGroupSample: lowerGroup.map(s => ({ id: s.id, name: s.name, total: s.totalRawScore }))
    };
  }

  return {
    QUESTION_FORMATS: QUESTION_FORMATS,
    scoreStudentAnswer: scoreStudentAnswer,
    getRTable: getRTable,
    calculateMean: calculateMean,
    calculateVariance: calculateVariance,
    calculateStdDev: calculateStdDev,
    calculatePearson: calculatePearson,
    calculateCorrectedItemTotal: calculateCorrectedItemTotal,
    classifyDifficulty: classifyDifficulty,
    classifyDiscrimination: classifyDiscrimination,
    classifyReliability: classifyReliability,
    analyze: analyze
  };
}));
