const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing table and drawing with exact schema rules...');

const origDocXml = fs.readFileSync('temp_orig/word/document.xml', 'utf8');
const rootMatch = origDocXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = origDocXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];

// Test Table with tblGrid
const tbl = `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="0" w:type="auto"/>
    <w:jc w:val="center"/>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="4000"/>
    <w:gridCol w:w="4300"/>
  </w:tblGrid>
  <w:tr>
    <w:tc><w:tcPr><w:tcW w:w="4000" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Col 1 Header</w:t></w:r></w:p></w:tc>
    <w:tc><w:tcPr><w:tcW w:w="4300" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Col 2 Header</w:t></w:r></w:p></w:tc>
  </w:tr>
  <w:tr>
    <w:tc><w:tcPr><w:tcW w:w="4000" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Value 1</w:t></w:r></w:p></w:tc>
    <w:tc><w:tcPr><w:tcW w:w="4300" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Value 2</w:t></w:r></w:p></w:tc>
  </w:tr>
</w:tbl>`;

const pTest = `<w:p><w:pPr><w:spacing w:before="120" w:after="120"/><w:ind w:left="720"/><w:jc w:val="both"/></w:pPr><w:r><w:t>Paragraph with indent before jc!</w:t></w:r></w:p>`;

const xml = `${rootMatch}${tbl}${pTest}${sectPr}</w:body></w:document>`;
fs.writeFileSync('temp_orig/word/document.xml', xml, 'utf8');

const testPath = path.resolve(__dirname, '..', 'test_tbl.docx');
if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_orig', '${testPath}')"`);

const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
console.log('Result for table with tblGrid + p with ind before jc:', res);

if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
// Restore original
fs.writeFileSync('temp_orig/word/document.xml', origDocXml, 'utf8');
