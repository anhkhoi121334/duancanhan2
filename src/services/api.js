// Base URL của API - Laravel Backend
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL;

// Timeout cho fetch requests (10 giây)
const FETCH_TIMEOUT = 10000;

// Check if backend is available
let backendAvailable = true;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

// Hàm helper để lấy token từ localStorage
const getToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return null;
};

// Hàm helper để tạo headers với Authorization
const getAuthHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Wrapper cho fetch với timeout và error handling
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('⏱️ Request timeout - Backend mất quá nhiều thời gian để phản hồi');
    }
    
    // Network error hoặc backend không chạy
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      backendAvailable = false;
      throw new Error('🔌 Không thể kết nối đến server. Vui lòng kiểm tra:\n' +
        '1. Backend có đang chạy? (php artisan serve)\n' +
        '2. URL có đúng không? (' + API_BASE_URL + ')\n' +
        '3. CORS đã được cấu hình chưa?');
    }
    
    throw error;
  }
};

// Check backend health
export const checkBackendHealth = async () => {
  const now = Date.now();
  
  // Only check every 30 seconds
  if (backendAvailable && (now - lastCheckTime) < CHECK_INTERVAL) {
    return backendAvailable;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Sử dụng endpoint categories thay vì health (vì health không tồn tại)
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    backendAvailable = response.ok;
    lastCheckTime = now;
    
    if (!backendAvailable) {
      console.warn('⚠️ Backend health check failed');
    }
    
    return backendAvailable;
  } catch (error) {
    backendAvailable = false;
    lastCheckTime = now;
    console.error('❌ Backend is not available:', error.message);
    return false;
  }
};

