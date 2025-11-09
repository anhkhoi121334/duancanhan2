import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiFileText, FiTag, FiDroplet, 
  FiImage, FiSearch, FiSave, FiRefreshCw, FiCheck, FiX,
  FiLink, FiGlobe, FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import { API_URL } from '../../config/env';
import { useCartStore } from '../../store/cartStore';

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

const AdminSettings = () => {
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  // State management
  const [activeMenu, setActiveMenu] = useState('Cài đặt');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Google Analytics
    google_analytics_id: '',
    google_analytics_enabled: false,
    
    // Theme Settings
    theme_primary_color: '#8B5CF6', // Purple
    theme_secondary_color: '#4F46E5', // Indigo
    theme_accent_color: '#F59E0B', // Amber
    theme_mode: 'light', // light, dark, auto
    
    // Site Settings
    site_name: 'ANKH Store',
    site_description: 'Cửa hàng giày thể thao chính hãng',
    site_logo: '',
    site_favicon: '',
    
    // Contact Info
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    
    // Social Media
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    
    // SEO Settings
    meta_keywords: '',
    default_meta_description: '',
    
    // Other Settings
    maintenance_mode: false,
    allow_registration: true,
    default_currency: 'VND',
    default_language: 'vi'
  });

  // ========== Authentication & Initialization ==========
  useEffect(() => {
    checkAdminAuth();
  }, [navigate, showToast]);

  useEffect(() => {
    fetchSettings();
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
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.settings) {
        setSettings({ ...settings, ...data.settings });
      } else if (data.data) {
        setSettings({ ...settings, ...data.data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default settings if API fails
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      showToast('Đã lưu cài đặt thành công!', 'success');
      
      // Apply theme colors to CSS variables if needed
      applyThemeColors();
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Có lỗi xảy ra khi lưu cài đặt!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeColors = () => {
    // Apply theme colors to document root for CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.theme_primary_color);
    root.style.setProperty('--secondary-color', settings.theme_secondary_color);
    root.style.setProperty('--accent-color', settings.theme_accent_color);
  };

  // ========== Event Handlers ==========
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleInputChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleColorChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    // Preview color change immediately
    const root = document.documentElement;
    root.style.setProperty(`--${key.replace('theme_', '').replace('_', '-')}`, value);
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

  const renderSettingSection = (title, icon, children) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <>
      <SEO title="Cài đặt - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Cài đặt</h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Lưu cài đặt
                    </>
                  )}
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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-500">Đang tải...</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Google Analytics */}
                {renderSettingSection(
                  'Google Analytics',
                  <FiTrendingUp className="text-xl text-purple-600" />,
                  <>
                    <div className="mb-4">
                      <label className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.google_analytics_enabled}
                          onChange={(e) => handleInputChange('google_analytics_enabled', e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Bật Google Analytics</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Google Analytics Tracking ID
                      </label>
                      <div className="flex items-center gap-2">
                        <FiLink className="text-gray-400" />
                        <input
                          type="text"
                          value={settings.google_analytics_id}
                          onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                          placeholder="G-XXXXXXXXXX hoặc UA-XXXXXXXXX-X"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Nhập Google Analytics Tracking ID (GA4: G-XXXXXXXXXX hoặc Universal Analytics: UA-XXXXXXXXX-X)
                      </p>
                    </div>
                  </>
                )}

                {/* Theme Settings */}
                {renderSettingSection(
                  'Theme & Colors',
                  <FiDroplet className="text-xl text-purple-600" />,
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.theme_primary_color}
                            onChange={(e) => handleColorChange('theme_primary_color', e.target.value)}
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.theme_primary_color}
                            onChange={(e) => handleColorChange('theme_primary_color', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.theme_secondary_color}
                            onChange={(e) => handleColorChange('theme_secondary_color', e.target.value)}
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.theme_secondary_color}
                            onChange={(e) => handleColorChange('theme_secondary_color', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.theme_accent_color}
                            onChange={(e) => handleColorChange('theme_accent_color', e.target.value)}
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.theme_accent_color}
                            onChange={(e) => handleColorChange('theme_accent_color', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Theme Mode
                      </label>
                      <select
                        value={settings.theme_mode}
                        onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Site Settings */}
                {renderSettingSection(
                  'Site Settings',
                  <FiGlobe className="text-xl text-purple-600" />,
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.site_name}
                        onChange={(e) => handleInputChange('site_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.site_description}
                        onChange={(e) => handleInputChange('site_description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Default Currency
                        </label>
                        <select
                          value={settings.default_currency}
                          onChange={(e) => handleInputChange('default_currency', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="VND">VND (₫)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Default Language
                        </label>
                        <select
                          value={settings.default_language}
                          onChange={(e) => handleInputChange('default_language', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="vi">Tiếng Việt</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Contact Info */}
                {renderSettingSection(
                  'Contact Information',
                  <FiMail className="text-xl text-purple-600" />,
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiMail />
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiPhone />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiMapPin />
                        Address
                      </label>
                      <textarea
                        value={settings.contact_address}
                        onChange={(e) => handleInputChange('contact_address', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Social Media */}
                {renderSettingSection(
                  'Social Media Links',
                  <FiLink className="text-xl text-purple-600" />,
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          value={settings.facebook_url}
                          onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={settings.instagram_url}
                          onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          value={settings.twitter_url}
                          onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                          placeholder="https://twitter.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          YouTube URL
                        </label>
                        <input
                          type="url"
                          value={settings.youtube_url}
                          onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* SEO Settings */}
                {renderSettingSection(
                  'SEO Settings',
                  <FiSearch className="text-xl text-purple-600" />,
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={settings.meta_keywords}
                        onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Default Meta Description
                      </label>
                      <textarea
                        value={settings.default_meta_description}
                        onChange={(e) => handleInputChange('default_meta_description', e.target.value)}
                        rows="3"
                        placeholder="Default meta description for pages..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Other Settings */}
                {renderSettingSection(
                  'Other Settings',
                  <FiSettings className="text-xl text-purple-600" />,
                  <>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode}
                          onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Maintenance Mode</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.allow_registration}
                          onChange={(e) => handleInputChange('allow_registration', e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Allow User Registration</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;

