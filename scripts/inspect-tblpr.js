const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

const tblPrs = xml.match(/<w:tblPr\b[\s\S]*?<\/w:tblPr>/g) || [];
tblPrs.forEach((t, i) => console.log(`TablePr ${i}:`, t));
