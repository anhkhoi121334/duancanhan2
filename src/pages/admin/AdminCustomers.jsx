import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiSearch, FiMenu, FiBell, FiMail, FiPhone,
  FiEye, FiEdit, FiTrash2, FiUserPlus, FiDroplet, FiTag, FiImage, FiFileText
} from 'react-icons/fi';

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Khách hàng');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminName, setAdminName] = useState('Admin User');

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

  // Mock data cho customers
  const [customers, setCustomers] = useState([
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      email: 'nguyenvana@gmail.com',
      phone: '0901234567',
      totalOrders: 15,
      totalSpent: '45,200,000',
      joinDate: '2024-01-15',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      email: 'tranthib@gmail.com',
      phone: '0912345678',
      totalOrders: 8,
      totalSpent: '28,500,000',
      joinDate: '2024-03-20',
      status: 'active'
    },
    { 
      id: 3, 
      name: 'Lê Văn C', 
      email: 'levanc@gmail.com',
      phone: '0923456789',
      totalOrders: 22,
      totalSpent: '68,900,000',
      joinDate: '2023-11-10',
      status: 'active'
    },
    { 
      id: 4, 
      name: 'Phạm Thị D', 
      email: 'phamthid@gmail.com',
      phone: '0934567890',
      totalOrders: 5,
      totalSpent: '12,300,000',
      joinDate: '2024-06-05',
      status: 'inactive'
    }
  ]);

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <>
      <SEO
        title="Quản lý Khách hàng - Admin ANKH Store"
        description="Quản lý khách hàng website ANKH Store"
      />
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar - Same as AdminOrders */}
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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
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
                    <FiUsers className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tổng khách hàng</p>
                    <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">KH mới (tháng này)</p>
                    <p className="text-2xl font-bold text-gray-800">24</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Trung bình đơn/KH</p>
                    <p className="text-2xl font-bold text-gray-800">12.5</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-2xl text-orange-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Giá trị TB/KH</p>
                    <p className="text-2xl font-bold text-gray-800">38.7M</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách khách hàng</h2>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
                  <FiUserPlus />
                  Thêm khách hàng
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Khách hàng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Liên hệ</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tổng đơn</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tổng chi tiêu</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ngày tham gia</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div className="font-medium text-gray-800 text-sm">{customer.name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiMail className="text-xs" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiPhone className="text-xs" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-800 font-medium text-sm">{customer.totalOrders}</td>
                        <td className="py-4 px-4 text-gray-800 font-medium text-sm">{customer.totalSpent} VNĐ</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{customer.joinDate}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            customer.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <FiEye className="text-blue-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <FiEdit className="text-green-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <FiTrash2 className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminCustomers;

