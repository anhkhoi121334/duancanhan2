# ======================================
# ANKH STORE - VERCEL DEPLOYMENT SCRIPT
# ======================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DEPLOY TO VERCEL" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI chưa được cài đặt!" -ForegroundColor Yellow
    $install = Read-Host "Bạn có muốn cài đặt? (y/N)"
    
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Green
        npm install -g vercel
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
Write-Host "Chọn deployment type:" -ForegroundColor Green
Write-Host "1. Preview (test deployment)" -ForegroundColor White
Write-Host "2. Production (live deployment)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1/2)"

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "📤 Deploying to preview..." -ForegroundColor Yellow
        vercel
    }
    "2" {
        Write-Host "📤 Deploying to production..." -ForegroundColor Green
        vercel --prod
    }
    default {
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""

