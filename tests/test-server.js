const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

console.log('Testing server.js...');
const serverProcess = spawn('agy-node.cmd', [path.join(__dirname, '../server.js')], {
  stdio: 'pipe',
  shell: true
});

serverProcess.stdout.on('data', data => {
  const text = data.toString();
  console.log('Server output:', text);
  if (text.includes('URL Server')) {
    // Request /api/health
    http.get('http://127.0.0.1:3000/api/health', res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('API /api/health response:', body);
        // Request /api/projects
        http.get('http://127.0.0.1:3000/api/projects', resPrj => {
          let prjBody = '';
          resPrj.on('data', chunk => prjBody += chunk);
          resPrj.on('end', () => {
            console.log('API /api/projects response length:', JSON.parse(prjBody).length);
            serverProcess.kill();
            process.exit(0);
          });
        });
      });
    }).on('error', err => {
      console.error('Request error:', err);
      serverProcess.kill();
      process.exit(1);
    });
  }
});

serverProcess.stderr.on('data', data => {
  console.error('Server err:', data.toString());
});

setTimeout(() => {
  console.error('Timeout waiting for server');
  serverProcess.kill();
  process.exit(1);
}, 6000);
