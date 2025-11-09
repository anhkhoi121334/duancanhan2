import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiArrowLeft, FiDroplet, FiTag,
  FiPhone, FiMail, FiMapPin, FiCalendar, FiCreditCard,
  FiTruck, FiCheckCircle, FiXCircle, FiClock, FiEdit, FiDownload, FiImage
} from 'react-icons/fi';
import { API_URL } from '../../config/env';
import { getOrderById, updateOrderStatus } from '../../services/api';

const AdminOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeMenu, setActiveMenu] = useState('Đơn hàng');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  // Check if user is admin
  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_token');

    if (!adminUser || !adminToken) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        navigate('/');
        return;
      }
      setAdminName(user.name || 'Admin User');
    } catch (e) {
      console.error('Error parsing admin user', e);
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch order details
  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      console.log(`📡 Fetching order ${id}...`);
      
      const data = await getOrderById(id);
      console.log('📦 Order data:', data);
      
      // Handle different response formats
      const orderData = data.order || data.data || data;
      setOrder(orderData);
      
      console.log('✅ Order loaded:', orderData);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      alert(`Không thể tải thông tin đơn hàng: ${error.message}`);
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  // Menu items
  const menuItems = [
    { icon: <FiGrid />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <FiPackage />, label: 'Sản phẩm', path: '/admin/products' },
    { icon: <FiTag />, label: 'Thương hiệu', path: '/admin/brands' },
    { icon: <FiDroplet />, label: 'Màu sắc', path: '/admin/colors' },
    { icon: <FiPackage />, label: 'Sizes', path: '/admin/sizes' },
    { icon: <FiImage />, label: 'Banners', path: '/admin/banners' },
    { icon: <FiShoppingBag />, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: <FiUsers />, label: 'Khách hàng', path: '/admin/customers' },
    { icon: <FiStar />, label: 'Đánh giá', path: '/admin/reviews' },
    { icon: <FiTrendingUp />, label: 'Thống kê', path: '/admin/analytics' },
    { icon: <FiDollarSign />, label: 'Doanh thu', path: '/admin/revenue' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: <FiClock /> },
      'confirmed': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: <FiCheckCircle /> },
      'preparing': { label: 'Đang chuẩn bị', color: 'bg-indigo-100 text-indigo-700', icon: <FiPackage /> },
      'delivering': { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-700', icon: <FiTruck /> },
      'completed': { label: 'Đã giao hàng', color: 'bg-green-100 text-green-700', icon: <FiCheckCircle /> },
      'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: <FiXCircle /> }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: <FiClock /> };
  };

  // Lấy các status có thể transition từ status hiện tại
  const getAvailableStatuses = (currentStatus) => {
    if (!currentStatus) {
      console.warn('⚠️ No current status provided');
      return [];
    }
    
    // Normalize status (handle different formats from backend)
    const normalizedStatus = String(currentStatus).toLowerCase().trim();
    
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['delivering', 'cancelled'],
      'delivering': ['completed', 'cancelled'],
      'delivered': ['completed', 'cancelled'], // Alias
      'shipping': ['completed', 'cancelled'], // Alias
      'completed': [],
      'cancelled': []
    };
    
    const available = validTransitions[normalizedStatus] || [];
    console.log(`🔍 Current status: "${normalizedStatus}", Available transitions:`, available);
    
    return available;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'delivering': 'Đang giao hàng',
      'completed': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    
    return statusMap[status] || status;
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Vui lòng chọn trạng thái mới');
      return;
    }

    // Nếu chọn completed, yêu cầu payment_status
    if (newStatus === 'completed' && !paymentStatus) {
      alert('Vui lòng chọn trạng thái thanh toán khi hoàn thành đơn hàng');
      return;
    }

    // Nếu chọn confirmed, khuyến khích nhập estimated_delivery_date (nhưng không bắt buộc)
    let confirmMessage = `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${getStatusLabel(newStatus)}"?`;
    if (newStatus === 'completed' && paymentStatus) {
      confirmMessage = `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${getStatusLabel(newStatus)}" với trạng thái thanh toán "${paymentStatus}"?`;
    } else if (newStatus === 'confirmed' && estimatedDeliveryDate) {
      confirmMessage = `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${getStatusLabel(newStatus)}" với ngày dự kiến giao hàng: ${estimatedDeliveryDate}?`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      console.log('📋 Update Status Request:', {
        orderId: id,
        currentStatus: order?.status,
        newStatus: newStatus,
        paymentStatus: paymentStatus || 'none',
        estimatedDeliveryDate: estimatedDeliveryDate || 'none'
      });
      
      const updatedOrder = await updateOrderStatus(
        id, 
        newStatus, 
        paymentStatus || null,
        estimatedDeliveryDate || null
      );
      
      console.log('📦 Updated order response:', updatedOrder);
      
      // Cập nhật order trong state
      const orderData = updatedOrder.order || updatedOrder.data || updatedOrder;
      console.log('✅ Setting order data:', orderData);
      setOrder(orderData);
      setNewStatus(''); // Reset selection
      setPaymentStatus(''); // Reset payment status
      setEstimatedDeliveryDate(''); // Reset estimated delivery date
      
      // Reload order để đảm bảo dữ liệu mới nhất
      setTimeout(() => {
        fetchOrderDetail();
      }, 500);
      
      alert(`✅ Cập nhật trạng thái thành công sang "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      alert(`❌ Không thể cập nhật trạng thái: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      'COD': '💵 Thanh toán khi nhận hàng (COD)',
      'CARD': '💳 Thanh toán qua thẻ',
      'QR': '📱 Thanh toán QR Code',
      'BANK_TRANSFER': '🏦 Chuyển khoản ngân hàng',
      'cod': '💵 Thanh toán khi nhận hàng (COD)',
      'card': '💳 Thanh toán qua thẻ',
      'qr': '📱 Thanh toán QR Code',
      'bank_transfer': '🏦 Chuyển khoản ngân hàng'
    };
    
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <>
        <SEO title="Chi tiết Đơn hàng - Admin ANKH Store" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-500">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SEO title="Không tìm thấy đơn hàng - Admin ANKH Store" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">Không tìm thấy đơn hàng #{id}</p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={`Đơn hàng #${order.order_code || id} - Admin ANKH Store`} />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              {sidebarOpen && (
                <span className="font-bold text-xl text-gray-800">ANKH Store</span>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveMenu(item.label);
                  if (item.path) navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === item.label
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
              <FiHelpCircle className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Trợ giúp</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
              <FiSettings className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Cài đặt</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            >
              <FiLogOut className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Đăng xuất</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMenu className="text-xl text-gray-600" />
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Chi tiết Đơn hàng</h1>
                  {order && (
                    <p className="text-sm text-gray-500 mt-1">Mã: {order.order_code}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiBell className="text-xl text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Status & Info */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          Đơn hàng #{order.order_code || order.id}
                        </h2>
                        <p className="text-sm text-gray-500">
                          <FiCalendar className="inline mr-1" />
                          Đặt lúc: {formatDate(order.created_at)}
                        </p>
                      </div>
                      {order.status && (() => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Customer Info */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin khách hàng</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiUsers className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tên khách hàng</p>
                            <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiPhone className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Số điện thoại</p>
                            <p className="text-sm font-semibold text-gray-900">{order.phone}</p>
                          </div>
                        </div>

                        {order.email && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FiMail className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-semibold text-gray-900">{order.email}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FiMapPin className="text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                            <p className="text-sm font-semibold text-gray-900">{order.address}</p>
                          </div>
                        </div>
                      </div>

                      {order.note && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 font-semibold mb-1">Ghi chú:</p>
                          <p className="text-sm text-yellow-900">{order.note}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
                    
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                            {item.product_image && (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name}
                                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
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
                                {(() => {
                                  // Safely extract size - handle both object and string
                                  let sizeValue = '';
                                  if (item.size) {
                                    if (typeof item.size === 'string') {
                                      sizeValue = item.size;
                                    } else if (typeof item.size === 'object' && item.size.name) {
                                      sizeValue = String(item.size.name);
                                    } else if (typeof item.size === 'object' && item.size.size) {
                                      sizeValue = String(item.size.size);
                                    } else {
                                      sizeValue = String(item.size);
                                    }
                                  }
                                  
                                  // Safely extract color - handle both object and string
                                  let colorValue = '';
                                  if (item.color) {
                                    if (typeof item.color === 'string') {
                                      colorValue = item.color;
                                    } else if (typeof item.color === 'object' && item.color.name) {
                                      colorValue = String(item.color.name);
                                    } else if (typeof item.color === 'object' && item.color.color) {
                                      colorValue = String(item.color.color);
                                    } else {
                                      colorValue = String(item.color);
                                    }
                                  }
                                  
                                  return (
                                    <>
                                      {sizeValue && <span>Size: {sizeValue}</span>}
                                      {colorValue && <span>• Màu: {colorValue}</span>}
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Số lượng: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(item.quantity * item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Không có sản phẩm</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tổng quan đơn hàng</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(order.subtotal || order.total_amount)}
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

                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-bold text-gray-900">Tổng cộng</span>
                        <span className="font-black text-purple-600 text-xl">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thanh toán</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="text-gray-600" />
                        <span className="text-sm text-gray-600">Phương thức:</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 pl-6">
                        {getPaymentMethodLabel(order.payment_method)}
                      </p>

                      {order.payment_status && (
                        <div className="mt-4 pt-4 border-t">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            order.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </div>
                      )}

                      {order.estimated_delivery_date && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <FiTruck className="text-gray-600" />
                            <span className="text-sm text-gray-600">Ngày dự kiến giao hàng:</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 pl-6">
                            {formatDate(order.estimated_delivery_date)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Update Status */}
                  {order && order.status && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Cập nhật trạng thái</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái hiện tại
                          </label>
                          {(() => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </div>

                        {(() => {
                          const availableStatuses = getAvailableStatuses(order.status);
                          
                          if (availableStatuses.length === 0) {
                            return (
                              <p className="text-sm text-gray-500 py-2">
                                Đơn hàng đã ở trạng thái cuối cùng, không thể thay đổi
                              </p>
                            );
                          }

                          return (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Chuyển sang trạng thái
                                </label>
                                <select
                                  value={newStatus}
                                  onChange={(e) => {
                                    setNewStatus(e.target.value);
                                    // Reset payment_status khi đổi status
                                    if (e.target.value !== 'completed') {
                                      setPaymentStatus('');
                                    }
                                    // Reset estimated_delivery_date khi đổi status
                                    if (e.target.value !== 'confirmed') {
                                      setEstimatedDeliveryDate('');
                                    }
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  disabled={updatingStatus}
                                >
                                  <option value="">-- Chọn trạng thái --</option>
                                  {availableStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {getStatusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Estimated Delivery Date - Chỉ hiển thị khi chọn confirmed */}
                              {newStatus === 'confirmed' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày dự kiến giao hàng
                                  </label>
                                  <input
                                    type="date"
                                    value={estimatedDeliveryDate}
                                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={updatingStatus}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Nhập ngày dự kiến giao hàng (tùy chọn)
                                  </p>
                                </div>
                              )}

                              {/* Payment Status - Chỉ hiển thị khi chọn completed */}
                              {newStatus === 'completed' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái thanh toán <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={updatingStatus}
                                    required
                                  >
                                    <option value="">-- Chọn trạng thái thanh toán --</option>
                                    <option value="paid">Đã thanh toán</option>
                                    <option value="pending">Chưa thanh toán</option>
                                    <option value="failed">Thanh toán thất bại</option>
                                    <option value="refunded">Đã hoàn tiền</option>
                                  </select>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Khi hoàn thành đơn hàng, cần xác định trạng thái thanh toán
                                  </p>
                                </div>
                              )}

                              <button
                                onClick={handleUpdateStatus}
                                disabled={!newStatus || updatingStatus || (newStatus === 'completed' && !paymentStatus)}
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingStatus ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang cập nhật...
                                  </>
                                ) : (
                                  <>
                                    <FiEdit />
                                    Cập nhật trạng thái
                                  </>
                                )}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thao tác khác</h3>
                    
                    <div className="space-y-3">
                    </div>
                  </div>

                  {/* Timeline */}
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch sử đơn hàng</h3>
                      
                      <div className="space-y-4">
                        {order.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <FiCheckCircle className="text-white text-sm" />
                              </div>
                              {index < order.timeline.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(event.created_at)}</p>
                              {event.note && (
                                <p className="text-sm text-gray-600 mt-2">{event.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminOrderDetail;

