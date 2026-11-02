/**
 * BISA (Butir Instrumen Soal Analitik)
 * Database & Storage Layer (IndexedDB with LocalStorage fallback & REST Sync)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BISADatabase = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DB_NAME = 'bisa_edtech_db';
  const DB_VERSION = 1;

  let idb = null;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        // Lingkungan non-browser (misal Node.js)
        resolve(null);
        return;
      }

      if (idb) {
        resolve(idb);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Store: users
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Store: profiles
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        // Store: projects
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Store: questions
        if (!db.objectStoreNames.contains('questions')) {
          const qStore = db.createObjectStore('questions', { keyPath: 'id' });
          qStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Store: students
        if (!db.objectStoreNames.contains('students')) {
          const sStore = db.createObjectStore('students', { keyPath: 'id' });
          sStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Store: analysisResults
        if (!db.objectStoreNames.contains('analysisResults')) {
          const resStore = db.createObjectStore('analysisResults', { keyPath: 'projectId' });
        }

        // Store: settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = function (event) {
        idb = event.target.result;
        resolve(idb);
      };

      request.onerror = function (event) {
        console.error('Gagal membuka IndexedDB BISA, beralih ke LocalStorage fallback:', event.target.error);
        resolve(null);
      };
    });
  }

  // Helper IndexedDB Transaction
  async function performTx(storeName, mode, callback) {
    const db = await openDatabase();
    if (!db) {
      // Fallback LocalStorage
      const localKey = `bisa_${storeName}`;
      const data = JSON.parse(localStorage.getItem(localKey) || '[]');
      return callback({ isFallback: true, data: data, storeName: storeName });
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result = null;

      callback(store, (res) => { result = res; });

      tx.oncomplete = () => resolve(result);
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  // API Storage Methods
  const BISADatabase = {
    // Inisialisasi Database & Default User
    async init() {
      await openDatabase();

      // Cek apakah sudah ada profile default
      const profile = await this.getProfile();
      if (!profile) {
        await this.saveProfile({
          id: 'user_default',
          name: 'Heriansyah, S.Si., S.Pd., M.Pd.',
          email: 'guru@bisa.kemdikbud.go.id',
          nip: '198205142008011007',
          schoolName: 'SMP Negeri 1 Sidrap',
          npsn: '40301234',
          gradeLevel: 'SMP',
          address: 'Jl. Jenderal Sudirman No. 45',
          city: 'Kab. Sidenreng Rappang',
          headmasterName: 'Drs. H. Muhammad Aris, M.Pd.',
          headmasterNip: '196803121994031005',
          defaultOptionsCount: 4,
          isLoggedIn: true
        });
      }
    },

    // PROFIL GURU & SEKOLAH
    async getProfile() {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const data = localStorage.getItem('bisa_profile');
            resolve(data ? JSON.parse(data) : null);
            return;
          }
          const tx = db.transaction('profiles', 'readonly');
          const store = tx.objectStore('profiles');
          const req = store.get('user_default');
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    async saveProfile(profileData) {
      profileData.id = 'user_default';
      profileData.updatedAt = new Date().toISOString();

      return new Promise(async (resolve, reject) => {
        try {
          const db = await openDatabase();
          if (!db) {
            localStorage.setItem('bisa_profile', JSON.stringify(profileData));
            resolve(profileData);
            return;
          }
          const tx = db.transaction('profiles', 'readwrite');
          const store = tx.objectStore('profiles');
          store.put(profileData);
          tx.oncomplete = () => {
            localStorage.setItem('bisa_profile', JSON.stringify(profileData));
            resolve(profileData);
          };
          tx.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    },

    // PROYEK ANALISIS
    async getAllProjects() {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const data = localStorage.getItem('bisa_projects');
            resolve(data ? JSON.parse(data) : []);
            return;
          }
          const tx = db.transaction('projects', 'readonly');
          const store = tx.objectStore('projects');
          const req = store.getAll();
          req.onsuccess = () => {
            const sorted = (req.result || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            resolve(sorted);
          };
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    },

    async getProjectById(projectId) {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const list = JSON.parse(localStorage.getItem('bisa_projects') || '[]');
            resolve(list.find(p => p.id === projectId) || null);
            return;
          }
          const tx = db.transaction('projects', 'readonly');
          const store = tx.objectStore('projects');
          const req = store.get(projectId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    async saveProject(project) {
      if (!project.id) {
        project.id = 'PRJ-' + Date.now();
      }
      project.updatedAt = new Date().toISOString();
      if (!project.createdAt) {
        project.createdAt = project.updatedAt;
      }

      return new Promise(async (resolve, reject) => {
        try {
          const db = await openDatabase();
          if (!db) {
            let list = JSON.parse(localStorage.getItem('bisa_projects') || '[]');
            const idx = list.findIndex(p => p.id === project.id);
            if (idx >= 0) list[idx] = project; else list.unshift(project);
            localStorage.setItem('bisa_projects', JSON.stringify(list));
            resolve(project);
            return;
          }
          const tx = db.transaction('projects', 'readwrite');
          const store = tx.objectStore('projects');
          store.put(project);
          tx.oncomplete = () => resolve(project);
          tx.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    },

    async deleteProject(projectId) {
      return new Promise(async (resolve, reject) => {
        try {
          const db = await openDatabase();
          if (!db) {
            let list = JSON.parse(localStorage.getItem('bisa_projects') || '[]');
            list = list.filter(p => p.id !== projectId);
            localStorage.setItem('bisa_projects', JSON.stringify(list));
            // Hapus juga relasi
            localStorage.removeItem(`bisa_questions_${projectId}`);
            localStorage.removeItem(`bisa_students_${projectId}`);
            localStorage.removeItem(`bisa_results_${projectId}`);
            resolve(true);
            return;
          }

          // Hapus di projects, questions, students, analysisResults
          const tx1 = db.transaction('projects', 'readwrite');
          tx1.objectStore('projects').delete(projectId);

          const tx2 = db.transaction('analysisResults', 'readwrite');
          tx2.objectStore('analysisResults').delete(projectId);

          // Hapus butir & siswa dengan iterasi
          const tx3 = db.transaction('questions', 'readwrite');
          const qStore = tx3.objectStore('questions');
          const qIdx = qStore.index('projectId');
          const qReq = qIdx.getAllKeys(projectId);
          qReq.onsuccess = () => {
            (qReq.result || []).forEach(k => qStore.delete(k));
          };

          const tx4 = db.transaction('students', 'readwrite');
          const sStore = tx4.objectStore('students');
          const sIdx = sStore.index('projectId');
          const sReq = sIdx.getAllKeys(projectId);
          sReq.onsuccess = () => {
            (sReq.result || []).forEach(k => sStore.delete(k));
          };

          resolve(true);
        } catch (e) {
          reject(e);
        }
      });
    },

    // SOAL (QUESTIONS)
    async getQuestions(projectId) {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const data = localStorage.getItem(`bisa_questions_${projectId}`);
            resolve(data ? JSON.parse(data) : []);
            return;
          }
          const tx = db.transaction('questions', 'readonly');
          const store = tx.objectStore('questions');
          const index = store.index('projectId');
          const req = index.getAll(projectId);
          req.onsuccess = () => {
            const list = (req.result || []).sort((a, b) => a.number - b.number);
            resolve(list);
          };
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    },

    async saveQuestions(projectId, questions) {
      return new Promise(async (resolve, reject) => {
        try {
          const formatted = questions.map((q, idx) => ({
            ...q,
            id: q.id || `${projectId}_Q${idx + 1}`,
            projectId: projectId,
            number: q.number || (idx + 1)
          }));

          const db = await openDatabase();
          if (!db) {
            localStorage.setItem(`bisa_questions_${projectId}`, JSON.stringify(formatted));
            resolve(formatted);
            return;
          }

          const tx = db.transaction('questions', 'readwrite');
          const store = tx.objectStore('questions');

          // Hapus butir lama lalu simpan baru
          const idx = store.index('projectId');
          const keysReq = idx.getAllKeys(projectId);
          keysReq.onsuccess = () => {
            (keysReq.result || []).forEach(k => store.delete(k));
            formatted.forEach(q => store.put(q));
          };

          tx.oncomplete = () => resolve(formatted);
          tx.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    },

    // SISWA (STUDENTS)
    async getStudents(projectId) {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const data = localStorage.getItem(`bisa_students_${projectId}`);
            resolve(data ? JSON.parse(data) : []);
            return;
          }
          const tx = db.transaction('students', 'readonly');
          const store = tx.objectStore('students');
          const index = store.index('projectId');
          const req = index.getAll(projectId);
          req.onsuccess = () => {
            const list = (req.result || []).sort((a, b) => a.studentNo - b.studentNo);
            resolve(list);
          };
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    },

    async saveStudents(projectId, students) {
      return new Promise(async (resolve, reject) => {
        try {
          const formatted = students.map((s, idx) => ({
            ...s,
            id: s.id || `${projectId}_S${idx + 1}`,
            projectId: projectId,
            studentNo: s.studentNo || (idx + 1)
          }));

          const db = await openDatabase();
          if (!db) {
            localStorage.setItem(`bisa_students_${projectId}`, JSON.stringify(formatted));
            resolve(formatted);
            return;
          }

          const tx = db.transaction('students', 'readwrite');
          const store = tx.objectStore('students');

          const idx = store.index('projectId');
          const keysReq = idx.getAllKeys(projectId);
          keysReq.onsuccess = () => {
            (keysReq.result || []).forEach(k => store.delete(k));
            formatted.forEach(s => store.put(s));
          };

          tx.oncomplete = () => resolve(formatted);
          tx.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    },

    // HASIL ANALISIS (ANALYSIS RESULTS)
    async getAnalysisResult(projectId) {
      return new Promise(async (resolve) => {
        try {
          const db = await openDatabase();
          if (!db) {
            const data = localStorage.getItem(`bisa_results_${projectId}`);
            resolve(data ? JSON.parse(data) : null);
            return;
          }
          const tx = db.transaction('analysisResults', 'readonly');
          const store = tx.objectStore('analysisResults');
          const req = store.get(projectId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    async saveAnalysisResult(projectId, resultData) {
      resultData.projectId = projectId;
      resultData.savedAt = new Date().toISOString();

      return new Promise(async (resolve, reject) => {
        try {
          const db = await openDatabase();
          if (!db) {
            localStorage.setItem(`bisa_results_${projectId}`, JSON.stringify(resultData));
            resolve(resultData);
            return;
          }
          const tx = db.transaction('analysisResults', 'readwrite');
          const store = tx.objectStore('analysisResults');
          store.put(resultData);
          tx.oncomplete = () => {
            localStorage.setItem(`bisa_results_${projectId}`, JSON.stringify(resultData));
            resolve(resultData);
          };
          tx.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    }
  };

  return BISADatabase;
}));
