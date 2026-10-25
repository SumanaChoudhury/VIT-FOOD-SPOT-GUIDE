const { execSync } = require('child_process');
const path = require('path');
const origDir = path.resolve(__dirname, '..', 'temp_orig');
const testDocx = path.resolve(__dirname, '..', 'test_orig.docx');

const zipCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; if (Test-Path '${testDocx}') { Remove-Item '${testDocx}' -Force }; [System.IO.Compression.ZipFile]::CreateFromDirectory('${origDir}', '${testDocx}')"`;
execSync(zipCmd);

const psTest = `powershell -ExecutionPolicy Bypass -Command "
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
  $doc = $word.Documents.Open('${testDocx}', $false, $true)
  Write-Output "Original docx opened successfully in Word! Page count: $($doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages))"
  $doc.Close([ref]$false)
} catch {
  Write-Output "Word open failed: $_"
} finally {
  $word.Quit()
}
"`;
console.log(execSync(psTest, { encoding: 'utf8' }));
