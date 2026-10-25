const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const fullXml = fs.readFileSync('temp_template/word/document.xml', 'utf8');
const docOpen = fullXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = fullXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];
const docClose = '</w:body></w:document>';
const elements = fullXml.match(/<(w:p|w:tbl)\b[\s\S]*?<\/\1>/g) || [];

for (let i = 1; i <= 6; i++) {
  const slice = elements.slice(0, i).join('\n');
  const xml = `${docOpen}\n${slice}\n${sectPr}\n${docClose}`;
  fs.writeFileSync('temp_template/word/document.xml', xml, 'utf8');
  
  const testPath = path.resolve(__dirname, '..', `test_${i}.docx`);
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  
  execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_template', '${testPath}')"`);
  
  const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
  console.log(`Element 0..${i - 1}: ${res}`);
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
}

// Restore
fs.writeFileSync('temp_template/word/document.xml', fullXml, 'utf8');
