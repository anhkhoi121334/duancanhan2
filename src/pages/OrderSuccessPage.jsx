import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getMyOrders } from '../services/api';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      // Xử lý 2 trường hợp:
      // 1. Có orderData từ state (COD payment từ CheckoutPage)
      // 2. Có query params từ MoMo callback (order_id, method, status)
      
      const urlParams = new URLSearchParams(location.search);
      const orderIdFromQuery = urlParams.get('order_id');
      const methodFromQuery = urlParams.get('method');
      const statusFromQuery = urlParams.get('status');
      
      // Trường hợp 1: Có orderData từ state (COD payment)
      if (location.state?.orderData) {
        setOrderData(location.state.orderData);
        clearCart();
        setLoading(false);
        return;
      }
      
      // Trường hợp 2: MoMo callback (có query params)
      if (orderIdFromQuery && methodFromQuery === 'momo' && statusFromQuery === 'success') {
        // Clear cart ngay khi thanh toán MoMo thành công
        clearCart();
        
        // Fetch order data từ API
        if (isAuthenticated) {
          try {
            const orders = await getMyOrders();
            // Tìm order có code = orderIdFromQuery
            const foundOrder = orders.find(order => 
              order.code === orderIdFromQuery || 
              order.order_code === orderIdFromQuery ||
              String(order.id) === String(orderIdFromQuery)
            );
            
            if (foundOrder) {
              // Map order data từ API format sang format của OrderSuccessPage
              setOrderData({
                order_code: foundOrder.code || foundOrder.order_code || orderIdFromQuery,
                customer_name: foundOrder.customer_name,
                customer_phone: foundOrder.phone,
                customer_email: foundOrder.email,
                shipping_address: foundOrder.address,
                note: foundOrder.note,
                items: foundOrder.items || [],
                subtotal: foundOrder.subtotal || foundOrder.total_amount,
                shipping_fee: foundOrder.shipping_fee || 0,
                discount_amount: foundOrder.discount_amount || 0,
                total_amount: foundOrder.total_amount,
                payment_method: 'momo',
                created_at: foundOrder.created_at
              });
            } else {
              // Nếu không tìm thấy, tạo minimal order data
              setOrderData({
                order_code: orderIdFromQuery,
                payment_method: 'momo',
                total_amount: 0,
                created_at: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('❌ Error fetching order:', error);
            // Tạo minimal order data nếu fetch fail
            setOrderData({
              order_code: orderIdFromQuery,
              payment_method: 'momo',
              total_amount: 0,
              created_at: new Date().toISOString()
            });
          }
        } else {
          // Nếu chưa đăng nhập, tạo minimal order data
          setOrderData({
            order_code: orderIdFromQuery,
            payment_method: 'momo',
            total_amount: 0,
            created_at: new Date().toISOString()
          });
        }
        
        setLoading(false);
        return;
      }
      
      // Nếu không có dữ liệu, redirect về trang chủ
      setLoading(false);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    };
    
    loadOrderData();
  }, [location.state, location.search, clearCart, navigate, isAuthenticated]);

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

  // Loading state
  if (loading) {
    return (
      <>
        <SEO title="Đang tải..." />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600] mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  // Nếu không có orderData, redirect về trang chủ
  if (!orderData) {
    return null;
  }

  return (
    <>
      <SEO
        title="Đặt hàng thành công - ANKH Store"
        description="Cảm ơn bạn đã đặt hàng tại ANKH Store. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý."
      />
      
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Icon & Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center mb-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fadeIn">
              <svg className="w-12 h-12 md:w-14 md:h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">
              {orderData.payment_method === 'momo' ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
            </h1>
            
            <p className="text-gray-600 text-sm md:text-base mb-6">
              {orderData.payment_method === 'momo' 
                ? 'Cảm ơn bạn đã thanh toán qua MoMo tại' 
                : 'Cảm ơn bạn đã mua hàng tại'} <span className="font-bold text-[#ff6600]">ANKH Store</span>
            </p>

            {/* Order Code */}
            {orderData.order_code && (
              <div className="inline-block bg-orange-50 border-2 border-orange-200 rounded-lg px-6 py-3 mb-6">
                <p className="text-xs text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="text-2xl font-black text-[#ff6600] tracking-wider">
                  {orderData.order_code}
                </p>
              </div>
            )}

            {/* Status Message */}
            <div className={`border rounded-lg p-4 mb-6 ${
              orderData.payment_method === 'momo' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                {orderData.payment_method === 'momo' ? (
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={`text-sm text-left ${
                  orderData.payment_method === 'momo' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {orderData.payment_method === 'momo' 
                    ? 'Đơn hàng của bạn đã được thanh toán thành công qua MoMo. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.'
                    : 'Đơn hàng của bạn đã được tiếp nhận và đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight border-b pb-3">
              Thông tin đơn hàng
            </h2>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Người nhận</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.customer_phone}</p>
              </div>
              {orderData.customer_email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{orderData.customer_email}</p>
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
            {orderData.shipping_address && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                <p className="text-sm font-semibold text-gray-900">{orderData.shipping_address}</p>
              </div>
            )}

            {/* Note */}
            {orderData.note && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
                <p className="text-sm text-gray-700 italic">{orderData.note}</p>
              </div>
            )}

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="border-t pt-6">
                <p className="text-xs text-gray-500 mb-3">Sản phẩm đã đặt</p>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-3 border-b last:border-b-0">
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
                        <p className="text-xs text-gray-500">SL: {item.quantity}</p>
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
            <div className="border-t mt-6 pt-6 space-y-2">
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

              <div className="flex justify-between text-base md:text-lg pt-3 border-t-2 border-dashed">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-black text-[#ff6600] text-xl">
                  {formatPrice(orderData.total_amount)} ₫
                </span>
              </div>
            </div>

            {/* Payment Method */}
            {orderData.payment_method && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                <p className="text-sm font-semibold text-gray-900">
                  {orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                   orderData.payment_method === 'bank' ? 'Chuyển khoản ngân hàng' :
                   orderData.payment_method === 'momo' ? 'Ví MoMo' :
                   orderData.payment_method === 'vnpay' ? 'VNPay' :
                   'Thanh toán khi nhận hàng'}
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-tight">
              Bước tiếp theo
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#ff6600] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-sm text-gray-700">
                  Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng <strong>2-4 giờ</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#ff6600] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-sm text-gray-700">
                  Đơn hàng sẽ được giao trong vòng <strong>2-5 ngày làm việc</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#ff6600] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="text-sm text-gray-700">
                  Bạn có thể tra cứu đơn hàng bằng <strong>mã đơn hàng</strong> và <strong>số điện thoại</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/orders"
              className="bg-[#ff6600] text-white py-3 px-6 rounded-lg font-bold text-center hover:bg-orange-700 transition uppercase text-sm no-underline shadow-md"
            >
              Tra cứu đơn hàng
            </Link>
            <Link
              to="/"
              className="bg-white border-2 border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-bold text-center hover:bg-gray-50 transition uppercase text-sm no-underline shadow-md"
            >
              Về trang chủ
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Cần hỗ trợ? Liên hệ với chúng tôi:
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
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

export default OrderSuccessPage;

