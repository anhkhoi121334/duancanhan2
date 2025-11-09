# ======================================
# ANKH STORE - ENV SETUP SCRIPT
# ======================================
# Script tự động setup environment variables

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ANKH STORE - ENV SETUP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  File .env đã tồn tại!" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè? (y/N)"
    
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Hủy bỏ. File .env hiện tại được giữ nguyên." -ForegroundColor Red
        exit 0
    }
}

# Ask for environment
Write-Host ""
Write-Host "Chọn môi trường:" -ForegroundColor Green
Write-Host "1. Development (localhost)" -ForegroundColor White
Write-Host "2. Production (deploy)" -ForegroundColor White
Write-Host "3. Custom (tự nhập)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host "📋 Copy env.development -> .env" -ForegroundColor Green
        Copy-Item "env.development" ".env"
    }
    "2" {
        Write-Host "📋 Copy env.production -> .env" -ForegroundColor Green
        Copy-Item "env.production" ".env"
    }
    "3" {
        Write-Host "📋 Copy env.example -> .env" -ForegroundColor Green
        Copy-Item "env.example" ".env"
        Write-Host "⚠️  Vui lòng cập nhật file .env với giá trị phù hợp" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Setup thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Mở file .env và kiểm tra các giá trị" -ForegroundColor White
Write-Host "   2. Cập nhật VITE_API_URL với backend URL của bạn" -ForegroundColor White
Write-Host "   3. Chạy: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Xem thêm: ENV-CONFIGURATION-GUIDE.md" -ForegroundColor Yellow
Write-Host ""

