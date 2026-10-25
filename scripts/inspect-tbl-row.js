const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

const tbl2 = (xml.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/g) || [])[2];
if (tbl2) {
  const rows = tbl2.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || [];
  console.log('Row 0 (Header):', rows[0]);
  console.log('Row 1 (Sample):', rows[1]);
}