// Hàm helper để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
    
    try {
      // Try to get response as text first
      const responseText = await response.text();
      
      // Try to parse as JSON
      try {
        // Decode Unicode escapes if any
        let decodedText = responseText;
        try {
          // Try to decode Unicode escape sequences like \u00f3
          decodedText = responseText.replace(/\\u([0-9a-f]{4})/gi, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
          });
        } catch (decodeError) {
          // If decode fails, use original
          decodedText = responseText;
        }
        
        errorData = JSON.parse(decodedText);
      } catch (parseError) {
        // If not JSON, use text as error message
        errorData = { message: responseText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      // Extract error message từ các format khác nhau
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : JSON.stringify(errorData.error);
      } else if (errorData.errors) {
        // Laravel validation errors - format: "field: message1, message2"
        const validationErrors = Object.entries(errorData.errors).map(([field, messages]) => {
          const msgs = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgs.join(', ')}`;
        });
        errorMessage = validationErrors.join(' | ');
      } else if (responseText && responseText.length < 500) {
        // Use response text if it's short enough
        errorMessage = responseText;
      }
      
      // Log chi tiết error để debug
      console.error('❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData,
        responseText: responseText, // Show full response
        fullErrorData: JSON.stringify(errorData, null, 2), // Pretty print
        // Decode response text để xem message đầy đủ
        decodedResponseText: (() => {
          try {
            return responseText.replace(/\\u([0-9a-f]{4})/gi, (match, code) => {
              return String.fromCharCode(parseInt(code, 16));
            });
          } catch (e) {
            return responseText;
          }
        })()
      });
      
      // Log validation errors nếu có
      if (errorData.errors) {
        console.error('❌ Validation Errors:', JSON.stringify(errorData.errors, null, 2));
      }
      
      // Log full message nếu có
      if (errorData.message) {
        console.error('❌ Error Message:', errorData.message);
        // Try to extract more info from message if it contains encoded text
        try {
          const decodedMessage = decodeURIComponent(errorData.message);
          if (decodedMessage !== errorData.message) {
            console.error('❌ Decoded Error Message:', decodedMessage);
          }
        } catch (e) {
          // Ignore decode errors
        }
      }
      
      // Log trace nếu có
      if (errorData.trace) {
        if (typeof errorData.trace === 'string') {
          console.error('❌ Stack Trace (first 500 chars):', errorData.trace.substring(0, 500));
        } else if (Array.isArray(errorData.trace)) {
          console.error('❌ Stack Trace (array):', errorData.trace.slice(0, 5)); // Show first 5 items
        } else {
          console.error('❌ Stack Trace:', errorData.trace);
        }
      }
      
      // Log file và line nếu có
      if (errorData.file) {
        console.error('❌ Error File:', errorData.file, 'Line:', errorData.line);
      }
    } catch (e) {
      console.error('❌ Failed to parse error response:', e);
      // Không thể clone response vì body đã được đọc
      // Response text đã được lưu ở trên nên không cần clone
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

// ========== PRODUCTS API ==========

/**
 * Lấy danh sách tất cả sản phẩm
 * @param {Object} params - Query parameters
 * @param {number} params.page - Số trang
 * @param {number} params.limit - Số sản phẩm mỗi trang
 * @param {string} params.category - Danh mục sản phẩm
 * @param {string} params.search - Từ khóa tìm kiếm
 * @param {string} params.sort - Sắp xếp (price_asc, price_desc, name_asc, name_desc)
 * @returns {Promise<Object>} Danh sách sản phẩm
 */
export const getProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  
  // Brand filter
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.brand_id) queryParams.append('brand_id', params.brand_id);
  
  // Color filter
  if (params.color) queryParams.append('color', params.color);
  if (params.color_id) queryParams.append('color_id', params.color_id);
  
  // Gender filter
  if (params.gender) queryParams.append('gender', params.gender);
  
  // Featured filter
  if (params.featured) queryParams.append('featured', params.featured);
  
  // Accessory filter
  if (params.is_accessory) queryParams.append('is_accessory', params.is_accessory);
  
  const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
  
  try {
    const response = await fetchWithTimeout(url);
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Tìm kiếm sản phẩm nâng cao
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Từ khóa tìm kiếm
 * @param {number} params.page - Số trang
 * @param {number} params.limit - Số sản phẩm mỗi trang
 * @param {string} params.brand_id - ID thương hiệu
 * @param {number} params.min_price - Giá tối thiểu
 * @param {number} params.max_price - Giá tối đa
 * @param {string} params.gender - Giới tính
 * @param {string} params.sort_by - Sắp xếp theo (price, name, created_at)
 * @param {string} params.sort_order - Thứ tự (asc, desc)
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const searchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.brand_id) queryParams.append('brand_id', params.brand_id);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const url = `${API_BASE_URL}/products/search/advanced?${queryParams.toString()}`;
    
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 * @param {number|string} id - ID sản phẩm
 * @returns {Promise<Object>} Chi tiết sản phẩm
 */
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Cập nhật sản phẩm (Requires Authentication)
 * @param {number|string} id - ID sản phẩm
 * @param {Object} productData - Dữ liệu sản phẩm cần cập nhật
 * @param {string} productData.name - Tên sản phẩm
 * @param {string} productData.description - Mô tả
 * @param {number} productData.price - Giá
 * @param {number} productData.price_sale - Giá sale (optional)
 * @param {number} productData.brand_id - ID thương hiệu
 * @param {number} productData.category_id - ID danh mục
 * @param {string} productData.gender - Giới tính (Nam, Nữ, Unisex)
 * @param {number} productData.status - Trạng thái (0: Ẩn, 1: Hiển thị)
 * @param {Array} productData.variants - Mảng các biến thể (optional)
 * @returns {Promise<Object>} Thông tin sản phẩm đã cập nhật
 */
export const updateProduct = async (id, productData) => {
  try {
    const token = getToken();
    const adminToken = localStorage.getItem('admin_token');
    
    // Use admin token if available, otherwise use regular user token
    const authToken = adminToken || token;
    
    if (!authToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(productData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy sản phẩm liên quan
 * @param {number|string} id - ID sản phẩm
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm liên quan
 */
export const getRelatedProducts = async (id, limit = 4) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/related?limit=${limit}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching related products:`, error);
    throw error;
  }
};

