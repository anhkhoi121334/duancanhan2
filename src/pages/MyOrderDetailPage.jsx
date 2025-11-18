import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { getMyOrderDetail, cancelOrder } from '../services/api';
import SEO from '../components/SEO';
import { 
  FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, 
  FiClock, FiPhone, FiMail, FiMapPin, FiCalendar, FiCreditCard, FiShoppingCart, FiDownload
} from 'react-icons/fi';

const MyOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useCartStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, id, navigate]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      console.log(`📡 Fetching order ${id}...`);
      
      const data = await getMyOrderDetail(id);
      console.log('📦 Order detail:', data);
      
      // Handle different response formats
      const orderData = data.order || data.data || data;
      setOrder(orderData);
      
      console.log('✅ Order loaded:', orderData);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      alert(`Không thể tải thông tin đơn hàng: ${error.message}`);
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Kiểm tra xem có thời gian không (nếu chỉ có date thì format khác)
    const hasTime = dateString.includes('T') || dateString.includes(' ');
    if (hasTime) {
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Chỉ format date nếu không có thời gian
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: <FiClock /> },
      'confirmed': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: <FiCheckCircle /> },
      'processing': { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700', icon: <FiPackage /> },
      'shipping': { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-700', icon: <FiTruck /> },
      'delivered': { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: <FiCheckCircle /> },
      'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: <FiXCircle /> }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: <FiClock /> };
  };

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') {
      showToast('Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xác nhận!', 'error');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hủy đơn hàng này?\n\n' +
      'Sau khi hủy, đơn hàng sẽ không thể hoàn tác.'
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    try {
      console.log(`🚫 Cancelling order ${id}...`);
      await cancelOrder(id);
      
      showToast('Đã hủy đơn hàng thành công!', 'success');
      
      // Reload order detail để cập nhật status
      await fetchOrderDetail();
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.';
      showToast(errorMessage, 'error');
      alert(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  // Component Timeline Progress như Shopee
  const OrderProgressTimeline = ({ status }) => {
    const steps = [
      { key: 'pending', label: 'Đơn hàng đã đặt', icon: <FiShoppingCart />, description: 'Đơn hàng của bạn đã được đặt thành công' },
      { key: 'confirmed', label: 'Đã xác nhận', icon: <FiCheckCircle />, description: 'Đơn hàng đã được xác nhận và đang được xử lý' },
      { key: 'processing', label: 'Đang chuẩn bị', icon: <FiPackage />, description: 'Sản phẩm đang được đóng gói' },
      { key: 'shipping', label: 'Đang giao hàng', icon: <FiTruck />, description: 'Đơn hàng đang trên đường đến bạn' },
      { key: 'delivered', label: 'Đã giao hàng', icon: <FiCheckCircle />, description: 'Đơn hàng đã được giao thành công' }
    ];

    const getStepIndex = (status) => {
      const indexMap = {
        'pending': 0,
        'confirmed': 1,
        'processing': 2,
        'shipping': 3,
        'delivered': 4,
        'cancelled': -1
      };
      return indexMap[status] ?? 0;
    };

    const currentStep = getStepIndex(status);
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return (
        <div className="flex flex-col items-center gap-3 text-red-600 py-4">
          <FiXCircle className="text-4xl" />
          <span className="font-semibold text-lg">Đơn hàng đã bị hủy</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Horizontal Timeline */}
        <div className="relative py-4">
          {/* Steps Container */}
          <div className="relative flex items-start justify-between gap-4">
            {steps.map((step, index) => {
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <React.Fragment key={step.key}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                        isActive
                          ? isCurrent
                            ? 'bg-[#ff6600] border-[#ff6600] text-white scale-110'
                            : 'bg-green-500 border-green-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <p
                      className={`text-xs mt-3 text-center font-semibold max-w-[120px] leading-tight break-words ${
                        isActive ? (isCurrent ? 'text-[#ff6600]' : 'text-green-600') : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  
                  {/* Connecting Line Segment */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 relative self-center -mx-2" style={{ marginTop: '-24px', zIndex: 0 }}>
                      <div className="absolute top-0 left-0 right-0 h-full bg-gray-200"></div>
                      {isCompleted && (
                        <div className="absolute top-0 left-0 right-0 h-full bg-green-500 transition-all duration-300"></div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current Step Description */}
        {currentStep >= 0 && currentStep < steps.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 text-xl">
                {steps[currentStep].icon}
              </div>
              <div>
                <p className="font-semibold text-blue-900">{steps[currentStep].label}</p>
                <p className="text-sm text-blue-700 mt-1">{steps[currentStep].description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      'COD': '💵 Thanh toán khi nhận hàng',
      'CARD': '💳 Thanh toán qua thẻ',
      'QR': '📱 Thanh toán QR Code',
      'BANK_TRANSFER': '🏦 Chuyển khoản ngân hàng',
      'cod': '💵 Thanh toán khi nhận hàng',
      'card': '💳 Thanh toán qua thẻ',
      'qr': '📱 Thanh toán QR Code',
      'bank_transfer': '🏦 Chuyển khoản ngân hàng'
    };
    
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <>
        <SEO title="Chi tiết đơn hàng - ANKH Store" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
            <p className="mt-4 text-gray-500">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SEO title="Không tìm thấy đơn hàng - ANKH Store" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">Không tìm thấy đơn hàng</p>
            <Link
              to="/my-orders"
              className="inline-block px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-orange-700 font-semibold"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const orderCode = order.code || order.order_code || `#${order.id}`;

  return (
    <>
      <SEO title={`Đơn hàng #${orderCode} - ANKH Store`} />

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/my-orders')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chi tiết đơn hàng
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Mã: {orderCode}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Shipping Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{order.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPhone className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="text-sm font-semibold text-gray-900">{order.phone}</p>
                    </div>
                  </div>

                  {order.email && (
                    <div className="flex items-start gap-3">
                      <FiMail className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{order.email}</p>
                      </div>
                    </div>
                  )}

                  {order.note && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-semibold mb-1">Ghi chú:</p>
                      <p className="text-sm text-yellow-900">{order.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
                
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.product_name || 'Sản phẩm'}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>• Màu: {item.color}</span>}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {item.quantity} × {formatPrice(item.price || item.variant_price || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice((item.quantity || 1) * (item.price || item.variant_price || item.total || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Không có sản phẩm</p>
                )}
              </div>

              {/* Progress Timeline - Shopee Style */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Tiến trình đơn hàng</h2>
                <OrderProgressTimeline status={order.status} />
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng quan đơn hàng</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.subtotal || order.total_amount || 0)}
                    </span>
                  </div>
                  
                  {order.shipping_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.shipping_fee)}
                      </span>
                    </div>
                  )}

                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-semibold text-green-600">
                        -{formatPrice(order.discount_amount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="font-black text-[#ff6600] text-xl">
                      {formatPrice(order.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thanh toán</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-gray-600" />
                    <span className="text-sm text-gray-600">Phương thức:</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 pl-6">
                    {getPaymentMethodLabel(order.payment_method)}
                  </p>

                  {order.payment_status && (
                    <div className="mt-4">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline History */}
              {order.timeline && order.timeline.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h3>
                  
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-[#ff6600] rounded-full flex items-center justify-center">
                            <FiCheckCircle className="text-white text-sm" />
                          </div>
                          {index < order.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-gray-900 text-sm">{event.title || event.status}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(event.created_at || event.timestamp)}</p>
                          {event.note && (
                            <p className="text-sm text-gray-600 mt-2">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác</h3>
                
                <div className="space-y-3">
                  {order.status === 'pending' && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <FiXCircle />
                          <span>Hủy đơn hàng</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button className="w-full px-4 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                      Mua lại
                    </button>
                  )}

                  <Link
                    to="/my-orders"
                    className="block w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-center font-semibold"
                  >
                    Quay lại danh sách đơn hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    'COD': '💵 Thanh toán khi nhận hàng',
    'CARD': '💳 Thanh toán qua thẻ',
    'QR': '📱 Thanh toán QR Code',
    'BANK_TRANSFER': '🏦 Chuyển khoản ngân hàng',
    'cod': '💵 Thanh toán khi nhận hàng',
    'card': '💳 Thanh toán qua thẻ',
    'qr': '📱 Thanh toán QR Code',
    'bank_transfer': '🏦 Chuyển khoản ngân hàng'
  };
  
  return methodMap[method] || method;
};

export default MyOrderDetailPage;

