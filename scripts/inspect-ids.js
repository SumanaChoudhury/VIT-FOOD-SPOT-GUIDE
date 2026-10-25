const fs = require('fs');
const html = fs.readFileSync('client/index.html', 'utf8');

const ids = html.match(/id="([^"]+)"/g) || [];
console.log('Key IDs found:');
ids.slice(0, 50).forEach(id => console.log('  ', id));
