const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3999;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 1. Start server with custom PORT
const env = { ...process.env, PORT: String(PORT) };
const serverProcess = spawn('node', ['server/server.js'], { env, cwd: path.resolve(__dirname, '..') });

serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

const shots = [
  { name: 'fig6_1_explore_light.png', query: 'shot=explore_light' },
  { name: 'fig6_2_explore_dark.png', query: 'shot=explore_dark' },
  { name: 'fig6_3_search_results.png', query: 'shot=search' },
  { name: 'fig6_4_food_spot_card.png', query: 'shot=explore_light' },
  { name: 'fig6_5_menu_modal.png', query: 'shot=modal' },
  { name: 'fig6_6_mens_hostel.png', query: 'shot=mens_hostel' },
  { name: 'fig6_7_ladies_hostel.png', query: 'shot=ladies_hostel' },
  { name: 'fig6_8_academic_blocks.png', query: 'shot=academic' },
  { name: 'fig6_9_ai_chatbot.png', query: 'shot=chatbot' },
  { name: 'fig6_10_feedback_form.png', query: 'shot=feedback' },
  { name: 'fig6_11_student_reviews.png', query: 'shot=reviews' },
  { name: 'fig6_12_favorites.png', query: 'shot=favorites' },
  { name: 'fig6_13_auth_modal.png', query: 'shot=auth' },
  { name: 'fig6_14_admin_portal.png', query: 'shot=admin' }
];

function waitForServer(retries = 20) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
        if (res.statusCode === 200) return resolve();
        if (attempt <= 0) return reject(new Error('Server responded with status: ' + res.statusCode));
        setTimeout(() => check(attempt - 1), 500);
      }).on('error', () => {
        if (attempt <= 0) return reject(new Error('Server not reachable'));
        setTimeout(() => check(attempt - 1), 500);
      });
    };
    check(retries);
  });
}

async function run() {
  try {
    console.log('Waiting for server on port', PORT, '...');
    await waitForServer();
    console.log('Server is UP! Capturing screenshots...');

    for (const s of shots) {
      const outPath = path.join(SCREENSHOT_DIR, s.name);
      const url = `http://127.0.0.1:${PORT}/?${s.query}`;
      console.log(`Capturing ${s.name} from ${url}...`);
      const cmd = `"${EDGE_PATH}" --headless --disable-gpu --virtual-time-budget=2500 --window-size=1280,820 --screenshot="${outPath}" "${url}"`;
      try {
        execSync(cmd, { stdio: 'pipe' });
        const size = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
        console.log(`  -> Saved ${s.name} (${size} bytes)`);
      } catch (err) {
        console.error(`  -> Error capturing ${s.name}:`, err.message);
      }
    }

    console.log('All screenshots captured successfully!');
  } finally {
    console.log('Shutting down server process...');
    serverProcess.kill('SIGINT');
  }
}

run().catch((e) => {
  console.error(e);
  serverProcess.kill('SIGINT');
});
