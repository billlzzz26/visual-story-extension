# Script to fix line endings in all markdown files
# Converts CRLF (Windows) to LF (Unix) line endings

Write-Host "Normalizing line endings in markdown files..." -ForegroundColor Cyan

# Find all markdown files and convert CRLF to LF
Get-ChildItem -Recurse -Filter "*.md" -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    if ($content -match "`r`n") {
        $content = $content -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Yellow
    }
}

Write-Host "Done! All markdown files now have LF line endings." -ForegroundColor Green
