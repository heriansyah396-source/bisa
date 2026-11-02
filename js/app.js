/**
 * BISA (Butir Instrumen Soal Analitik)
 * Main Application Controller & View Router
 */

(function () {
  'use strict';

  // State Aplikasi
  const state = {
    currentView: 'dashboard',
    profile: null,
    projects: [],
    currentProject: null,
    currentQuestions: [],
    currentStudents: [],
    currentAnalysisResult: null,
    activeWizardStep: 1,
    charts: {} // menyimpan instance Chart.js
  };

  // Helper Elemen DOM
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Helper Notifikasi Toast
  function showToast(message, type = 'success') {
    const container = $('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `<span style="font-weight:bold; font-size:16px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Router Tampilan
  function switchView(viewName, params = {}) {
    state.currentView = viewName;

    // Sembunyikan semua section view
    $$('.view-section').forEach(el => el.style.display = 'none');

    // Perbarui active nav item
    $$('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Perbarui breadcrumb
    const bcMap = {
      'dashboard': 'Dashboard Utama',
      'create-project': 'Buat Analisis Baru',
      'results-dashboard': 'Hasil Analisis Butir Soal',
      'my-projects': 'Daftar Analisis Saya',
      'my-profile': 'Profil Saya & Sekolah',
      'guide': 'Panduan & Rumus CTT'
    };
    if ($('breadcrumb-text')) {
      $('breadcrumb-text').textContent = bcMap[viewName] || 'Aplikasi BISA';
    }

    // Tampilkan view yang dipilih
    const targetEl = $(`view-${viewName}`);
    if (targetEl) {
      targetEl.style.display = 'block';
    }

    // Panggil handler spesifik view
    if (viewName === 'dashboard') {
      renderDashboard();
    } else if (viewName === 'create-project') {
      setupCreateProject(params.step || 1);
    } else if (viewName === 'results-dashboard') {
      renderResultsDashboard();
    } else if (viewName === 'my-projects') {
      renderMyProjects();
    } else if (viewName === 'my-profile') {
      renderProfileForm();
    } else if (viewName === 'guide') {
      // static guide
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // VIEW 1: DASHBOARD UTAMA
  // =========================================================================
  async function renderDashboard() {
    const projects = await BISADatabase.getAllProjects();
    state.projects = projects;

    // Hitung KPI
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'analyzed').length;

    let totalItemsAnalyzed = 0;
    for (const prj of projects) {
      const q = await BISADatabase.getQuestions(prj.id);
      totalItemsAnalyzed += q.length;
    }

    $('stat-total-projects').textContent = totalProjects;
    $('stat-completed-projects').textContent = completedProjects;
    $('stat-total-items').textContent = totalItemsAnalyzed;

    // Render Proyek Terbaru
    const recentContainer = $('recent-projects-list');
    if (projects.length === 0) {
      recentContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--gray-500);">
          <div style="font-size: 42px; margin-bottom: 12px; opacity: 0.6;">📁</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 6px;">Belum Ada Proyek Analisis</h3>
          <p style="font-size: 13px; max-width: 440px; margin: 0 auto 18px auto;">
            Mulai analisis pertama Anda dengan tombol di bawah, atau muat data contoh siap pakai untuk melihat fitur BISA.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="window.BISAApp.startNewProject()">
              + Buat Analisis Baru
            </button>
            <button class="btn btn-secondary" onclick="window.BISAApp.loadSampleData('SMP')">
              ⚡ Muat Contoh SMP (IPA)
            </button>
            <button class="btn btn-secondary" onclick="window.BISAApp.loadSampleData('SD')">
              ⚡ Muat Contoh SD (Matematika)
            </button>
          </div>
        </div>
      `;
    } else {
      let html = `
        <table class="data-table-ui">
          <thead>
            <tr>
              <th>Nama Analisis</th>
              <th>Mata Pelajaran</th>
              <th>Kelas / Jenjang</th>
              <th>Semester / TA</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
      `;

      projects.slice(0, 6).forEach(prj => {
        const isAnalyzed = prj.status === 'analyzed';
        const badgeClass = isAnalyzed ? 'badge-success' : 'badge-warning';
        const statusText = isAnalyzed ? 'Selesai Dianalisis' : 'Draft / Belum Dianalisis';

        html += `
          <tr>
            <td>
              <strong>${prj.name}</strong><br>
              <small style="color: var(--gray-500);">${prj.schoolName || ''}</small>
            </td>
            <td>${prj.subject}</td>
            <td><span class="badge badge-teal">${prj.gradeLevel}</span> ${prj.gradeClass}</td>
            <td>${prj.semester} ${prj.academicYear}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>
              <div style="display: flex; gap: 6px;">
                ${isAnalyzed ? `
                  <button class="btn btn-primary btn-sm" onclick="window.BISAApp.openProjectResults('${prj.id}')">
                    📊 Hasil
                  </button>
                ` : `
                  <button class="btn btn-primary btn-sm" onclick="window.BISAApp.resumeProject('${prj.id}')">
                    Lanjutkan
                  </button>
                `}
                <button class="btn btn-secondary btn-sm" onclick="window.BISAApp.openEditProject('${prj.id}')">
                  Edit
                </button>
                <button class="btn btn-secondary btn-sm" style="color: var(--danger-solid);" onclick="window.BISAApp.deleteProject('${prj.id}')">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      recentContainer.innerHTML = html;
    }
  }

  // =========================================================================
  // VIEW 2: BUAT & KELOLA PROYEK (WIZARD STEPS)
  // =========================================================================
  const EXAM_FORMAT_DESCRIPTIONS = {
    'mixed': {
      title: 'Model Campuran AKM (8 Format Lengkap)',
      desc: 'Paket asesmen komprehensif yang memadukan seluruh 8 ragam instrumen evaluasi modern: Pilihan Ganda Biasa, PG Kompleks Multi-Select, Kategori B/S, Menjodohkan, Isian Singkat, Sebab-Akibat, Analisis Informasi, dan Esai.'
    },
    'multiple_choice_4': {
      title: 'Pilihan Ganda Biasa 4 Opsi (A, B, C, D)',
      desc: 'Siswa memilih satu jawaban paling tepat dari 4 opsi (A–D). Standar baku jenjang SD & SMP, penskoran dikotomis (1 jika benar, 0 jika salah) disertai telaah efektivitas distraktor.'
    },
    'multiple_choice_5': {
      title: 'Pilihan Ganda Biasa 5 Opsi (A, B, C, D, E)',
      desc: 'Siswa memilih satu jawaban paling tepat dari 5 opsi (A–E). Standar baku jenjang SMP & SMA, penskoran dikotomis (1 jika benar, 0 jika salah) disertai telaah efektivitas distraktor.'
    },
    'complex_multiple_choice': {
      title: 'Pilihan Ganda Kompleks (Lebih dari Satu Jawaban Benar)',
      desc: 'Siswa dapat memilih lebih dari satu jawaban yang benar dari beberapa pilihan yang disajikan. Penskoran proporsional berbobot (skor parsial berdasarkan kecocokan).'
    },
    'category_table': {
      title: 'Pilihan Ganda Kompleks Kategori (Tabel Benar/Salah atau Ya/Tidak)',
      desc: 'Siswa menganalisis beberapa pernyataan sekaligus dalam bentuk tabel dan menentukan statusnya (Benar/Salah atau Ya/Tidak). Penskoran berdasarkan persentase kecocokan.'
    },
    'matching': {
      title: 'Soal Menjodohkan (Matching)',
      desc: 'Siswa memasangkan item premis di sebelah kiri dengan respon yang tepat di sebelah kanan (contoh format kunci: 1-B, 2-C, 3-A). Skor dihitung berbanding pasangan yang tepat.'
    },
    'short_answer': {
      title: 'Soal Isian Singkat',
      desc: 'Anda tidak memilih jawaban dari opsi yang tersedia, melainkan harus mengetikkan jawaban pendek secara langsung. Jawaban ini biasanya berupa angka (hasil perhitungan matematika) atau satu kata kunci yang pasti.'
    },
    'associative': {
      title: 'Soal Pilihan Ganda Asosiatif (Sebab-Akibat)',
      desc: 'Anda diberikan dua pernyataan yang terdiri dari "Pernyataan" dan "Alasan". Anda harus menganalisis apakah kedua pernyataan itu benar, serta apakah keduanya memiliki hubungan sebab-akibat (Opsi baku A, B, C, D, E).'
    },
    'information_analysis': {
      title: 'Soal Analisis Informasi (Pernyataan 1 dan 2)',
      desc: 'Anda diberikan sebuah pertanyaan matematika atau logika, diikuti oleh dua informasi tambahan (pernyataan 1 dan pernyataan 2). Anda harus menentukan apakah informasi tersebut cukup untuk menjawab pertanyaan yang diajukan (Opsi baku A, B, C, D, E).'
    },
    'essay': {
      title: 'Soal Esai / Uraian Bebas',
      desc: 'Siswa menuliskan uraian penjelasan dan jawaban komprehensif. Guru menginput nilai perolehan siswa sesuai rubrik penilaian sekolah.'
    }
  };

  function createDefaultQuestion(num, format, optsCount = 4) {
    const defaultOpts = optsCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
    let type = 'multiple_choice';
    let key = 'A';
    let minScore = 0;
    let maxScore = 1;
    let weight = 1;

    if (format === 'multiple_choice_4') {
      type = 'multiple_choice';
      key = 'A';
    } else if (format === 'multiple_choice_5') {
      type = 'multiple_choice';
      key = 'A';
      optsCount = 5;
    } else if (format === 'complex_multiple_choice') {
      type = 'complex_multiple_choice';
      key = 'A, C';
    } else if (format === 'category_table') {
      type = 'category_table';
      key = 'B, S, B';
    } else if (format === 'matching') {
      type = 'matching';
      key = '1-B, 2-C, 3-A';
    } else if (format === 'short_answer') {
      type = 'short_answer';
      key = num % 2 === 0 ? 'Fotosintesis' : '24';
    } else if (format === 'associative') {
      type = 'associative';
      key = 'A';
    } else if (format === 'information_analysis') {
      type = 'information_analysis';
      key = 'C';
    } else if (format === 'essay') {
      type = 'essay';
      key = '-';
      minScore = 0;
      maxScore = 10;
    } else if (format === 'mixed') {
      const pattern = [
        'multiple_choice',
        'complex_multiple_choice',
        'category_table',
        'matching',
        'short_answer',
        'associative',
        'information_analysis',
        'essay'
      ];
      type = pattern[(num - 1) % pattern.length];
      if (type === 'multiple_choice') key = 'A';
      else if (type === 'complex_multiple_choice') key = 'A, C';
      else if (type === 'category_table') key = 'B, S, B';
      else if (type === 'matching') key = '1-B, 2-C, 3-A';
      else if (type === 'short_answer') key = num % 2 === 0 ? 'Fotosintesis' : '24';
      else if (type === 'associative') key = 'A';
      else if (type === 'information_analysis') key = 'C';
      else if (type === 'essay') {
        key = '-';
        minScore = 0;
        maxScore = 10;
      }
    }

    return {
      id: `q${num}`,
      number: num,
      type: type,
      key: key,
      weight: weight,
      minScore: minScore,
      maxScore: maxScore,
      text: `Butir Soal Nomor ${num}`,
      options: [...defaultOpts]
    };
  }

  function onExamFormatChange() {
    const sel = $('select-exam-format');
    if (!sel) return;
    const val = sel.value;
    const info = EXAM_FORMAT_DESCRIPTIONS[val] || EXAM_FORMAT_DESCRIPTIONS['mixed'];
    if ($('exam-format-info-title')) $('exam-format-info-title').textContent = info.title;
    if ($('exam-format-info-desc')) $('exam-format-info-desc').textContent = info.desc;

    const optsCount = val === 'multiple_choice_5' ? 5 : 4;
    if ($('select-options-count')) $('select-options-count').value = optsCount;
    if (state.currentProject) {
      state.currentProject.optionsCount = optsCount;
      state.currentProject.examFormat = val;
    }

    // Perbarui butir soal jika form masih dalam mode buat baru
    if (!state.currentProject || state.currentProject.status !== 'analyzed') {
      const qCount = state.currentQuestions.length || 10;
      state.currentQuestions = [];
      for (let i = 1; i <= qCount; i++) {
        state.currentQuestions.push(createDefaultQuestion(i, val, optsCount));
      }
    }
  }

  function setWizardStep(stepNum) {
    state.activeWizardStep = stepNum;

    $$('.wizard-step').forEach((el, idx) => {
      const num = idx + 1;
      el.classList.remove('active', 'completed');
      if (num === stepNum) {
        el.classList.add('active');
      } else if (num < stepNum) {
        el.classList.add('completed');
      }
    });

    $('wizard-step-1').style.display = (stepNum === 1) ? 'block' : 'none';
    $('wizard-step-2').style.display = (stepNum === 2) ? 'block' : 'none';
    $('wizard-step-3').style.display = (stepNum === 3) ? 'block' : 'none';
  }

  async function setupCreateProject(step = 1) {
    setWizardStep(step);

    const profile = await BISADatabase.getProfile();
    state.profile = profile || {};

    if (!state.currentProject) {
      // Inisialisasi proyek baru dengan default profil guru
      const defaultFmt = state.profile.defaultExamFormat || 'mixed';
      const defaultOpts = defaultFmt === 'multiple_choice_5' ? 5 : (state.profile.gradeLevel === 'SD' ? 4 : 5);

      state.currentProject = {
        id: 'PRJ-' + Date.now(),
        name: '',
        schoolName: state.profile.schoolName || '',
        npsn: state.profile.npsn || '',
        gradeLevel: state.profile.gradeLevel || 'SMP',
        gradeClass: '',
        subject: '',
        semester: 'Ganjil',
        academicYear: '2025/2026',
        examType: 'Asesmen Sumatif Akhir Semester (SAS)',
        examFormat: defaultFmt,
        teacherName: state.profile.name || '',
        teacherNip: state.profile.nip || '',
        headmasterName: state.profile.headmasterName || '',
        headmasterNip: state.profile.headmasterNip || '',
        examDate: new Date().toISOString().split('T')[0],
        schoolCity: state.profile.city || '',
        optionsCount: defaultOpts
      };

      // Default 10 soal sesuai format yang dipilih
      state.currentQuestions = [];
      for (let i = 1; i <= 10; i++) {
        state.currentQuestions.push(createDefaultQuestion(i, defaultFmt, defaultOpts));
      }

      state.currentStudents = [];
    }

    // Isi form Step 1
    const p = state.currentProject;
    $('input-prj-name').value = p.name || '';
    $('input-school-name').value = p.schoolName || '';
    $('input-npsn').value = p.npsn || '';
    $('select-grade-level').value = p.gradeLevel || 'SMP';
    $('input-grade-class').value = p.gradeClass || '';
    $('input-subject').value = p.subject || '';
    $('select-semester').value = p.semester || 'Ganjil';
    $('input-academic-year').value = p.academicYear || '2025/2026';
    $('select-exam-type').value = p.examType || 'Asesmen Sumatif Akhir Semester (SAS)';
    $('input-teacher-name').value = p.teacherName || '';
    $('input-teacher-nip').value = p.teacherNip || '';
    $('input-headmaster-name').value = p.headmasterName || '';
    $('input-headmaster-nip').value = p.headmasterNip || '';
    $('input-exam-date').value = p.examDate || '';
    $('input-school-city').value = p.schoolCity || '';
    if ($('select-options-count')) $('select-options-count').value = p.optionsCount || 4;
    if ($('select-exam-format')) {
      $('select-exam-format').value = p.examFormat || 'mixed';
      const info = EXAM_FORMAT_DESCRIPTIONS[p.examFormat || 'mixed'] || EXAM_FORMAT_DESCRIPTIONS['mixed'];
      if ($('exam-format-info-title')) $('exam-format-info-title').textContent = info.title;
      if ($('exam-format-info-desc')) $('exam-format-info-desc').textContent = info.desc;
    }

    if (step === 2) {
      renderQuestionsConfig();
    } else if (step === 3) {
      renderStudentGrid();
    }
  }

  // Simpan data Step 1 & Lanjut ke Step 2
  function saveStep1AndProceed() {
    const p = state.currentProject;
    p.name = $('input-prj-name').value.trim();
    p.schoolName = $('input-school-name').value.trim();
    p.npsn = $('input-npsn').value.trim();
    p.gradeLevel = $('select-grade-level').value;
    p.gradeClass = $('input-grade-class').value.trim();
    p.subject = $('input-subject').value.trim();
    p.semester = $('select-semester').value;
    p.academicYear = $('input-academic-year').value.trim();
    p.examType = $('select-exam-type').value;
    p.teacherName = $('input-teacher-name').value.trim();
    p.teacherNip = $('input-teacher-nip').value.trim();
    p.headmasterName = $('input-headmaster-name').value.trim();
    p.headmasterNip = $('input-headmaster-nip').value.trim();
    p.examDate = $('input-exam-date').value;
    p.schoolCity = $('input-school-city').value.trim();
    p.examFormat = $('select-exam-format') ? $('select-exam-format').value : (p.examFormat || 'mixed');
    p.optionsCount = p.examFormat === 'multiple_choice_5' ? 5 : 4;
    if ($('select-options-count')) $('select-options-count').value = p.optionsCount;

    if (step === 2) {
      renderQuestionsConfig();
    } else if (step === 3) {
      renderStudentGrid();
    }
  }

  // Simpan data Step 1 & Lanjut ke Step 2
  function saveStep1AndProceed() {
    const p = state.currentProject;
    p.name = $('input-prj-name').value.trim();
    p.schoolName = $('input-school-name').value.trim();
    p.npsn = $('input-npsn').value.trim();
    p.gradeLevel = $('select-grade-level').value;
    p.gradeClass = $('input-grade-class').value.trim();
    p.subject = $('input-subject').value.trim();
    p.semester = $('select-semester').value;
    p.academicYear = $('input-academic-year').value.trim();
    p.examType = $('select-exam-type').value;
    p.teacherName = $('input-teacher-name').value.trim();
    p.teacherNip = $('input-teacher-nip').value.trim();
    p.headmasterName = $('input-headmaster-name').value.trim();
    p.headmasterNip = $('input-headmaster-nip').value.trim();
    p.examDate = $('input-exam-date').value;
    p.schoolCity = $('input-school-city').value.trim();
    p.optionsCount = parseInt($('select-options-count').value, 10) || 4;

    if (!p.name) {
      p.name = `Analisis Butir ${p.subject || 'Soal'} ${p.gradeClass || ''}`;
    }

    if (!p.subject || !p.gradeClass) {
      showToast('Mohon lengkapi Mata Pelajaran dan Kelas.', 'warning');
      return;
    }

    setWizardStep(2);
    renderQuestionsConfig();
  }

  // Render Step 2: Konfigurasi Soal
  function renderQuestionsConfig() {
    $('badge-config-count').textContent = `${state.currentQuestions.length} Butir`;
    const container = $('questions-config-list');

    let html = `
      <div class="table-responsive">
        <table class="data-table-ui">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">No</th>
              <th style="width: 220px;">Format Soal (Kurikulum Merdeka / AKM)</th>
              <th style="width: 210px;">Kunci Jawaban / Pengaturan</th>
              <th style="width: 80px;">Bobot</th>
              <th>Teks / Stimulus Soal (Opsional)</th>
              <th style="width: 50px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
    `;

    const optsCount = state.currentProject.optionsCount || 4;
    const defaultOpts = optsCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

    state.currentQuestions.forEach((q, idx) => {
      const qType = q.type || 'multiple_choice';

      // Kontrol Input Kunci Spesifik per Format Soal
      let keyInputHtml = '';
      if (qType === 'essay') {
        keyInputHtml = `
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="number" class="form-control" style="width: 70px; padding: 4px 6px; font-size: 12px;" title="Skor Maksimum" value="${q.maxScore || 10}" min="1" max="100" onchange="window.BISAApp.updateQuestionField(${idx}, 'maxScore', this.value)">
            <span style="font-size: 11px; color: var(--gray-600); font-weight: 500;">Skor Maks</span>
          </div>
        `;
      } else if (qType === 'multiple_choice') {
        keyInputHtml = `
          <select class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px;" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
            ${defaultOpts.map(opt => `<option value="${opt}" ${q.key === opt ? 'selected' : ''}>Kunci: Opsi ${opt}</option>`).join('')}
          </select>
        `;
      } else if (qType === 'associative') {
        keyInputHtml = `
          <div>
            <select class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px;" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
              <option value="A" ${q.key === 'A' ? 'selected' : ''}>A: Benar-Benar-Sebab</option>
              <option value="B" ${q.key === 'B' ? 'selected' : ''}>B: Benar-Benar-Bukan Sebab</option>
              <option value="C" ${q.key === 'C' ? 'selected' : ''}>C: Benar-Salah</option>
              <option value="D" ${q.key === 'D' ? 'selected' : ''}>D: Salah-Benar</option>
              <option value="E" ${q.key === 'E' ? 'selected' : ''}>E: Salah-Salah</option>
            </select>
            <div style="font-size: 10px; color: #0f766e; margin-top: 2px;">Aturan baku Sebab-Akibat A–E</div>
          </div>
        `;
      } else if (qType === 'information_analysis') {
        keyInputHtml = `
          <div>
            <select class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px;" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
              <option value="A" ${q.key === 'A' ? 'selected' : ''}>A: Pernyataan (1) SAJA Cukup</option>
              <option value="B" ${q.key === 'B' ? 'selected' : ''}>B: Pernyataan (2) SAJA Cukup</option>
              <option value="C" ${q.key === 'C' ? 'selected' : ''}>C: DUA Pernyataan BERSAMA Cukup</option>
              <option value="D" ${q.key === 'D' ? 'selected' : ''}>D: (1) Cukup & (2) Cukup Sendiri</option>
              <option value="E" ${q.key === 'E' ? 'selected' : ''}>E: Keduanya TIDAK CUKUP</option>
            </select>
            <div style="font-size: 10px; color: #0284c7; margin-top: 2px;">Kecukupan Data (1 & 2)</div>
          </div>
        `;
      } else if (qType === 'complex_multiple_choice') {
        keyInputHtml = `
          <div>
            <input type="text" class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px; text-transform: uppercase;" placeholder="Contoh: A, C atau B, D" value="${q.key || 'A, C'}" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
            <div style="font-size: 10px; color: var(--gray-500); margin-top: 2px;">Pisahkan koma (mis: A, C)</div>
          </div>
        `;
      } else if (qType === 'category_table') {
        keyInputHtml = `
          <div>
            <input type="text" class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px; text-transform: uppercase;" placeholder="Contoh: B, S, B" value="${q.key || 'B, S, B'}" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
            <div style="font-size: 10px; color: var(--gray-500); margin-top: 2px;">Urutan Benar/Salah (mis: B, S, B)</div>
          </div>
        `;
      } else if (qType === 'matching') {
        keyInputHtml = `
          <div>
            <input type="text" class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px; text-transform: uppercase;" placeholder="Contoh: 1-C, 2-A, 3-B" value="${q.key || '1-C, 2-A, 3-B'}" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
            <div style="font-size: 10px; color: var(--gray-500); margin-top: 2px;">Pasangan (mis: 1-C, 2-A)</div>
          </div>
        `;
      } else if (qType === 'short_answer') {
        keyInputHtml = `
          <div>
            <input type="text" class="form-control" style="font-weight: bold; padding: 4px 8px; font-size: 12px;" placeholder="Kata kunci atau angka (mis: 25)" value="${q.key || ''}" onchange="window.BISAApp.updateQuestionField(${idx}, 'key', this.value)">
            <div style="font-size: 10px; color: var(--gray-500); margin-top: 2px;">Dukung angka atau kata kunci</div>
          </div>
        `;
      }

      html += `
        <tr>
          <td style="text-align: center; font-weight: bold; background: #fafafa;">${idx + 1}</td>
          <td>
            <select class="form-control" style="padding: 4px 8px; font-size: 12px; font-weight: 600;" onchange="window.BISAApp.changeQuestionType(${idx}, this.value)">
              <option value="multiple_choice" ${qType === 'multiple_choice' ? 'selected' : ''}>Pilihan Ganda Biasa (1 Jawaban)</option>
              <option value="complex_multiple_choice" ${qType === 'complex_multiple_choice' ? 'selected' : ''}>PG Kompleks (Multi-Jawaban Benar)</option>
              <option value="category_table" ${qType === 'category_table' ? 'selected' : ''}>PG Kompleks Kategori (Benar/Salah)</option>
              <option value="matching" ${qType === 'matching' ? 'selected' : ''}>Menjodohkan (Matching)</option>
              <option value="short_answer" ${qType === 'short_answer' ? 'selected' : ''}>Isian Singkat (Kata Kunci / Angka)</option>
              <option value="associative" ${qType === 'associative' ? 'selected' : ''}>PG Asosiatif (Sebab-Akibat A–E)</option>
              <option value="information_analysis" ${qType === 'information_analysis' ? 'selected' : ''}>Analisis Informasi (Pernyataan 1 & 2)</option>
              <option value="essay" ${qType === 'essay' ? 'selected' : ''}>Esai / Uraian</option>
            </select>
          </td>
          <td>
            ${keyInputHtml}
          </td>
          <td>
            <input type="number" class="form-control" style="width: 70px; padding: 4px 6px; font-size: 12px;" value="${q.weight || 1}" min="0.1" step="0.5" onchange="window.BISAApp.updateQuestionField(${idx}, 'weight', this.value)">
          </td>
          <td>
            <input type="text" class="form-control" style="padding: 4px 8px; font-size: 12px;" placeholder="Teks ringkas soal, KD, atau stimulus..." value="${q.text || ''}" onchange="window.BISAApp.updateQuestionField(${idx}, 'text', this.value)">
          </td>
          <td style="text-align: center;">
            <button class="btn btn-secondary btn-sm" style="color: var(--danger-solid); padding: 2px 6px;" title="Hapus Butir" onclick="window.BISAApp.deleteQuestionRow(${idx})">
              ✕
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  function addQuestionRow() {
    const newNum = state.currentQuestions.length + 1;
    const fmt = (state.currentProject && state.currentProject.examFormat) || 'mixed';
    const optsCount = (state.currentProject && state.currentProject.optionsCount) || 4;

    state.currentQuestions.push(createDefaultQuestion(newNum, fmt, optsCount));
    renderQuestionsConfig();
  }

  function deleteQuestionRow(idx) {
    if (state.currentQuestions.length <= 1) {
      showToast('Minimal harus ada 1 butir soal.', 'warning');
      return;
    }
    state.currentQuestions.splice(idx, 1);
    state.currentQuestions.forEach((q, i) => {
      q.number = i + 1;
    });
    renderQuestionsConfig();
  }

  function changeQuestionType(idx, newType) {
    const q = state.currentQuestions[idx];
    q.type = newType;

    if (newType === 'essay') {
      q.maxScore = 10;
      q.minScore = 0;
      q.key = '-';
    } else if (newType === 'complex_multiple_choice') {
      q.key = 'A, C';
      q.maxScore = 1;
      q.minScore = 0;
    } else if (newType === 'category_table') {
      q.key = 'B, S, B';
      q.maxScore = 1;
      q.minScore = 0;
    } else if (newType === 'matching') {
      q.key = '1-C, 2-A, 3-B';
      q.maxScore = 1;
      q.minScore = 0;
    } else if (newType === 'short_answer') {
      q.key = 'jawaban';
      q.maxScore = 1;
      q.minScore = 0;
    } else if (newType === 'associative') {
      q.key = 'A';
      q.maxScore = 1;
      q.minScore = 0;
      q.options = ['A', 'B', 'C', 'D', 'E'];
    } else if (newType === 'information_analysis') {
      q.key = 'C';
      q.maxScore = 1;
      q.minScore = 0;
      q.options = ['A', 'B', 'C', 'D', 'E'];
    } else {
      q.key = 'A';
      q.maxScore = 1;
      q.minScore = 0;
      const optsCount = state.currentProject.optionsCount || 4;
      q.options = optsCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
    }
    renderQuestionsConfig();
  }

  function updateQuestionField(idx, field, val) {
    const q = state.currentQuestions[idx];
    if (field === 'weight' || field === 'maxScore' || field === 'minScore') {
      q[field] = parseFloat(val) || 0;
    } else {
      q[field] = val;
    }
  }

  function bulkSetQuestionsCount(count) {
    const targetCount = parseInt(count, 10);
    if (isNaN(targetCount) || targetCount < 1) return;

    const fmt = (state.currentProject && state.currentProject.examFormat) || 'mixed';
    const optsCount = (state.currentProject && state.currentProject.optionsCount) || 4;

    if (targetCount > state.currentQuestions.length) {
      const diff = targetCount - state.currentQuestions.length;
      for (let i = 0; i < diff; i++) {
        const num = state.currentQuestions.length + 1;
        state.currentQuestions.push(createDefaultQuestion(num, fmt, optsCount));
      }
    } else if (targetCount < state.currentQuestions.length) {
      state.currentQuestions = state.currentQuestions.slice(0, targetCount);
    }
    renderQuestionsConfig();
  }

  // Simpan Step 2 & Lanjut ke Step 3
  function saveStep2AndProceed() {
    if (state.currentQuestions.length === 0) {
      showToast('Konfigurasi soal tidak boleh kosong.', 'warning');
      return;
    }
    setWizardStep(3);
    renderStudentGrid();
  }

  // Render Step 3: Input Jawaban Siswa (Editable Grid)
  function renderStudentGrid() {
    const questions = state.currentQuestions;
    const nQ = questions.length;

    // Jika siswa belum ada, buat 5 baris awal
    if (!state.currentStudents || state.currentStudents.length === 0) {
      state.currentStudents = [];
      for (let s = 1; s <= 5; s++) {
        state.currentStudents.push({
          studentNo: s,
          nisn: `008123450${s}`,
          name: `Siswa ${s}`,
          answers: new Array(nQ).fill('')
        });
      }
    }

    $('student-count-badge').textContent = `${state.currentStudents.length} Siswa`;

    const container = $('student-grid-container');

    let html = `
      <div class="editable-grid-container">
        <table class="editable-grid">
          <thead>
            <tr>
              <th style="width: 45px;">No</th>
              <th style="width: 120px;">NISN</th>
              <th style="width: 200px; text-align: left; padding-left: 8px;">Nama Siswa</th>
    `;

    questions.forEach((q, qIdx) => {
      const qType = q.type || 'multiple_choice';
      let typeLabel = 'PG';
      let typeColor = '#0f766e';

      if (qType === 'essay') { typeLabel = 'Esai'; typeColor = '#0284c7'; }
      else if (qType === 'complex_multiple_choice') { typeLabel = 'Multi'; typeColor = '#7c3aed'; }
      else if (qType === 'category_table') { typeLabel = 'B/S'; typeColor = '#0369a1'; }
      else if (qType === 'matching') { typeLabel = 'Jodoh'; typeColor = '#0d9488'; }
      else if (qType === 'short_answer') { typeLabel = 'Isian'; typeColor = '#d97706'; }
      else if (qType === 'associative') { typeLabel = 'Sebab'; typeColor = '#059669'; }
      else if (qType === 'information_analysis') { typeLabel = 'Info'; typeColor = '#2563eb'; }

      html += `
        <th style="min-width: 65px;" title="Soal ${qIdx + 1} (${typeLabel} - Kunci: ${q.key || '-'})">
          S${qIdx + 1}<br>
          <span style="font-size: 9.5px; color: ${typeColor}; font-weight: bold;">
            ${typeLabel} (${qType === 'essay' ? (q.maxScore || 10) : (q.key || '-')})
          </span>
        </th>
      `;
    });

    html += `
              <th style="width: 40px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
    `;

    state.currentStudents.forEach((st, sIdx) => {
      html += `
        <tr>
          <td style="font-weight: bold; background: #f8fafc;">${sIdx + 1}</td>
          <td>
            <input type="text" class="grid-input" value="${st.nisn || ''}" onchange="window.BISAApp.updateStudentField(${sIdx}, 'nisn', this.value)">
          </td>
          <td>
            <input type="text" class="grid-input grid-input-name" value="${st.name || ''}" onchange="window.BISAApp.updateStudentField(${sIdx}, 'name', this.value)">
          </td>
      `;

      questions.forEach((q, qIdx) => {
        const qType = q.type || 'multiple_choice';
        const ansVal = st.answers[qIdx] !== undefined ? st.answers[qIdx] : '';

        if (qType === 'essay') {
          html += `
            <td>
              <input type="number" 
                class="grid-input" 
                value="${ansVal}" 
                min="0"
                max="${q.maxScore || 10}"
                onfocus="this.select()"
                onchange="window.BISAApp.updateStudentAnswer(${sIdx}, ${qIdx}, this.value)">
            </td>
          `;
        } else if (qType === 'multiple_choice' || qType === 'associative' || qType === 'information_analysis') {
          html += `
            <td>
              <input type="text" 
                class="grid-input" 
                maxlength="1"
                style="text-transform: uppercase; font-weight: bold;"
                value="${ansVal}" 
                placeholder="A-E"
                onfocus="this.select()"
                oninput="this.value = this.value.toUpperCase()"
                onchange="window.BISAApp.updateStudentAnswer(${sIdx}, ${qIdx}, this.value)">
            </td>
          `;
        } else if (qType === 'short_answer') {
          html += `
            <td>
              <input type="text" 
                class="grid-input" 
                style="font-size: 11px; padding: 0 4px;"
                value="${ansVal}" 
                placeholder="Jawaban"
                onfocus="this.select()"
                onchange="window.BISAApp.updateStudentAnswer(${sIdx}, ${qIdx}, this.value)">
            </td>
          `;
        } else {
          // PGK Multi, Kategori B/S, Menjodohkan
          html += `
            <td>
              <input type="text" 
                class="grid-input" 
                style="text-transform: uppercase; font-size: 11px; padding: 0 2px;"
                value="${ansVal}" 
                placeholder="Respon"
                onfocus="this.select()"
                oninput="this.value = this.value.toUpperCase()"
                onchange="window.BISAApp.updateStudentAnswer(${sIdx}, ${qIdx}, this.value)">
            </td>
          `;
        }
      });

      html += `
          <td>
            <button class="btn btn-secondary btn-sm" style="color: var(--danger-solid); padding: 1px 5px; font-size: 11px;" onclick="window.BISAApp.deleteStudentRow(${sIdx})">
              ✕
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  function addStudentRow() {
    const newNo = state.currentStudents.length + 1;
    const nQ = state.currentQuestions.length;
    state.currentStudents.push({
      studentNo: newNo,
      nisn: '-',
      name: `Siswa Baru ${newNo}`,
      answers: new Array(nQ).fill('')
    });
    renderStudentGrid();
  }

  function deleteStudentRow(sIdx) {
    if (state.currentStudents.length <= 1) {
      showToast('Minimal harus ada 1 siswa.', 'warning');
      return;
    }
    state.currentStudents.splice(sIdx, 1);
    state.currentStudents.forEach((s, idx) => s.studentNo = idx + 1);
    renderStudentGrid();
  }

  function updateStudentField(sIdx, field, val) {
    state.currentStudents[sIdx][field] = val;
  }

  function updateStudentAnswer(sIdx, qIdx, val) {
    const q = state.currentQuestions[qIdx];
    if (q.type === 'essay') {
      const num = parseFloat(val);
      state.currentStudents[sIdx].answers[qIdx] = isNaN(num) ? 0 : num;
    } else if (q.type === 'short_answer') {
      state.currentStudents[sIdx].answers[qIdx] = val ? val.trim() : '';
    } else {
      state.currentStudents[sIdx].answers[qIdx] = val ? val.trim().toUpperCase() : '';
    }
  }

  // Handle Paste Matrix Data dari Excel / Spreadsheet
  function handlePasteMatrix() {
    navigator.clipboard.readText().then(clipText => {
      if (!clipText || clipText.trim() === '') {
        showToast('Papan klip (clipboard) kosong.', 'warning');
        return;
      }

      const lines = clipText.trim().split(/\r\n|\n/);
      if (lines.length === 0) return;

      const newStudents = [];
      const nQ = state.currentQuestions.length;

      lines.forEach((line, idx) => {
        const parts = line.split('\t');
        if (parts.length === 0 || parts.every(p => p.trim() === '')) return;

        let name = '';
        let nisn = '-';
        let answers = [];

        // Deteksi pola: jika kolom 0 angka (no), kolom 1 nama/nisn
        if (parts.length > 2 && /^\d+$/.test(parts[0].trim())) {
          nisn = parts[1].trim();
          name = parts[2].trim();
          answers = parts.slice(3);
        } else {
          name = parts[0].trim();
          answers = parts.slice(1);
        }

        // Pad answers sesuai jumlah butir
        const finalAns = [];
        for (let q = 0; q < nQ; q++) {
          finalAns.push(answers[q] !== undefined ? answers[q].trim().toUpperCase() : '');
        }

        newStudents.push({
          studentNo: newStudents.length + 1,
          nisn: nisn || '-',
          name: name || `Siswa ${idx + 1}`,
          answers: finalAns
        });
      });

      if (newStudents.length > 0) {
        state.currentStudents = newStudents;
        renderStudentGrid();
        showToast(`Berhasil menempel ${newStudents.length} baris data siswa dari Excel!`);
      }
    }).catch(err => {
      showToast('Gagal membaca papan klip. Pastikan Anda mengizinkan akses clipboard di browser.', 'error');
    });
  }

  // JALANKAN ANALISIS (RUN ANALYSIS)
  async function runStatisticalAnalysis() {
    if (state.currentStudents.length === 0) {
      showToast('Data siswa belum dimasukkan.', 'warning');
      return;
    }
    if (state.currentQuestions.length === 0) {
      showToast('Konfigurasi soal belum ditentukan.', 'warning');
      return;
    }

    try {
      showToast('Menghitung parameter psikometrik CTT...', 'warning');

      // Simpan Proyek ke Database
      state.currentProject.status = 'analyzed';
      const savedProject = await BISADatabase.saveProject(state.currentProject);
      await BISADatabase.saveQuestions(savedProject.id, state.currentQuestions);
      await BISADatabase.saveStudents(savedProject.id, state.currentStudents);

      // Jalankan Perhitungan CTT
      const analysisResult = CTTEngine.analyze(
        savedProject,
        state.currentQuestions,
        state.currentStudents
      );

      // Simpan Hasil
      await BISADatabase.saveAnalysisResult(savedProject.id, analysisResult);

      state.currentProject = savedProject;
      state.currentAnalysisResult = analysisResult;

      showToast('Analisis butir soal berhasil dihitung!');
      switchView('results-dashboard');
    } catch (err) {
      console.error('Error saat analisis:', err);
      showToast(`Gagal menjalankan analisis: ${err.message}`, 'error');
    }
  }

  // =========================================================================
  // VIEW 3: DASHBOARD HASIL ANALISIS (RESULTS DASHBOARD)
  // =========================================================================
  function renderResultsDashboard() {
    const p = state.currentProject;
    const res = state.currentAnalysisResult;

    if (!p || !res) {
      showToast('Belum ada data analisis yang aktif.', 'warning');
      switchView('dashboard');
      return;
    }

    // Header Metadata
    $('res-prj-name').textContent = p.name;
    $('res-prj-meta').textContent = `${p.schoolName} • ${p.subject} • ${p.gradeClass} (${p.gradeLevel}) • ${p.semester} ${p.academicYear}`;

    // KPI Cards
    const meta = res.metadata || {};
    const cs = res.classSummary || {};
    const rel = res.reliability || {};
    const sum = res.summary || {};

    $('res-stat-students').textContent = meta.nStudents || 0;
    $('res-stat-questions').textContent = meta.nQuestions || 0;
    $('res-stat-mean').textContent = cs.meanScore100 !== undefined ? cs.meanScore100.toFixed(1) : '0';
    $('res-stat-range').textContent = `Min: ${cs.minScore100 || 0} | Maks: ${cs.maxScore100 || 0}`;

    $('res-stat-reliability').textContent = rel.coefficient !== undefined ? rel.coefficient.toFixed(3) : '0.000';
    $('res-stat-rel-cat').textContent = `${rel.category || 'Tinggi'} (${rel.formulaUsed || 'KR-20'})`;

    $('res-stat-rec-keep').textContent = sum.recommendation?.pertahankan || 0;
    $('res-stat-rec-revise').textContent = sum.recommendation?.revisi || 0;
    $('res-stat-rec-discard').textContent = sum.recommendation?.buang || 0;

    // Render Charts
    renderAnalysisCharts(res);

    // Render Matrix Table
    renderItemMatrixTable(res.items);
  }

  function renderAnalysisCharts(res) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js belum dimuat.');
      return;
    }

    const sum = res.summary || {};

    // 1. Chart Tingkat Kesukaran (Donut)
    const ctxDiff = $('chart-difficulty')?.getContext('2d');
    if (ctxDiff) {
      if (state.charts.diff) state.charts.diff.destroy();
      state.charts.diff = new Chart(ctxDiff, {
        type: 'doughnut',
        data: {
          labels: ['Mudah', 'Sedang', 'Sukar'],
          datasets: [{
            data: [
              sum.difficulty?.mudah || 0,
              sum.difficulty?.sedang || 0,
              sum.difficulty?.sukar || 0
            ],
            backgroundColor: ['#10b981', '#0284c7', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 2. Chart Rekomendasi (Pie)
    const ctxRec = $('chart-recommendation')?.getContext('2d');
    if (ctxRec) {
      if (state.charts.rec) state.charts.rec.destroy();
      state.charts.rec = new Chart(ctxRec, {
        type: 'pie',
        data: {
          labels: ['Pertahankan', 'Revisi', 'Buang'],
          datasets: [{
            data: [
              sum.recommendation?.pertahankan || 0,
              sum.recommendation?.revisi || 0,
              sum.recommendation?.buang || 0
            ],
            backgroundColor: ['#15803d', '#f59e0b', '#dc2626'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 3. Chart Daya Pembeda (Bar)
    const ctxDisc = $('chart-discrimination')?.getContext('2d');
    if (ctxDisc) {
      if (state.charts.disc) state.charts.disc.destroy();
      const disc = sum.discrimination || {};
      state.charts.disc = new Chart(ctxDisc, {
        type: 'bar',
        data: {
          labels: ['Sangat Baik (≥0.4)', 'Baik (0.3-0.4)', 'Cukup (0.2-0.3)', 'Buruk (<0.2)'],
          datasets: [{
            label: 'Jumlah Butir',
            data: [
              disc.sangatBaik || 0,
              disc.baik || 0,
              disc.cukup || 0,
              disc.buruk || 0
            ],
            backgroundColor: ['#0f766e', '#14b8a6', '#f59e0b', '#ef4444'],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // 4. Chart Distribusi Nilai Siswa (Bar)
    const ctxScores = $('chart-score-dist')?.getContext('2d');
    if (ctxScores && res.students) {
      if (state.charts.scores) state.charts.scores.destroy();

      // Kelompokkan skor dalam interval
      const brackets = { '0-40': 0, '41-60': 0, '61-75': 0, '76-85': 0, '86-100': 0 };
      res.students.forEach(s => {
        const sc = s.score100 || 0;
        if (sc <= 40) brackets['0-40']++;
        else if (sc <= 60) brackets['41-60']++;
        else if (sc <= 75) brackets['61-75']++;
        else if (sc <= 85) brackets['76-85']++;
        else brackets['86-100']++;
      });

      state.charts.scores = new Chart(ctxScores, {
        type: 'bar',
        data: {
          labels: Object.keys(brackets),
          datasets: [{
            label: 'Jumlah Siswa',
            data: Object.values(brackets),
            backgroundColor: '#0284c7',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  // Render Tabel Matriks Butir Soal
  function renderItemMatrixTable(items) {
    const container = $('item-matrix-tbody');
    if (!container) return;

    const filterType = $('filter-item-type')?.value || 'ALL';
    const filterRec = $('filter-item-rec')?.value || 'ALL';
    const filterDiff = $('filter-item-diff')?.value || 'ALL';
    const searchQuery = ($('search-item-query')?.value || '').toLowerCase().trim();

    const filtered = items.filter(it => {
      if (filterType !== 'ALL' && it.type !== filterType) return false;
      if (filterRec !== 'ALL' && it.recommendation !== filterRec) return false;
      if (filterDiff !== 'ALL' && it.difficultyLevel !== filterDiff) return false;
      if (searchQuery !== '') {
        const matchesNo = String(it.number).includes(searchQuery);
        const matchesText = (it.text || '').toLowerCase().includes(searchQuery);
        if (!matchesNo && !matchesText) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 24px; color: var(--gray-500);">
            Tidak ditemukan butir soal yang sesuai filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(it => {
      let recBadge = 'badge-pertahankan';
      if (it.recommendation === 'REVISI') recBadge = 'badge-revisi';
      if (it.recommendation === 'BUANG') recBadge = 'badge-buang';
      if (it.recommendation === 'DATA KURANG') recBadge = 'badge-teal';

      html += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${it.number}</td>
          <td>
            <span class="badge ${it.typeBadge || 'badge-teal'}" style="font-size: 11px;">
              ${it.typeName || it.type}
            </span>
          </td>
          <td style="text-align: center; font-weight: bold; font-family: monospace; font-size: 11.5px;">${it.type === 'essay' ? '-' : it.key}</td>
          <td>
            <strong>${it.difficulty.toFixed(3)}</strong>
            <span class="badge ${it.difficultyBadge}" style="margin-left: 4px;">${it.difficultyCategory}</span>
          </td>
          <td>
            <strong>${it.discrimination.toFixed(3)}</strong>
            <span class="badge ${it.discriminationBadge}" style="margin-left: 4px;">${it.discriminationCategory}</span>
          </td>
          <td>
            <span>${it.rCorrected.toFixed(3)}</span>
            <span class="badge ${it.validityBadge}" style="margin-left: 4px;">${it.validityStatus}</span>
          </td>
          <td>
            <span class="badge ${recBadge}">${it.recommendation}</span>
          </td>
          <td style="font-size: 11.5px; color: var(--gray-600); max-width: 220px;">
            ${it.recommendationAction || '-'}
          </td>
          <td style="text-align: center;">
            <button class="btn btn-primary btn-sm" onclick="window.BISAApp.openItemDetailModal(${it.number})">
              🔍 Detail
            </button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = html;
  }

  // MODAL DETAIL BUTIR SOAL & DISTRAKTOR
  function openItemDetailModal(itemNumber) {
    const res = state.currentAnalysisResult;
    if (!res || !res.items) return;

    const item = res.items.find(i => i.number === itemNumber);
    if (!item) return;

    $('modal-item-title').textContent = `Telaah Mendalam Butir Soal Nomor ${item.number}`;
    $('modal-item-badge').className = `badge ${item.recommendationBadge}`;
    $('modal-item-badge').textContent = item.recommendation;

    // Isi Metrik Utama
    $('modal-item-diff').textContent = `${item.difficulty.toFixed(3)} (${item.difficultyCategory})`;
    $('modal-item-disc').textContent = `${item.discrimination.toFixed(3)} (${item.discriminationCategory})`;
    $('modal-item-val').textContent = `${item.rCorrected.toFixed(3)} [r-tabel: ${item.rTable.toFixed(3)}] (${item.validityStatus})`;
    $('modal-item-type').textContent = `${item.typeName || item.type} (Kunci: ${item.key || '-'})`;
    $('modal-item-text').textContent = item.text || '(Teks stimulus butir soal tidak diinput)';

    // Tambahkan Penjelasan Spesifik Format Soal
    let formatGuideHtml = '';
    if (item.type === 'associative') {
      formatGuideHtml = `
        <div style="margin-top: 8px; padding: 8px 12px; background: #f0fdfa; border-left: 3px solid #0f766e; border-radius: 4px; font-size: 11px; line-height: 1.4;">
          <strong>Pedoman Opsi Sebab-Akibat (Asosiatif):</strong><br>
          &bull; <strong>A</strong>: Pernyataan Benar, Alasan Benar, dan Berhubungan Sebab-Akibat.<br>
          &bull; <strong>B</strong>: Pernyataan Benar, Alasan Benar, tetapi TIDAK Berhubungan Sebab-Akibat.<br>
          &bull; <strong>C</strong>: Pernyataan Benar, Alasan Salah.<br>
          &bull; <strong>D</strong>: Pernyataan Salah, Alasan Benar.<br>
          &bull; <strong>E</strong>: Pernyataan dan Alasan keduanya Salah.
        </div>
      `;
    } else if (item.type === 'information_analysis') {
      formatGuideHtml = `
        <div style="margin-top: 8px; padding: 8px 12px; background: #eff6ff; border-left: 3px solid #2563eb; border-radius: 4px; font-size: 11px; line-height: 1.4;">
          <strong>Pedoman Opsi Analisis Informasi (Kecukupan Data 1 & 2):</strong><br>
          &bull; <strong>A</strong>: Pernyataan (1) SAJA cukup untuk menjawab pertanyaan, tetapi (2) SAJA tidak cukup.<br>
          &bull; <strong>B</strong>: Pernyataan (2) SAJA cukup untuk menjawab pertanyaan, tetapi (1) SAJA tidak cukup.<br>
          &bull; <strong>C</strong>: DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU pernyataan SAJA tidak cukup.<br>
          &bull; <strong>D</strong>: Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup.<br>
          &bull; <strong>E</strong>: Pernyataan (1) dan (2) TIDAK CUKUP untuk menjawab pertanyaan.
        </div>
      `;
    }
    const guideHost = $('modal-format-guide');
    if (guideHost) guideHost.innerHTML = formatGuideHtml;

    // Rekomendasi & Alasan
    const reasonsContainer = $('modal-item-reasons');
    reasonsContainer.innerHTML = item.recommendationReasons.map(r => `<li>${r}</li>`).join('');
    $('modal-item-action').textContent = item.recommendationAction || '-';

    // Rincian Distraktor / Pola Respon
    const distContainer = $('modal-distractor-container');
    const chartBox = $('modal-distractor-chart-box');
    const tableBox = $('modal-distractor-table');

    if (item.type !== 'essay' && item.distractorAnalysis) {
      distContainer.style.display = 'block';
      const da = item.distractorAnalysis;

      if (da.options && da.options.length > 0) {
        if (chartBox) chartBox.style.display = 'block';

        let dHtml = `
          <table class="data-table-ui" style="font-size: 12px; margin-top: 8px;">
            <thead>
              <tr>
                <th style="width: 50px;">Opsi</th>
                <th style="width: 70px;">Jumlah</th>
                <th style="width: 70px;">Persen</th>
                <th style="width: 90px;">Kel. Atas</th>
                <th style="width: 90px;">Kel. Bawah</th>
                <th style="width: 120px;">Status</th>
                <th>Catatan Efektivitas</th>
              </tr>
            </thead>
            <tbody>
        `;

        da.options.forEach(opt => {
          dHtml += `
            <tr style="${opt.isKey ? 'background-color: #f0fdfa;' : ''}">
              <td style="font-weight: bold; text-align: center;">${opt.option} ${opt.isKey ? '⭐' : ''}</td>
              <td style="text-align: center;">${opt.totalCount}</td>
              <td style="text-align: center;">${opt.percentage}%</td>
              <td style="text-align: center; color: #0284c7; font-weight: 600;">${opt.upperCount}</td>
              <td style="text-align: center; color: #e11d48; font-weight: 600;">${opt.lowerCount}</td>
              <td><span class="badge ${opt.badgeClass}">${opt.status}</span></td>
              <td style="font-size: 11px;">${opt.statusNote}</td>
            </tr>
          `;
        });

        dHtml += `</tbody></table>`;
        tableBox.innerHTML = dHtml;

        const ctxD = $('modal-distractor-chart')?.getContext('2d');
        if (ctxD) {
          if (state.charts.modalDist) state.charts.modalDist.destroy();
          state.charts.modalDist = new Chart(ctxD, {
            type: 'bar',
            data: {
              labels: da.options.map(o => `Opsi ${o.option}${o.isKey ? ' (Kunci)' : ''}`),
              datasets: [
                {
                  label: 'Kelompok Atas',
                  data: da.options.map(o => o.upperCount),
                  backgroundColor: '#0284c7',
                  borderRadius: 4
                },
                {
                  label: 'Kelompok Bawah',
                  data: da.options.map(o => o.lowerCount),
                  backgroundColor: '#ef4444',
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
              }
            }
          });
        }
      } else if (da.isAlternativeAnalysis) {
        // Pola Respon untuk Format Non-Opsi (Multi-select, B/S, Menjodohkan, Isian)
        if (chartBox) chartBox.style.display = 'none';

        tableBox.innerHTML = `
          <div style="background: #fafafa; border: 1px solid var(--gray-200); border-radius: 6px; padding: 12px; margin-top: 8px;">
            <div style="font-weight: bold; font-size: 12.5px; margin-bottom: 8px; color: var(--gray-800);">
              📈 Rincian Distribusi Respon Peserta Didik:
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 4px;">
                <div style="font-size: 11px; color: #065f46; font-weight: 600;">Skor Penuh (100% Benar)</div>
                <div style="font-size: 16px; font-weight: bold; color: #059669; margin-top: 2px;">${da.fullScoreCount} siswa</div>
              </div>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 4px;">
                <div style="font-size: 11px; color: #1e40af; font-weight: 600;">Skor Parsial (Sebagian)</div>
                <div style="font-size: 16px; font-weight: bold; color: #2563eb; margin-top: 2px;">${da.partialScoreCount} siswa</div>
              </div>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 8px; border-radius: 4px;">
                <div style="font-size: 11px; color: #991b1b; font-weight: 600;">Salah Total (Skor 0)</div>
                <div style="font-size: 16px; font-weight: bold; color: #dc2626; margin-top: 2px;">${da.zeroScoreCount} siswa</div>
              </div>
            </div>
            <div style="font-size: 11.5px; color: var(--gray-600); margin-top: 8px;">
              Kunci Instrumen Terdaftar: <strong style="color: #0f766e;">${da.key}</strong>
            </div>
          </div>
        `;
      }
    } else {
      distContainer.style.display = 'none';
    }

    $('modal-item-detail').classList.add('show');
  }

  function closeItemDetailModal() {
    $('modal-item-detail').classList.remove('show');
  }

  // =========================================================================
  // VIEW 4: DAFTAR ANALISIS SAYA
  // =========================================================================
  async function renderMyProjects() {
    const projects = await BISADatabase.getAllProjects();
    state.projects = projects;
    const container = $('all-projects-list');

    if (projects.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--gray-500);">
          <div style="font-size: 36px; margin-bottom: 8px;">📂</div>
          <p>Belum ada proyek analisis tersimpan.</p>
        </div>
      `;
      return;
    }

    let html = `
      <table class="data-table-ui">
        <thead>
          <tr>
            <th>Nama Analisis</th>
            <th>Sekolah</th>
            <th>Mata Pelajaran</th>
            <th>Kelas</th>
            <th>Status</th>
            <th>Tanggal Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;

    projects.forEach(p => {
      const isAnalyzed = p.status === 'analyzed';
      html += `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.schoolName || '-'}</td>
          <td>${p.subject}</td>
          <td><span class="badge badge-teal">${p.gradeLevel}</span> ${p.gradeClass}</td>
          <td><span class="badge ${isAnalyzed ? 'badge-success' : 'badge-warning'}">${isAnalyzed ? 'Selesai' : 'Draft'}</span></td>
          <td style="font-size: 11.5px; color: var(--gray-500);">${new Date(p.updatedAt).toLocaleDateString('id-ID')}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${isAnalyzed ? `
                <button class="btn btn-primary btn-sm" onclick="window.BISAApp.openProjectResults('${p.id}')">
                  📊 Hasil
                </button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="window.BISAApp.resumeProject('${p.id}')">
                  Lanjutkan
                </button>
              `}
              <button class="btn btn-secondary btn-sm" onclick="window.BISAApp.openEditProject('${p.id}')">
                Edit
              </button>
              <button class="btn btn-secondary btn-sm" style="color: var(--danger-solid);" onclick="window.BISAApp.deleteProject('${p.id}')">
                Hapus
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // Buka Hasil Proyek
  async function openProjectResults(projectId) {
    const p = await BISADatabase.getProjectById(projectId);
    const res = await BISADatabase.getAnalysisResult(projectId);

    if (!p || !res) {
      showToast('Data hasil analisis tidak ditemukan.', 'error');
      return;
    }

    state.currentProject = p;
    state.currentAnalysisResult = res;
    switchView('results-dashboard');
  }

  // Lanjutkan / Edit Proyek
  async function openEditProject(projectId) {
    const p = await BISADatabase.getProjectById(projectId);
    const q = await BISADatabase.getQuestions(projectId);
    const s = await BISADatabase.getStudents(projectId);

    if (!p) return;
    state.currentProject = p;
    state.currentQuestions = q || [];
    state.currentStudents = s || [];

    switchView('create-project', { step: 1 });
  }

  async function deleteProject(projectId) {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek analisis ini beserta seluruh data butir dan jawaban siswanya?')) {
      return;
    }

    await BISADatabase.deleteProject(projectId);
    showToast('Proyek berhasil dihapus.');
    if (state.currentView === 'my-projects') {
      renderMyProjects();
    } else {
      renderDashboard();
    }
  }

  // =========================================================================
  // VIEW 5: PROFIL GURU & SEKOLAH
  // =========================================================================
  async function renderProfileForm() {
    const profile = await BISADatabase.getProfile();
    state.profile = profile || {};

    $('prof-name').value = profile.name || '';
    $('prof-email').value = profile.email || '';
    $('prof-nip').value = profile.nip || '';
    $('prof-school').value = profile.schoolName || '';
    $('prof-npsn').value = profile.npsn || '';
    $('prof-level').value = profile.gradeLevel || 'SMP';
    $('prof-address').value = profile.address || '';
    $('prof-city').value = profile.city || '';
    $('prof-headmaster').value = profile.headmasterName || '';
    $('prof-headmaster-nip').value = profile.headmasterNip || '';
    if ($('prof-options-count')) {
      $('prof-options-count').value = profile.defaultExamFormat || (profile.defaultOptionsCount === 5 ? 'multiple_choice_5' : 'mixed');
    }
  }

  async function saveProfile() {
    const profFmt = $('prof-options-count') ? $('prof-options-count').value : 'mixed';
    const optsCount = profFmt === 'multiple_choice_5' ? 5 : 4;
    const updated = {
      name: $('prof-name').value.trim(),
      email: $('prof-email').value.trim(),
      nip: $('prof-nip').value.trim(),
      schoolName: $('prof-school').value.trim(),
      npsn: $('prof-npsn').value.trim(),
      gradeLevel: $('prof-level').value,
      address: $('prof-address').value.trim(),
      city: $('prof-city').value.trim(),
      headmasterName: $('prof-headmaster').value.trim(),
      headmasterNip: $('prof-headmaster-nip').value.trim(),
      defaultExamFormat: profFmt,
      defaultOptionsCount: optsCount
    };

    await BISADatabase.saveProfile(updated);
    state.profile = updated;

    // Perbarui footer snippet
    if ($('sidebar-user-name')) $('sidebar-user-name').textContent = updated.name;
    if ($('sidebar-user-school')) $('sidebar-user-school').textContent = updated.schoolName;

    showToast('Profil guru dan sekolah berhasil disimpan!');
  }

  // =========================================================================
  // MUAT CONTOH DATA (SAMPLE DATA LOADERS)
  // =========================================================================
  async function loadSampleData(datasetType = 'SMP') {
    showToast(`Memuat data contoh asesmen ${datasetType}...`, 'warning');

    let prj = null;
    let questions = [];
    let students = [];

    if (datasetType === 'AKM') {
      prj = { ...BISASampleData.sampleProjectAKM, id: 'PRJ-AKM-' + Date.now() };
      questions = [...BISASampleData.sampleQuestionsAKM];
      students = [...BISASampleData.sampleStudentsAKM];
    } else if (datasetType === 'SD') {
      prj = { ...BISASampleData.sampleProjectSD, id: 'PRJ-SD-' + Date.now() };
      questions = [...BISASampleData.sampleQuestionsSD];
      students = [...BISASampleData.sampleStudentsSD];
    } else {
      prj = { ...BISASampleData.sampleProjectSMP, id: 'PRJ-SMP-' + Date.now() };
      questions = [...BISASampleData.sampleQuestionsSMP];
      students = [...BISASampleData.sampleStudentsSMP];
    }

    // Simpan ke DB
    prj.status = 'analyzed';
    const savedPrj = await BISADatabase.saveProject(prj);
    await BISADatabase.saveQuestions(savedPrj.id, questions);
    await BISADatabase.saveStudents(savedPrj.id, students);

    // Hitung analisis CTT
    const result = CTTEngine.analyze(savedPrj, questions, students);
    await BISADatabase.saveAnalysisResult(savedPrj.id, result);

    state.currentProject = savedPrj;
    state.currentQuestions = questions;
    state.currentStudents = students;
    state.currentAnalysisResult = result;

    showToast(`Data contoh ${datasetType} berhasil dimuat dan dianalisis!`);
    switchView('results-dashboard');
  }

  // =========================================================================
  // MODAL UPLOAD EXCEL DENGAN PREVIEW & VALIDASI
  // =========================================================================
  function openUploadModal() {
    $('modal-upload-excel').classList.add('show');
    $('excel-file-input').value = '';
    $('upload-preview-area').innerHTML = '';
    $('btn-confirm-import').disabled = true;
  }

  function closeUploadModal() {
    $('modal-upload-excel').classList.remove('show');
  }

  async function handleExcelFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      showToast('Membaca dan memvalidasi file Excel...', 'warning');
      const validation = await BISAExcel.parseAndValidate(file, state.currentProject, state.currentQuestions);

      renderUploadValidationPreview(validation);
    } catch (err) {
      showToast(`Gagal membaca file: ${err.message}`, 'error');
    }
  }

  function renderUploadValidationPreview(val) {
    const previewEl = $('upload-preview-area');
    state.pendingImportStudents = val.students;

    let html = `
      <div style="margin-bottom: 14px; padding: 12px; background: ${val.isValid ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${val.isValid ? '#a7f3d0' : '#fecaca'}; border-radius: 6px;">
        <div style="font-weight: bold; color: ${val.isValid ? '#065f46' : '#991b1b'}; display: flex; align-items: center; gap: 8px;">
          <span>${val.isValid ? '✓ File Siap Diimpor' : '⚠ Ditemukan Kesalahan Validasi'}</span>
        </div>
        <div style="font-size: 12px; margin-top: 4px; color: var(--gray-700);">
          Terbaca: <strong>${val.totalStudents} siswa</strong> &bull; Jumlah butir: <strong>${val.totalQuestionsExpected} butir</strong>
        </div>
      </div>
    `;

    if (val.errors && val.errors.length > 0) {
      html += `
        <div style="margin-bottom: 12px; font-size: 12px; color: var(--danger-solid);">
          <strong>Daftar Kesalahan (Wajib Diperbaiki):</strong>
          <ul style="margin: 4px 0 0 16px;">
            ${val.errors.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (val.warnings && val.warnings.length > 0) {
      html += `
        <div style="margin-bottom: 12px; font-size: 12px; color: #b45309;">
          <strong>Peringatan / Catatan:</strong>
          <ul style="margin: 4px 0 0 16px;">
            ${val.warnings.slice(0, 5).map(w => `<li>${w}</li>`).join('')}
            ${val.warnings.length > 5 ? `<li>... dan ${val.warnings.length - 5} catatan lainnya.</li>` : ''}
          </ul>
        </div>
      `;
    }

    // Pratinjau 3 baris siswa
    html += `
      <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Pratinjau Data Siswa:</div>
      <div class="table-responsive" style="max-height: 200px;">
        <table class="data-table-ui" style="font-size: 11.5px;">
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Respon Jawaban</th>
            </tr>
          </thead>
          <tbody>
    `;

    val.students.slice(0, 5).forEach(s => {
      html += `
        <tr>
          <td>${s.studentNo}</td>
          <td>${s.nisn}</td>
          <td><strong>${s.name}</strong></td>
          <td style="letter-spacing: 1px; font-family: monospace;">${s.answers.join(' ')}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    previewEl.innerHTML = html;

    $('btn-confirm-import').disabled = !val.isValid;
  }

  function confirmImport() {
    if (state.pendingImportStudents && state.pendingImportStudents.length > 0) {
      state.currentStudents = state.pendingImportStudents;
      renderStudentGrid();
      closeUploadModal();
      showToast(`Berhasil mengimpor ${state.currentStudents.length} siswa dari Excel!`);
    }
  }

  // Download Template Excel
  function downloadOfficialTemplate() {
    BISAExcel.generateTemplate(state.currentProject, state.currentQuestions);
    showToast('Template resmi BISA berhasil diunduh.');
  }

  // Cetak Laporan PDF
  function printPDFReport() {
    BISAPdfReport.generateAndPrint(state.currentProject, state.currentAnalysisResult);
  }

  // Ekspor Excel Hasil
  function exportExcelResults() {
    BISAExcel.exportResultsToExcel(state.currentProject, state.currentAnalysisResult);
  }

  // INISIALISASI SAAT HALAMAN SELESAI DIMUAT
  window.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi DB
    await BISADatabase.init();
    const profile = await BISADatabase.getProfile();
    state.profile = profile || {};

    if ($('sidebar-user-name') && profile) {
      $('sidebar-user-name').textContent = profile.name || 'Heriansyah, M.Pd.';
    }
    if ($('sidebar-user-school') && profile) {
      $('sidebar-user-school').textContent = profile.schoolName || 'SMP Negeri 1 Sidrap';
    }

    // Event listener navigasi sidebar
    $$('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Mulai di dashboard
    switchView('dashboard');
  });

  // Ekspor API Global untuk UI handler
  window.BISAApp = {
    switchView: switchView,
    startNewProject: () => {
      state.currentProject = null;
      state.currentQuestions = [];
      state.currentStudents = [];
      switchView('create-project', { step: 1 });
    },
    saveStep1AndProceed: saveStep1AndProceed,
    saveStep2AndProceed: saveStep2AndProceed,
    setWizardStep: setWizardStep,
    onExamFormatChange: onExamFormatChange,
    addQuestionRow: addQuestionRow,
    deleteQuestionRow: deleteQuestionRow,
    changeQuestionType: changeQuestionType,
    updateQuestionField: updateQuestionField,
    bulkSetQuestionsCount: bulkSetQuestionsCount,
    addStudentRow: addStudentRow,
    deleteStudentRow: deleteStudentRow,
    updateStudentField: updateStudentField,
    updateStudentAnswer: updateStudentAnswer,
    handlePasteMatrix: handlePasteMatrix,
    runStatisticalAnalysis: runStatisticalAnalysis,
    openProjectResults: openProjectResults,
    openEditProject: openEditProject,
    deleteProject: deleteProject,
    resumeProject: (id) => openEditProject(id),
    openItemDetailModal: openItemDetailModal,
    closeItemDetailModal: closeItemDetailModal,
    saveProfile: saveProfile,
    loadSampleData: loadSampleData,
    openUploadModal: openUploadModal,
    closeUploadModal: closeUploadModal,
    handleExcelFileSelected: handleExcelFileSelected,
    confirmImport: confirmImport,
    downloadOfficialTemplate: downloadOfficialTemplate,
    printPDFReport: printPDFReport,
    exportExcelResults: exportExcelResults,
    filterMatrix: () => {
      if (state.currentAnalysisResult) {
        renderItemMatrixTable(state.currentAnalysisResult.items);
      }
    }
  };
})();
