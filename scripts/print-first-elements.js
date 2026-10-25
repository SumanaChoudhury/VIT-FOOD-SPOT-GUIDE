const fs = require('fs');
const fullXml = fs.readFileSync('temp_template/word/document.xml', 'utf8');
const elements = fullXml.match(/<(w:p|w:tbl)\b[\s\S]*?<\/\1>/g) || [];

for (let i = 0; i < 15; i++) {
  console.log(`Element ${i}:`, elements[i].substring(0, 150));
}
