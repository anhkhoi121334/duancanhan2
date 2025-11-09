import React, { useState } from 'react';
import { validateVoucher } from '../services/api';

const VoucherInput = ({ 
  orderValue, 
  onApply, 
  onRemove, 
  appliedVoucher,
  showToast 
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const formatPrice = (price) => price?.toLocaleString('vi-VN') || '0';

  // Tính toán số tiền giảm giá
  const calculateDiscount = (voucher) => {
    if (voucher.discount_type === 'percentage') {
      const discount = (orderValue * voucher.discount_value) / 100;
      return voucher.max_discount_value 
        ? Math.min(discount, voucher.max_discount_value)
        : discount;
    }
    return voucher.discount_value;
  };

  // Validate voucher
  const validateVoucherData = (voucher) => {
    if (!voucher.is_valid || !voucher.status) {
      return !voucher.status 
        ? 'Voucher không còn hoạt động' 
        : 'Voucher đã hết hạn hoặc không còn hiệu lực';
    }
    if (orderValue < voucher.min_order_value) {
      return `Đơn hàng phải có giá trị tối thiểu ${formatPrice(voucher.min_order_value)} VND`;
    }
    if (voucher.quantity <= 0) {
      return 'Voucher đã hết số lượng';
    }
    return null;
  };

  // Xử lý áp dụng voucher
  const handleApply = async () => {
    if (!voucherCode.trim()) {
      showToast('Vui lòng nhập mã voucher', 'error');
      return;
    }

    try {
      setIsValidating(true);
      
      const response = await validateVoucher({
        code: voucherCode.trim(),
        order_value: orderValue
      });

      const voucher = response.data || response.voucher || response;
      const error = validateVoucherData(voucher);
      
      if (error) {
        showToast(error, 'error');
        return;
      }

      const discountAmount = Math.min(
        calculateDiscount(voucher),
        orderValue
      );

      onApply({
        code: voucher.code,
        discount_amount: discountAmount,
        voucher_data: voucher
      });

      showToast(`Áp dụng voucher thành công! Giảm ${formatPrice(discountAmount)} VND`, 'success');
      setVoucherCode('');

    } catch (error) {
      showToast(error.message || 'Mã voucher không hợp lệ hoặc đã hết hạn', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // Xử lý xóa voucher
  const handleRemove = () => {
    onRemove();
    setVoucherCode('');
    showToast('Đã xóa mã voucher', 'success');
  };

  // Nếu đã áp dụng voucher
  if (appliedVoucher) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">{appliedVoucher.code}</p>
              <p className="text-xs text-green-600">Giảm {formatPrice(appliedVoucher.discount_amount)} VND</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 text-xs font-semibold transition"
          >
            XÓA
          </button>
        </div>
      </div>
    );
  }

  // Form nhập voucher
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
        placeholder="Nhập mã voucher"
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff6600] transition"
        disabled={isValidating}
      />
      <button 
        onClick={handleApply}
        disabled={isValidating}
        className="bg-[#ff6600] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isValidating ? 'ĐANG KIỂM TRA...' : 'ÁP DỤNG'}
      </button>
    </div>
  );
};

export default VoucherInput;

