import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { getAdminOrders } from '../../services/api';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiSearch, FiMenu, FiBell, FiFilter,
  FiDownload, FiEye, FiEdit, FiTrash2, FiDroplet, FiTag,
  FiChevronLeft, FiChevronRight, FiImage, FiFileText
} from 'react-icons/fi';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Đơn hàng');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  
  // Filters và Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  
  // Data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20
  });

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

  // Fetch orders từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage
      };
      
      if (filterStatus) params.status = filterStatus;
      if (filterPaymentStatus) params.payment_status = filterPaymentStatus;
      if (filterPaymentMethod) params.payment_method = filterPaymentMethod;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      console.log('📡 Fetching admin orders with params:', params);
      
      const data = await getAdminOrders(params);
      console.log('📦 Orders response:', data);
      
      // Handle different response formats
      const ordersData = data.orders || data.data || (Array.isArray(data) ? data : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
      // Set pagination
      if (data.pagination) {
        setPagination(data.pagination);
      } else if (data.meta) {
        setPagination({
          current_page: data.meta.current_page || 1,
          last_page: data.meta.last_page || 1,
          total: data.meta.total || 0,
          per_page: data.meta.per_page || perPage
        });
      } else {
        setPagination(prev => ({
          ...prev,
          current_page: page,
          total: ordersData.length
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
      alert(`Không thể tải danh sách đơn hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders khi filters/page thay đổi
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, filterStatus, filterPaymentStatus, filterPaymentMethod]);
  
  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset về trang 1 khi search
      fetchOrders();
    }, 500);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Menu items
  const menuItems = [
    { icon: <FiGrid />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <FiPackage />, label: 'Sản phẩm', path: '/admin/products' },
    { icon: <FiTag />, label: 'Thương hiệu', path: '/admin/brands' },
    { icon: <FiDroplet />, label: 'Màu sắc', path: '/admin/colors' },
    { icon: <FiPackage />, label: 'Sizes', path: '/admin/sizes' },
    { icon: <FiImage />, label: 'Banners', path: '/admin/banners' },
    { icon: <FiFileText />, label: 'Blog', path: '/admin/blogs' },
    { icon: <FiSearch />, label: 'Search Console', path: '/admin/search-console' },
    { icon: <FiShoppingBag />, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: <FiUsers />, label: 'Khách hàng', path: '/admin/customers' },
    { icon: <FiStar />, label: 'Đánh giá', path: '/admin/reviews' },
    { icon: <FiTrendingUp />, label: 'Thống kê', path: '/admin/analytics' },
    { icon: <FiDollarSign />, label: 'Doanh thu', path: '/admin/revenue' },
    { icon: <FiSettings />, label: 'Cài đặt', path: '/admin/settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'delivered':
      case 'đã giao':
        return 'bg-green-100 text-green-700';
      case 'shipping':
      case 'đang giao':
      case 'đang giao hàng':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
      case 'chờ xác nhận':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
      case 'đã xác nhận':
        return 'bg-indigo-100 text-indigo-700';
      case 'cancelled':
      case 'đã hủy':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };
  
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0';
    return price.toLocaleString('vi-VN');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="Quản lý Đơn hàng - Admin ANKH Store"
        description="Quản lý đơn hàng website ANKH Store"
      />
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
          {/* Logo */}
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

          {/* Menu Items */}
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

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
              <FiHelpCircle className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Trợ giúp</span>}
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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-800">{pagination.total || orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiFilter className="text-2xl text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter(o => o.status === 'pending' || o.status === 'Chờ xác nhận').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Đang giao</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter(o => o.status === 'shipping' || o.status === 'Đang giao').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Đã giao</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter(o => o.status === 'delivered' || o.status === 'Đã giao').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách đơn hàng</h2>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
                  <FiDownload />
                  Xuất Excel
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                <div className="relative md:col-span-2">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <select 
                  value={filterPaymentStatus}
                  onChange={(e) => {
                    setFilterPaymentStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">Tất cả thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thanh toán thất bại</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
                <select 
                  value={filterPaymentMethod}
                  onChange={(e) => {
                    setFilterPaymentMethod(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">Tất cả phương thức</option>
                  <option value="COD">COD</option>
                  <option value="VNPAY">VNPay</option>
                  <option value="MOMO">MoMo</option>
                  <option value="ZALOPAY">ZaloPay</option>
                </select>
                <select 
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="10">10 / trang</option>
                  <option value="20">20 / trang</option>
                  <option value="50">50 / trang</option>
                  <option value="100">100 / trang</option>
                </select>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mã đơn</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Khách hàng</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sản phẩm</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SL</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tổng tiền</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ngày đặt</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const orderCode = order.code || order.order_code || `#${order.id}`;
                        
                        // Safely extract customer name
                        let customerName = 'N/A';
                        if (order.customer_name) {
                          customerName = String(order.customer_name);
                        } else if (order.customer) {
                          if (typeof order.customer === 'string') {
                            customerName = order.customer;
                          } else if (typeof order.customer === 'object' && order.customer.name) {
                            customerName = String(order.customer.name);
                          }
                        }
                        
                        // Safely extract customer email and phone
                        const customerEmail = order.email ? String(order.email) : (order.customer?.email ? String(order.customer.email) : '');
                        const customerPhone = order.phone ? String(order.phone) : (order.customer?.phone ? String(order.customer.phone) : '');
                        
                        // Get items info
                        const items = Array.isArray(order.items) ? order.items : [];
                        const totalItems = order.total_items || order.items_count || items.length || 0;
                        const firstItem = items[0];
                        
                        // Safely extract product name - handle both object and string
                        let productName = 'Nhiều sản phẩm';
                        if (firstItem) {
                          if (firstItem.product_name) {
                            productName = String(firstItem.product_name);
                          } else if (firstItem.product) {
                            // If product is an object, get name property
                            if (typeof firstItem.product === 'string') {
                              productName = firstItem.product;
                            } else if (firstItem.product && typeof firstItem.product === 'object') {
                              productName = String(firstItem.product.name || 'Sản phẩm');
                            }
                          }
                        }
                        
                        const displayProduct = items.length > 1 
                          ? `${productName} và ${items.length - 1} sản phẩm khác` 
                          : productName;
                        
                        const totalAmount = parseFloat(order.total_amount || order.total || 0);
                        const orderDate = order.created_at || order.order_date || order.date;
                        
                        return (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-800 text-sm">{orderCode}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-800">{customerName}</div>
                                {customerEmail && (
                                  <div className="text-gray-500 text-xs">{customerEmail}</div>
                                )}
                                {customerPhone && (
                                  <div className="text-gray-500 text-xs">{customerPhone}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600 text-sm max-w-xs truncate" title={displayProduct}>
                              {displayProduct}
                            </td>
                            <td className="py-4 px-4 text-gray-600 text-sm">{totalItems}</td>
                            <td className="py-4 px-4 text-gray-800 font-medium text-sm">{formatPrice(totalAmount)} ₫</td>
                            <td className="py-4 px-4 text-gray-600 text-sm">{formatDate(orderDate)}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/admin/orders/${order.id}`}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <FiEye className="text-blue-600" />
                                </Link>
                                <Link
                                  to={`/admin/orders/${order.id}`}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Sửa / Cập nhật trạng thái"
                                >
                                  <FiEdit className="text-green-600" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} / {pagination.total} đơn hàng
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiChevronLeft />
                        </button>
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum;
                          if (pagination.last_page <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current_page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i;
                          } else {
                            pageNum = pagination.current_page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 border rounded-lg transition-colors ${
                                pageNum === pagination.current_page
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminOrders;

