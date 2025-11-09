import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiPlus, FiEdit, 
  FiTrash2, FiDroplet, FiTag, FiImage, FiUpload, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminBrands = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Thương hiệu');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 1
  });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

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
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // Direct array response
        setBrands(data);
      } else if (data.brands && Array.isArray(data.brands)) {
        // Wrapped in brands key: { brands: [...] }
        setBrands(data.brands);
      } else if (data.data && Array.isArray(data.data)) {
        // Wrapped in data key: { data: [...] }
        setBrands(data.data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
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

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, construct full URL
    return `${API_URL}/${imagePath.replace(/^\//, '')}`;
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        image: brand.image || '',
        status: brand.status !== undefined ? brand.status : 1
      });
      // Use full URL from API response
      const imageUrl = getImageUrl(brand.image);
      setImagePreview(imageUrl || '');
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        status: 1
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 1
    });
    setImagePreview('');
    setSelectedFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File vượt quá 2MB!');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file JPG, PNG, GIF, WEBP!');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image separately for existing brand
  const uploadBrandImage = async (brandId, file) => {
    const token = localStorage.getItem('admin_token');
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    const response = await fetch(`${API_URL}/admin/brands/${brandId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formDataObj
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi upload ảnh');
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      let brandId = null;

      // Step 1: Create or update brand (without image if editing)
      if (editingBrand) {
        // Update existing brand
        const url = `${API_URL}/admin/brands/${editingBrand.id}`;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };

        const body = JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status
        });

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật thương hiệu');
        }

        const data = await response.json();
        brandId = editingBrand.id;

        // Step 2: Upload image separately if file is selected
        if (selectedFile) {
          await uploadBrandImage(brandId, selectedFile);
        }

        alert(data.message || 'Cập nhật thương hiệu thành công!');
      } else {
        // Create new brand
        const url = `${API_URL}/admin/brands`;
        let body;
        let headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        if (selectedFile) {
          // Create with image
          const formDataObj = new FormData();
          formDataObj.append('name', formData.name);
          formDataObj.append('description', formData.description);
          formDataObj.append('status', formData.status.toString());
          formDataObj.append('image', selectedFile);
          body = formDataObj;
        } else {
          // Create without image
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({
            name: formData.name,
            description: formData.description,
            status: formData.status
          });
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo thương hiệu');
        }

        const data = await response.json();
        alert(data.message || 'Thêm thương hiệu thành công!');
      }

      handleCloseModal();
      fetchBrands();
    } catch (error) {
      console.error('❌ Error:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/admin/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Xóa thương hiệu thành công!');
      fetchBrands();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  return (
    <>
      <SEO title="Quản lý Thương hiệu - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Thương hiệu</h1>
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách thương hiệu</h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <FiPlus />
                  Thêm thương hiệu
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              )}

              {/* Brands Grid */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                      {brand.image ? (
                        <img 
                          src={getImageUrl(brand.image) || ''} 
                          alt={brand.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full ${brand.image ? 'hidden' : 'flex'} items-center justify-center`}>
                        <FiImage className="text-gray-400 text-4xl" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{brand.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{brand.description}</p>
                      {brand.products_count !== undefined && (
                        <p className="text-xs text-gray-400 mb-4">
                          {brand.products_count} sản phẩm
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(brand)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <FiEdit />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <FiTrash2 />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}

              {brands.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có thương hiệu nào</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="VD: Nike, Adidas, Puma..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  placeholder="Mô tả ngắn về thương hiệu..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hình ảnh {!editingBrand && <span className="text-red-500">*</span>}
                </label>
                <label className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <FiUpload />
                  {selectedFile ? selectedFile.name : (editingBrand ? 'Chọn file mới (tùy chọn)' : 'Chọn file')}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    required={!editingBrand}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, JPEG, PNG, GIF, WEBP - Tối đa 2MB
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xem trước
                  </label>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Ẩn</option>
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
                  {loading ? 'Đang lưu...' : editingBrand ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBrands;

