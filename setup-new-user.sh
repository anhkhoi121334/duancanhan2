#!/bin/bash

# ========================================
# SETUP SCRIPT CHO NGƯỜI MỚI NHẬN CODE
# ========================================
# Script này tự động setup project cho người mới nhận code
# Chạy: chmod +x setup-new-user.sh && ./setup-new-user.sh

echo "🚀 Bắt đầu setup project..."
echo ""

# Kiểm tra Node.js
echo "📋 Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "👉 Tải Node.js từ: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# Kiểm tra npm
echo "📋 Kiểm tra npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt!"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm: $NPM_VERSION"
echo ""

# Kiểm tra file cấu hình
echo "📋 Kiểm tra file cấu hình..."
REQUIRED_FILES=(
    "package.json"
    "vite.config.js"
    "jsconfig.json"
    "tailwind.config.js"
    "postcss.config.js"
    "env.example"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Thiếu file: $file"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo ""
    echo "❌ Thiếu các file cần thiết!"
    echo "👉 Liên hệ người gửi code để lấy đầy đủ file."
    exit 1
fi
echo ""

# Tạo file .env
echo "📝 Tạo file .env..."
if [ -f ".env" ]; then
    echo "⚠️ File .env đã tồn tại, giữ nguyên file cũ"
    read -p "Bạn có muốn ghi đè không? (y/n): " overwrite
    if [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
        cp env.example .env
        echo "✅ Đã tạo file .env mới"
    else
        echo "ℹ️ Giữ nguyên file .env hiện tại"
    fi
else
    cp env.example .env
    echo "✅ Đã tạo file .env từ env.example"
fi
echo ""

# Cài đặt dependencies
echo "📦 Cài đặt dependencies (npm install)..."
echo "⏳ Đang cài đặt, vui lòng đợi 2-5 phút..."
echo ""

if ! npm install; then
    echo ""
    echo "❌ Lỗi khi cài đặt dependencies!"
    echo "👉 Thử chạy: npm install --legacy-peer-deps"
    exit 1
fi

echo ""
echo "✅ Đã cài đặt dependencies thành công!"
echo ""

# Kiểm tra node_modules
echo "📋 Kiểm tra node_modules..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules tồn tại"
else
    echo "❌ node_modules không tồn tại!"
    echo "👉 Chạy lại: npm install"
    exit 1
fi
echo ""

# Tóm tắt
echo "========================================"
echo "✅ SETUP HOÀN TẤT!"
echo "========================================"
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. (Tùy chọn) Sửa file .env nếu cần"
echo "2. Chạy: npm run dev"
echo "3. Mở trình duyệt: http://localhost:5173"
echo ""
echo "💡 Nếu gặp lỗi, xem: SETUP-FOR-NEW-USER.md"
echo ""

# Hỏi có muốn chạy dev server không
read -p "Bạn có muốn chạy dev server ngay bây giờ? (y/n): " run_dev
if [ "$run_dev" = "y" ] || [ "$run_dev" = "Y" ]; then
    echo ""
    echo "🚀 Khởi động dev server..."
    echo ""
    npm run dev
fi

