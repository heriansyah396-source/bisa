/**
 * BISA (Butir Instrumen Soal Analitik)
 * Professional A4 PDF Report Engine (Printable Official Document)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BISAPdfReport = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BISAPdfReport = {
    /**
     * Membuka dokumen laporan cetak A4 resmi di jendela baru atau tab cetak
     */
    generateAndPrint(project, analysisResult) {
      if (!project || !analysisResult) {
        alert('Data analisis belum lengkap untuk menghasilkan laporan.');
        return;
      }

      const p = project;
      const res = analysisResult;
      const meta = res.metadata || {};
      const cs = res.classSummary || {};
      const rel = res.reliability || {};
      const sum = res.summary || {};

      const now = new Date();
      const dateStr = p.examDate || now.toISOString().split('T')[0];
      const printDateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const cityName = p.schoolCity || 'Kab. Sidenreng Rappang';

      // Saring butir yang direvisi atau dibuang untuk telaah khusus
      const criticalItems = res.items.filter(it => it.recommendation === 'REVISI' || it.recommendation === 'BUANG');

      const reportHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Analisis Butir Soal BISA - ${p.subject} ${p.gradeClass}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Times New Roman', Times, serif, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 10.5pt;
      line-height: 1.35;
    }
    .print-toolbar {
      background: #0f766e;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 999;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .print-btn {
      background: #ffffff;
      color: #0f766e;
      border: none;
      padding: 8px 18px;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .print-btn:hover {
      background: #f0fdfa;
    }
    .report-sheet {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 10mm 15mm;
      background: #ffffff;
    }
    @media print {
      .print-toolbar {
        display: none !important;
      }
      .report-sheet {
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
      .page-break {
        page-break-before: always;
      }
    }

    /* KOP SEKOLAH RESMI */
    .kop-header {
      text-align: center;
      border-bottom: 3px double #1f2937;
      padding-bottom: 8px;
      margin-bottom: 16px;
      position: relative;
    }
    .kop-dinas {
      font-size: 12pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .kop-sekolah {
      font-size: 16pt;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 2px 0;
      text-transform: uppercase;
      color: #0f766e;
    }
    .kop-alamat {
      font-size: 8.5pt;
      font-style: italic;
      margin: 2px 0 0 0;
      color: #374151;
    }

    /* JUDUL LAPORAN */
    .report-title-box {
      text-align: center;
      margin-bottom: 16px;
    }
    .report-title {
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-subtitle {
      font-size: 9.5pt;
      margin-top: 4px;
      font-weight: 600;
      color: #4b5563;
    }

    /* TABEL IDENTITAS */
    .meta-table {
      width: 100%;
      margin-bottom: 14px;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .meta-table td {
      padding: 3px 6px;
      vertical-align: top;
    }
    .meta-table .label {
      width: 22%;
      font-weight: 600;
      color: #374151;
    }
    .meta-table .colon {
      width: 2%;
      text-align: center;
    }
    .meta-table .val {
      width: 26%;
      font-weight: 700;
      color: #111827;
    }

    /* RINGKASAN METRIK & KPI */
    .section-title {
      font-size: 10.5pt;
      font-weight: bold;
      background: #f1f5f9;
      padding: 5px 8px;
      border-left: 4px solid #0f766e;
      margin: 14px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
      background: #fafafa;
    }
    .kpi-label {
      font-size: 7.5pt;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
    }
    .kpi-val {
      font-size: 13pt;
      font-weight: bold;
      color: #0f766e;
      margin-top: 2px;
    }
    .kpi-sub {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 2px;
    }

    /* TABEL DATA */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-bottom: 14px;
    }
    .data-table th, .data-table td {
      border: 1px solid #94a3b8;
      padding: 4px 6px;
      text-align: center;
    }
    .data-table th {
      background: #f8fafc;
      font-weight: bold;
      color: #0f172a;
    }
    .data-table td.text-left {
      text-align: left;
    }
    .badge-pertahankan {
      background: #dcfce7;
      color: #15803d;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 7.5pt;
      display: inline-block;
    }
    .badge-revisi {
      background: #fef9c3;
      color: #a16207;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 7.5pt;
      display: inline-block;
    }
    .badge-buang {
      background: #fee2e2;
      color: #b91c1c;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 7.5pt;
      display: inline-block;
    }

    /* KESIMPULAN */
    .conclusion-box {
      border: 1px dashed #0f766e;
      background: #f0fdfa;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 8.5pt;
      margin-bottom: 16px;
    }

    /* LEMBAR PENGESAHAN */
    .signature-container {
      margin-top: 22px;
      width: 100%;
      display: table;
      font-size: 9.5pt;
    }
    .signature-col {
      display: table-cell;
      width: 50%;
      text-align: center;
      vertical-align: top;
    }
    .sig-space {
      height: 60px;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
    }
    .sig-nip {
      font-size: 8.5pt;
      color: #374151;
    }
    .footer-note {
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: right;
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
    }
  </style>
</head>
<body>

  <!-- BILAH AKSI CETAK (HANYA DITAMPILKAN DI LAYAR BUKAN DI KERTAS) -->
  <div class="print-toolbar">
    <div>
      <strong>Pratinjau Laporan Resmi BISA</strong> &mdash; Siap Cetak Format A4
    </div>
    <div>
      <button class="print-btn" onclick="window.print()">
        🖨️ Cetak / Simpan ke PDF
      </button>
      <button class="print-btn" style="margin-left: 8px; background: transparent; color: #fff; border: 1px solid #fff;" onclick="window.close()">
        Tutup
      </button>
    </div>
  </div>

  <div class="report-sheet">
    <!-- KOP RESMI SEKOLAH -->
    <div class="kop-header">
      <div class="kop-dinas">PEMERINTAH KABUPATEN SIDENRENG RAPPANG</div>
      <div class="kop-dinas">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
      <div class="kop-sekolah">${p.schoolName || 'SMP NEGERI 1 SIDRAP'}</div>
      <div class="kop-alamat">
        NPSN: ${p.npsn || '40301234'} &bull; Alamat: ${p.schoolCity || 'Kab. Sidenreng Rappang, Sulawesi Selatan'} &bull; Web: https://bisa.edtech.id
      </div>
    </div>

    <!-- JUDUL DOKUMEN -->
    <div class="report-title-box">
      <h1 class="report-title">LAPORAN ANALISIS KUALITAS BUTIR INSTRUMEN EVALUASI</h1>
      <div class="report-subtitle">
        Platform Digital BISA (Butir Instrumen Soal Analitik) &bull; Standar Classical Test Theory (CTT)
      </div>
    </div>

    <!-- IDENTITAS EVALUASI -->
    <table class="meta-table">
      <tr>
        <td class="label">Mata Pelajaran</td>
        <td class="colon">:</td>
        <td class="val">${p.subject || '-'}</td>
        <td class="label">Semester / TA</td>
        <td class="colon">:</td>
        <td class="val">${p.semester || 'Ganjil'} / ${p.academicYear || '2025/2026'}</td>
      </tr>
      <tr>
        <td class="label">Kelas / Rombel</td>
        <td class="colon">:</td>
        <td class="val">${p.gradeClass || '-'} (${p.gradeLevel || 'SMP'})</td>
        <td class="label">Jenis Asesmen</td>
        <td class="colon">:</td>
        <td class="val">${p.examType || 'Asesmen Sumatif'}</td>
      </tr>
      <tr>
        <td class="label">Guru Pengampu</td>
        <td class="colon">:</td>
        <td class="val">${p.teacherName || '-'}</td>
        <td class="label">Tanggal Pelaksanaan</td>
        <td class="colon">:</td>
        <td class="val">${dateStr}</td>
      </tr>
      <tr>
        <td class="label">NIP Guru</td>
        <td class="colon">:</td>
        <td class="val">${p.teacherNip || '-'}</td>
        <td class="label">Total Peserta / Soal</td>
        <td class="colon">:</td>
        <td class="val">${meta.nStudents || 0} Siswa / ${meta.nQuestions || 0} Butir</td>
      </tr>
    </table>

    <!-- RINGKASAN PSIKOMETRIK (KPI) -->
    <div class="section-title">I. Ringkasan Parameter Psikometrik & Reliabilitas Tes</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Koefisien Reliabilitas</div>
        <div class="kpi-val">${rel.coefficient !== undefined ? rel.coefficient.toFixed(3) : '0.000'}</div>
        <div class="kpi-sub">${rel.category || 'Tinggi'} (${rel.formulaUsed || 'KR-20'})</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Rata-rata Nilai (100)</div>
        <div class="kpi-val">${cs.meanScore100 !== undefined ? cs.meanScore100.toFixed(1) : '0.0'}</div>
        <div class="kpi-sub">Rentang: ${cs.minScore100 || 0} - ${cs.maxScore100 || 0}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Proporsi Kesukaran</div>
        <div class="kpi-val" style="font-size: 10.5pt; padding-top: 3px;">
          <span style="color:#0f766e">M:${sum.difficulty?.mudah || 0}</span> | 
          <span style="color:#0284c7">S:${sum.difficulty?.sedang || 0}</span> | 
          <span style="color:#e11d48">Sk:${sum.difficulty?.sukar || 0}</span>
        </div>
        <div class="kpi-sub">Mudah / Sedang / Sukar</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Status Rekomendasi</div>
        <div class="kpi-val" style="font-size: 10.5pt; padding-top: 3px;">
          <span style="color:#16a34a">P:${sum.recommendation?.pertahankan || 0}</span> | 
          <span style="color:#d97706">R:${sum.recommendation?.revisi || 0}</span> | 
          <span style="color:#dc2626">B:${sum.recommendation?.buang || 0}</span>
        </div>
        <div class="kpi-sub">Pertahankan / Revisi / Buang</div>
      </div>
    </div>

    <!-- TABEL REKAPITULASI SELURUH BUTIR SOAL -->
    <div class="section-title">II. Matriks Hasil Analisis Seluruh Butir Soal</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 5%">No</th>
          <th style="width: 7%">Tipe</th>
          <th style="width: 6%">Kunci</th>
          <th style="width: 14%">Kesukaran (P)</th>
          <th style="width: 14%">Daya Pembeda (D)</th>
          <th style="width: 14%">Validitas (r)</th>
          <th style="width: 13%">Rekomendasi</th>
          <th style="width: 27%">Tindak Lanjut Pedagogis</th>
        </tr>
      </thead>
      <tbody>
        ${res.items.map(it => {
          let recBadge = 'badge-pertahankan';
          if (it.recommendation === 'REVISI') recBadge = 'badge-revisi';
          if (it.recommendation === 'BUANG') recBadge = 'badge-buang';

          return `
            <tr>
              <td><strong>${it.number}</strong></td>
              <td><span style="font-size:7.5pt; font-weight:600;">${it.typeName || (it.type === 'essay' ? 'Esai' : 'PG')}</span></td>
              <td><strong>${it.type === 'essay' ? '-' : (it.key || '-')}</strong></td>
              <td>${it.difficulty.toFixed(3)}<br><small style="color:#475569">${it.difficultyCategory}</small></td>
              <td>${it.discrimination.toFixed(3)}<br><small style="color:#475569">${it.discriminationCategory}</small></td>
              <td>${it.rCorrected.toFixed(3)}<br><small style="color:${it.isValid ? '#15803d' : '#b91c1c'}">${it.validityStatus}</small></td>
              <td><span class="${recBadge}">${it.recommendation}</span></td>
              <td class="text-left" style="font-size: 7.5pt;">${it.recommendationAction || '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    ${criticalItems.length > 0 ? `
    <!-- TELAAH BUTIR KRITIS (REVISI & BUANG) -->
    <div class="page-break"></div>
    <div class="section-title">III. Rincian Telaah Butir Memerlukan Perbaikan / Dibuang</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 6%">No</th>
          <th style="width: 12%">Status</th>
          <th style="width: 42%">Faktor Penyebab & Kelemahan Statistik</th>
          <th style="width: 40%">Rekomendasi Revisi & Konstruksi Butir</th>
        </tr>
      </thead>
      <tbody>
        ${criticalItems.map(cit => `
          <tr>
            <td><strong>${cit.number}</strong></td>
            <td>
              <span class="${cit.recommendation === 'REVISI' ? 'badge-revisi' : 'badge-buang'}">${cit.recommendation}</span>
            </td>
            <td class="text-left" style="font-size: 8pt;">
              ${cit.recommendationReasons.map(r => `&bull; ${r}`).join('<br>')}
              ${cit.distractorAnalysis && cit.distractorIssue ? `
                <div style="margin-top: 4px; padding: 4px; background: #fff1f2; border-radius: 3px; font-size: 7.5pt;">
                  <strong>Pola Distribusi Opsi:</strong><br>
                  ${cit.distractorAnalysis.options.map(o => `${o.option}: ${o.totalCount} siswa (${o.percentage}%) [${o.status}]`).join(' | ')}
                </div>
              ` : ''}
            </td>
            <td class="text-left" style="font-size: 8pt;">
              ${cit.recommendationAction}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- KESIMPULAN & TINDAK LANJUT EVALUASI -->
    <div class="section-title">IV. Kesimpulan & Rekomendasi Tindak Lanjut Guru</div>
    <div class="conclusion-box">
      <strong>Catatan Evaluasi Guru:</strong>
      <ol style="margin: 4px 0 0 16px; padding: 0;">
        <li>Sebanyak <strong>${sum.recommendation?.pertahankan || 0} butir (${meta.nQuestions > 0 ? Math.round(((sum.recommendation?.pertahankan || 0) / meta.nQuestions) * 100) : 0}%)</strong> soal telah memenuhi standar psikometri dan layak diarsipkan ke dalam Bank Soal Satuan Pendidikan.</li>
        <li>Terdapat <strong>${sum.recommendation?.revisi || 0} butir</strong> yang memerlukan perbaikan redaksi atau opsi distraktor sebelum digunakan kembali.</li>
        <li>Terdapat <strong>${sum.recommendation?.buang || 0} butir</strong> yang tidak layak digunakan kembali karena memiliki daya pembeda negatif atau anomali respon siswa.</li>
        <li>Bagi peserta didik dengan nilai di bawah batas ketercapaian tujuan pembelajaran (KKTP), disarankan melaksanakan program remedial pada indikator soal nomor: 
          ${res.items.filter(i => i.difficulty < 0.40).map(i => i.number).join(', ') || 'N/A'}.
        </li>
      </ol>
    </div>

    <!-- PENGESAHAN DOKUMEN -->
    <div class="signature-container">
      <div class="signature-col">
        Mengetahui,<br>
        Kepala Sekolah ${p.schoolName || 'SMP Negeri 1 Sidrap'}<br>
        <div class="sig-space"></div>
        <div class="sig-name">${p.headmasterName || 'Drs. H. Muhammad Aris, M.Pd.'}</div>
        <div class="sig-nip">NIP. ${p.headmasterNip || '196803121994031005'}</div>
      </div>
      <div class="signature-col">
        ${cityName}, ${printDateStr}<br>
        Guru Mata Pelajaran,<br>
        <div class="sig-space"></div>
        <div class="sig-name">${p.teacherName || 'Heriansyah, S.Si., S.Pd., M.Pd.'}</div>
        <div class="sig-nip">NIP. ${p.teacherNip || '198205142008011007'}</div>
      </div>
    </div>

    <div class="footer-note">
      Dicetak secara otomatis melalui Platform BISA (Butir Instrumen Soal Analitik) &bull; Dokumen Portofolio Resmi Evaluasi Pembelajaran Guru
    </div>
  </div>

  <script>
    // Otomatis picu dialog cetak jika parameter auto=true
    window.onload = function() {
      // Tunggu render font & css
      setTimeout(function() {
        // window.print();
      }, 500);
    };
  </script>
</body>
</html>
      `;

      // Buka di jendela baru atau tab cetak
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(reportHtml);
        printWindow.document.close();
      } else {
        // Jika pop-up diblokir, tulis ke iframe tersembunyi
        let iframe = document.getElementById('bisa-print-frame');
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'bisa-print-frame';
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);
        }
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(reportHtml);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 500);
      }
    }
  };

  return BISAPdfReport;
}));
