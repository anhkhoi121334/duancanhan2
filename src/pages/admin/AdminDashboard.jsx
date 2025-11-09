import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiCheckSquare, FiClock, FiUsers, FiDollarSign, 
  FiTrendingUp, FiFileText, FiHelpCircle, FiSettings, 
  FiLogOut, FiSearch, FiMenu, FiBell, FiPackage,
  FiShoppingBag, FiStar, FiArrowUp, FiArrowDown, FiDroplet, FiTag, FiImage
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_token');

    if (!adminUser || !adminToken) {
      // Không có thông tin admin -> redirect đến trang login
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        // Không phải admin -> redirect đến trang chủ
        alert('Bạn không có quyền truy cập trang này!');
        navigate('/');
        return;
      }
    } catch (e) {
      console.error('Error parsing admin user', e);
      navigate('/admin/login');
    }
  }, [navigate]);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminName, setAdminName] = useState('Admin User');
  
  // Mock data cho statistics
  const [stats, setStats] = useState({
    totalProducts: 450,
    totalOrders: 1450,
    totalCustomers: 2340,
    totalRevenue: 145.5, // Triệu VNĐ
    productsChange: 15.5,
    ordersChange: 12.8,
    customersChange: 25.5,
    revenueChange: 18.2
  });

  // Mock data cho Sales Performance Chart
  const performanceData = [
    { month: 'Tháng 1', giayNam: 35, giayNu: 42 },
    { month: 'Tháng 2', giayNam: 48, giayNu: 55 },
    { month: 'Tháng 3', giayNam: 42, giayNu: 58 },
    { month: 'Tháng 4', giayNam: 58, giayNu: 48 },
    { month: 'Tháng 5', giayNam: 52, giayNu: 65 }
  ];

  const maxValue = Math.max(...performanceData.flatMap(d => [d.giayNam, d.giayNu]));

  // Mock data cho Recent Orders Table
  const [recentOrders, setRecentOrders] = useState([
    { id: 1, orderCode: '#ORD-2025-001', customerName: 'Nguyễn Văn A', product: 'Nike Air Max 270', quantity: 2, total: '5,200,000', status: 'Đang giao' },
    { id: 2, orderCode: '#ORD-2025-002', customerName: 'Trần Thị B', product: 'Adidas Ultraboost', quantity: 1, total: '3,800,000', status: 'Đã giao' },
    { id: 3, orderCode: '#ORD-2025-003', customerName: 'Lê Văn C', product: 'Puma RS-X', quantity: 3, total: '6,500,000', status: 'Chờ xác nhận' }
  ]);

  // Mock data cho Pie Chart (Products by Category)
  const categoryData = [
    { name: 'Giày Nam', value: 180, color: '#6366f1', percentage: 40 },
    { name: 'Giày Nữ', value: 200, color: '#a78bfa', percentage: 44 },
    { name: 'Giày Thể Thao', value: 70, color: '#8b5cf6', percentage: 16 }
  ];

  const totalProducts = categoryData.reduce((acc, item) => acc + item.value, 0);

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

  useEffect(() => {
    // Lấy thông tin admin từ localStorage sau khi đã verify
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setAdminName(user.name || 'Admin User');
      } catch (e) {
        console.error('Error parsing admin user', e);
      }
    }
  }, []);

  return (
    <>
      <SEO
        title="Admin Dashboard - ANKH Store"
        description="Quản trị website ANKH Store"
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
            <button
              onClick={() => setActiveMenu('Help Center')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              <FiHelpCircle className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Help Center</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            >
              <FiLogOut className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMenu className="text-xl text-gray-600" />
                </button>
                <div className="relative max-w-md w-full">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search anything"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Payslip
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Report
                </button>
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
            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Xin chào, {adminName}
              </h1>
              <p className="text-gray-500">Đây là báo cáo kinh doanh hôm nay</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-2xl text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FiArrowUp className="text-green-500" />
                    <span className="text-green-500 font-medium">{stats.productsChange}%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Tổng sản phẩm</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                <p className="text-xs text-gray-400 mt-1">Sản phẩm mới</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-2xl text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FiArrowUp className="text-green-500" />
                    <span className="text-green-500 font-medium">{stats.ordersChange}%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                <p className="text-xs text-gray-400 mt-1">Đơn hàng mới</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-2xl text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FiArrowUp className="text-green-500" />
                    <span className="text-green-500 font-medium">{stats.customersChange}%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Khách hàng</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
                <p className="text-xs text-gray-400 mt-1">Khách hàng mới</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-2xl text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FiArrowUp className="text-green-500" />
                    <span className="text-green-500 font-medium">{stats.revenueChange}%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Doanh thu (triệu)</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalRevenue}M</p>
                <p className="text-xs text-gray-400 mt-1">Tháng này</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Doanh số bán hàng</h2>
                  <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    5 tháng gần đây
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Custom Bar Chart */}
                <div className="space-y-6">
                  {performanceData.map((data, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 w-20">{data.month}</span>
                        <div className="flex-1 flex gap-2">
                          {/* Giày Nam Bar */}
                          <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                              style={{ width: `${(data.giayNam / maxValue) * 100}%` }}
                            >
                              <span className="text-xs text-white font-medium">{data.giayNam}</span>
                            </div>
                          </div>
                          {/* Giày Nữ Bar */}
                          <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                              style={{ width: `${(data.giayNu / maxValue) * 100}%` }}
                            >
                              <span className="text-xs text-white font-medium">{data.giayNu}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm text-gray-600">Giày Nam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-600">Giày Nữ</span>
                  </div>
                </div>
              </div>

              {/* Total Products Donut Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Sản phẩm theo danh mục</h2>
                  <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Tất cả
                  </button>
                </div>
                
                {/* Custom Donut Chart */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-48 h-48">
                    {/* SVG Donut Chart */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {(() => {
                        let currentAngle = 0;
                        return categoryData.map((item, index) => {
                          const percentage = item.percentage;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;
                          
                          const startX = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
                          const startY = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
                          const endX = 50 + 35 * Math.cos((endAngle - 90) * Math.PI / 180);
                          const endY = 50 + 35 * Math.sin((endAngle - 90) * Math.PI / 180);
                          
                          const largeArcFlag = angle > 180 ? 1 : 0;
                          
                          const pathData = [
                            `M 50 50`,
                            `L ${startX} ${startY}`,
                            `A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `Z`
                          ].join(' ');
                          
                          return (
                            <path
                              key={index}
                              d={pathData}
                              fill={item.color}
                              className="transition-all duration-300 hover:opacity-80"
                            />
                          );
                        });
                      })()}
                      {/* Center white circle to create donut */}
                      <circle cx="50" cy="50" r="25" fill="white" />
                    </svg>
                    
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
                      <p className="text-sm text-gray-500">Sản phẩm</p>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 space-y-3 w-full">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Đơn hàng gần đây</h2>
                <Link to="/admin/orders" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                  Xem tất cả
                </Link>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option>Tất cả trạng thái</option>
                  <option>Chờ xác nhận</option>
                  <option>Đang giao</option>
                  <option>Đã giao</option>
                </select>
                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option>Hôm nay</option>
                  <option>Tuần này</option>
                  <option>Tháng này</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mã đơn</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Khách hàng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sản phẩm</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Số lượng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tổng tiền</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800 text-sm">{order.orderCode}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{order.customerName}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{order.product}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{order.quantity}</td>
                        <td className="py-4 px-4 text-gray-800 font-medium text-sm">{order.total} VNĐ</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Đã giao' 
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'Đang giao'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
