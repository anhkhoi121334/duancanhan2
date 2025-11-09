import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiSearch, FiMenu, FiBell, FiPlus,
  FiEye, FiEdit, FiTrash2, FiDroplet, FiTag, FiImage, FiLayers, FiFileText
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Sản phẩm');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = `${API_URL}/products/all`;

      console.log('📡 Fetching all products from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📦 API Response:', data);

      if (data.data) {
        setProducts(data.data);
        console.log(`✅ Loaded ${data.data.length}/${data.total} products`);
      } else {
        console.warn('⚠️ No products data in response');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      alert(data.message || 'Đã xóa sản phẩm!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm!');
    }
  };

  // Client-side filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  return (
    <>
      <SEO title="Quản lý Sản phẩm - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
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
                    <FiPackage className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Đang bán</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {products.filter(p => p.status === 1).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-2xl text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Đang giảm giá</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {products.filter(p => p.price_sale && p.price_sale > 0).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-2xl text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Ẩn</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {products.filter(p => p.status === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách sản phẩm</h2>
                <Link
                  to="/admin/products/add"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <FiPlus />
                  Thêm sản phẩm
                </Link>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="Giày Nam">Giày Nam</option>
                  <option value="Giày Nữ">Giày Nữ</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Danh mục</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Giá</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Giới tính</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {product.image && product.image !== 'http://localhost:8000/storage' ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 rounded-lg bg-gray-200 ${product.image && product.image !== 'http://localhost:8000/storage' ? 'hidden' : 'flex'} items-center justify-center`}>
                                <FiImage className="text-gray-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">{product.category || 'N/A'}</td>
                          <td className="py-4 px-4">
                            {product.price > 0 ? (
                              <div>
                                <div className={`text-sm font-medium ${product.price_sale ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                </div>
                                {product.price_sale && product.price_sale > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-600 font-medium">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_sale)}
                                    </span>
                                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                      -{product.discount_percent}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Chưa cập nhật</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">{product.gender || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.status === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.status === 1 ? 'Hoạt động' : 'Ẩn'}
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
                              <Link
                                to={`/admin/products/${product.id}/images`}
                                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Quản lý ảnh"
                              >
                                <FiImage className="text-purple-600" />
                              </Link>
                              <Link
                                to={`/admin/products/${product.id}/variants`}
                                className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Quản lý biến thể"
                              >
                                <FiLayers className="text-indigo-600" />
                              </Link>
                              <Link
                                to={`/admin/products/edit/${product.id}`}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Sửa"
                              >
                                <FiEdit className="text-green-600" />
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
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

                  {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
                      <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                      {(searchTerm || filterCategory) && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterCategory('');
                          }}
                          className="mt-4 text-purple-600 hover:underline text-sm"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  {filteredProducts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Hiển thị <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                        {(searchTerm || filterCategory) && (
                          <span className="ml-2 text-purple-600">
                            (đã lọc từ {products.length} sản phẩm)
                          </span>
                        )}
                      </p>
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

export default AdminProducts;
