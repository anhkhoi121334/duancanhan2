import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiPlus, FiEdit, 
  FiTrash2, FiImage, FiUpload, FiX, FiFileText, FiEye, FiEyeOff, FiTag, FiDroplet, FiSearch,
  FiBold, FiItalic, FiUnderline, FiList, FiLink, FiType, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiMaximize2, FiMinimize2, FiLayers, FiSliders, FiRotateCw, FiFilter, FiZap, FiCode, FiTable,
  FiVideo, FiSave, FiClock, FiMinus, FiCheckCircle, FiXCircle, FiCalendar
} from 'react-icons/fi';
import { API_URL } from '../../config/env';
import { useCartStore } from '../../store/cartStore';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const DEFAULT_FORM_DATA = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  featured_image_alt: '', // Alt text cho SEO
  status: 'draft', // draft, published, scheduled
  meta_title: '',
  meta_description: '',
  meta_keywords: '', // Meta keywords
  seo_focus_keyword: '', // Từ khóa chính (SEO)
  canonical_url: '', // Canonical URL
  og_title: '', // Open Graph title
  og_description: '', // Open Graph description
  og_image: '', // Open Graph image
  twitter_card: 'summary_large_image', // summary, summary_large_image
  twitter_title: '', // Twitter title
  twitter_description: '', // Twitter description
  robots: 'index, follow', // Robots meta tag
  schema_type: 'Article', // Article, BlogPosting, NewsArticle
  category_id: null, // Category ID
  author_id: null, // Author ID
  categories: [], // Danh mục (legacy)
  tags: [], // Tags
  reading_time: 0, // Thời gian đọc (tính tự động)
  scheduled_at: '', // Lên lịch xuất bản
  word_count: 0, // Số từ
  published_at: '' // Ngày xuất bản
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

