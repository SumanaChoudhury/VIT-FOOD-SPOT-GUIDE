const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing document.xml.rels impact on Word...');

// Copy temp_template's document.xml.rels to temp_orig
fs.copyFileSync('temp_template/word/_rels/document.xml.rels', 'temp_orig/word/_rels/document.xml.rels');

// Also copy media files to temp_orig/word/media/
const mediaDir = 'temp_orig/word/media';
const srcMediaDir = 'temp_template/word/media';
fs.readdirSync(srcMediaDir).forEach(f => {
  fs.copyFileSync(path.join(srcMediaDir, f), path.join(mediaDir, f));
});

// Also copy [Content_Types].xml
fs.copyFileSync('temp_template/[Content_Types].xml', 'temp_orig/[Content_Types].xml');

// Now test original document.xml with new rels
const testPath = path.resolve(__dirname, '..', 'test_rels.docx');
if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_orig', '${testPath}')"`);

const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
console.log('Result with new rels + media + [Content_Types]:', res);

if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
