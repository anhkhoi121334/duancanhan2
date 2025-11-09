import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiArrowUp, FiCalendar,
  FiTag, FiDroplet, FiImage, FiFileText, FiSearch
} from 'react-icons/fi';

const AdminRevenue = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Doanh thu');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');

  const stats = {
    today: 12500000,
    week: 58000000,
    month: 145500000,
    year: 1250000000
  };

  const revenueData = [
    { date: '01/01', revenue: 15000000 },
    { date: '02/01', revenue: 18000000 },
    { date: '03/01', revenue: 22000000 },
    { date: '04/01', revenue: 19000000 },
    { date: '05/01', revenue: 25000000 },
    { date: '06/01', revenue: 28000000 },
    { date: '07/01', revenue: 18000000 }
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

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
      <SEO title="Doanh thu - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Doanh thu</h1>
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
            {/* Period Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm">Hôm nay</span>
                  <FiCalendar className="text-2xl text-blue-100" />
                </div>
                <p className="text-3xl font-bold mb-1">{(stats.today / 1000000).toFixed(1)}M</p>
                <p className="text-blue-100 text-xs">+8.2% so với hôm qua</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm">Tuần này</span>
                  <FiTrendingUp className="text-2xl text-green-100" />
                </div>
                <p className="text-3xl font-bold mb-1">{(stats.week / 1000000).toFixed(1)}M</p>
                <p className="text-green-100 text-xs">+12.5% so với tuần trước</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm">Tháng này</span>
                  <FiDollarSign className="text-2xl text-purple-100" />
                </div>
                <p className="text-3xl font-bold mb-1">{(stats.month / 1000000).toFixed(1)}M</p>
                <p className="text-purple-100 text-xs">+18.2% so với tháng trước</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-100 text-sm">Năm nay</span>
                  <FiArrowUp className="text-2xl text-orange-100" />
                </div>
                <p className="text-3xl font-bold mb-1">{(stats.year / 1000000).toFixed(0)}M</p>
                <p className="text-orange-100 text-xs">+25.8% so với năm trước</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Doanh thu 7 ngày gần đây</h2>
              <div className="flex items-end justify-between gap-4 h-64">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {(item.revenue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Doanh thu theo danh mục</h2>
                <div className="space-y-4">
                  {[
                    { category: 'Giày Nam', revenue: 58000000, percentage: 40 },
                    { category: 'Giày Nữ', revenue: 65000000, percentage: 45 },
                    { category: 'Giày Thể Thao', revenue: 22500000, percentage: 15 }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">{item.category}</span>
                        <span className="text-gray-800 font-bold">{(item.revenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Doanh thu theo thương hiệu</h2>
                <div className="space-y-4">
                  {[
                    { brand: 'Nike', revenue: 45000000, color: 'orange' },
                    { brand: 'Adidas', revenue: 38000000, color: 'blue' },
                    { brand: 'Puma', revenue: 28000000, color: 'purple' },
                    { brand: 'New Balance', revenue: 34500000, color: 'green' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                          <span className={`text-${item.color}-600 font-bold text-sm`}>
                            {item.brand.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{item.brand}</span>
                      </div>
                      <span className="font-bold text-gray-800">{(item.revenue / 1000000).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminRevenue;

