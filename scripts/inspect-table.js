const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

const tbls = xml.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/g) || [];
console.log('Tables found:', tbls.length);
tbls.forEach((t, i) => {
  const rows = t.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || [];
  console.log(`Table ${i}: ${rows.length} rows`);
  rows.slice(0, 10).forEach((r, ri) => {
    const text = r.replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').trim();
    console.log(`  Row ${ri}: ${text}`);
  });
});
