const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

console.log('Validating XML files in temp_template...');

const files = [
  'temp_template/[Content_Types].xml',
  'temp_template/word/_rels/document.xml.rels',
  'temp_template/word/document.xml'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  parser.parseString(content, (err, result) => {
    if (err) {
      console.error(`ERROR in ${f}:`, err.message);
    } else {
      console.log(`VALID: ${f}`);
    }
  });
});
