# ======================================
# ANKH STORE - NETLIFY DEPLOYMENT SCRIPT
# ======================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DEPLOY TO NETLIFY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if netlify CLI is installed
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "⚠️  Netlify CLI chưa được cài đặt!" -ForegroundColor Yellow
    $install = Read-Host "Bạn có muốn cài đặt? (y/N)"
    
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Green
        npm install -g netlify-cli
    } else {
        Write-Host "❌ Hủy bỏ deployment" -ForegroundColor Red
        exit 1
    }
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env không tồn tại!" -ForegroundColor Yellow
    Write-Host "📋 Copy env.production -> .env" -ForegroundColor Green
    Copy-Item "env.production" ".env"
}

Write-Host ""
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

Write-Host "Chọn deployment type:" -ForegroundColor Green
Write-Host "1. Preview (draft deployment)" -ForegroundColor White
Write-Host "2. Production (live deployment)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1/2)"

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "📤 Deploying to preview..." -ForegroundColor Yellow
        netlify deploy --dir=dist
    }
    "2" {
        Write-Host "📤 Deploying to production..." -ForegroundColor Green
        netlify deploy --dir=dist --prod
    }
    default {
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""

