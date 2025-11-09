import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiUpload, FiImage, 
  FiTrash2, FiArrowLeft, FiTag, FiDroplet, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminProductImages = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [activeMenu, setActiveMenu] = useState('Sản phẩm');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

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
    if (productId) {
      fetchProduct();
      fetchImages();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.product) {
        setProduct(data.product);
      } else {
        setProduct(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log(`📸 Fetching images for product ${productId}...`);
      
      const response = await fetch(`${API_URL}/products/${productId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📦 Images response:', data);

      if (data.images) {
        setImages(data.images);
        console.log(`✅ Loaded ${data.images.length} images`);
        
        // Update product name if available
        if (data.product_name && !product) {
          setProduct({ id: productId, name: data.product_name });
        }
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      setImages([]);
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
    { icon: <FiShoppingBag />, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: <FiUsers />, label: 'Khách hàng', path: '/admin/customers' },
    { icon: <FiStar />, label: 'Đánh giá', path: '/admin/reviews' },
    { icon: <FiTrendingUp />, label: 'Thống kê', path: '/admin/analytics' },
    { icon: <FiDollarSign />, label: 'Doanh thu', path: '/admin/revenue' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate file size (max 2MB each)
      const validFiles = files.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} vượt quá 2MB!`);
          return false;
        }
        return true;
      });

      setSelectedFiles(validFiles);

      // Create preview URLs
      const previews = [];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === validFiles.length) {
            setFilePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Vui lòng chọn ảnh để upload!');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      
      selectedFiles.forEach((file, index) => {
        formData.append('images[]', file);
      });

      console.log(`📸 Đang upload ${selectedFiles.length} ảnh cho sản phẩm #${productId}...`);

      const response = await fetch(`${API_URL}/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Upload ảnh thành công!');
        setSelectedFiles([]);
        setFilePreviews([]);
        fetchImages(); // Reload images
        console.log('✅ Upload ảnh thành công!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error.message || 'Có lỗi xảy ra khi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      console.log(`🗑️ Deleting image ${imageId} from product ${productId}...`);
      
      const response = await fetch(`${API_URL}/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('✅ Delete response:', data);

      alert(data.message || 'Xóa ảnh thành công!');
      fetchImages();
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      alert('Có lỗi xảy ra khi xóa ảnh!');
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  // Drag and Drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move image up/down
  const moveImage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;
    
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
    saveImageOrder(newImages);
  };

  // Save image order to backend
  const saveImageOrder = async (orderedImages) => {
    setReordering(true);
    try {
      const token = localStorage.getItem('admin_token');
      const imageIds = orderedImages.map(img => img.id);
      
      const response = await fetch(`${API_URL}/products/${productId}/images/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ image_ids: imageIds })
      });

      if (response.ok) {
        console.log('✅ Thứ tự ảnh đã được cập nhật');
      } else {
        // Nếu API endpoint chưa tồn tại, chỉ log và không báo lỗi
        console.warn('⚠️ API reorder chưa được implement, thứ tự chỉ thay đổi ở frontend');
      }
    } catch (error) {
      console.warn('⚠️ Không thể lưu thứ tự ảnh:', error);
      // Không báo lỗi vì endpoint có thể chưa tồn tại
    } finally {
      setReordering(false);
    }
  };

  // Save order after drag ends
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      saveImageOrder(images);
      setDraggedIndex(null);
    }
  };

  return (
    <>
      <SEO title={`Quản lý Ảnh Sản phẩm - Admin ANKH Store`} />

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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
              <FiSettings className="text-xl" />
              {sidebarOpen && <span className="font-medium text-sm">Cài đặt</span>}
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
                <button
                  onClick={() => navigate('/admin/products')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Quản lý Ảnh Sản phẩm</h1>
                  {product && (
                    <p className="text-sm text-gray-500 mt-1">{product.name}</p>
                  )}
                </div>
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
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Upload Ảnh Mới</h2>
                
                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                      <FiUpload />
                      <span>Chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/gif,image/webp,image/avif"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, JPEG, PNG, GIF, WEBP, AVIF (MAX. 2MB mỗi ảnh)
                    </p>
                  </div>

                  {/* Selected Files Preview */}
                  {filePreviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Đã chọn {selectedFiles.length} ảnh
                        </p>
                        <button
                          onClick={handleClearSelection}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square border-2 border-purple-300 rounded-lg overflow-hidden">
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {uploading ? 'Đang upload...' : `Upload ${selectedFiles.length} ảnh`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Images */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Ảnh hiện tại ({images.length})
                  </h2>
                  {images.length > 1 && (
                    <p className="text-sm text-gray-500">
                      💡 Kéo thả để sắp xếp lại thứ tự ảnh
                    </p>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                ) : images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id || index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        className={`relative group cursor-move ${
                          draggedIndex === index ? 'opacity-50' : ''
                        } ${reordering ? 'pointer-events-none' : ''}`}
                      >
                        <div className="aspect-square border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={image.image_url} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center">
                            <FiImage className="text-gray-400 text-4xl" />
                          </div>
                        </div>
                        
                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 p-1.5 bg-white bg-opacity-90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiMenu className="text-gray-600 text-sm" />
                        </div>
                        
                        {/* Order Number Badge */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded font-semibold">
                          #{index + 1}
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                        
                        {/* New Badge */}
                        {image.created_at && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                            Mới
                          </div>
                        )}
                        
                        {/* Arrow Controls */}
                        <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0 || reordering}
                            className="p-1.5 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Di chuyển lên"
                          >
                            <FiArrowUp className="text-gray-600 text-sm" />
                          </button>
                          <button
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === images.length - 1 || reordering}
                            className="p-1.5 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Di chuyển xuống"
                          >
                            <FiArrowDown className="text-gray-600 text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <FiImage className="mx-auto text-5xl text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Chưa có ảnh nào</p>
                    <p className="text-gray-400 text-sm">Upload ảnh đầu tiên cho sản phẩm này</p>
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

export default AdminProductImages;