/**
 * Lấy sản phẩm mới nhất
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm mới
 */
export const getNewProducts = async (limit = 8) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new?limit=${limit}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching new products:', error);
    throw error;
  }
};

/**
 * Lấy sản phẩm bán chạy
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm bán chạy
 */
export const getBestSellerProducts = async (limit = 8) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/bestseller?limit=${limit}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    throw error;
  }
};

/**
 * Lấy sản phẩm giảm giá
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm sale
 */
export const getSaleProducts = async (limit = 8) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/sale?limit=${limit}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching sale products:', error);
    throw error;
  }
};

// ========== CATEGORIES API ==========

/**
 * Lấy danh sách danh mục
 * @returns {Promise<Array>} Danh sách danh mục
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// ========== BRANDS API ==========

/**
 * Lấy danh sách thương hiệu
 * @returns {Promise<Array>} Danh sách thương hiệu
 */
/**
 * Lấy danh sách tất cả màu sắc
 * @returns {Promise<Array>} Danh sách màu sắc
 */
export const getColors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/colors`);
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [API] Error fetching colors:', error.message);
    throw error;
  }
};

export const getBrands = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// ========== BANNERS API ==========

/**
 * Lấy danh sách banners
 * @returns {Promise<Array>} Danh sách banners
 */
export const getBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [API] Error fetching banners:', error.message);
    // Trả về array rỗng thay vì throw error
    return [];
  }
};

/**
 * Lấy danh sách banners cho admin (có authentication)
 * @returns {Promise<Array>} Danh sách banners
 */
export const getAdminBanners = async () => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/banners`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [API] Error fetching admin banners:', error.message);
    throw error;
  }
};

/**
 * Tạo banner mới (Admin)
 * @param {FormData} formData - FormData chứa: title, image (file), link, position, status
 * @returns {Promise<Object>} Thông tin banner đã tạo
 */
export const createBanner = async (formData) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
        // Don't set Content-Type, browser will set it with boundary for FormData
      },
      body: formData
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [API] Error creating banner:', error.message);
    throw error;
  }
};

/**
 * Cập nhật banner (Admin)
 * @param {number|string} id - ID banner
 * @param {FormData} formData - FormData chứa: title, image (file, optional), link, position, status
 * @returns {Promise<Object>} Thông tin banner đã cập nhật
 */
export const updateBanner = async (id, formData) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
        // Don't set Content-Type, browser will set it with boundary for FormData
      },
      body: formData
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ [API] Error updating banner ${id}:`, error.message);
    throw error;
  }
};

/**
 * Xóa banner (Admin)
 * @param {number|string} id - ID banner
 * @returns {Promise<Object>}
 */
export const deleteBanner = async (id) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ [API] Error deleting banner ${id}:`, error.message);
    throw error;
  }
};

// ========== PROMOTIONS API ==========

/**
 * Lấy danh sách khuyến mãi/promotions
 * @returns {Promise<Array>} Danh sách promotions
 */
export const getPromotions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await handleResponse(response);
  } catch (error) {
    // Trả về array rỗng thay vì throw error
    return [];
  }
};

// ========== HOME API ==========

/**
 * Lấy dữ liệu trang chủ (categories, products_hot, products_sale)
 * @returns {Promise<Object>} Dữ liệu trang chủ với format:
 * {
 *   categories: Array,
 *   products_hot: Array,
 *   products_sale: Array
 * }
 */
