import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiArrowUp, FiArrowDown,
  FiTag, FiDroplet, FiImage, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Thống kê');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    productsGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    revenueGrowth: 0
  });

  // Chart data
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

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

  useEffect(() => {
    fetchOverview();
    fetchSales();
    fetchTopProducts();
  }, []);

  // Helper function to handle API response
  const handleApiResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Response không phải JSON:', errorText.substring(0, 200));
      throw new Error('Server trả về không phải JSON format');
    }

    return await response.json();
  };

  // Fetch overview statistics
  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/statistics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      
      setStats({
        totalProducts: data.total_products?.value || 0,
        totalOrders: data.total_orders?.value || 0,
        totalCustomers: data.customers?.value || 0,
        totalRevenue: data.revenue?.value || 0,
        productsGrowth: data.total_products?.growth || 0,
        ordersGrowth: data.total_orders?.growth || 0,
        customersGrowth: data.customers?.growth || 0,
        revenueGrowth: data.revenue?.growth || 0
      });
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales data
  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/statistics/sales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      
      // Handle response format: { sales: [...] } or [...]
      const sales = data.sales || data || [];
      
      // Convert revenue to millions for display
      const formattedSales = sales.map(item => ({
        month: item.month || item.month_name || 'N/A',
        value: (item.revenue || 0) / 1000000, // Convert to millions
        revenue: item.revenue || 0
      }));
      
      setSalesData(formattedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSalesData([]);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/statistics/top-products?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      
      // Handle response format: { products: [...] } or [...]
      const products = data.products || data || [];
      setTopProducts(products);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setTopProducts([]);
    }
  };

  const maxValue = salesData.length > 0 ? Math.max(...salesData.map(d => d.value)) : 100;

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

  return (
    <>
      <SEO title="Thống kê - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Thống kê</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <FiPackage className="text-3xl text-purple-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {stats.productsGrowth >= 0 ? (
                      <FiArrowUp className="text-green-500" />
                    ) : (
                      <FiArrowDown className="text-red-500" />
                    )}
                    <span className={`font-medium ${stats.productsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.productsGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Tổng sản phẩm</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <FiShoppingBag className="text-3xl text-blue-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {stats.ordersGrowth >= 0 ? (
                      <FiArrowUp className="text-green-500" />
                    ) : (
                      <FiArrowDown className="text-red-500" />
                    )}
                    <span className={`font-medium ${stats.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.ordersGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="text-3xl text-green-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {stats.customersGrowth >= 0 ? (
                      <FiArrowUp className="text-green-500" />
                    ) : (
                      <FiArrowDown className="text-red-500" />
                    )}
                    <span className={`font-medium ${stats.customersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.customersGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Khách hàng</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <FiDollarSign className="text-3xl text-orange-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {stats.revenueGrowth >= 0 ? (
                      <FiArrowUp className="text-green-500" />
                    ) : (
                      <FiArrowDown className="text-red-500" />
                    )}
                    <span className={`font-medium ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.revenueGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Doanh thu</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalRevenue >= 1000000 
                    ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` 
                    : `${(stats.totalRevenue / 1000).toFixed(0)}K`} VNĐ
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Doanh số 6 tháng gần đây</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              ) : salesData.length > 0 ? (
                <div className="flex items-end justify-between gap-4 h-64">
                  {salesData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                            {item.value.toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{item.month}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có dữ liệu doanh số</p>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Top sản phẩm bán chạy</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              ) : topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.product_id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                          #{product.rank || index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{product.product_name || product.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Đã bán: {product.quantity_sold || product.sold || 0} sản phẩm</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {product.revenue 
                            ? `${(product.revenue / 1000000).toFixed(1)}M VNĐ`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có dữ liệu sản phẩm bán chạy</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;

