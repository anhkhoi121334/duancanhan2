import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiPlus, FiEdit, 
  FiTrash2, FiTag, FiDroplet, FiX, FiImage, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminSizes = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Sizes');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 1
  });
  const [bulkSizes, setBulkSizes] = useState('');

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
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('📏 Fetching sizes...');
      
      const response = await fetch(`${API_URL}/sizes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Kiểm tra Content-Type trước khi parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Response không phải JSON:', errorText.substring(0, 200));
        throw new Error('Server trả về không phải JSON format');
      }

      const data = await response.json();
      console.log('📦 Sizes response:', data);

      if (Array.isArray(data)) {
        setSizes(data);
        console.log(`✅ Loaded ${data.length} sizes`);
      } else {
        console.warn('⚠️ No sizes data');
        setSizes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sizes:', error);
      setSizes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (size = null) => {
    if (size) {
      setEditingSize(size);
      setFormData({
        name: size.name,
        status: size.status
      });
    } else {
      setEditingSize(null);
      setFormData({
        name: '',
        status: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSize(null);
    setFormData({
      name: '',
      status: 1
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const url = editingSize 
        ? `${API_URL}/sizes/${editingSize.id}`
        : `${API_URL}/sizes`;
      
      const method = editingSize ? 'PUT' : 'POST';

      console.log(`${method} ${url}`, formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          status: parseInt(formData.status)
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        alert(data.message || (editingSize ? 'Cập nhật size thành công!' : 'Thêm size thành công!'));
        handleCloseModal();
        fetchSizes();
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sizeId) => {
    if (!confirm('Bạn có chắc muốn xóa size này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      console.log(`🗑️ Deleting size ${sizeId}...`);
      
      const response = await fetch(`${API_URL}/sizes/${sizeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      alert(data.message || 'Xóa size thành công!');
      fetchSizes();
    } catch (error) {
      console.error('Error deleting size:', error);
      alert('Có lỗi xảy ra khi xóa size!');
    }
  };

  // Thêm nhanh các size giày phổ biến
  const handleAddCommonShoeSizes = async () => {
    if (!confirm('Bạn muốn thêm các size giày phổ biến (35-45)?\nCác size đã tồn tại sẽ được bỏ qua.')) return;

    setLoading(true);
    const commonSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    await handleBulkAdd(commonSizes);
  };

  // Thêm nhiều size một lúc
  const handleBulkAdd = async (sizeList = null) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Lấy danh sách sizes từ input hoặc từ parameter
      let sizesToAdd = sizeList;
      if (!sizesToAdd) {
        if (!bulkSizes.trim()) {
          alert('Vui lòng nhập danh sách sizes!');
          setLoading(false);
          return;
        }
        // Parse từ textarea: mỗi dòng là một size, hoặc cách nhau bởi dấu phẩy
        sizesToAdd = bulkSizes
          .split(/[,\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      if (sizesToAdd.length === 0) {
        alert('Không có size nào để thêm!');
        setLoading(false);
        return;
      }

      // Lấy danh sách sizes hiện có để tránh trùng
      const existingSizes = sizes.map(s => s.name.toLowerCase().trim());
      
      // Lọc ra các size chưa tồn tại
      const newSizes = sizesToAdd.filter(
        size => !existingSizes.includes(size.toLowerCase().trim())
      );

      if (newSizes.length === 0) {
        alert('Tất cả các size đã tồn tại!');
        setLoading(false);
        return;
      }

      // Thêm từng size
      let successCount = 0;
      let failCount = 0;

      for (const sizeName of newSizes) {
        try {
          const response = await fetch(`${API_URL}/sizes`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: sizeName,
              status: 1
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error adding size ${sizeName}:`, error);
          failCount++;
        }
      }

      setBulkSizes('');
      setShowBulkModal(false);
      alert(`Thêm thành công ${successCount} size(s)${failCount > 0 ? `, ${failCount} size(s) thất bại` : ''}!`);
      fetchSizes();
    } catch (error) {
      console.error('Error in bulk add:', error);
      alert('Có lỗi xảy ra khi thêm sizes!');
    } finally {
      setLoading(false);
    }
  };

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
      <SEO title="Quản lý Sizes - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sizes</h1>
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
              {/* Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Tổng sizes</p>
                      <p className="text-2xl font-bold text-gray-800">{sizes.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Đang hoạt động</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {sizes.filter(s => s.status === 1).length}
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
                      <p className="text-gray-500 text-sm">Đã ẩn</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {sizes.filter(s => s.status === 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizes List */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-gray-800">Danh sách sizes ({sizes.length})</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleAddCommonShoeSizes}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiPlus />
                      Thêm size giày (35-45)
                    </button>
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <FiPlus />
                      Thêm nhiều size
                    </button>
                    <button
                      onClick={() => handleOpenModal()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <FiPlus />
                      Thêm 1 size
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                  </div>
                ) : sizes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sizes.map(size => (
                      <div
                        key={size.id}
                        className="relative group bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-purple-500 transition-all"
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-800 mb-2">{size.name}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            size.status === 1 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {size.status === 1 ? 'Hoạt động' : 'Ẩn'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => handleOpenModal(size)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Sửa"
                          >
                            <FiEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(size.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Xóa"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
                    <p className="text-gray-500">Chưa có size nào</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSize ? 'Sửa size' : 'Thêm size mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Size Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ví dụ: 38, S, M, L, Free Size..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Có thể nhập số (38, 39, 40...) hoặc chữ (S, M, L, XL, Free Size...)
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Ẩn</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : (editingSize ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Thêm nhiều size một lúc
              </h2>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkSizes('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleBulkAdd();
              }} 
              className="p-6 space-y-4"
            >
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Hướng dẫn:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Nhập mỗi size trên một dòng, hoặc cách nhau bởi dấu phẩy (,)</li>
                  <li>Ví dụ: 35, 36, 37, 38 hoặc mỗi dòng một size</li>
                  <li>Các size đã tồn tại sẽ được tự động bỏ qua</li>
                </ul>
              </div>

              {/* Bulk Sizes Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh sách sizes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkSizes}
                  onChange={(e) => setBulkSizes(e.target.value)}
                  required
                  rows={8}
                  placeholder="35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45

Hoặc:
S
M
L
XL
2XL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Đã nhập: {bulkSizes.split(/[,\n]/).filter(s => s.trim().length > 0).length} size(s)
                </p>
              </div>

              {/* Quick Add Buttons */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Thêm nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkSizes(prev => prev ? `${prev}\n35,36,37,38,39,40,41,42,43,44,45` : '35,36,37,38,39,40,41,42,43,44,45')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
                  >
                    Size giày (35-45)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSizes(prev => prev ? `${prev}\nS,M,L,XL,2XL,3XL` : 'S,M,L,XL,2XL,3XL')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
                  >
                    Size quần áo (S-3XL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSizes(prev => prev ? `${prev}\n28,29,30,31,32,33,34` : '28,29,30,31,32,33,34')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
                  >
                    Size giày nhỏ (28-34)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSizes(prev => prev ? `${prev}\n46,47,48,49,50` : '46,47,48,49,50')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
                  >
                    Size giày lớn (46-50)
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkSizes('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !bulkSizes.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang thêm...' : 'Thêm tất cả'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSizes;