export const getHomeData = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/home`);
    const data = await handleResponse(response);
    
    // Validate và format dữ liệu trả về
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      products_hot: Array.isArray(data.products_hot) ? data.products_hot : [],
      products_sale: Array.isArray(data.products_sale) ? data.products_sale : []
    };
  } catch (error) {
    
    // Fallback data nếu API không khả dụng
    const fallbackData = {
      categories: [
        { id: 1, name: 'Giày Nam', slug: 'giay-nam', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400' },
        { id: 2, name: 'Giày Nữ', slug: 'giay-nu', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400' },
        { id: 3, name: 'Phụ kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' }
      ],
      products_hot: [],
      products_sale: []
    };
    
    return fallbackData;
  }
};

// ========== CART API ==========

/**
 * Lấy giỏ hàng từ backend (nếu user đã đăng nhập)
 * @returns {Promise<Object>} Cart data với format: { items: [], total_items: 0, total_amount: 0, count: 0 }
 */
export const getCart = async () => {
  try {
    const token = getToken();
    if (!token) {
      console.log('👤 No auth token, returning empty cart');
      return { 
        items: [], 
        total_items: 0, 
        total_amount: 0, 
        count: 0,
        can_checkout: true,
        checkout_message: null,
        invalid_items_count: 0
      };
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.status === 404) {
      // Cart endpoint không tồn tại, trả về empty
      return { 
        items: [], 
        total_items: 0, 
        total_amount: 0, 
        count: 0,
        can_checkout: true,
        checkout_message: null,
        invalid_items_count: 0
      };
    }

    const data = await handleResponse(response);
    
    // Xử lý cả 2 format: object với items hoặc array trực tiếp
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // Nếu là array, wrap vào object
        // Nếu là array, tính toán và kiểm tra stock
        const hasInvalidItems = data.some(item => item.can_checkout === false);
        return {
          items: data,
          total_items: data.reduce((sum, item) => sum + (item.quantity || 0), 0),
          total_amount: data.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0),
          count: data.length,
          can_checkout: !hasInvalidItems,
          checkout_message: hasInvalidItems ? 'Có sản phẩm không đủ số lượng, vui lòng kiểm tra lại' : null,
          invalid_items_count: data.filter(item => item.can_checkout === false).length
        };
      } else if (data.items && Array.isArray(data.items)) {
        // Nếu là object với items property - xử lý format mới với stock validation
        return {
          items: data.items || [],
          total_items: data.total_items || 0,
          total_amount: data.total_amount || 0,
          count: data.count || (data.items ? data.items.length : 0),
          can_checkout: data.can_checkout !== undefined ? data.can_checkout : true,
          checkout_message: data.checkout_message || null,
          invalid_items_count: data.invalid_items_count || 0
        };
      }
    }
    
    // Fallback
    return { 
      items: [], 
      total_items: 0, 
      total_amount: 0, 
      count: 0,
      can_checkout: true,
      checkout_message: null,
      invalid_items_count: 0
    };
  } catch (error) {
    console.error('❌ [API] Error fetching cart:', error.message);
    // Trả về empty object nếu lỗi (fallback to local storage)
    return { 
      items: [], 
      total_items: 0, 
      total_amount: 0, 
      count: 0,
      can_checkout: true,
      checkout_message: null,
      invalid_items_count: 0
    };
  }
};

/**
 * Thêm sản phẩm vào cart trên backend
 * @param {number|Object} variant_idOrData - ID của product variant HOẶC object { variant_id, quantity }
 * @param {number} [quantity=1] - Số lượng (nếu variant_id là số)
 * @returns {Promise<Object>} Thông tin item đã thêm
 * 
 * @example
 * // Cách 1: Truyền variant_id và quantity riêng
 * addToCartAPI(1, 2)
 * 
 * @example
 * // Cách 2: Truyền object
 * addToCartAPI({ variant_id: 1, quantity: 2 })
 */
export const addToCartAPI = async (variant_idOrData, quantity = 1) => {
  try {
    const token = getToken();
    if (!token) {
      console.log('👤 No auth token, cart only saved locally');
      return null; // Không có token thì chỉ lưu local
    }

    // Xử lý cả 2 cách: object hoặc tham số riêng
    let itemData;
    if (typeof variant_idOrData === 'object' && variant_idOrData !== null) {
      // Cách 2: Truyền object
      itemData = {
        variant_id: parseInt(variant_idOrData.variant_id),
        quantity: parseInt(variant_idOrData.quantity || 1)
      };
    } else {
      // Cách 1: Truyền variant_id và quantity riêng
      itemData = {
        variant_id: parseInt(variant_idOrData),
        quantity: parseInt(quantity)
      };
    }

    // Validate input
    if (!itemData.variant_id || isNaN(itemData.variant_id)) {
      console.error('❌ [API] Invalid variant_id:', itemData.variant_id);
      throw new Error('variant_id phải là số hợp lệ');
    }

    if (!itemData.quantity || itemData.quantity <= 0) {
      console.error('❌ [API] Invalid quantity:', itemData.quantity);
      throw new Error('quantity phải lớn hơn 0');
    }

    console.log('📤 Adding to cart:', itemData);

    const response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    const result = await handleResponse(response);
    console.log('✅ Added to cart successfully:', result);
    return result;
  } catch (error) {
    // Log chi tiết cho developer, nhưng không throw error
    // Vì cart vẫn hoạt động với local storage
    if (error.message && error.message.includes('fillable property')) {
      console.warn('⚠️ [API] Backend cần fix: Thêm user_id vào fillable trong CartDetail model');
      console.warn('⚠️ Cart vẫn hoạt động bình thường với local storage');
    } else {
      console.error('❌ [API] Error adding to cart:', error.message);
    }
    // Không throw error, chỉ log (fallback to local storage)
    return null;
  }
};

/**
 * Cập nhật item trong cart trên backend
 * PUT /api/cart/{id}
 * @param {number} cartItemId - ID của cart item
 * @param {Object} itemData - Dữ liệu cập nhật: { quantity }
 * @returns {Promise<Object>} Thông tin item đã cập nhật với format:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ...item details },
 *   available_stock: number (nếu không đủ hàng)
 * }
 */
export const updateCartItem = async (cartItemId, itemData) => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    console.log(`📤 Updating cart item ${cartItemId}:`, itemData);

    const response = await fetchWithTimeout(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    const result = await handleResponse(response);
    console.log('✅ Cart item updated:', result);
    
    // Xử lý các trường hợp đặc biệt từ response
    if (result.available_stock !== undefined && result.available_stock < itemData.quantity) {
      // Không đủ hàng - backend đã tự động điều chỉnh quantity
      console.warn(`⚠️ Không đủ hàng. Số lượng còn lại: ${result.available_stock}`);
    }
    
    if (result.removed === true) {
      // Item đã bị xóa vì variant không hợp lệ
      console.warn('⚠️ Item đã bị xóa vì variant không còn hợp lệ');
    }
    
    return result;
  } catch (error) {
    console.error('❌ [API] Error updating cart item:', error.message);
    // Throw error để CartPage có thể xử lý và hiển thị thông báo
    throw error;
  }
};

/**
 * Xóa item khỏi cart trên backend
 * DELETE /api/cart/{id}
 * @param {number} cartItemId - ID của cart item
 * @returns {Promise<Object>} Response với format:
 * {
 *   success: true,
 *   message: "Đã xóa sản phẩm 'Tên sản phẩm' khỏi giỏ hàng",
 *   product_name: "Tên sản phẩm"
 * }
 */
export const removeFromCartAPI = async (cartItemId) => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    console.log(`📤 Removing cart item ${cartItemId}...`);

    const response = await fetchWithTimeout(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await handleResponse(response);
    console.log('✅ Cart item removed:', result);
    return result;
  } catch (error) {
    console.error('❌ [API] Error removing from cart:', error.message);
    // Throw error để CartPage có thể xử lý
    throw error;
  }
};

/**
 * Xóa toàn bộ cart trên backend
 * DELETE /api/cart/clear/all
 * @returns {Promise<Object>} Response với format:
 * {
 *   success: true,
 *   message: "Đã xóa tất cả sản phẩm khỏi giỏ hàng",
 *   deleted_count: number
 * }
 */
export const clearCartAPI = async () => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    console.log('📤 Clearing all cart items...');

    // Thử endpoint mới /cart/clear/all trước
    let response;
    try {
      response = await fetchWithTimeout(`${API_BASE_URL}/cart/clear/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      // Fallback về endpoint cũ nếu endpoint mới không tồn tại
      console.log('⚠️ /cart/clear/all not available, trying /cart...');
      response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    }

    const result = await handleResponse(response);
    console.log('✅ Cart cleared:', result);
    return result;
  } catch (error) {
    console.error('❌ [API] Error clearing cart:', error.message);
    // Throw error để CartPage có thể xử lý
    throw error;
  }
};

