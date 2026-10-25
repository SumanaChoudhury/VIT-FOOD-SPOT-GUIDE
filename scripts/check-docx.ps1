param([string]$DocxPath)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$cleanPath = (Resolve-Path $DocxPath).Path
Unblock-File $cleanPath
try {
    $doc = $word.Documents.Open($cleanPath)
    $pages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
    $doc.Close([ref]$false)
    Write-Output "OK: Pages = $pages"
} catch {
    Write-Output ("FAIL: " + $_.Exception.ToString())
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
