const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const fullXml = fs.readFileSync('temp_template/word/document.xml', 'utf8');

// The outer document wrapper
const docOpen = fullXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = fullXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];
const docClose = '</w:body></w:document>';

// Split body into top-level elements: <w:p>...</w:p> and <w:tbl>...</w:tbl>
const elements = fullXml.match(/<(w:p|w:tbl)\b[\s\S]*?<\/\1>/g) || [];
console.log('Total top-level elements in document:', elements.length);

function testElements(count) {
  const slice = elements.slice(0, count).join('\n');
  const xml = `${docOpen}\n${slice}\n${sectPr}\n${docClose}`;
  fs.writeFileSync('temp_template/word/document.xml', xml, 'utf8');
  
  const testPath = path.resolve(__dirname, '..', 'test_bisect.docx');
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  
  execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_template', '${testPath}')"`);
  
  const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  return res;
}

// Test element 1 (first 10 elements)
console.log('Testing 10 elements:', testElements(10));
console.log('Testing 30 elements:', testElements(30));
console.log('Testing 50 elements:', testElements(50));
console.log('Testing 100 elements:', testElements(100));

// Restore full document.xml
fs.writeFileSync('temp_template/word/document.xml', fullXml, 'utf8');
