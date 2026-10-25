const fs = require('fs');

const docXml = fs.readFileSync('temp_template/word/document.xml', 'utf8');
const relsXml = fs.readFileSync('temp_template/word/_rels/document.xml.rels', 'utf8');

const embeds = docXml.match(/r:embed="([^"]+)"/g) || [];
console.log('Total r:embed references in document.xml:', embeds.length);

const relIds = new Set((relsXml.match(/Id="([^"]+)"/g) || []).map(s => s.match(/Id="([^"]+)"/)[1]));
console.log('Defined relationship IDs in document.xml.rels:', Array.from(relIds));

let missing = 0;
embeds.forEach(e => {
  const id = e.match(/r:embed="([^"]+)"/)[1];
  if (!relIds.has(id)) {
    console.error('MISSING RELATIONSHIP:', id);
    missing++;
  }
});

console.log('Missing relationships count:', missing);
