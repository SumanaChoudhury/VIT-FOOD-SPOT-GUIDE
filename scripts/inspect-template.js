const fs = require('fs');

const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');
const ps = xml.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];

console.log('Total paragraphs:', ps.length);
ps.forEach((p, i) => {
  const text = p.replace(/<[^>]+>/g, '').trim();
  if (text || p.includes('<w:drawing')) {
    const jcMatch = p.match(/<w:jc w:val="([^"]+)"/);
    const szMatch = p.match(/<w:sz w:val="([^"]+)"/);
    const isBold = /<w:b[\s\/>]/.test(p);
    const jc = jcMatch ? jcMatch[1] : 'left';
    const sz = szMatch ? szMatch[1] : 'default';
    const hasDrawing = p.includes('<w:drawing');
    console.log(`[${i}] (align: ${jc}, size: ${sz}, bold: ${isBold}${hasDrawing ? ', [IMAGE]' : ''}): ${text}`);
  }
});
