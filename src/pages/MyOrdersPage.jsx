import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMyOrders } from '../services/api';
import SEO from '../components/SEO';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle, 
  FiClock, FiEye, FiShoppingBag, FiShoppingCart 
} from 'react-icons/fi';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      fetchOrders();
    }
  }, [isAuthenticated, navigate, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // API sẽ tự động lấy orders từ token, không cần truyền userId
      console.log('👤 User object:', user);
      console.log('📡 Fetching my orders...');
      const data = await getMyOrders();
      console.log('📦 Orders data:', data);
      
      // Handle different response formats
      // Response có thể là:
      // 1. Array trực tiếp: [ {...}, {...} ]
      // 2. Object với orders: { orders: [...] }
      // 3. Object với data: { data: [...] }
      // 4. Object đơn (một order): { id: 1, code: "...", ... }
      let ordersData = [];
      
      if (Array.isArray(data)) {
        // Trường hợp 1: Response là array trực tiếp
        ordersData = data;
      } else if (data && Array.isArray(data.orders)) {
        // Trường hợp 2: Response có dạng { orders: [...] }
        ordersData = data.orders;
      } else if (data && Array.isArray(data.data)) {
        // Trường hợp 3: Response có dạng { data: [...] }
        ordersData = data.data;
      } else if (data && typeof data === 'object' && data.id) {
        // Trường hợp 4: Response là một order object đơn, convert thành array
        ordersData = [data];
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        ordersData = [];
      }
      
      setOrders(ordersData);
      console.log(`✅ Loaded ${ordersData.length} orders`);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      // Don't show error if just no orders
      if (!error.message.includes('404') && !error.message.includes('Authentication')) {
        alert(`Không thể tải danh sách đơn hàng: ${error.message}`);
      }
      setOrders([]);
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
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Component Timeline Progress như Shopee
  const OrderProgressTimeline = ({ status }) => {
    const steps = [
      { key: 'pending', label: 'Đơn hàng đã đặt', icon: <FiShoppingCart /> },
      { key: 'confirmed', label: 'Đã xác nhận', icon: <FiCheckCircle /> },
      { key: 'processing', label: 'Đang chuẩn bị', icon: <FiPackage /> },
      { key: 'shipping', label: 'Đang giao hàng', icon: <FiTruck /> },
      { key: 'delivered', label: 'Đã giao hàng', icon: <FiCheckCircle /> }
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
        <div className="flex items-center gap-3 text-red-600">
          <FiXCircle className="text-xl" />
          <span className="font-semibold">Đơn hàng đã bị hủy</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive
                      ? isCurrent
                        ? 'bg-[#ff6600] border-[#ff6600] text-white'
                        : 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <p
                  className={`text-xs mt-2 text-center font-medium ${
                    isActive ? 'text-[#ff6600]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-5 relative z-0 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { 
        label: 'Chờ xác nhận', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <FiClock className="text-yellow-600" /> 
      },
      'confirmed': { 
        label: 'Đã xác nhận', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <FiCheckCircle className="text-blue-600" /> 
      },
      'processing': { 
        label: 'Đang xử lý', 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: <FiPackage className="text-indigo-600" /> 
      },
      'shipping': { 
        label: 'Đang giao hàng', 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: <FiTruck className="text-purple-600" /> 
      },
      'delivered': { 
        label: 'Đã giao', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <FiCheckCircle className="text-green-600" /> 
      },
      'cancelled': { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <FiXCircle className="text-red-600" /> 
      }
    };
    
    return statusMap[status] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <FiClock className="text-gray-600" /> 
    };
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
          <Link
            to="/login"
            className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Đơn hàng của tôi - ANKH Store"
        description="Xem và quản lý đơn hàng của bạn tại ANKH Store"
      />

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header Banner */}
        <div className="relative h-[160px] bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
              Đơn hàng của tôi
            </h1>
            <p className="text-white text-sm mt-2">Quản lý và theo dõi đơn hàng của bạn</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-[#ff6600] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => setFilter('shipping')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'shipping' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Đang giao
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'delivered' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Đã giao
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'cancelled' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Đã hủy
            </button>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
              <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã đơn hàng</p>
                          <p className="font-bold text-gray-900">{order.code || order.order_code || `#${order.id}`}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày đặt</p>
                          <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Progress Timeline - Shopee Style */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100">
                      <OrderProgressTimeline status={order.status} />
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
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
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.color && <span>• Màu: {item.color}</span>}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm">
                            {order.total_items || order.items_count ? (
                              <>Số lượng sản phẩm: <span className="font-semibold">{order.total_items || order.items_count}</span></>
                            ) : (
                              'Không có thông tin sản phẩm'
                            )}
                          </p>
                        </div>
                      )}

                      {/* Order Footer */}
                      <div className="border-t pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tổng thanh toán:</p>
                          <p className="text-xl font-black text-[#ff6600]">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                        <Link
                          to={`/my-orders/${order.id}`}
                          className="px-6 py-2.5 bg-[#ff6600] text-white rounded-lg hover:bg-orange-700 transition-all font-semibold text-sm flex items-center gap-2"
                        >
                          <FiEye />
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!' 
                  : `Không có đơn hàng nào ở trạng thái "${getStatusInfo(filter).label}"`}
              </p>
              <Link
                to="/products"
                className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase"
              >
                Mua sắm ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrdersPage;

