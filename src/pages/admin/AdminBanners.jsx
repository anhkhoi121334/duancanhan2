import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiPlus, FiEdit, 
  FiTrash2, FiImage, FiUpload, FiX, FiTag, FiDroplet, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';
import { useCartStore } from '../../store/cartStore';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const DEFAULT_FORM_DATA = {
  title: '',
  link: '',
  position: 1,
  status: 1
};

const MENU_ITEMS = [
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

const AdminBanners = () => {
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  // State management
  const [activeMenu, setActiveMenu] = useState('Banners');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // ========== Authentication & Initialization ==========
  useEffect(() => {
    checkAdminAuth();
  }, [navigate, showToast]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const checkAdminAuth = useCallback(() => {
    const adminUser = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_token');

    if (!adminUser || !adminToken) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        showToast('Bạn không có quyền truy cập trang này!', 'error');
        navigate('/');
        return;
      }
      setAdminName(user.name || 'Admin User');
    } catch (error) {
      console.error('Error parsing admin user:', error);
      navigate('/admin/login');
    }
  }, [navigate, showToast]);

  // ========== API Functions ==========
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setBanners(data);
      } else if (data.data && Array.isArray(data.data)) {
        setBanners(data.data);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
      showToast('Không thể tải danh sách banners', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createOrUpdateBanner = async (bannerData, bannerId = null) => {
    const token = localStorage.getItem('admin_token');
    const url = bannerId ? `${API_URL}/banners/${bannerId}` : `${API_URL}/banners`;
    const method = bannerId ? 'PUT' : 'POST';

    const formDataObj = new FormData();
    formDataObj.append('title', bannerData.title);
    formDataObj.append('link', bannerData.link);
    formDataObj.append('position', bannerData.position.toString());
    formDataObj.append('status', bannerData.status.toString());
    
    if (bannerData.image) {
      formDataObj.append('image', bannerData.image);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formDataObj
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Có lỗi xảy ra');
    }

    return data;
  };

  const deleteBanner = async (id) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Có lỗi xảy ra');
    }

    return data;
  };

  // ========== Helper Functions ==========
  const getImageUrl = (banner) => {
    if (!banner) return null;
    
    // Check for image_url first (from API response)
    if (banner.image_url) {
      return banner.image_url.startsWith('http') 
        ? banner.image_url 
        : `${API_URL}/${banner.image_url.replace(/^\//, '')}`;
    }
    // Fallback to image field (for backward compatibility)
    if (banner.image) {
      return banner.image.startsWith('http') 
        ? banner.image 
        : `${API_URL}/${banner.image.replace(/^\//, '')}`;
    }
    return null;
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setImagePreview('');
    setSelectedFile(null);
    setEditingBanner(null);
  };

  // ========== Validation Functions ==========
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast('File vượt quá 5MB!', 'error');
      return false;
    }

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      showToast('Chỉ chấp nhận file JPG, PNG, GIF, WEBP, AVIF!', 'error');
      return false;
    }

    return true;
  };

  const validateForm = () => {
    if (!editingBanner && !selectedFile) {
      showToast('Vui lòng chọn hình ảnh banner!', 'error');
      return false;
    }
    return true;
  };

  // ========== Event Handlers ==========
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        link: banner.link || '',
        position: banner.position || 1,
        status: banner.status !== undefined ? banner.status : 1
      });
      const imageUrl = getImageUrl(banner);
      setImagePreview(imageUrl || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const bannerData = {
        title: formData.title,
        link: formData.link,
        position: formData.position,
        status: formData.status,
        image: selectedFile
      };

      const data = await createOrUpdateBanner(bannerData, editingBanner?.id);
      
      showToast(
        data.message || (editingBanner ? 'Cập nhật banner thành công!' : 'Thêm banner thành công!'), 
        'success'
      );
      
      handleCloseModal();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showToast(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;

    try {
      const data = await deleteBanner(id);
      showToast(data.message || 'Xóa banner thành công!', 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showToast(error.message || 'Có lỗi xảy ra khi xóa banner!', 'error');
    }
  };

  // ========== Render Functions ==========
  const renderSidebar = () => (
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
        {MENU_ITEMS.map((item, index) => (
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
  );

  const renderBannerCard = (banner) => {
    const imageUrl = getImageUrl(banner);
    
    return (
      <div
        key={banner.id}
        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Banner Image */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full ${imageUrl ? 'hidden' : 'flex'} items-center justify-center`}>
            <FiImage className="text-gray-400 text-4xl" />
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              banner.status === 1 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-white'
            }`}>
              {banner.status === 1 ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Banner Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1">
            {banner.title || 'Untitled Banner'}
          </h3>
          <p className="text-xs text-gray-500 mb-2">Link: {banner.link || 'N/A'}</p>
          <p className="text-xs text-gray-500 mb-4">Vị trí: {banner.position || 1}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal(banner)}
              className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FiEdit />
              Sửa
            </button>
            <button
              onClick={() => handleDelete(banner.id)}
              className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FiTrash2 />
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingBanner ? 'Sửa banner' : 'Thêm banner mới'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="text-xl text-gray-600" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Summer Sale 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh banner <span className="text-red-500">*</span>
              </label>
              <label className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <FiUpload />
                {selectedFile ? selectedFile.name : (editingBanner ? 'Chọn file mới (tùy chọn)' : 'Chọn file')}
                <input
                  type="file"
                  accept={VALID_IMAGE_TYPES.join(',')}
                  onChange={handleImageChange}
                  className="hidden"
                  required={!editingBanner}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ: JPG, JPEG, PNG, GIF, WEBP, AVIF - Tối đa 5MB
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
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Liên kết
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="VD: /products?featured=sale"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL hoặc đường dẫn khi click vào banner
              </p>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min="1"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Số càng nhỏ, banner càng hiển thị trước
              </p>
            </div>

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
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Form Actions */}
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
                {loading ? 'Đang lưu...' : editingBanner ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="Quản lý Banners - Admin ANKH Store" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        {renderSidebar()}

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Banners</h1>
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
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách banners</h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <FiPlus />
                  Thêm banner mới
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              )}

              {/* Banners Grid */}
              {!loading && banners.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map(renderBannerCard)}
                </div>
              )}

              {/* Empty State */}
              {!loading && banners.length === 0 && (
                <div className="text-center py-12">
                  <FiImage className="mx-auto text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có banner nào</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Modal */}
        {renderModal()}
      </div>
    </>
  );
};

export default AdminBanners;
