const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

const ps = xml.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
console.log('Cover page XML from index 0 to 22:');
for (let i = 0; i <= 22; i++) {
  console.log(`P[${i}]:`, ps[i]);
}
