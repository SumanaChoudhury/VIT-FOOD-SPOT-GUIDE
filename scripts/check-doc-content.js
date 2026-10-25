const fs = require('fs');
const xml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

console.log('Includes rId101:', xml.includes('rId101'));
console.log('Includes rId4:', xml.includes('rId4'));
console.log('Includes Figure 6.1:', xml.includes('Figure 6.1'));
