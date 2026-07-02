<#
    generate-media.ps1
    -------------------
    Bulk-creates optimized media for the portfolio:
      * every image under images/ and projects/  ->  a .webp version (smaller, same name)
      * every .mp4 under projects/                ->  a *_poster.jpg still frame

    Requires ffmpeg (one free tool does both jobs).
      Install on Windows:  winget install Gyan.FFmpeg
      or download:         https://www.gyan.dev/ffmpeg/builds/  (add the bin folder to PATH)

    Usage (from the project folder):
      powershell -ExecutionPolicy Bypass -File .\generate-media.ps1

    Safe to re-run: it skips files whose optimized version is already up to date.
    After running, open admin.html and put the .webp path in each image's "optimized"
    box and the *_poster.jpg path in each video's box  (or ask Claude to auto-fill them).
#>

$ErrorActionPreference = 'Stop'

# --- Check ffmpeg ---
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) {
    Write-Host "ffmpeg not found." -ForegroundColor Red
    Write-Host "Install it first:  winget install Gyan.FFmpeg" -ForegroundColor Yellow
    Write-Host "Then close and reopen the terminal so PATH updates, and re-run this script."
    exit 1
}

$root       = $PSScriptRoot
$imageDirs  = @('images', 'projects')
$maxWidth   = 1600   # downscale very large images to this width (keeps aspect ratio)
$webpQuality = 82

$imgCount = 0; $imgSkip = 0
$vidCount = 0; $vidSkip = 0

Write-Host "Scanning for media under: $($imageDirs -join ', ')" -ForegroundColor Cyan

# --- Images -> WebP ---
foreach ($dir in $imageDirs) {
    $path = Join-Path $root $dir
    if (-not (Test-Path $path)) { continue }
    Get-ChildItem -Path $path -Recurse -Include *.png, *.jpg, *.jpeg -File | ForEach-Object {
        $src = $_.FullName
        $out = [System.IO.Path]::ChangeExtension($src, '.webp')
        if ((Test-Path $out) -and ((Get-Item $out).LastWriteTime -ge $_.LastWriteTime)) {
            $imgSkip++; return
        }
        & $ffmpeg -y -loglevel error -i $src -vf "scale='min($maxWidth,iw)':-2" -quality $webpQuality $out
        if ($LASTEXITCODE -eq 0) { $imgCount++; Write-Host "  webp  $($_.Name)" -ForegroundColor Green }
        else { Write-Host "  FAILED $($_.Name)" -ForegroundColor Red }
    }
}

# --- Videos -> poster frame ---
$projPath = Join-Path $root 'projects'
if (Test-Path $projPath) {
    Get-ChildItem -Path $projPath -Recurse -Include *.mp4 -File | ForEach-Object {
        $src = $_.FullName
        $poster = [System.IO.Path]::ChangeExtension($src, $null) + '_poster.jpg'
        if ((Test-Path $poster) -and ((Get-Item $poster).LastWriteTime -ge $_.LastWriteTime)) {
            $vidSkip++; return
        }
        # grab a frame ~1s in; fall back to the very first frame for short clips
        & $ffmpeg -y -loglevel error -ss 00:00:01 -i $src -frames:v 1 -q:v 3 $poster
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $poster)) {
            & $ffmpeg -y -loglevel error -i $src -frames:v 1 -q:v 3 $poster
        }
        if (Test-Path $poster) { $vidCount++; Write-Host "  poster $($_.Name)" -ForegroundColor Green }
        else { Write-Host "  FAILED $($_.Name)" -ForegroundColor Red }
    }
}

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan
Write-Host "  Images -> WebP : $imgCount created, $imgSkip already current"
Write-Host "  Videos -> poster: $vidCount created, $vidSkip already current"
Write-Host ""
Write-Host "Next: reference the new .webp / *_poster.jpg files in admin.html (optimized box),"
Write-Host "then Generate + commit projects-data.js. Commit the new media files too."
