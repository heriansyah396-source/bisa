const fs = require('fs');
const files = [
  'js/ctt-engine.js',
  'js/sample-data.js',
  'js/excel-handler.js',
  'js/pdf-report.js',
  'js/db.js',
  'server.js'
];

files.forEach(f => {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new Function(code);
    console.log('✓ Syntax OK:', f);
  } catch (err) {
    console.error('✗ Syntax Error in', f, ':', err.message);
    process.exit(1);
  }
});

console.log('Semua modul JavaScript lolos uji sintaks!');
