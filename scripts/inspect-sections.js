const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

const sectPrs = xml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g) || [];
console.log('Section properties found:', sectPrs.length);
sectPrs.forEach((s, i) => console.log(`Section ${i}:`, s.substring(0, 300)));
