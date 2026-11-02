/**
 * BISA (Butir Instrumen Soal Analitik)
 * Production-ready Full-stack Backend Server
 * Runtimes: Node.js (with built-in node:sqlite, node:http, node:crypto)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const CTTEngine = require('./js/ctt-engine.js');
const SampleData = require('./js/sample-data.js');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'bisa_app.db');

// Inisialisasi Database SQLite
const db = new DatabaseSync(DB_FILE);

// Buat Skema Tabel Relasional
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'teacher',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    nip TEXT,
    school_name TEXT NOT NULL,
    npsn TEXT,
    grade_level TEXT DEFAULT 'SMP',
    address TEXT,
    city TEXT,
    headmaster_name TEXT,
    headmaster_nip TEXT,
    default_options_count INTEGER DEFAULT 4,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analysis_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    npsn TEXT,
    grade_level TEXT NOT NULL,
    grade_class TEXT NOT NULL,
    subject TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    teacher_nip TEXT,
    headmaster_name TEXT,
    headmaster_nip TEXT,
    exam_date TEXT,
    school_city TEXT,
    options_count INTEGER DEFAULT 4,
    status TEXT DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    number INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'multiple_choice',
    key TEXT,
    weight REAL DEFAULT 1.0,
    min_score REAL DEFAULT 0,
    max_score REAL DEFAULT 1,
    text TEXT,
    options_json TEXT,
    FOREIGN KEY(project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    student_no INTEGER NOT NULL,
    nisn TEXT,
    name TEXT NOT NULL,
    answers_json TEXT,
    FOREIGN KEY(project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analysis_results (
    project_id TEXT PRIMARY KEY,
    analyzed_at TEXT NOT NULL,
    results_json TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
  );
`);

// Pre-seed data default jika belum ada profile
const userCheck = db.prepare('SELECT id FROM user_profiles WHERE id = ?').get('user_default');
if (!userCheck) {
  const insertProfile = db.prepare(`
    INSERT INTO user_profiles (id, user_id, name, nip, school_name, npsn, grade_level, address, city, headmaster_name, headmaster_nip, default_options_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run(
    'user_default',
    'usr_01',
    'Heriansyah, S.Si., S.Pd., M.Pd.',
    '198205142008011007',
    'SMP Negeri 1 Sidrap',
    '40301234',
    'SMP',
    'Jl. Jenderal Sudirman No. 45',
    'Kab. Sidenreng Rappang',
    'Drs. H. Muhammad Aris, M.Pd.',
    '196803121994031005',
    4,
    new Date().toISOString()
  );

  // Seed sample project 1: SMP IPA
  const pSMP = SampleData.sampleProjectSMP;
  const insertPrj = db.prepare(`
    INSERT INTO analysis_projects (id, user_id, name, school_name, npsn, grade_level, grade_class, subject, semester, academic_year, exam_type, teacher_name, teacher_nip, headmaster_name, headmaster_nip, exam_date, school_city, options_count, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPrj.run(
    pSMP.id,
    'usr_01',
    pSMP.name,
    pSMP.schoolName,
    pSMP.npsn,
    pSMP.gradeLevel,
    pSMP.gradeClass,
    pSMP.subject,
    pSMP.semester,
    pSMP.academicYear,
    pSMP.examType,
    pSMP.teacherName,
    pSMP.teacherNip,
    pSMP.headmasterName,
    pSMP.headmasterNip,
    pSMP.examDate,
    pSMP.schoolCity,
    pSMP.optionsCount,
    'analyzed',
    new Date().toISOString(),
    new Date().toISOString()
  );

  // Seed questions
  const insertQ = db.prepare(`
    INSERT INTO questions (id, project_id, number, type, key, weight, min_score, max_score, text, options_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  SampleData.sampleQuestionsSMP.forEach(q => {
    insertQ.run(q.id, pSMP.id, q.number, q.type, q.key, q.weight, 0, 1, q.text, JSON.stringify(q.options));
  });

  // Seed students
  const insertS = db.prepare(`
    INSERT INTO students (id, project_id, student_no, nisn, name, answers_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  SampleData.sampleStudentsSMP.forEach(s => {
    insertS.run(`S_${s.studentNo}`, pSMP.id, s.studentNo, s.nisn, s.name, JSON.stringify(s.answers));
  });

  // Jalankan analisis awal
  const initResult = CTTEngine.analyze(pSMP, SampleData.sampleQuestionsSMP, SampleData.sampleStudentsSMP);
  const insertRes = db.prepare(`
    INSERT INTO analysis_results (project_id, analyzed_at, results_json)
    VALUES (?, ?, ?)
  `);
  insertRes.run(pSMP.id, initResult.analyzedAt, JSON.stringify(initResult));

  // Seed sample project 2: AKM 8 Format Lengkap
  if (SampleData.sampleProjectAKM) {
    const pAKM = SampleData.sampleProjectAKM;
    insertPrj.run(
      pAKM.id,
      'usr_01',
      pAKM.name,
      pAKM.schoolName,
      pAKM.npsn,
      pAKM.gradeLevel,
      pAKM.gradeClass,
      pAKM.subject,
      pAKM.semester,
      pAKM.academicYear,
      pAKM.examType,
      pAKM.teacherName,
      pAKM.teacherNip,
      pAKM.headmasterName,
      pAKM.headmasterNip,
      pAKM.examDate,
      pAKM.schoolCity,
      pAKM.optionsCount || 5,
      'analyzed',
      new Date().toISOString(),
      new Date().toISOString()
    );

    SampleData.sampleQuestionsAKM.forEach(q => {
      insertQ.run(q.id, pAKM.id, q.number, q.type, q.key, q.weight, q.minScore || 0, q.maxScore || 1, q.text, JSON.stringify(q.options || []));
    });

    SampleData.sampleStudentsAKM.forEach(s => {
      insertS.run(`S_AKM_${s.studentNo}`, pAKM.id, s.studentNo, s.nisn, s.name, JSON.stringify(s.answers));
    });

    const initResultAKM = CTTEngine.analyze(pAKM, SampleData.sampleQuestionsAKM, SampleData.sampleStudentsAKM);
    insertRes.run(pAKM.id, initResultAKM.analyzedAt, JSON.stringify(initResultAKM));
  }
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Helper JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Helper Parse Request Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // ----------------------------------------------------
    // REST API ENDPOINTS
    // ----------------------------------------------------
    if (pathname.startsWith('/api/')) {
      // 1. Health Check
      if (pathname === '/api/health' && req.method === 'GET') {
        sendJson(res, 200, { status: 'ok', serverTime: new Date().toISOString(), app: 'BISA' });
        return;
      }

      // 2. Profile
      if (pathname === '/api/profile') {
        if (req.method === 'GET') {
          const profile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get('user_default');
          sendJson(res, 200, profile || {});
          return;
        } else if (req.method === 'POST') {
          const data = await parseBody(req);
          db.prepare(`
            UPDATE user_profiles 
            SET name = ?, nip = ?, school_name = ?, npsn = ?, grade_level = ?, address = ?, city = ?, headmaster_name = ?, headmaster_nip = ?, default_options_count = ?, updated_at = ?
            WHERE id = ?
          `).run(
            data.name || '',
            data.nip || '',
            data.school_name || data.schoolName || '',
            data.npsn || '',
            data.grade_level || data.gradeLevel || 'SMP',
            data.address || '',
            data.city || '',
            data.headmaster_name || data.headmasterName || '',
            data.headmaster_nip || data.headmasterNip || '',
            data.default_options_count || data.defaultOptionsCount || 4,
            new Date().toISOString(),
            'user_default'
          );
          sendJson(res, 200, { success: true, message: 'Profil berhasil diperbarui' });
          return;
        }
      }

      // 3. Projects List & Create
      if (pathname === '/api/projects') {
        if (req.method === 'GET') {
          const projects = db.prepare('SELECT * FROM analysis_projects ORDER BY updated_at DESC').all();
          sendJson(res, 200, projects);
          return;
        } else if (req.method === 'POST') {
          const data = await parseBody(req);
          const prjId = data.id || ('PRJ-' + Date.now());
          const nowStr = new Date().toISOString();

          const existing = db.prepare('SELECT id FROM analysis_projects WHERE id = ?').get(prjId);
          if (existing) {
            db.prepare(`
              UPDATE analysis_projects
              SET name = ?, school_name = ?, npsn = ?, grade_level = ?, grade_class = ?, subject = ?, semester = ?, academic_year = ?, exam_type = ?, teacher_name = ?, teacher_nip = ?, headmaster_name = ?, headmaster_nip = ?, exam_date = ?, school_city = ?, options_count = ?, updated_at = ?
              WHERE id = ?
            `).run(
              data.name, data.schoolName || data.school_name, data.npsn, data.gradeLevel || data.grade_level,
              data.gradeClass || data.grade_class, data.subject, data.semester, data.academicYear || data.academic_year,
              data.examType || data.exam_type, data.teacherName || data.teacher_name, data.teacherNip || data.teacher_nip,
              data.headmasterName || data.headmaster_name, data.headmasterNip || data.headmaster_nip,
              data.examDate || data.exam_date, data.schoolCity || data.school_city,
              data.optionsCount || data.options_count || 4, nowStr, prjId
            );
          } else {
            db.prepare(`
              INSERT INTO analysis_projects (id, user_id, name, school_name, npsn, grade_level, grade_class, subject, semester, academic_year, exam_type, teacher_name, teacher_nip, headmaster_name, headmaster_nip, exam_date, school_city, options_count, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              prjId, 'usr_01', data.name, data.schoolName || data.school_name, data.npsn, data.gradeLevel || data.grade_level,
              data.gradeClass || data.grade_class, data.subject, data.semester, data.academicYear || data.academic_year,
              data.examType || data.exam_type, data.teacherName || data.teacher_name, data.teacherNip || data.teacher_nip,
              data.headmasterName || data.headmaster_name, data.headmasterNip || data.headmaster_nip,
              data.examDate || data.exam_date, data.schoolCity || data.school_city,
              data.optionsCount || data.options_count || 4, data.status || 'draft', nowStr, nowStr
            );
          }
          sendJson(res, 200, { success: true, id: prjId });
          return;
        }
      }

      // 4. Project Single: GET, DELETE
      const projectMatch = pathname.match(/^\/api\/projects\/([^\/]+)$/);
      if (projectMatch) {
        const prjId = projectMatch[1];
        if (req.method === 'GET') {
          const prj = db.prepare('SELECT * FROM analysis_projects WHERE id = ?').get(prjId);
          if (!prj) {
            sendJson(res, 404, { error: 'Proyek tidak ditemukan' });
            return;
          }
          const questions = db.prepare('SELECT * FROM questions WHERE project_id = ? ORDER BY number ASC').all();
          const students = db.prepare('SELECT * FROM students WHERE project_id = ? ORDER BY student_no ASC').all();
          const resultsRow = db.prepare('SELECT * FROM analysis_results WHERE project_id = ?').get(prjId);

          sendJson(res, 200, {
            project: prj,
            questions: questions.map(q => ({
              ...q,
              options: q.options_json ? JSON.parse(q.options_json) : ['A', 'B', 'C', 'D']
            })),
            students: students.map(s => ({
              ...s,
              answers: s.answers_json ? JSON.parse(s.answers_json) : []
            })),
            analysisResult: resultsRow ? JSON.parse(resultsRow.results_json) : null
          });
          return;
        } else if (req.method === 'DELETE') {
          db.prepare('DELETE FROM questions WHERE project_id = ?').run(prjId);
          db.prepare('DELETE FROM students WHERE project_id = ?').run(prjId);
          db.prepare('DELETE FROM analysis_results WHERE project_id = ?').run(prjId);
          db.prepare('DELETE FROM analysis_projects WHERE project_id = ?').run(prjId);
          sendJson(res, 200, { success: true, message: 'Proyek berhasil dihapus' });
          return;
        }
      }

      // 5. Run Analysis: POST /api/projects/:id/analyze
      const analyzeMatch = pathname.match(/^\/api\/projects\/([^\/]+)\/analyze$/);
      if (analyzeMatch && req.method === 'POST') {
        const prjId = analyzeMatch[1];
        const prj = db.prepare('SELECT * FROM analysis_projects WHERE id = ?').get(prjId);
        if (!prj) {
          sendJson(res, 404, { error: 'Proyek tidak ditemukan' });
          return;
        }

        const questionsRaw = db.prepare('SELECT * FROM questions WHERE project_id = ? ORDER BY number ASC').all();
        const studentsRaw = db.prepare('SELECT * FROM students WHERE project_id = ? ORDER BY student_no ASC').all();

        const questions = questionsRaw.map(q => ({
          ...q,
          options: q.options_json ? JSON.parse(q.options_json) : ['A', 'B', 'C', 'D']
        }));
        const students = studentsRaw.map(s => ({
          ...s,
          answers: s.answers_json ? JSON.parse(s.answers_json) : []
        }));

        const result = CTTEngine.analyze(prj, questions, students);

        // Simpan hasil ke analysis_results
        db.prepare(`
          INSERT INTO analysis_results (project_id, analyzed_at, results_json)
          VALUES (?, ?, ?)
          ON CONFLICT(project_id) DO UPDATE SET analyzed_at = excluded.analyzed_at, results_json = excluded.results_json
        `).run(prjId, result.analyzedAt, JSON.stringify(result));

        // Update status project
        db.prepare("UPDATE analysis_projects SET status = 'analyzed', updated_at = ? WHERE id = ?")
          .run(new Date().toISOString(), prjId);

        sendJson(res, 200, { success: true, analysisResult: result });
        return;
      }

      sendJson(res, 404, { error: 'Endpoint API tidak ditemukan' });
      return;
    }

    // ----------------------------------------------------
    // STATIC FILE SERVER
    // ----------------------------------------------------
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    filePath = path.normalize(filePath);

    // Mencegah directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Akses Ditolak');
      return;
    }

    // Cek file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`<h2>404 - Halaman Tidak Ditemukan</h2><p><a href="/">Kembali ke Beranda BISA</a></p>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });

  } catch (error) {
    console.error('Server Error:', error);
    sendJson(res, 500, { error: 'Terjadi kesalahan pada server', details: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 APLIKASI BISA (Butir Instrumen Soal Analitik) AKTIF`);
  console.log(`   URL Server : http://127.0.0.1:${PORT}`);
  console.log(`   Status DB  : SQLite Tersambung (${DB_FILE})`);
  console.log(`======================================================\n`);
});