// ========== ORDERS API ==========

/**
 * Tạo đơn hàng mới (Requires Authentication)
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<Object>} Thông tin đơn hàng đã tạo
 */
export const createOrder = async (orderData) => {
  try {
    console.log('📤 Creating order:', orderData);
    
    // Không yêu cầu auth token vì user có thể checkout mà không cần login
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Chỉ thêm auth token nếu có
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using auth token');
    } else {
      console.log('👤 Guest checkout (no auth token)');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(orderData),
    });
    
    const result = await handleResponse(response);
    console.log('✅ Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ [API] Error creating order:', error.message);
    console.error('Request data:', orderData);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 * GET /api/orders - Backend tự động lấy từ token
 * @returns {Promise<Array>} Danh sách orders array
 */
export const getMyOrders = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Sử dụng endpoint /orders để lấy danh sách orders của user hiện tại
    // Backend tự động lấy từ token, không cần truyền user_id
    console.log(`📡 Fetching orders from /orders...`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    // Nếu 404, có thể user chưa có orders - trả về mảng rỗng
    if (response.status === 404) {
      // Clone response để có thể đọc text mà không mất data
      const clonedResponse = response.clone();
      try {
        const errorText = await clonedResponse.text();
        const errorJson = JSON.parse(errorText);
        if (errorJson.message && (
          errorJson.message.includes('Không tìm thấy đơn hàng') || 
          errorJson.message.includes('Not Found') ||
          errorJson.message.includes('không tìm thấy')
        )) {
          console.log('ℹ️ User chưa có orders, trả về mảng rỗng');
          return [];
        }
      } catch (e) {
        // Nếu không parse được, vẫn coi như 404 = không có orders
        console.log('ℹ️ 404 response - User chưa có orders, trả về mảng rỗng');
        return [];
      }
    }
    
    return await handleResponse(response);
  } catch (error) {
    // Nếu lỗi 404, coi như user chưa có orders
    if (error.message && (
      error.message.includes('404') || 
      error.message.includes('Không tìm thấy đơn hàng') ||
      error.message.includes('không tìm thấy')
    )) {
      console.log('ℹ️ User chưa có orders, trả về mảng rỗng');
      return [];
    }
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng (Admin) với filter và pagination
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {string} params.payment_status - Filter by payment status
 * @param {string} params.payment_method - Filter by payment method
 * @param {string} params.search - Search by order code, customer name, or phone
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @returns {Promise<Object>} Danh sách đơn hàng với pagination
 */
export const getAdminOrders = async (params = {}) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 Fetching admin orders:', url);
    
    const response = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await handleResponse(response);
    console.log('📦 Admin orders data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID (Admin)
 * @param {number|string} id - ID đơn hàng
 * @returns {Promise<Object>} Thông tin đơn hàng
 */
export const getOrderById = async (id) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

/**
 * Cập nhật status của đơn hàng (Admin)
 * @param {number|string} id - ID đơn hàng
 * @param {string} status - Status mới (pending, confirmed, preparing, delivering, completed, cancelled)
 * @param {string} payment_status - Payment status (optional, chỉ cần khi status = 'completed')
 * @returns {Promise<Object>} Thông tin đơn hàng đã cập nhật
 */
export const updateOrderStatus = async (id, status, payment_status = null) => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
    }
    
    // Build request body
    const requestBody = { status };
    if (payment_status) {
      requestBody.payment_status = payment_status;
    }
    
    console.log(`📡 Updating order ${id} status to ${status}${payment_status ? ` with payment_status: ${payment_status}` : ''}...`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await handleResponse(response);
    console.log('✅ Order status updated:', data);
    return data;
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng của user
 * GET /api/orders/{id} - Chi tiết đơn hàng ID (nếu là của user)
 * @param {number|string} id - ID đơn hàng
 * @returns {Promise<Object>} Thông tin đơn hàng
 */
export const getMyOrderDetail = async (id) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Sử dụng endpoint /orders/{id} để lấy chi tiết đơn hàng
    console.log(`📡 Fetching order detail from /orders/${id}`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await handleResponse(response);
    console.log('📦 Order detail response:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching order detail ${id}:`, error);
    throw error;
  }
};

/**
 * Tra cứu đơn hàng
 * @param {string} orderCode - Mã đơn hàng
 * @param {string} phone - Số điện thoại
 * @returns {Promise<Object>} Thông tin đơn hàng
 */
export const trackOrder = async (orderCode, phone) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/track?code=${orderCode}&phone=${phone}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error tracking order:', error);
    throw error;
  }
};

