const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const origXml = fs.readFileSync('temp_orig/word/document.xml', 'utf8');

// Test 1: Just the original document.xml with our updated document.xml.rels & [Content_Types].xml
fs.writeFileSync('temp_template/word/document.xml', origXml, 'utf8');
const test1Docx = path.resolve(__dirname, '..', 'test_t1.docx');
if (fs.existsSync(test1Docx)) fs.unlinkSync(test1Docx);
execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_template', '${test1Docx}')"`);

const psCheck = (file) => {
  const cmd = `powershell -ExecutionPolicy Bypass -Command "
    \\$word = New-Object -ComObject Word.Application
    \\$word.Visible = \\$false
    try {
      \\$doc = \\$word.Documents.Open('${file}', \\$false, \\$true)
      Write-Output ('OK: ' + \\$doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages))
      \\$doc.Close([ref]\\$false)
    } catch {
      Write-Output ('FAIL: ' + \\$_.Exception.Message)
    } finally {
      \\$word.Quit()
    }
  "`;
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'ERROR: ' + e.message;
  }
};

console.log('Test 1 (Original XML + new rels/content-types):', psCheck(test1Docx));
fs.unlinkSync(test1Docx);
