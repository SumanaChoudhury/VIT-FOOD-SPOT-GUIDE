const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read our full generated document.xml
const fullDocXml = fs.readFileSync('temp_template/word/document.xml', 'utf8');
const rootOpen = fullDocXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = fullDocXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];
const rootClose = '</w:body></w:document>';

// Extract paragraphs and tables from fullDocXml body
const bodyContent = fullDocXml.replace(rootOpen, '').replace(sectPr + rootClose, '');

function testContent(content, label) {
  const xml = `${rootOpen}${content}${sectPr}${rootClose}`;
  fs.writeFileSync('temp_orig/word/document.xml', xml, 'utf8');
  const testPath = path.resolve(__dirname, '..', 'test_diag.docx');
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  
  execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_orig', '${testPath}')"`);
  
  const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
  console.log(`[${label}]: ${res}`);
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
}

// Split into parts by page breaks (<w:br w:type="page"/>)
const parts = bodyContent.split(/<w:p><w:r><w:br w:type="page"\/><\/w:r><\/w:p>/);
console.log('Document parts separated by page breaks:', parts.length);

let cumulative = '';
const labels = [
  'Cover Page',
  'Abstract',
  'Table of Contents',
  'Chapter 1: Introduction',
  'Chapter 2: Description & Plan',
  'Chapter 3: Technical Spec',
  'Chapter 4: Design & Data Dict',
  'Chapter 5: Code',
  'Chapter 6: Screenshots Part 1',
  'Chapter 6: Screenshots Part 2',
  'Chapter 6: Screenshots Part 3',
  'Chapter 6: Screenshots Part 4',
  'Chapter 6: Screenshots Part 5',
  'Chapter 6: Screenshots Part 6',
  'Chapter 6: Screenshots Part 7',
  'Chapter 6: Screenshots Part 8',
  'Chapter 7: References'
];

for (let i = 0; i < parts.length; i++) {
  cumulative += parts[i] + '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  testContent(cumulative, labels[i] || `Part ${i}`);
}