/**
 * Hủy đơn hàng của user
 * PUT /api/orders/{id}/cancel - Hủy đơn hàng (chỉ khi status là pending)
 * @param {number|string} id - ID đơn hàng
 * @param {string} reason - Lý do hủy (optional)
 * @returns {Promise<Object>} Thông tin đơn hàng đã hủy
 */
export const cancelOrder = async (id, reason = null) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    console.log(`📡 Cancelling order ${id}...`);
    
    const requestBody = {};
    if (reason) {
      requestBody.reason = reason;
    }
    
    // Thử endpoint /orders/{id}/cancel trước
    let response;
    try {
      response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      // Nếu endpoint /cancel không tồn tại, thử update status trực tiếp
      console.log('⚠️ /cancel endpoint not available, trying direct status update...');
      response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled',
          ...requestBody
        })
      });
    }
    
    const data = await handleResponse(response);
    console.log('✅ Order cancelled:', data);
    return data;
  } catch (error) {
    console.error(`Error cancelling order ${id}:`, error);
    throw error;
  }
};

// ========== VOUCHERS API ==========

/**
 * Lấy danh sách tất cả vouchers
 * @returns {Promise<Array>} Danh sách vouchers
 */
export const getVouchers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

/**
 * Lấy thông tin voucher theo code
 * @param {string} code - Mã voucher
 * @param {boolean} activeOnly - Chỉ lấy voucher active
 * @returns {Promise<Object>} Thông tin voucher
 */
