const fs = require('fs');
const origXml = fs.readFileSync('temp_orig/word/document.xml', 'utf8');
const tag = origXml.match(/<w:document\b[\s\S]*?>/)[0];
console.log('Original <w:document> tag:\n', tag);