const AdminBlogs = () => {
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  // State management
  const [activeMenu, setActiveMenu] = useState('Blog');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'text'
  const [contentRef, setContentRef] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlignment, setImageAlignment] = useState('none'); // none, left, center, right
  const [imageSize, setImageSize] = useState('full'); // thumbnail, medium, large, full
  const [imageCaption, setImageCaption] = useState('');
  const [imageLinkTo, setImageLinkTo] = useState('none'); // none, file, custom
  const [imageLinkUrl, setImageLinkUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageModalTab, setImageModalTab] = useState('upload'); // 'upload' or 'library'
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [imageBorder, setImageBorder] = useState('');
  const [imageBorderRadius, setImageBorderRadius] = useState('');
  const [imageMargin, setImageMargin] = useState('');
  const [imagePadding, setImagePadding] = useState('');
  const [imageOpacity, setImageOpacity] = useState('100');
  const [imageLazyLoad, setImageLazyLoad] = useState(true);
  const [imageResponsive, setImageResponsive] = useState(true);
  const [imageFilter, setImageFilter] = useState('none'); // none, grayscale, sepia, blur, brightness
  const [imageFilterValue, setImageFilterValue] = useState('100');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [multipleImages, setMultipleImages] = useState([]);
  const [galleryMode, setGalleryMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ========== Authentication & Initialization ==========
  useEffect(() => {
    checkAdminAuth();
  }, [navigate, showToast]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !formData.title || !showModal) return;

    const autoSaveTimer = setInterval(() => {
      // Auto-save logic - có thể lưu vào localStorage hoặc gọi API
      const autoSaveData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('blog_autosave', JSON.stringify(autoSaveData));
      setLastSaved(new Date());
    }, 30000); // Auto-save mỗi 30 giây

    return () => clearInterval(autoSaveTimer);
  }, [formData, autoSaveEnabled, showModal]);

  // Word count update
  useEffect(() => {
    const words = countWords(formData.content);
    setWordCount(words);
  }, [formData.content]);

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
      setCurrentUser(user);
      // Set author_id nếu chưa có
      if (!formData.author_id && user.id) {
        setFormData(prev => ({ ...prev, author_id: user.id }));
      }
    } catch (error) {
      console.error('Error parsing admin user:', error);
      navigate('/admin/login');
    }
  }, [navigate, showToast]);

  // ========== Helper Functions ==========
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_URL}/${imagePath.replace(/^\//, '')}`;
  };

  // Upload content image
  const uploadContentImage = async (file, alt = '') => {
    setUploadingContentImage(true);
    try {
      const token = localStorage.getItem('admin_token');
      const formDataObj = new FormData();
      formDataObj.append('image', file);
      if (alt) {
        formDataObj.append('alt', alt);
      }

      const response = await fetch(`${API_URL}/admin/blogs/upload-content-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('Upload ảnh thất bại');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading content image:', error);
      showToast('Không thể upload ảnh!', 'error');
      return null;
    } finally {
      setUploadingContentImage(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Tính thời gian đọc (từ số từ, giả sử 200 từ/phút)
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, ''); // Loại bỏ HTML tags
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 từ/phút
    return readingTime;
  };

  // Đếm số từ
  const countWords = (content) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, ''); // Loại bỏ HTML tags
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Tính SEO score
  const calculateSEOScore = (data) => {
    let score = 0;
    let maxScore = 0;

    // Title (20 điểm)
    maxScore += 20;
    if (data.title && data.title.length >= 30 && data.title.length <= 60) {
      score += 20;
    } else if (data.title && data.title.length > 0) {
      score += 10;
    }

    // Meta Title (15 điểm)
    maxScore += 15;
    if (data.meta_title && data.meta_title.length >= 50 && data.meta_title.length <= 60) {
      score += 15;
    } else if (data.meta_title && data.meta_title.length > 0) {
      score += 7;
    }

    // Meta Description (20 điểm)
    maxScore += 20;
    if (data.meta_description && data.meta_description.length >= 150 && data.meta_description.length <= 160) {
      score += 20;
    } else if (data.meta_description && data.meta_description.length > 0) {
      score += 10;
    }

    // Focus Keyword (15 điểm)
    maxScore += 15;
    if (data.seo_focus_keyword && data.seo_focus_keyword.length > 0) {
      score += 15;
    }

    // Slug (10 điểm)
    maxScore += 10;
    if (data.slug && data.slug.length > 0) {
      score += 10;
    }

    // Content (15 điểm)
    maxScore += 15;
    if (data.content && data.content.length >= 300) {
      score += 15;
    } else if (data.content && data.content.length > 0) {
      score += 7;
    }

    // Image Alt Text (10 điểm)
    maxScore += 10;
    if (data.featured_image_alt && data.featured_image_alt.length > 0) {
      score += 10;
    }

    // Excerpt (10 điểm)
    maxScore += 10;
    if (data.excerpt && data.excerpt.length >= 50) {
      score += 10;
    } else if (data.excerpt && data.excerpt.length > 0) {
      score += 5;
    }

    // Canonical URL (5 điểm)
    maxScore += 5;
    if (data.canonical_url && data.canonical_url.length > 0) {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setImagePreview('');
    setSelectedFile(null);
    setEditingBlog(null);
  };

  // ========== API Functions ==========
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        showToast('Vui lòng đăng nhập lại!', 'error');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/blogs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Log response for debugging
      console.log('Fetch blogs response status:', response.status);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails = null;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
          console.error('Error response data:', errorData);
          
          // Check if it's a backend PHP error
          if (errorData.message && errorData.message.includes('Call to a member function')) {
            errorMessage = 'Lỗi backend: ' + errorData.message + '. Vui lòng kiểm tra server logs.';
          }
        } catch (e) {
          // If response is not JSON, use status text
          console.error('Error parsing error response:', e);
        }
        
        // Don't throw error for 500, just show empty state
        if (response.status === 500) {
          console.error('Server error (500):', errorMessage, errorDetails);
          setBlogs([]);
          showToast('Lỗi server. Vui lòng thử lại sau hoặc liên hệ admin.', 'error');
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Blogs response data:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setBlogs(data);
      } else if (data.blogs && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else if (data.data && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else {
        console.warn('Unexpected response format:', data);
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      
      // Don't show error toast if we already handled it (500 case)
      if (!error.message || !error.message.includes('Server error')) {
        const errorMessage = error.message || 'Không thể tải danh sách blog';
        showToast(errorMessage, 'error');
      }
      
      // If 401 or 403, redirect to login
      if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [showToast, navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAvailableCategories(data);
        } else if (data.categories && Array.isArray(data.categories)) {
          setAvailableCategories(data.categories);
        } else if (data.data && Array.isArray(data.data)) {
          setAvailableCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock categories for demo
      setAvailableCategories([
        { id: 1, name: 'Thời trang' },
        { id: 2, name: 'Thể thao' },
        { id: 3, name: 'Lifestyle' },
        { id: 4, name: 'Review' }
      ]);
    }
  }, []);

  const createOrUpdateBlog = async (blogData, blogId = null) => {
    const token = localStorage.getItem('admin_token');
    const url = blogId ? `${API_URL}/admin/blogs/${blogId}` : `${API_URL}/admin/blogs`;
    const method = blogId ? 'PUT' : 'POST';

    // Tính reading time
    const readingTime = calculateReadingTime(blogData.content);

    const formDataObj = new FormData();
    formDataObj.append('title', blogData.title);
    formDataObj.append('slug', blogData.slug || generateSlug(blogData.title));
    formDataObj.append('excerpt', blogData.excerpt || '');
    formDataObj.append('content', blogData.content);
    formDataObj.append('status', blogData.status);
    
    // SEO Fields
    formDataObj.append('meta_title', blogData.meta_title || blogData.title || '');
    formDataObj.append('meta_description', blogData.meta_description || blogData.excerpt || '');
    formDataObj.append('meta_keywords', blogData.meta_keywords || '');
    formDataObj.append('seo_focus_keyword', blogData.seo_focus_keyword || '');
    formDataObj.append('canonical_url', blogData.canonical_url || '');
    formDataObj.append('featured_image_alt', blogData.featured_image_alt || '');
    
    // Open Graph
    formDataObj.append('og_title', blogData.og_title || blogData.meta_title || blogData.title || '');
    formDataObj.append('og_description', blogData.og_description || blogData.meta_description || blogData.excerpt || '');
    
    // Twitter Card
    formDataObj.append('twitter_card', blogData.twitter_card || 'summary_large_image');
    formDataObj.append('twitter_title', blogData.twitter_title || blogData.og_title || blogData.meta_title || blogData.title || '');
    formDataObj.append('twitter_description', blogData.twitter_description || blogData.og_description || blogData.meta_description || blogData.excerpt || '');
    
    // Robots & Schema
    formDataObj.append('robots', blogData.robots || 'index, follow');
    formDataObj.append('schema_type', blogData.schema_type || 'Article');
    
    // Category & Author
    if (blogData.category_id) {
      formDataObj.append('category_id', blogData.category_id.toString());
    }
    if (blogData.author_id) {
      formDataObj.append('author_id', blogData.author_id.toString());
    } else if (currentUser && currentUser.id) {
      formDataObj.append('author_id', currentUser.id.toString());
    }
    
    // Published at
    if (blogData.published_at) {
      formDataObj.append('published_at', blogData.published_at);
    } else if (blogData.status === 'published') {
      formDataObj.append('published_at', new Date().toISOString());
    }
    
    // Scheduled at
    if (blogData.scheduled_at) {
      formDataObj.append('scheduled_at', blogData.scheduled_at);
    }
    
    // Images
    if (blogData.featured_image && typeof blogData.featured_image === 'object') {
      formDataObj.append('featured_image', blogData.featured_image);
    }
    
    if (blogData.og_image && typeof blogData.og_image === 'object') {
      formDataObj.append('og_image', blogData.og_image);
    }

    // Tags và Categories (legacy support)
    if (blogData.tags && Array.isArray(blogData.tags)) {
      formDataObj.append('tags', JSON.stringify(blogData.tags));
    }
    if (blogData.categories && Array.isArray(blogData.categories)) {
      formDataObj.append('categories', JSON.stringify(blogData.categories));
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        // Don't set Content-Type for FormData, browser will set it automatically with boundary
      },
      body: formDataObj
    });

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(errorMessage);
    }

    return data;
  };

  const deleteBlog = async (id) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_URL}/admin/blogs/${id}`, {
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
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề!', 'error');
      return false;
    }
    if (!formData.content.trim()) {
      showToast('Vui lòng nhập nội dung!', 'error');
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

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: blog.featured_image || '',
        featured_image_alt: blog.featured_image_alt || '',
        status: blog.status || 'draft',
        meta_title: blog.meta_title || blog.title || '',
        meta_description: blog.meta_description || blog.excerpt || '',
        meta_keywords: blog.meta_keywords || '',
        seo_focus_keyword: blog.seo_focus_keyword || '',
        canonical_url: blog.canonical_url || '',
        og_title: blog.og_title || blog.meta_title || blog.title || '',
        og_description: blog.og_description || blog.meta_description || blog.excerpt || '',
        og_image: blog.og_image || '',
        twitter_card: blog.twitter_card || 'summary_large_image',
        twitter_title: blog.twitter_title || blog.og_title || blog.meta_title || blog.title || '',
        twitter_description: blog.twitter_description || blog.og_description || blog.meta_description || blog.excerpt || '',
        robots: blog.robots || 'index, follow',
        schema_type: blog.schema_type || 'Article',
        category_id: blog.category?.id || blog.category_id || null,
        author_id: blog.author?.id || blog.author_id || (currentUser?.id || null),
        categories: blog.categories || [],
        tags: blog.tags || [],
        reading_time: blog.reading_time || calculateReadingTime(blog.content || ''),
        word_count: countWords(blog.content || ''),
        scheduled_at: blog.scheduled_at || '',
        published_at: blog.published_at || ''
      });
      const imageUrl = getImageUrl(blog.featured_image || blog.image);
      setImagePreview(imageUrl || '');
      setWordCount(countWords(blog.content || ''));
      
      // Parse scheduled date/time if exists
      if (blog.scheduled_at) {
        const scheduled = new Date(blog.scheduled_at);
        setScheduledDate(scheduled.toISOString().split('T')[0]);
        setScheduledTime(scheduled.toTimeString().slice(0, 5));
      }
    } else {
      resetForm();
      // Set default author_id
      if (currentUser && currentUser.id) {
        setFormData(prev => ({ ...prev, author_id: currentUser.id }));
      }
    }
    
    // Load categories when opening modal
    fetchCategories();
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

  const handleFeaturedImageUpload = async (file) => {
    if (!editingBlog || !editingBlog.id) {
      // Nếu chưa có blog, lưu file để upload sau
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Upload featured image cho blog đã tồn tại
    try {
      const token = localStorage.getItem('admin_token');
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const response = await fetch(`${API_URL}/admin/blogs/${editingBlog.id}/featured-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('Upload ảnh thất bại');
      }

      const data = await response.json();
      if (data.blog && data.blog.featured_image) {
        setImagePreview(getImageUrl(data.blog.featured_image));
        setFormData(prev => ({ ...prev, featured_image: data.blog.featured_image }));
      }
      showToast('Upload ảnh đại diện thành công!', 'success');
    } catch (error) {
      console.error('Error uploading featured image:', error);
      showToast('Không thể upload ảnh!', 'error');
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ 
      ...formData, 
      title,
      slug: formData.slug || generateSlug(title),
      meta_title: formData.meta_title || title,
      og_title: formData.og_title || title
    });
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    const readingTime = calculateReadingTime(content);
    const words = countWords(content);
    setFormData({ 
      ...formData, 
      content,
      reading_time: readingTime,
      word_count: words
    });
    setWordCount(words);
  };

  // Rich text editor functions
  const insertText = (before, after = '') => {
    const textarea = contentRef;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);
    
    setFormData({ ...formData, content: newText });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHeading = (level) => {
    insertText(`<h${level}>`, `</h${level}>\n\n`);
  };

  const insertList = (ordered = false) => {
    const tag = ordered ? 'ol' : 'ul';
    insertText(`<${tag}>\n<li>`, `</li>\n</${tag}>\n\n`);
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      const text = contentRef?.value.substring(contentRef.selectionStart, contentRef.selectionEnd) || 'Link text';
      insertText(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, `</a>`);
    }
  };

  const insertStrikethrough = () => {
    insertText('<del>', '</del>');
  };

  const insertCode = () => {
    setShowCodeModal(true);
  };

  const handleInsertCode = () => {
    if (!codeContent) return;
    const codeBlock = `<pre><code class="language-${codeLanguage}">${codeContent}</code></pre>\n\n`;
    insertText(codeBlock, '');
    setCodeContent('');
    setCodeLanguage('javascript');
    setShowCodeModal(false);
    showToast('Đã chèn code block!', 'success');
  };

  const insertTable = () => {
    setShowTableModal(true);
  };

  const handleInsertTable = () => {
    let tableHTML = '<table class="wp-table">\n<thead>\n<tr>\n';
    for (let i = 0; i < tableCols; i++) {
      tableHTML += '<th>Header ' + (i + 1) + '</th>\n';
    }
    tableHTML += '</tr>\n</thead>\n<tbody>\n';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>\n';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += '<td>Cell ' + (i + 1) + ',' + (j + 1) + '</td>\n';
      }
      tableHTML += '</tr>\n';
    }
    tableHTML += '</tbody>\n</table>\n\n';
    insertText(tableHTML, '');
    setShowTableModal(false);
    showToast('Đã chèn bảng!', 'success');
  };

  const insertVideo = () => {
    setShowVideoModal(true);
  };

  const handleInsertVideo = () => {
    if (!videoUrl) {
      showToast('Vui lòng nhập URL video!', 'error');
      return;
    }

    let embedCode = '';
    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtu.be') 
        ? videoUrl.split('/').pop().split('?')[0]
        : videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n\n`;
      }
    }
    // Vimeo
    else if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('/').pop();
      if (videoId) {
        embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>\n\n`;
      }
    }
    // Generic iframe
    else {
      embedCode = `<iframe src="${videoUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n\n`;
    }

    if (embedCode) {
      insertText(embedCode, '');
      setVideoUrl('');
      setShowVideoModal(false);
      showToast('Đã chèn video!', 'success');
    } else {
      showToast('URL video không hợp lệ!', 'error');
    }
  };

  const insertTextColor = () => {
    const selectedText = contentRef?.value.substring(contentRef.selectionStart, contentRef.selectionEnd) || 'Text';
    insertText(`<span style="color: ${textColor}">`, `</span>`);
  };

  const insertBgColor = () => {
    const selectedText = contentRef?.value.substring(contentRef.selectionStart, contentRef.selectionEnd) || 'Text';
    insertText(`<span style="background-color: ${bgColor}">`, `</span>`);
  };

  const insertGallery = () => {
    if (multipleImages.length === 0) {
      showToast('Vui lòng chọn ảnh trước!', 'error');
      return;
    }

    let galleryHTML = '<div class="wp-gallery">\n';
    multipleImages.forEach((img, index) => {
      galleryHTML += `<figure class="gallery-item">\n<img src="${img.url}" alt="Gallery Image ${index + 1}" />\n</figure>\n`;
    });
    galleryHTML += '</div>\n\n';
    
    insertText(galleryHTML, '');
    setMultipleImages([]);
    showToast(`Đã chèn gallery với ${multipleImages.length} ảnh!`, 'success');
  };

  const insertImage = () => {
    setShowImageModal(true);
  };

  const buildImageStyle = () => {
    const styles = [];
    
    if (imageWidth) styles.push(`width: ${imageWidth}${imageWidth.match(/\d+$/) ? 'px' : ''}`);
    if (imageHeight) styles.push(`height: ${imageHeight}${imageHeight.match(/\d+$/) ? 'px' : ''}`);
    if (imageBorder) styles.push(`border: ${imageBorder}`);
    if (imageBorderRadius) styles.push(`border-radius: ${imageBorderRadius}${imageBorderRadius.match(/\d+$/) ? 'px' : ''}`);
    if (imageMargin) styles.push(`margin: ${imageMargin}`);
    if (imagePadding) styles.push(`padding: ${imagePadding}`);
    if (imageOpacity !== '100') styles.push(`opacity: ${parseInt(imageOpacity) / 100}`);
    
    // Filters
    if (imageFilter !== 'none') {
      const filterValue = parseInt(imageFilterValue);
      switch (imageFilter) {
        case 'grayscale':
          styles.push(`filter: grayscale(${filterValue}%)`);
          break;
        case 'sepia':
          styles.push(`filter: sepia(${filterValue}%)`);
          break;
        case 'blur':
          styles.push(`filter: blur(${filterValue / 10}px)`);
          break;
        case 'brightness':
          styles.push(`filter: brightness(${filterValue}%)`);
          break;
        case 'contrast':
          styles.push(`filter: contrast(${filterValue}%)`);
          break;
        case 'saturate':
          styles.push(`filter: saturate(${filterValue}%)`);
          break;
        default:
          break;
      }
    }
    
    return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  };

  const handleInsertImage = async () => {
    if (!imageUrl && !selectedFile) {
      showToast('Vui lòng nhập URL ảnh hoặc upload ảnh!', 'error');
      return;
    }

    let finalImageUrl = imageUrl;
    let finalAlt = imageAlt || 'Image';

    // Nếu có file được chọn, upload lên server
    if (selectedFile) {
      setUploadingContentImage(true);
      const uploadResult = await uploadContentImage(selectedFile, finalAlt);
      if (uploadResult && uploadResult.html_tag) {
        // Sử dụng HTML tag từ server
        insertText(uploadResult.html_tag + '\n\n', '');
        setShowImageModal(false);
        showToast('Đã chèn ảnh vào bài viết!', 'success');
        // Reset
        setImageUrl('');
        setImageAlt('');
        setSelectedFile(null);
        setImageAlignment('none');
        setImageSize('full');
        setImageCaption('');
        setImageLinkTo('none');
        setImageLinkUrl('');
        setImageWidth('');
        setImageHeight('');
        setImageBorder('');
        setImageBorderRadius('');
        setImageMargin('');
        setImagePadding('');
        setImageOpacity('100');
        setImageFilter('none');
        setImageFilterValue('100');
        setShowAdvancedSettings(false);
        return;
      }
      if (uploadResult && uploadResult.image_url) {
        finalImageUrl = uploadResult.image_url;
        finalAlt = uploadResult.alt || finalAlt;
      }
      setUploadingContentImage(false);
    }

    if (!finalImageUrl) {
      showToast('Không thể lấy URL ảnh!', 'error');
      return;
    }

    const alt = finalAlt || 'Image';
    let imgTag = `<img src="${finalImageUrl}" alt="${alt}" class="wp-image align${imageAlignment}`;
    
    // Add size class
    if (imageSize !== 'full') {
      imgTag += ` size-${imageSize}`;
    }
    
    // Add responsive class
    if (imageResponsive) {
      imgTag += ' img-responsive';
    }
    
    imgTag += '"';
    
    // Add lazy loading
    if (imageLazyLoad) {
      imgTag += ' loading="lazy"';
    }
    
    // Add width/height attributes for performance
    if (imageWidth) {
      const width = imageWidth.replace(/[^\d]/g, '');
      if (width) imgTag += ` width="${width}"`;
    }
    if (imageHeight) {
      const height = imageHeight.replace(/[^\d]/g, '');
      if (height) imgTag += ` height="${height}"`;
    }
    
    // Add inline styles
    const styleAttr = buildImageStyle();
    if (styleAttr) {
      imgTag += styleAttr;
    }
    
    imgTag += ' />';
    
    // Wrap with link if needed
    if (imageLinkTo === 'file') {
      imgTag = `<a href="${finalImageUrl}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`;
    } else if (imageLinkTo === 'custom' && imageLinkUrl) {
      imgTag = `<a href="${imageLinkUrl}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`;
    }
    
    // Wrap with caption if provided
    if (imageCaption) {
      imgTag = `<figure class="wp-caption align${imageAlignment}">${imgTag}<figcaption class="wp-caption-text">${imageCaption}</figcaption></figure>`;
    } else if (imageAlignment !== 'none') {
      imgTag = `<figure class="wp-caption align${imageAlignment}">${imgTag}</figure>`;
    }
    
    insertText(imgTag + '\n\n', '');
    
    // Add to library
    if (finalImageUrl && !uploadedImages.find(img => img.url === finalImageUrl)) {
      setUploadedImages([...uploadedImages, {
        url: finalImageUrl,
        alt: finalAlt,
        caption: imageCaption,
        uploadedAt: new Date().toISOString()
      }]);
    }
    
    // Reset và đóng modal
    setImageUrl('');
    setImageAlt('');
    setSelectedFile(null);
    setImageAlignment('none');
    setImageSize('full');
    setImageCaption('');
    setImageLinkTo('none');
    setImageLinkUrl('');
    setImageWidth('');
    setImageHeight('');
    setImageBorder('');
    setImageBorderRadius('');
    setImageMargin('');
    setImagePadding('');
    setImageOpacity('100');
    setImageFilter('none');
    setImageFilterValue('100');
    setShowAdvancedSettings(false);
    setShowImageModal(false);
    showToast('Đã chèn ảnh vào bài viết!', 'success');
  };

  const handleMultipleImageUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => VALID_IMAGE_TYPES.includes(file.type));
    
    if (validFiles.length === 0) {
      showToast('Không có file ảnh hợp lệ!', 'error');
      return;
    }
    
    validFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File ${file.name} vượt quá 5MB!`, 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMultipleImages(prev => [...prev, {
          url: reader.result,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Build scheduled_at if status is scheduled
      let scheduledAt = null;
      if (formData.status === 'scheduled' && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const blogData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        status: formData.status,
        scheduled_at: scheduledAt,
        published_at: formData.status === 'published' ? (formData.published_at || new Date().toISOString()) : null,
        // SEO Fields
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        meta_keywords: formData.meta_keywords || '',
        seo_focus_keyword: formData.seo_focus_keyword || '',
        canonical_url: formData.canonical_url || '',
        featured_image_alt: formData.featured_image_alt || '',
        // Open Graph
        og_title: formData.og_title || formData.meta_title || formData.title,
        og_description: formData.og_description || formData.meta_description || formData.excerpt,
        // Twitter Card
        twitter_card: formData.twitter_card || 'summary_large_image',
        twitter_title: formData.twitter_title || formData.og_title || formData.meta_title || formData.title,
        twitter_description: formData.twitter_description || formData.og_description || formData.meta_description || formData.excerpt,
        // Robots & Schema
        robots: formData.robots || 'index, follow',
        schema_type: formData.schema_type || 'Article',
        // Category & Author
        category_id: formData.category_id || null,
        author_id: formData.author_id || (currentUser?.id || null),
        // Legacy support
        tags: formData.tags,
        categories: formData.categories,
        reading_time: formData.reading_time,
        word_count: wordCount,
        // Images
        featured_image: selectedFile,
        og_image: formData.og_image
      };

      const data = await createOrUpdateBlog(blogData, editingBlog?.id);
      
      showToast(
        data.message || (editingBlog ? 'Cập nhật blog thành công!' : 'Thêm blog thành công!'), 
        'success'
      );
      
      // Clear auto-save
      localStorage.removeItem('blog_autosave');
      
      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      showToast(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa blog này?')) return;

    try {
      const data = await deleteBlog(id);
      showToast(data.message || 'Xóa blog thành công!', 'success');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      showToast(error.message || 'Có lỗi xảy ra khi xóa blog!', 'error');
    }
  };

  // ========== Render Functions ==========
  const renderSidebar = () => (
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

  const renderBlogTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hình ảnh</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tiêu đề</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tác giả</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Danh mục</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Lượt xem</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thời gian đọc</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày tạo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {blogs.map((blog) => {
              const imageUrl = getImageUrl(blog.featured_image || blog.image);
              const isPublished = blog.status === 'published';
              
              return (
                <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                  {/* Image */}
                  <td className="py-3 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full ${imageUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                        <FiImage className="text-gray-400 text-xl" />
                      </div>
                    </div>
                  </td>
                  
                  {/* Title */}
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                        {blog.title || 'Untitled Blog'}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-1">{blog.excerpt}</p>
                      )}
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isPublished
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isPublished ? <FiEye className="text-xs" /> : <FiEyeOff className="text-xs" />}
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  
                  {/* Author */}
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {blog.author?.name || 'N/A'}
                  </td>
                  
                  {/* Category */}
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {blog.category?.name || 'N/A'}
                  </td>
                  
                  {/* Views */}
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {blog.views || 0}
                  </td>
                  
                  {/* Reading Time */}
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {blog.reading_time || 0} phút
                  </td>
                  
                  {/* Created Date */}
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {blog.created_at ? new Date(blog.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  
                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        title="Sửa"
                      >
                        <FiEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-[95vw] h-[95vh] flex flex-col">
          {/* Modal Header - WordPress style */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBlog ? 'Sửa bài viết' : 'Thêm bài viết mới'}
              </h2>
              {formData.status === 'published' && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Đã xuất bản
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // Preview functionality
                  window.open(`/blog/preview/${formData.slug || 'preview'}`, '_blank');
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <FiEye className="inline mr-1" />
                Xem trước
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>
          </div>

          {/* Modal Form - WordPress 2 column layout */}
          <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
            {/* Left Column - Editor (70%) */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ width: '70%' }}>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="VD: Xu hướng giày thể thao 2024"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="xu-huong-giay-the-thao-2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Để trống sẽ tự động tạo từ tiêu đề</p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Mô tả ngắn về bài viết..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

                {/* Content Editor - WordPress style */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nội dung <span className="text-red-500">*</span>
                      {formData.reading_time > 0 && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          (~{formData.reading_time} phút đọc)
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-1 border border-gray-300 rounded">
                      <button
                        type="button"
                        onClick={() => setEditorMode('visual')}
                        className={`px-3 py-1 text-xs ${editorMode === 'visual' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('text')}
                        className={`px-3 py-1 text-xs ${editorMode === 'text' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        Text
                      </button>
                    </div>
                  </div>
                  
                  {/* Rich Text Toolbar */}
                  {editorMode === 'visual' && (
                    <div className="border border-gray-300 border-b-0 bg-gray-50 rounded-t-lg p-2 flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertText('<strong>', '</strong>')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Bold"
                      >
                        <FiBold />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('<em>', '</em>')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Italic"
                      >
                        <FiItalic />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => insertHeading(1)}
                        className="p-2 hover:bg-gray-200 rounded text-xs font-bold"
                        title="Heading 1"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertHeading(2)}
                        className="p-2 hover:bg-gray-200 rounded text-xs font-bold"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertHeading(3)}
                        className="p-2 hover:bg-gray-200 rounded text-xs font-bold"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => insertList(false)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Bullet List"
                      >
                        <FiList />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertList(true)}
                        className="p-2 hover:bg-gray-200 rounded text-xs font-bold"
                        title="Numbered List"
                      >
                        1.
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={insertLink}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Insert Link"
                      >
                        <FiLink />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={insertImage}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Insert Image"
                      >
                        <FiImage />
                      </button>
                      <button
                        type="button"
                        onClick={insertVideo}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Insert Video"
                      >
                        <FiVideo />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={insertStrikethrough}
                        className="p-2 hover:bg-gray-200 rounded text-xs font-bold line-through"
                        title="Strikethrough"
                      >
                        S
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('<u>', '</u>')}
                        className="p-2 hover:bg-gray-200 rounded text-xs underline"
                        title="Underline"
                      >
                        U
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 hover:bg-gray-200 rounded relative"
                        title="Text Color"
                      >
                        <FiType />
                        {showColorPicker && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10">
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-10 h-8 rounded border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={insertTextColor}
                                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-10 h-8 rounded border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={insertBgColor}
                                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={insertCode}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Insert Code"
                      >
                        <FiCode />
                      </button>
                      <button
                        type="button"
                        onClick={insertTable}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Insert Table"
                      >
                        <FiTable />
                      </button>
                      {multipleImages.length > 0 && (
                        <>
                          <div className="w-px h-6 bg-gray-300 mx-1"></div>
                          <button
                            type="button"
                            onClick={insertGallery}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Insert Gallery"
                          >
                            <FiLayers />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  <textarea
                    ref={(el) => setContentRef(el)}
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Bắt đầu viết hoặc nhấn / để chọn block..."
                    rows="15"
                    required
                    className={`w-full px-4 py-3 border border-gray-300 ${editorMode === 'visual' ? 'rounded-b-lg' : 'rounded-lg'} focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${editorMode === 'text' ? 'font-mono text-sm' : ''}`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {editorMode === 'visual' ? 'Hỗ trợ HTML. Sử dụng toolbar để format text.' : 'Chế độ Text - Chỉnh sửa HTML trực tiếp'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Từ: {wordCount.toLocaleString()}</span>
                      <span>Ký tự: {formData.content.length.toLocaleString()}</span>
                      {lastSaved && (
                        <span className="text-green-600 flex items-center gap-1">
                          <FiCheckCircle className="text-xs" />
                          Đã lưu: {lastSaved.toLocaleTimeString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - WordPress style (30%) */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Publish Box */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Xuất bản</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="scheduled">Lên lịch</option>
                      </select>
                    </div>

                    {/* Schedule Publish */}
                    {formData.status === 'scheduled' && (
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            <FiCalendar className="inline mr-1" />
                            Ngày xuất bản
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            <FiClock className="inline mr-1" />
                            Giờ xuất bản
                          </label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Auto-save Toggle */}
                    <div className="pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSaveEnabled}
                          onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                          className="rounded"
                        />
                        <FiSave className="text-purple-600" />
                        Auto-save (Tự động lưu mỗi 30s)
                      </label>
                      {lastSaved && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <FiCheckCircle className="text-xs" />
                          Lần cuối: {lastSaved.toLocaleTimeString('vi-VN')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
                      >
                        {loading ? 'Đang lưu...' : editingBlog ? 'Cập nhật' : 'Xuất bản'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Hình ảnh đại diện</h3>
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedFile(null);
                          setFormData(prev => ({ ...prev, featured_image: '' }));
                        }}
                        className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Xóa hình ảnh
                      </button>
                    </div>
                  ) : (
                    <label className="block px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-center text-sm">
                      <FiUpload className="inline mr-2" />
                      Chọn hình ảnh
                      <input
                        type="file"
                        accept={VALID_IMAGE_TYPES.join(',')}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (validateFile(file)) {
                              handleImageChange(e);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  {imagePreview && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Alt Text (SEO) <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.featured_image_alt}
                        onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
                        placeholder="Mô tả hình ảnh..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* OG Image */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">OG Image (Social Media)</h3>
                  <label className="block px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-center text-sm">
                    <FiUpload className="inline mr-2" />
                    Chọn OG Image
                    <input
                      type="file"
                      accept={VALID_IMAGE_TYPES.join(',')}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && validateFile(file)) {
                          setFormData(prev => ({ ...prev, og_image: file }));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Ảnh hiển thị trên Facebook, Twitter (1200x630px)</p>
                </div>

                {/* Categories */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableCategories.length > 0 ? (
                      <div className="space-y-2">
                        {availableCategories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="radio"
                              name="category"
                              checked={formData.category_id === cat.id}
                              onChange={() => {
                                setFormData({
                                  ...formData,
                                  category_id: cat.id
                                });
                              }}
                              className="rounded"
                            />
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        <button
                          type="button"
                          onClick={() => {
                            fetchCategories();
                          }}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          + Thêm category mới
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                          setFormData({ ...formData, tags });
                        }}
                        placeholder="tag1, tag2, tag3..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                    </div>
                  </div>
                </div>

                {/* SEO Box */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">SEO</h3>
                    {(() => {
                      const seoScore = calculateSEOScore(formData);
                      return (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          seoScore >= 80 ? 'bg-green-100 text-green-700' :
                          seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {seoScore}%
                        </span>
                      );
                    })()}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={formData.seo_focus_keyword}
                        onChange={(e) => setFormData({ ...formData, seo_focus_keyword: e.target.value })}
                        placeholder="Từ khóa chính..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.meta_keywords}
                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Meta Title
                        <span className={`ml-1 text-xs ${
                          formData.meta_title.length >= 50 && formData.meta_title.length <= 60
                            ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ({formData.meta_title.length}/60)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="Tiêu đề SEO (50-60 ký tự)..."
                        maxLength={60}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Meta Description
                        <span className={`ml-1 text-xs ${
                          formData.meta_description.length >= 150 && formData.meta_description.length <= 160
                            ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ({formData.meta_description.length}/160)
                        </span>
                      </label>
                      <textarea
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        placeholder="Mô tả SEO (150-160 ký tự)..."
                        maxLength={160}
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={formData.canonical_url}
                        onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                        placeholder="https://ankhstore.com/blogs/..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Robots
                      </label>
                      <select
                        value={formData.robots}
                        onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="index, follow">index, follow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, follow">noindex, follow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Schema Type
                      </label>
                      <select
                        value={formData.schema_type}
                        onChange={(e) => setFormData({ ...formData, schema_type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Article">Article</option>
                        <option value="BlogPosting">BlogPosting</option>
                        <option value="NewsArticle">NewsArticle</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Twitter Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Twitter Card</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Card Type
                      </label>
                      <select
                        value={formData.twitter_card}
                        onChange={(e) => setFormData({ ...formData, twitter_card: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Twitter Title
                        <span className={`ml-1 text-xs ${
                          formData.twitter_title.length <= 70
                            ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ({formData.twitter_title.length}/70)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.twitter_title}
                        onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })}
                        placeholder="Twitter title..."
                        maxLength={70}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Twitter Description
                        <span className={`ml-1 text-xs ${
                          formData.twitter_description.length <= 200
                            ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ({formData.twitter_description.length}/200)
                        </span>
                      </label>
                      <textarea
                        value={formData.twitter_description}
                        onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })}
                        placeholder="Twitter description..."
                        maxLength={200}
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Image Insert Modal - WordPress style
  const renderImageModal = () => {
    if (!showImageModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Chèn ảnh vào bài viết</h3>
            <button
              onClick={() => {
                setShowImageModal(false);
                setImageUrl('');
                setImageAlt('');
                setImageAlignment('none');
                setImageSize('full');
                setImageCaption('');
                setImageLinkTo('none');
                setImageLinkUrl('');
              }}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <FiX className="text-xl text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setImageModalTab('upload')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                imageModalTab === 'upload'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setImageModalTab('library')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                imageModalTab === 'library'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Media Library
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Column - Upload/Library */}
            <div className="w-2/3 border-r border-gray-200 overflow-y-auto p-6">
              {imageModalTab === 'upload' ? (
                <div className="space-y-4">
                  {/* Drag & Drop Upload - Multiple files support */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-purple-500', 'bg-purple-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-purple-500', 'bg-purple-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-purple-500', 'bg-purple-50');
                      const files = e.dataTransfer.files;
                      if (files.length > 1) {
                        handleMultipleImageUpload(files);
                      } else if (files.length === 1) {
                        const file = files[0];
                        if (VALID_IMAGE_TYPES.includes(file.type)) {
                          if (validateFile(file)) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImageUrl(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors"
                  >
                    <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây (hỗ trợ nhiều file) hoặc</p>
                    <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                      <FiLayers className="inline mr-2" />
                      Chọn file(s)
                      <input
                        type="file"
                        accept={VALID_IMAGE_TYPES.join(',')}
                        onChange={(e) => {
                          if (e.target.files.length > 1) {
                            handleMultipleImageUpload(e.target.files);
                          } else if (e.target.files.length === 1) {
                            const file = e.target.files[0];
                            if (validateFile(file)) {
                              setSelectedFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImageUrl(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                        multiple
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Hỗ trợ: JPG, PNG, GIF, WEBP, AVIF - Tối đa 5MB/file - Có thể chọn nhiều file
                    </p>
                  </div>

                  {/* Multiple Images Preview */}
                  {multipleImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Đã chọn {multipleImages.length} ảnh
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (multipleImages.length > 0) {
                              setImageUrl(multipleImages[0].url);
                              setMultipleImages([]);
                            }
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          Chọn ảnh đầu tiên
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                        {multipleImages.map((img, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setImageUrl(img.url);
                              setMultipleImages([]);
                            }}
                            className="relative border-2 border-gray-200 rounded overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-20 object-cover"
                            />
                            <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Or URL Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hoặc nhập URL ảnh
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hoặc upload ảnh sẽ tự động upload lên server
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setImageUrl(img.url);
                            setImageAlt(img.alt || '');
                            setImageCaption(img.caption || '');
                            setImageModalTab('upload');
                          }}
                          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
                        >
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {img.caption && (
                            <p className="p-2 text-xs text-gray-600 truncate">{img.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiImage className="mx-auto text-5xl text-gray-300 mb-4" />
                      <p className="text-gray-500">Chưa có ảnh nào trong thư viện</p>
                      <p className="text-sm text-gray-400 mt-2">Upload ảnh để thêm vào thư viện</p>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xem trước
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={imageUrl} 
                      alt={imageAlt || 'Preview'} 
                      className="w-full max-h-64 object-contain mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center justify-center p-8 bg-gray-100">
                      <p className="text-gray-500 text-sm">Không thể hiển thị ảnh</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="w-1/3 bg-gray-50 overflow-y-auto p-6 space-y-4">
              <h4 className="font-semibold text-gray-800 mb-4">Attachment Details</h4>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Mô tả ảnh..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Caption
                </label>
                <textarea
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Chú thích ảnh..."
                  rows="2"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Alignment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setImageAlignment(align)}
                      className={`px-3 py-2 text-xs border rounded transition-colors ${
                        imageAlignment === align
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {align === 'none' ? 'None' : align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Size
                </label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="thumbnail">Thumbnail (150x150)</option>
                  <option value="medium">Medium (300x300)</option>
                  <option value="large">Large (1024x1024)</option>
                  <option value="full">Full Size</option>
                </select>
              </div>

              {/* Link To */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Link To
                </label>
                <select
                  value={imageLinkTo}
                  onChange={(e) => setImageLinkTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                >
                  <option value="none">None</option>
                  <option value="file">Media File</option>
                  <option value="custom">Custom URL</option>
                </select>
                {imageLinkTo === 'custom' && (
                  <input
                    type="url"
                    value={imageLinkUrl}
                    onChange={(e) => setImageLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                  />
                )}
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiSliders />
                    Advanced Settings
                  </span>
                  {showAdvancedSettings ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>
              </div>

              {/* Advanced Settings Panel */}
              {showAdvancedSettings && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Width
                      </label>
                      <input
                        type="text"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        placeholder="auto, 100%, 500px"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Height
                      </label>
                      <input
                        type="text"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        placeholder="auto, 100%, 500px"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Border & Border Radius */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Border
                      </label>
                      <input
                        type="text"
                        value={imageBorder}
                        onChange={(e) => setImageBorder(e.target.value)}
                        placeholder="2px solid #000"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Border Radius
                      </label>
                      <input
                        type="text"
                        value={imageBorderRadius}
                        onChange={(e) => setImageBorderRadius(e.target.value)}
                        placeholder="8px, 50%"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Margin & Padding */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Margin
                      </label>
                      <input
                        type="text"
                        value={imageMargin}
                        onChange={(e) => setImageMargin(e.target.value)}
                        placeholder="10px, 10px 20px"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Padding
                      </label>
                      <input
                        type="text"
                        value={imagePadding}
                        onChange={(e) => setImagePadding(e.target.value)}
                        placeholder="10px, 10px 20px"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Opacity: {imageOpacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageOpacity}
                      onChange={(e) => setImageOpacity(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Image Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Filter
                    </label>
                    <select
                      value={imageFilter}
                      onChange={(e) => setImageFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                    >
                      <option value="none">None</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="blur">Blur</option>
                      <option value="brightness">Brightness</option>
                      <option value="contrast">Contrast</option>
                      <option value="saturate">Saturate</option>
                    </select>
                    {imageFilter !== 'none' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Filter Value: {imageFilterValue}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={imageFilterValue}
                          onChange={(e) => setImageFilterValue(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Performance Options */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageLazyLoad}
                        onChange={(e) => setImageLazyLoad(e.target.checked)}
                        className="rounded"
                      />
                      <FiZap className="text-purple-600" />
                      Lazy Loading (Tối ưu hiệu suất)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageResponsive}
                        onChange={(e) => setImageResponsive(e.target.checked)}
                        className="rounded"
                      />
                      <FiMaximize2 className="text-purple-600" />
                      Responsive Image (Tự động điều chỉnh)
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleInsertImage}
                        disabled={(!imageUrl && !selectedFile) || uploadingContentImage}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {uploadingContentImage ? 'Đang upload...' : 'Chèn vào bài viết'}
                      </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(false);
                    setImageUrl('');
                    setImageAlt('');
                    setImageAlignment('none');
                    setImageSize('full');
                    setImageCaption('');
                    setImageLinkTo('none');
                    setImageLinkUrl('');
                    setImageWidth('');
                    setImageHeight('');
                    setImageBorder('');
                    setImageBorderRadius('');
                    setImageMargin('');
                    setImagePadding('');
                    setImageOpacity('100');
                    setImageFilter('none');
                    setImageFilterValue('100');
                    setShowAdvancedSettings(false);
                  }}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="Quản lý Blog - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Blog</h1>
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
                <h2 className="text-xl font-bold text-gray-800">Danh sách blog</h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <FiPlus />
                  Thêm blog mới
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
              )}

              {/* Blogs Table */}
              {!loading && blogs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {renderBlogTable()}
                </div>
              )}

              {/* Empty State */}
              {!loading && blogs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <FiFileText className="mx-auto text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có blog nào</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Modal */}
        {renderModal()}
        
        {/* Image Insert Modal */}
        {renderImageModal()}

        {/* Video Insert Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chèn Video</h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoUrl('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Video <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hỗ trợ: YouTube, Vimeo, hoặc iframe URL
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoModal(false);
                      setVideoUrl('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertVideo}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Chèn Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Insert Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chèn Code Block</h3>
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setCodeContent('');
                    setCodeLanguage('javascript');
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder="Nhập code của bạn..."
                    rows="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeModal(false);
                      setCodeContent('');
                      setCodeLanguage('javascript');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertCode}
                    disabled={!codeContent}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Chèn Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Insert Modal */}
        {showTableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chèn Bảng</h3>
                <button
                  onClick={() => {
                    setShowTableModal(false);
                    setTableRows(3);
                    setTableCols(3);
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số hàng
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={tableRows}
                      onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số cột
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tableCols}
                      onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableModal(false);
                      setTableRows(3);
                      setTableCols(3);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertTable}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Chèn Bảng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBlogs;

