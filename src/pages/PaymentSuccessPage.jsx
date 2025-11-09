import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCartStore } from '../store/cartStore';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [orderData, setOrderData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lấy thông tin đơn hàng từ state (được truyền từ CheckoutPage)
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setQrData(location.state.qrData || null);
      // Clear giỏ hàng sau khi thanh toán thành công
      clearCart();
      // Trigger animation after mount
      setTimeout(() => setMounted(true), 100);
    } else {
      // Nếu không có orderData, redirect về trang chủ
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [location.state, clearCart, navigate]);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Nếu không có dữ liệu, hiển thị loading
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Thanh toán thành công - ANKH Store"
        description="Cảm ơn bạn đã thanh toán tại ANKH Store. Đơn hàng của bạn đã được xử lý thành công."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Card */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center mb-6 transition-all duration-700 ${
            mounted ? 'animate-slideDown opacity-100' : 'opacity-0 translate-y-[-50px]'
          }`}>
            {/* Success Icon */}
            <div className={`mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${
              mounted ? 'animate-scaleBounce' : 'opacity-0 scale-0'
            }`}>
              <svg className={`w-14 h-14 text-green-500 transition-all duration-500 delay-300 ${
                mounted ? 'animate-checkmark' : 'opacity-0 scale-0'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h1 className={`text-3xl md:text-4xl font-black text-gray-900 mb-3 uppercase tracking-tight transition-all duration-700 delay-200 ${
              mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
            }`}>
              Thanh toán thành công!
            </h1>
            
            <p className={`text-gray-600 text-base md:text-lg mb-6 transition-all duration-700 delay-300 ${
              mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
            }`}>
              Cảm ơn bạn đã mua hàng tại <span className="font-bold text-[#ff6600]">ANKH Store</span>
            </p>

            {/* Order Code */}
            {orderData.order_code && (
              <div className={`inline-block bg-gradient-to-r from-[#ff6600] to-orange-600 text-white rounded-xl px-8 py-4 mb-6 shadow-lg transition-all duration-700 delay-400 ${
                mounted ? 'animate-slideUp animate-pulse-slow opacity-100' : 'opacity-0 translate-y-10'
              }`}>
                <p className="text-xs text-white/90 mb-2 uppercase tracking-wider">Mã đơn hàng</p>
                <p className="text-3xl font-black tracking-wider">
                  {orderData.order_code}
                </p>
          </div>
            )}

            {/* Payment Status */}
            <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6 transition-all duration-700 delay-500 ${
              mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-bold text-lg">Đã thanh toán thành công</p>
              </div>
              <p className="text-sm text-green-700">
                Số tiền: <span className="font-bold">{formatPrice(orderData.total_amount)} ₫</span>
              </p>
            </div>

            {/* QR Code Display (if QR payment) */}
            {qrData && qrData.qr_code_url && (
              <div className={`bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6 transition-all duration-700 delay-600 ${
                mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
              }`}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mã QR thanh toán</h3>
                <div className="flex flex-col items-center">
                  <img 
                    src={qrData.qr_code_url} 
                    alt="QR Code" 
                    className={`w-64 h-64 border-4 border-white shadow-lg rounded-lg mb-4 transition-all duration-700 delay-700 ${
                      mounted ? 'animate-scaleIn' : 'opacity-0 scale-0'
                    }`}
                  />
                  {qrData.bank_name && (
                    <p className="text-sm text-gray-600 mb-2">
                      Ngân hàng: <span className="font-semibold">{qrData.bank_name}</span>
                    </p>
                  )}
                  {qrData.account_no && (
                    <p className="text-sm text-gray-600 mb-2">
                      Số tài khoản: <span className="font-semibold">{qrData.account_no}</span>
                    </p>
                  )}
                  {qrData.account_name && (
                    <p className="text-sm text-gray-600 mb-2">
                      Tên tài khoản: <span className="font-semibold">{qrData.account_name}</span>
                    </p>
                  )}
                  {qrData.content && (
                    <p className="text-sm text-gray-600 mb-2">
                      Nội dung: <span className="font-semibold">{qrData.content}</span>
                    </p>
                  )}
                  {qrData.expired_at && (
                    <p className="text-sm text-red-600 font-semibold">
                      Hết hạn: {formatDate(qrData.expired_at)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {orderData.payment_method && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                <p className="text-lg font-bold text-gray-900">
                  {orderData.payment_method === 'COD' || orderData.payment_method === 'cod' 
                    ? '💵 Thanh toán khi nhận hàng (COD)' 
                    : orderData.payment_method === 'CARD' || orderData.payment_method === 'card' || orderData.payment_method === 'qr'
                    ? '💳 Thanh toán qua QR Code / Thẻ'
                    : orderData.payment_method === 'bank_transfer'
                    ? '🏦 Chuyển khoản ngân hàng'
                    : '💳 ' + orderData.payment_method}
                </p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 transition-all duration-700 delay-700 ${
            mounted ? 'animate-slideLeft opacity-100' : 'opacity-0 translate-x-[-50px]'
          }`}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight border-b pb-3">
              Chi tiết đơn hàng
            </h2>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Người nhận</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.phone}</p>
              </div>
              {orderData.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{orderData.email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày đặt hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(orderData.created_at || new Date())}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {orderData.address && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.address}</p>
              </div>
            )}

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="border-t pt-6 mb-6">
                <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Sản phẩm đã đặt</p>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-4 pb-3 border-b last:border-b-0 transition-all duration-500 ${
                        mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${800 + index * 100}ms` }}
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        {item.size && (
                          <p className="text-xs text-gray-500">Size: {item.size}</p>
                        )}
                        <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)} ₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(orderData.subtotal || orderData.total_amount)} ₫
                </span>
              </div>
              
              {orderData.shipping_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(orderData.shipping_fee)} ₫
                  </span>
                </div>
              )}

              {orderData.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold text-green-600">
                    -{formatPrice(orderData.discount_amount)} ₫
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg md:text-xl pt-4 border-t-2 border-dashed">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-black text-[#ff6600] text-2xl">
                  {formatPrice(orderData.total_amount)} ₫
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 transition-all duration-700 delay-900 ${
            mounted ? 'animate-slideRight opacity-100' : 'opacity-0 translate-x-[50px]'
          }`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-tight">
              Bước tiếp theo
            </h2>
            <ul className="space-y-3">
              {[
                'Đơn hàng của bạn đã được tiếp nhận và đang được xử lý',
                'Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 2-4 giờ',
                'Đơn hàng sẽ được giao trong vòng 2-5 ngày làm việc'
              ].map((text, index) => (
                <li 
                  key={index}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${1000 + index * 100}ms` }}
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-[#ff6600] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">
                    {text.includes('2-4 giờ') ? (
                      <>Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng <strong>2-4 giờ</strong></>
                    ) : text.includes('2-5 ngày') ? (
                      <>Đơn hàng sẽ được giao trong vòng <strong>2-5 ngày làm việc</strong></>
                    ) : (
                      text
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 delay-1000 ${
            mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
          }`}>
            <Link
              to="/orders"
              className="bg-[#ff6600] text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-orange-700 transition-all duration-300 uppercase text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              Tra cứu đơn hàng
            </Link>
            <Link
              to="/"
              className="bg-white border-2 border-gray-300 text-gray-800 py-4 px-6 rounded-lg font-bold text-center hover:bg-gray-50 transition-all duration-300 uppercase text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              Về trang chủ
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Cần hỗ trợ? Liên hệ với chúng tôi:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="tel:+84123456789" className="text-[#ff6600] hover:underline font-semibold">
                📞 +84 123 456 789
              </a>
              <a href="mailto:support@ankh-store.com" className="text-[#ff6600] hover:underline font-semibold">
                ✉️ support@ankh-store.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;

