# ========================================
# SETUP SCRIPT CHO NGƯỜI MỚI NHẬN CODE
# ========================================
# Script này tự động setup project cho người mới nhận code
# Chạy: .\setup-new-user.ps1

Write-Host "🚀 Bắt đầu setup project..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
Write-Host "📋 Kiểm tra Node.js..." -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "👉 Tải Node.js từ: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Kiểm tra npm
Write-Host "📋 Kiểm tra npm..." -ForegroundColor Yellow
$npmVersion = npm -v 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm chưa được cài đặt!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
Write-Host ""

# Kiểm tra file cấu hình
Write-Host "📋 Kiểm tra file cấu hình..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "vite.config.js",
    "jsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    "env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Thiếu file: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Thiếu các file cần thiết!" -ForegroundColor Red
    Write-Host "👉 Liên hệ người gửi code để lấy đầy đủ file." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Tạo file .env
Write-Host "📝 Tạo file .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠️ File .env đã tồn tại, giữ nguyên file cũ" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/n)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Copy-Item env.example .env -Force
        Write-Host "✅ Đã tạo file .env mới" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Giữ nguyên file .env hiện tại" -ForegroundColor Cyan
    }
} else {
    Copy-Item env.example .env
    Write-Host "✅ Đã tạo file .env từ env.example" -ForegroundColor Green
}
Write-Host ""

# Cài đặt dependencies
Write-Host "📦 Cài đặt dependencies (npm install)..." -ForegroundColor Yellow
Write-Host "⏳ Đang cài đặt, vui lòng đợi 2-5 phút..." -ForegroundColor Cyan
Write-Host ""

npm install | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
    Write-Host "👉 Thử chạy: npm install --legacy-peer-deps" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Đã cài đặt dependencies thành công!" -ForegroundColor Green
Write-Host ""

# Kiểm tra node_modules
Write-Host "📋 Kiểm tra node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules tồn tại" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules không tồn tại!" -ForegroundColor Red
    Write-Host "👉 Chạy lại: npm install" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Tóm tắt
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ SETUP HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Các bước tiếp theo:" -ForegroundColor Yellow
Write-Host "1. (Tùy chọn) Sửa file .env nếu cần" -ForegroundColor White
Write-Host "2. Chạy: npm run dev" -ForegroundColor White
Write-Host "3. Mở trình duyệt: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "💡 Nếu gặp lỗi, xem: SETUP-FOR-NEW-USER.md" -ForegroundColor Cyan
Write-Host ""

# Hỏi có muốn chạy dev server không
$runDev = Read-Host "Bạn có muốn chạy dev server ngay bây giờ? (y/n)"
if ($runDev -eq "y" -or $runDev -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Khởi động dev server..." -ForegroundColor Cyan
    Write-Host ""
    npm run dev
}

