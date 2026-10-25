const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read exact root from temp_orig
const origDocXml = fs.readFileSync('temp_orig/word/document.xml', 'utf8');
const rootMatch = origDocXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = origDocXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];

const body = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Testing exact root tag!</w:t></w:r></w:p>`;
const xml = `${rootMatch}${body}${sectPr}</w:body></w:document>`;

fs.writeFileSync('temp_template/word/document.xml', xml, 'utf8');

const testPath = path.resolve(__dirname, '..', 'test_root.docx');
if (fs.existsSync(testPath)) fs.unlinkSync(testPath);

execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_template', '${testPath}')"`);

const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
console.log('Result with exact template root tag:', res);

if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
