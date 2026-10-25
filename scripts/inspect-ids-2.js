const fs = require('fs');
const html = fs.readFileSync('client/index.html', 'utf8');

const ids = html.match(/id="([^"]+)"/g) || [];
console.log('Remaining IDs:');
ids.slice(50).forEach(id => console.log('  ', id));