export const getVoucherByCode = async (code, activeOnly = true) => {
  try {
    const params = new URLSearchParams({
      code: code
    });
    
    if (activeOnly) {
      params.append('status', '1');
    }
    
    const response = await fetch(`${API_BASE_URL}/vouchers?${params.toString()}`);
    const data = await handleResponse(response);
    
    // Backend trả về array, lấy phần tử đầu tiên
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    // Nếu không tìm thấy
    throw new Error('Mã voucher không tồn tại');
  } catch (error) {
    console.error('Error fetching voucher:', error);
    throw error;
  }
};

/**
 * Xác thực và áp dụng mã voucher
 * @param {Object} voucherData - Dữ liệu voucher
 * @param {string} voucherData.code - Mã voucher
 * @param {number} voucherData.order_value - Giá trị đơn hàng
 * @returns {Promise<Object>} Thông tin voucher và giảm giá
 */
export const validateVoucher = async (voucherData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(voucherData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error validating voucher:', error);
    throw error;
  }
};

// ========== USER API ==========

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Thông tin người dùng
 * @param {string} userData.name - Họ tên
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mật khẩu
 * @param {string} userData.password_confirmation - Xác nhận mật khẩu
 * @param {string} userData.phone - Số điện thoại
 * @param {string} userData.address - Địa chỉ
 * @returns {Promise<Object>} Thông tin user và token
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

