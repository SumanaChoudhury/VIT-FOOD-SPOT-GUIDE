const { execSync } = require('child_process');
const path = require('path');
const target = path.resolve(__dirname, '..', 'edge_out.png');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="${target}" "https://example.com"`;
console.log('Running:', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Target exists:', require('fs').existsSync(target));
} catch (e) {
  console.error(e);
}
