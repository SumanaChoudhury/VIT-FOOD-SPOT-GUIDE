$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false

function Test-Docx([string]$path) {
    try {
        $doc = $word.Documents.Open($path, $false, $true)
        $pages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
        $doc.Close([ref]$false)
        return "OK (Pages: $pages)"
    } catch {
        return "FAIL: " + $_.Exception.Message
    }
}

$origResult = Test-Docx (Resolve-Path '.\Project-web programming template.docx').Path
Write-Output "Original template: $origResult"

$fullResult = Test-Docx (Resolve-Path '.\VIT_Food_Spot_Guide_Project_Report.docx').Path
Write-Output "Full report: $fullResult"

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
