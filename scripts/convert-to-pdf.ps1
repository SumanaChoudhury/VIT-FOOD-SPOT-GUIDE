$ErrorActionPreference = 'Stop'
try {
    $docxPath = (Resolve-Path '.\VIT_Food_Spot_Guide_Project_Report.docx').Path
    $pdfPath = [System.IO.Path]::ChangeExtension($docxPath, '.pdf')
    Write-Host "Opening Microsoft Word to export PDF: $pdfPath"
    
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone
    
    $doc = $word.Documents.Open($docxPath, $false, $true)
    Write-Host "Document opened. Page count: $($doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages))"
    
    $doc.SaveAs([ref]$pdfPath, [ref]17) # 17 = wdFormatPDF
    $doc.Close([ref]$false)
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    
    if (Test-Path $pdfPath) {
        $size = (Get-Item $pdfPath).Length
        Write-Host "SUCCESS: PDF created ($size bytes)!"
    } else {
        Write-Host "WARNING: PDF was not found at $pdfPath"
    }
} catch {
    Write-Host "COM automation note: $_"
}