/**
 * Đăng nhập
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.email - Email
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise<Object>} Thông tin user và token
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 * @returns {Promise<Object>}
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(true), // Use current token
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Lấy thông tin user hiện tại
 * @returns {Promise<Object>} Thông tin user
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: getAuthHeaders(true), // Use current token
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

/**
 * Lấy thông tin user theo ID
 * @param {number} userId - ID của user
 * @returns {Promise<Object>} Thông tin user
 */
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Lấy thông tin profile user hiện tại
 * @returns {Promise<Object>} Thông tin profile
 */
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile
 * @param {Object} profileData - Dữ liệu profile cần update
 * @returns {Promise<Object>} Thông tin profile đã cập nhật
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// ========== ADDRESS API ==========

/**
 * Lấy danh sách tỉnh/thành phố từ provinces.open-api.vn
 * @returns {Promise<Array>} Danh sách provinces
 */
export const getProvinces = async () => {
  try {
    console.log('📡 Fetching provinces from API (with full data)...');
    // Using depth=3 to get provinces, districts, and wards in one call
    // Try proxy first (development), then direct API (production)
    const isDevelopment = import.meta.env.DEV;
    const proxyUrl = isDevelopment ? '/api/provinces/?depth=3' : 'https://provinces.open-api.vn/api/v1/?depth=3';
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Provinces fetched successfully:', data.length, 'provinces');  
    return data;
  } catch (error) {
    console.error('❌ Error fetching provinces from API:', error.message);
    // Return empty array, let CheckoutPage use static data as fallback
    return [];
  }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 * @param {number|string} provinceId - ID tỉnh
 * @returns {Promise<Array>} Danh sách districts
 */
export const getDistricts = async (provinceId) => {
  try {
    console.log(`📡 Fetching districts for province ${provinceId} from API...`);
    // Try proxy first (development), then direct API (production)
    const isDevelopment = import.meta.env.DEV;
    const proxyUrl = isDevelopment 
      ? `/api/provinces/districts/${provinceId}` 
      : `https://provinces.open-api.vn/api/districts/${provinceId}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Districts fetched successfully:', data.length, 'districts');
    return data;
  } catch (error) {
    console.error(`❌ Error fetching districts for province ${provinceId}:`, error.message);
    // Return empty array, let CheckoutPage use static data or manual input as fallback
    return [];
  }
};

/**
 * Lấy danh sách xã/phường theo quận
 * @param {number|string} districtId - ID quận
 * @returns {Promise<Array>} Danh sách wards
 */
export const getWards = async (districtId) => {
  try {
    console.log(`📡 Fetching wards for district ${districtId} from API...`);
    // Try proxy first (development), then direct API (production)
    const isDevelopment = import.meta.env.DEV;
    const proxyUrl = isDevelopment 
      ? `/api/provinces/wards/${districtId}` 
      : `https://provinces.open-api.vn/api/wards/${districtId}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Wards fetched successfully:', data.length, 'wards');
    return data;
  } catch (error) {
    console.error(`❌ Error fetching wards for district ${districtId}:`, error.message);
    // Return empty array, let CheckoutPage use manual input as fallback
    return [];
  }
};

export default {
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  getRelatedProducts,
  getNewProducts,
  getBestSellerProducts,
  getSaleProducts,
  getCategories,
  getBrands,
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getPromotions,
  createOrder,
  getMyOrders,
  getOrderById,
  getMyOrderDetail,
  trackOrder,
  cancelOrder,
  getVouchers,
  getVoucherByCode,
  validateVoucher,
  login,
  register,
  getCurrentUser,
  getUserById,
  getProfile,
  updateProfile,
  getProvinces,
  getDistricts,
  getWards,
};

