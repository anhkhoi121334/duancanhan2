#!/bin/bash

# ======================================
# ANKH STORE - ENV SETUP SCRIPT
# ======================================
# Script tự động setup environment variables

echo "======================================"
echo "  ANKH STORE - ENV SETUP"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  File .env đã tồn tại!"
    read -p "Bạn có muốn ghi đè? (y/N): " overwrite
    
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "❌ Hủy bỏ. File .env hiện tại được giữ nguyên."
        exit 0
    fi
fi

# Ask for environment
echo ""
echo "Chọn môi trường:"
echo "1. Development (localhost)"
echo "2. Production (deploy)"
echo "3. Custom (tự nhập)"
echo ""

read -p "Nhập lựa chọn (1/2/3): " choice

case $choice in
    1)
        echo "📋 Copy env.development -> .env"
        cp env.development .env
        ;;
    2)
        echo "📋 Copy env.production -> .env"
        cp env.production .env
        ;;
    3)
        echo "📋 Copy env.example -> .env"
        cp env.example .env
        echo "⚠️  Vui lòng cập nhật file .env với giá trị phù hợp"
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

echo ""
echo "✅ Setup thành công!"
echo ""
echo "📝 Next steps:"
echo "   1. Mở file .env và kiểm tra các giá trị"
echo "   2. Cập nhật VITE_API_URL với backend URL của bạn"
echo "   3. Chạy: npm run dev"
echo ""
echo "📚 Xem thêm: ENV-CONFIGURATION-GUIDE.md"
echo ""

