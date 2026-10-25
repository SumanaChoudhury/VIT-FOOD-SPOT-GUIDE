const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read temp_orig/word/document.xml
const orig = fs.readFileSync('temp_orig/word/document.xml', 'utf8');

// Replace "<Title of Project>" with "VIT FOOD SPOT GUIDE"
const modified = orig.replace('&lt;Title of Project&gt;', 'VIT FOOD SPOT GUIDE: AI-POWERED, LOCATION-BASED CAMPUS FOOD DISCOVERY WEB APPLICATION');
fs.writeFileSync('temp_orig/word/document.xml', modified, 'utf8');

const testPath = path.resolve(__dirname, '..', 'test_mod.docx');
if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_orig', '${testPath}')"`);

const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
console.log('Result of modifying title in original XML:', res);

// Restore original
fs.writeFileSync('temp_orig/word/document.xml', orig, 'utf8');
