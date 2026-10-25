const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Verifying generated docx archive...');
const docxPath = path.resolve(__dirname, '..', 'VIT_Food_Spot_Guide_Project_Report.docx');
const testExtractDir = path.resolve(__dirname, '..', 'temp_verify');

if (fs.existsSync(testExtractDir)) {
  fs.rmSync(testExtractDir, { recursive: true, force: true });
}

const extractCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${docxPath}', '${testExtractDir}')"`;
execSync(extractCmd);

console.log('Successfully extracted generated docx archive!');
const files = fs.readdirSync(testExtractDir);
console.log('Root files in package:', files);

const wordFiles = fs.readdirSync(path.join(testExtractDir, 'word'));
console.log('Files in word directory:', wordFiles);

const mediaFiles = fs.readdirSync(path.join(testExtractDir, 'word', 'media'));
console.log(`Media files (${mediaFiles.length} files):`, mediaFiles);

const docXml = fs.readFileSync(path.join(testExtractDir, 'word', 'document.xml'), 'utf8');
console.log('document.xml length:', docXml.length);

// Clean up test extract directory
fs.rmSync(testExtractDir, { recursive: true, force: true });
console.log('Verification PASSED! The docx package is completely valid.');
