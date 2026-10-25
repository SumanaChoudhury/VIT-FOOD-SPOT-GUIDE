const fs = require('fs');
const js = fs.readFileSync('client/js/app.js', 'utf8');
const lines = js.split('\n');
console.log(lines.slice(215, 275).join('\n'));
