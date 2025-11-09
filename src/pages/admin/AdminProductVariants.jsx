import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiPlus, FiEdit, 
  FiTrash2, FiArrowLeft, FiTag, FiDroplet, FiImage, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminProductVariants = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [activeMenu, setActiveMenu] = useState('Sản phẩm');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [uploadingVariant, setUploadingVariant] = useState(null);
  const [uploadImages, setUploadImages] = useState([]);
  const [uploadImageUrls, setUploadImageUrls] = useState([]); // Store object URLs for cleanup
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    size_id: '',
    color_id: '',
    price: '',
    price_sale: '',
    quantity: ''
  });
  const [quickFormData, setQuickFormData] = useState({
    selectedSizeIds: [],
    selectedColorIds: [],
    price: '',
    price_sale: '',
    quantity: ''
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchVariants();
      fetchSizes();
      fetchColors();
    }
  }, [productId]);

  // ========== Helper Functions ==========
  
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

  // Helper function to extract array from response
  const extractArrayFromResponse = (data, key = null) => {
    if (Array.isArray(data)) {
      return data;
    }
    if (key && data[key] && Array.isArray(data[key])) {
      return data[key];
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  };

  // ========== API Functions ==========

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Thử endpoint /products/{id} trước (giống các file khác)
      let response = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Nếu không tìm thấy, thử endpoint /admin/products/{id}
      if (!response.ok && response.status === 404) {
        console.log('Trying alternative endpoint: /admin/products');
        response = await fetch(`${API_URL}/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }

      const data = await handleApiResponse(response);
      
      // Handle different response formats: { product: {...} } or {...}
      const productData = data.product || data.data || data;
      setProduct(productData);
      
      console.log('✅ Product loaded:', productData);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      // Set default product để không bị lỗi UI
      setProduct({
        id: productId,
        name: 'Đang tải...',
        price: 0
      });
    }
  };

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log(`📡 Fetching variants for product ${productId}...`);
      
      const response = await fetch(`${API_URL}/products/${productId}/variants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      console.log('📦 Variants response:', data);

      // Handle different response formats: { variants: [...] } or [...]
      const variantsData = extractArrayFromResponse(data, 'variants');
      console.log(`✅ Loaded ${variantsData.length} variants`);
      
      // Update product name if provided in response
      if (data.product_name && !product?.name) {
        setProduct(prev => ({
          ...prev,
          name: data.product_name,
          id: data.product_id || productId
        }));
      }

      setVariants(variantsData);
    } catch (error) {
      console.error('❌ Error fetching variants:', error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSizes = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      console.log('📏 Fetching sizes...');
      
      const response = await fetch(`${API_URL}/sizes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await handleApiResponse(response);
      console.log('📦 Sizes response:', data);
      
      // Handle different response formats: { sizes: [...] } or [...]
      const sizesData = extractArrayFromResponse(data, 'sizes');
      
      // Chỉ lấy sizes có status = 1 (active)
      const activeSizes = sizesData.filter(size => size.status === 1);
      setSizes(activeSizes);
      console.log(`✅ Loaded ${activeSizes.length} active sizes`);
    } catch (error) {
      console.error('❌ Error fetching sizes:', error);
      setSizes([]);
    }
  };

  const fetchColors = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      console.log('🎨 Fetching colors...');
      
      // Try admin endpoint first, fallback to public endpoint
      let response = await fetch(`${API_URL}/admin/colors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // If admin endpoint fails, try public endpoint
      if (!response.ok) {
        console.warn('Admin colors endpoint failed, trying public endpoint...');
        response = await fetch(`${API_URL}/colors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
      
      const data = await handleApiResponse(response);
      console.log('📦 Colors response:', data);
      
      // Handle different response formats: { colors: [...] } or [...]
      const colorsData = extractArrayFromResponse(data, 'colors');
      setColors(colorsData);
      console.log(`✅ Loaded ${colorsData.length} colors`);
    } catch (error) {
      console.error('❌ Error fetching colors:', error);
      setColors([]);
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

  const handleOpenModal = (variant = null) => {
    if (variant) {
      setEditingVariant(variant);
      
      // Xử lý size_id: nếu có size_id thì dùng, nếu không thì tìm từ size string
      let sizeId = variant.size_id;
      if (!sizeId && variant.size) {
        const foundSize = sizes.find(s => s.name === variant.size);
        sizeId = foundSize?.id || '';
      }
      
      // Xử lý color_id: nếu có color_id thì dùng, nếu không thì tìm từ color string
      let colorId = variant.color_id;
      if (!colorId && variant.color) {
        const foundColor = colors.find(c => c.type === variant.color);
        colorId = foundColor?.id || '';
      }
      
      setFormData({
        size_id: sizeId || '',
        color_id: colorId || '',
        price: variant.price || '',
        price_sale: variant.price_sale || '',
        quantity: variant.quantity || ''
      });
    } else {
      setEditingVariant(null);
      setFormData({
        size_id: '',
        color_id: '',
        price: product?.price || '',
        price_sale: '',
        quantity: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVariant(null);
    setFormData({
      size_id: '',
      color_id: '',
      price: '',
      price_sale: '',
      quantity: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dữ liệu
      if (!editingVariant) {
        if (!formData.size_id || !formData.color_id) {
          alert('Vui lòng chọn size và màu sắc!');
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      const url = editingVariant 
        ? `${API_URL}/products/${productId}/variants/${editingVariant.id}`
        : `${API_URL}/products/${productId}/variants`;
      
      // Validate và parse số
      const quantity = parseInt(formData.quantity);
      const price = parseInt(formData.price);
      
      if (isNaN(quantity) || quantity < 0) {
        alert('Số lượng không hợp lệ!');
        setLoading(false);
        return;
      }
      
      if (isNaN(price) || price <= 0) {
        alert('Giá không hợp lệ!');
        setLoading(false);
        return;
      }

      // Khi sửa biến thể, chỉ gửi quantity, price, price_sale
      // Khi thêm mới, gửi đầy đủ size_id, color_id, price, price_sale, quantity
      let requestBody;
      
      if (editingVariant) {
        // Sửa biến thể - chỉ gửi quantity, price, price_sale
        requestBody = {
          quantity: quantity,
          price: price
        };
        
        // Chỉ thêm price_sale nếu có giá trị và hợp lệ
        if (formData.price_sale && formData.price_sale.trim() !== '') {
          const priceSale = parseInt(formData.price_sale);
          if (!isNaN(priceSale) && priceSale > 0) {
            requestBody.price_sale = priceSale;
          }
        }
      } else {
        // Thêm mới - gửi đầy đủ
        const sizeId = parseInt(formData.size_id);
        const colorId = parseInt(formData.color_id);
        
        if (isNaN(sizeId) || isNaN(colorId)) {
          alert('Size hoặc màu sắc không hợp lệ!');
          setLoading(false);
          return;
        }

        requestBody = {
          size_id: sizeId,
          color_id: colorId,
          price: price,
          quantity: quantity
        };
        
        // Chỉ thêm price_sale nếu có giá trị và hợp lệ
        if (formData.price_sale && formData.price_sale.trim() !== '') {
          const priceSale = parseInt(formData.price_sale);
          if (!isNaN(priceSale) && priceSale > 0) {
            requestBody.price_sale = priceSale;
          }
        }
      }

      console.log('📤 Sending request:', {
        url,
        method: editingVariant ? 'PUT' : 'POST',
        body: requestBody
      });
      
      const response = await fetch(url, {
        method: editingVariant ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (response.ok) {
        alert(editingVariant ? 'Cập nhật biến thể thành công!' : 'Thêm biến thể thành công!');
        handleCloseModal();
        fetchVariants();
      } else {
        // Kiểm tra xem response có phải JSON không
        const contentType = response.headers.get('content-type');
        let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('❌ Error response (JSON):', errorData);
          } catch (parseError) {
            console.error('❌ Cannot parse error response as JSON:', parseError);
          }
        } else {
          try {
            const errorText = await response.text();
            console.error('❌ Error response (HTML/Text):', errorText.substring(0, 500));
            errorMessage += '. Server trả về không phải JSON format.';
          } catch (textError) {
            console.error('❌ Cannot read error response:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId) => {
    if (!confirm('Bạn có chắc muốn xóa biến thể này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Xóa biến thể thành công!');
        fetchVariants();
      } else {
        // Kiểm tra xem response có phải JSON không
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        } else {
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa biến thể!');
    }
  };

  // Quick add multiple variants
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (quickFormData.selectedSizeIds.length === 0) {
        alert('Vui lòng chọn ít nhất một size!');
        setLoading(false);
        return;
      }

      if (quickFormData.selectedColorIds.length === 0) {
        alert('Vui lòng chọn ít nhất một màu!');
        setLoading(false);
        return;
      }

      const price = parseInt(quickFormData.price);
      const quantity = parseInt(quickFormData.quantity);

      if (isNaN(price) || price <= 0) {
        alert('Giá không hợp lệ!');
        setLoading(false);
        return;
      }

      if (isNaN(quantity) || quantity < 0) {
        alert('Số lượng không hợp lệ!');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      // Prepare price_sale if provided
      let priceSale = null;
      if (quickFormData.price_sale && quickFormData.price_sale.trim() !== '') {
        const parsedPriceSale = parseInt(quickFormData.price_sale);
        if (!isNaN(parsedPriceSale) && parsedPriceSale > 0) {
          priceSale = parsedPriceSale;
        }
      }

      // Prepare request body for quick add endpoint
      const requestBody = {
        size_ids: quickFormData.selectedSizeIds.map(id => parseInt(id)),
        color_ids: quickFormData.selectedColorIds.map(id => parseInt(id)),
        price: price,
        quantity: quantity
      };

      // Only add price_sale if it's a valid number
      if (priceSale !== null) {
        requestBody.price_sale = priceSale;
      }

      const totalVariants = requestBody.size_ids.length * requestBody.color_ids.length;
      console.log(`📤 Creating ${totalVariants} variants via quick endpoint...`, requestBody);

      // Call quick add endpoint
      const response = await fetch(`${API_URL}/admin/products/${productId}/variants/quick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      // Check Content-Type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('❌ Response is not JSON:', errorText.substring(0, 500));
        throw new Error(`Lỗi ${response.status}: Server trả về không phải JSON. ${errorText.substring(0, 200)}`);
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quick add success:', result);
        
        const createdCount = result.created_count || result.variants?.length || totalVariants;
        alert(result.message || `Tạo thành công ${createdCount} biến thể!`);
        
        setShowQuickModal(false);
        setQuickFormData({
          selectedSizeIds: [],
          selectedColorIds: [],
          price: product?.price || '',
          price_sale: '',
          quantity: ''
        });
        fetchVariants();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `Lỗi ${response.status}: ${response.statusText}`;
        console.error('❌ Quick add error:', errorData);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Quick add error:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const getSizeName = (sizeId) => {
    const size = sizes.find(s => s.id === sizeId);
    return size?.name || sizeId;
  };

  // Map màu sắc tên -> hex code
  const colorMap = {
    'Đen': '#000000',
    'Trắng': '#FFFFFF',
    'Xám': '#808080',
    'Đỏ': '#FF0000',
    'Hồng': '#FFC0CB',
    'Be': '#F5F5DC',
    'Nâu': '#8B4513',
    'Xanh Navy': '#000080',
    'Xanh dương': '#0000FF',
    'Xanh lá': '#00FF00',
    'Vàng': '#FFFF00',
    'Cam': '#FFA500',
    'Cam Đậm': '#FF6600',
    'Cam Nhạt': '#FFB366'
  };

  const getColorInfo = (colorId) => {
    const color = colors.find(c => c.id === colorId);
    if (!color) return { type: 'Unknown', hex_code: '#CCCCCC' };
    
    return {
      ...color,
      hex_code: colorMap[color.type] || '#CCCCCC'
    };
  };

  // Handle open image upload modal
  const handleOpenImageModal = (variant) => {
    // Cleanup any existing URLs
    uploadImageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    setUploadingVariant(variant);
    setUploadImages([]);
    setUploadImageUrls([]);
    setShowImageModal(true);
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Cleanup previous object URLs
    uploadImageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    // Create new object URLs for preview
    const newUrls = files.map(file => URL.createObjectURL(file));
    setUploadImageUrls(newUrls);
    setUploadImages(files);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      uploadImageUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [uploadImageUrls]);

  // Handle upload images for variant
  const handleUploadImages = async (e) => {
    e.preventDefault();
    
    if (!uploadingVariant || uploadImages.length === 0) {
      alert('Vui lòng chọn ít nhất một ảnh!');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('admin_token');
      
      const formData = new FormData();
      uploadImages.forEach((file) => {
        formData.append('images[]', file);
      });

      // Try /admin/products/{id}/variants/{variantId}/images first
      let response = await fetch(`${API_URL}/admin/products/${productId}/variants/${uploadingVariant.id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
          // Don't set Content-Type, browser will set it with boundary for FormData
        },
        body: formData
      });

      // If 404, try without /admin/ prefix
      if (!response.ok && response.status === 404) {
        console.log('Trying endpoint without /admin/ prefix...');
        response = await fetch(`${API_URL}/products/${productId}/variants/${uploadingVariant.id}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        });
      }

      // Check Content-Type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Response is not JSON:', text.substring(0, 500));
        throw new Error(`Lỗi ${response.status}: Server trả về không phải JSON. ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Upload images success:', result);
      
      alert(result.message || `Upload thành công ${result.images?.length || uploadImages.length} ảnh!`);
      
      // Refresh variants để lấy ảnh mới
      await fetchVariants();
      
      // Cleanup object URLs before closing
      uploadImageUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
      
      // Close modal
      setShowImageModal(false);
      setUploadImages([]);
      setUploadImageUrls([]);
      setUploadingVariant(null);
    } catch (error) {
      console.error('❌ Upload images error:', error);
      alert(error.message || 'Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <SEO title={`Quản lý Biến thể - Admin ANKH Store`} />

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
                <button
                  onClick={() => navigate('/admin/products')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Quản lý Biến thể</h1>
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
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    Danh sách biến thể ({variants.length})
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setQuickFormData({
                          selectedSizeIds: [],
                          selectedColorIds: [],
                          price: product?.price || '',
                          price_sale: '',
                          quantity: ''
                        });
                        setShowQuickModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <FiPlus />
                      Thêm nhanh nhiều biến thể
                    </button>
                    <button
                      onClick={() => handleOpenModal()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <FiPlus />
                      Thêm 1 biến thể
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                ) : variants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ảnh</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Size - Màu sắc</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Giá gốc</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Giá KM</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Số lượng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant) => {
                          // Handle both formats: variant.color (string/object) or variant.color_id (number)
                          let colorName;
                          if (variant.color) {
                            colorName = typeof variant.color === 'object' ? variant.color.name : variant.color;
                          } else {
                            colorName = getColorInfo(variant.color_id).type;
                          }
                          
                          const colorInfo = variant.color_id 
                            ? getColorInfo(variant.color_id)
                            : { type: colorName, hex_code: colorMap[colorName] || '#CCCCCC' };
                          
                          // Handle size: variant.size (string/object) or variant.size_id (number)
                          let sizeName;
                          if (variant.size) {
                            sizeName = typeof variant.size === 'object' ? variant.size.name : variant.size;
                          } else {
                            sizeName = getSizeName(variant.size_id);
                          }
                          
                          // Get first image for display
                          const firstImage = variant.images && variant.images.length > 0
                            ? (typeof variant.images[0] === 'string' 
                                ? variant.images[0] 
                                : (variant.images[0].url || variant.images[0].image_url || variant.images[0].image))
                            : null;
                          
                          return (
                            <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                {firstImage ? (
                                  <div className="relative group">
                                    <img
                                      src={firstImage}
                                      alt={`${sizeName} - ${colorName}`}
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                    />
                                    {variant.images && variant.images.length > 1 && (
                                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        +{variant.images.length - 1}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <FiImage className="text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-800">{sizeName}</span>
                                  <span className="text-gray-400">-</span>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded border-2 border-gray-300"
                                      style={{ backgroundColor: colorInfo.hex_code }}
                                    ></div>
                                    <span className="text-gray-800">{colorName}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-800 font-medium">
                                {variant.price ? (
                                  `${variant.price.toLocaleString('vi-VN')} VNĐ`
                                ) : product?.price ? (
                                  `${product.price.toLocaleString('vi-VN')} VNĐ`
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                {variant.price_sale ? (
                                  <span className="text-red-600 font-medium">
                                    {variant.price_sale.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                ) : product?.price_sale ? (
                                  <span className="text-red-600 font-medium">
                                    {product.price_sale.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  variant.in_stock === false || variant.quantity === 0
                                    ? 'bg-red-100 text-red-700'
                                    : variant.quantity > 10
                                    ? 'bg-green-100 text-green-700'
                                    : variant.quantity > 0
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {variant.quantity || 0}
                                  {variant.in_stock === false && (
                                    <span className="ml-1">(Hết hàng)</span>
                                  )}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenImageModal(variant)}
                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Upload ảnh"
                                  >
                                    <FiImage className="text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenModal(variant)}
                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Sửa"
                                  >
                                    <FiEdit className="text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(variant.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                  >
                                    <FiTrash2 className="text-red-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">Chưa có biến thể nào</p>
                    <p className="text-sm text-gray-400">Thêm biến thể đầu tiên cho sản phẩm này</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingVariant ? 'Sửa biến thể' : 'Thêm biến thể mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size <span className="text-red-500">*</span>
                    {editingVariant && <span className="text-xs text-gray-500 ml-2">(Không thể thay đổi)</span>}
                  </label>
                  <select
                    value={formData.size_id}
                    onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                    required={!editingVariant}
                    disabled={editingVariant}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      editingVariant ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Chọn size</option>
                    {sizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Màu sắc <span className="text-red-500">*</span>
                    {editingVariant && <span className="text-xs text-gray-500 ml-2">(Không thể thay đổi)</span>}
                  </label>
                  <select
                    value={formData.color_id}
                    onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                    required={!editingVariant}
                    disabled={editingVariant}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      editingVariant ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Chọn màu</option>
                    {colors.map(color => (
                      <option key={color.id} value={color.id}>
                        {color.type}
                      </option>
                    ))}
                  </select>
                  {/* Color Preview */}
                  {formData.color_id && (() => {
                    const selectedColor = colors.find(c => c.id === parseInt(formData.color_id));
                    const hexCode = selectedColor ? colorMap[selectedColor.type] || '#CCCCCC' : '#CCCCCC';
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: hexCode }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {selectedColor?.type || 'Unknown'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá gốc (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="2500000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Price Sale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá khuyến mãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price_sale}
                    onChange={(e) => setFormData({ ...formData, price_sale: e.target.value })}
                    placeholder="2000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    placeholder="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                  {loading ? 'Đang lưu...' : editingVariant ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Thêm nhanh nhiều biến thể
            </h2>

            <form onSubmit={handleQuickAdd} className="space-y-6">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  💡 Tạo tất cả các tổ hợp của Size × Màu với cùng giá và số lượng
                </p>
                <p className="text-xs text-blue-700">
                  Ví dụ: Chọn 5 sizes và 2 màu = Tạo 10 biến thể tự động
                </p>
              </div>

              {/* Sizes - Multi Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Chọn sizes <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Đã chọn: {quickFormData.selectedSizeIds.length} size)
                  </span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {sizes.filter(s => s.status === 1).map(size => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        const isSelected = quickFormData.selectedSizeIds.includes(size.id);
                        if (isSelected) {
                          setQuickFormData({
                            ...quickFormData,
                            selectedSizeIds: quickFormData.selectedSizeIds.filter(id => id !== size.id)
                          });
                        } else {
                          setQuickFormData({
                            ...quickFormData,
                            selectedSizeIds: [...quickFormData.selectedSizeIds, size.id]
                          });
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        quickFormData.selectedSizeIds.includes(size.id)
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors - Multi Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Chọn màu sắc <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Đã chọn: {quickFormData.selectedColorIds.length} màu)
                  </span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {colors.map(color => {
                    const hexCode = colorMap[color.type] || '#CCCCCC';
                    const isSelected = quickFormData.selectedColorIds.includes(color.id);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setQuickFormData({
                              ...quickFormData,
                              selectedColorIds: quickFormData.selectedColorIds.filter(id => id !== color.id)
                            });
                          } else {
                            setQuickFormData({
                              ...quickFormData,
                              selectedColorIds: [...quickFormData.selectedColorIds, color.id]
                            });
                          }
                        }}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-green-500 ring-2 ring-green-300'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded mb-1"
                          style={{ backgroundColor: hexCode }}
                        ></div>
                        <span className={`text-xs font-medium ${
                          isSelected ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {color.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {quickFormData.selectedSizeIds.length > 0 && quickFormData.selectedColorIds.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Sẽ tạo {quickFormData.selectedSizeIds.length * quickFormData.selectedColorIds.length} biến thể:
                  </p>
                  <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {quickFormData.selectedSizeIds.map(sizeId => {
                      const size = sizes.find(s => s.id === sizeId);
                      return quickFormData.selectedColorIds.map(colorId => {
                        const color = colors.find(c => c.id === colorId);
                        return (
                          <div key={`${sizeId}-${colorId}`} className="flex items-center gap-2">
                            <span className="font-medium">{size?.name}</span>
                            <span>×</span>
                            <div
                              className="w-4 h-4 rounded border border-gray-300 inline-block"
                              style={{ backgroundColor: colorMap[color?.type] || '#CCCCCC' }}
                            ></div>
                            <span>{color?.type}</span>
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá gốc (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quickFormData.price}
                    onChange={(e) => setQuickFormData({ ...quickFormData, price: e.target.value })}
                    required
                    placeholder="3500000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá KM (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={quickFormData.price_sale}
                    onChange={(e) => setQuickFormData({ ...quickFormData, price_sale: e.target.value })}
                    placeholder="2800000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quickFormData.quantity}
                    onChange={(e) => setQuickFormData({ ...quickFormData, quantity: e.target.value })}
                    required
                    placeholder="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickModal(false);
                    setQuickFormData({
                      selectedSizeIds: [],
                      selectedColorIds: [],
                      price: product?.price || '',
                      price_sale: '',
                      quantity: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || quickFormData.selectedSizeIds.length === 0 || quickFormData.selectedColorIds.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading 
                    ? 'Đang tạo...' 
                    : `Tạo ${quickFormData.selectedSizeIds.length * quickFormData.selectedColorIds.length} biến thể`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Images Modal */}
      {showImageModal && uploadingVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Upload ảnh cho biến thể
            </h2>

            {/* Variant Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Size:</p>
                  <p className="font-semibold text-gray-800">
                    {uploadingVariant.size 
                      ? (typeof uploadingVariant.size === 'object' ? uploadingVariant.size.name : uploadingVariant.size)
                      : getSizeName(uploadingVariant.size_id)
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Màu sắc:</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ 
                        backgroundColor: getColorInfo(uploadingVariant.color_id).hex_code 
                      }}
                    ></div>
                    <p className="font-semibold text-gray-800">
                      {uploadingVariant.color 
                        ? (typeof uploadingVariant.color === 'object' ? uploadingVariant.color.name : uploadingVariant.color)
                        : getColorInfo(uploadingVariant.color_id).type
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Images */}
            {uploadingVariant.images && uploadingVariant.images.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Ảnh hiện tại:</p>
                <div className="grid grid-cols-4 gap-3">
                  {uploadingVariant.images.map((img, idx) => {
                    const imgUrl = typeof img === 'string' ? img : (img.url || img.image_url || img.image);
                    return (
                      <div key={idx} className="relative">
                        <img
                          src={imgUrl}
                          alt={`Variant image ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadImages} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn ảnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Có thể chọn nhiều ảnh cùng lúc (Ctrl/Cmd + Click)
                </p>
              </div>

              {/* Preview Selected Images */}
              {uploadImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Ảnh đã chọn ({uploadImages.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {uploadImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={uploadImageUrls[idx]}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Revoke URL for removed image
                            URL.revokeObjectURL(uploadImageUrls[idx]);
                            setUploadImages(uploadImages.filter((_, i) => i !== idx));
                            setUploadImageUrls(uploadImageUrls.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    // Cleanup object URLs before closing
                    uploadImageUrls.forEach(url => {
                      URL.revokeObjectURL(url);
                    });
                    setShowImageModal(false);
                    setUploadImages([]);
                    setUploadImageUrls([]);
                    setUploadingVariant(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadImages.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Đang upload...' : `Upload ${uploadImages.length} ảnh`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProductVariants;

