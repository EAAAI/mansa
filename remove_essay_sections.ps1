# PowerShell Script to Remove Essay Sections from All Subject Pages
# This script removes the essay bank section to improve performance

$subjectFiles = @(
    "physics2.html",
    "english.html",
    "history.html",
    "it.html",
    "law.html",
    "math0.html",
    "electronics.html"
)

$basePath = "c:\Users\ib200\OneDrive\المستندات\GitHub\mansa\subjects\"

foreach ($file in $subjectFiles) {
    $filePath = Join-Path $basePath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Remove essay section from HTML
        $content = $content -replace '(?s)<section id="essay".*?</section>\s*(?=<section)', ''
        
        # Remove essay nav link
        $content = $content -replace '<a href="#essay"[^>]*>.*?</a>\s*', ''
        
        # Remove essay button from hero
        $content = $content -replace '<a href="#essay"[^>]*class="btn[^>]*>.*?</a>\s*', ''
        
        # Remove essay stat from hero
        $content = $content -replace '<div class="hero-stat"><i class="fas fa-pen-fancy"></i>.*?سؤال مقالي</div>\s*', ''
        
        # Save the modified content
        Set-Content $filePath $content -Encoding UTF8 -NoNewline
        
        Write-Host "✓ $file updated successfully" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $file not found" -ForegroundColor Red
    }
}

Write-Host "`nAll subject pages updated!" -ForegroundColor Green
Write-Host "Essay sections removed for performance optimization." -ForegroundColor Yellow
