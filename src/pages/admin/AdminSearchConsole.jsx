import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiFileText, FiTag, FiDroplet, 
  FiImage, FiSearch, FiFilter, FiDownload, FiCalendar,
  FiBarChart2, FiTrendingDown, FiArrowUp, FiArrowDown,
  FiEye, FiMousePointer, FiGlobe, FiMonitor, FiSmartphone
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
  { icon: <FiDollarSign />, label: 'Doanh thu', path: '/admin/revenue' }
];

const AdminSearchConsole = () => {
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  // State management
  const [activeMenu, setActiveMenu] = useState('Search Console');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(false);

  // Date range
  const [dateRange, setDateRange] = useState('last-28-days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filters
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterSearchType, setFilterSearchType] = useState('all');

  // Data
  const [overviewData, setOverviewData] = useState({
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    clicksChange: 0,
    impressionsChange: 0,
    ctrChange: 0,
    positionChange: 0
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [topQueries, setTopQueries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [topDevices, setTopDevices] = useState([]);

  // ========== Authentication & Initialization ==========
  useEffect(() => {
    checkAdminAuth();
  }, [navigate, showToast]);

  useEffect(() => {
    fetchSearchConsoleData();
  }, [dateRange, startDate, endDate, filterDevice, filterCountry, filterSearchType]);

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

  // ========== Helper Functions ==========
  const getDateRange = () => {
    const today = new Date();
    const ranges = {
      'last-7-days': {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: today
      },
      'last-28-days': {
        start: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000),
        end: today
      },
      'last-90-days': {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: today
      },
      'last-year': {
        start: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
        end: today
      }
    };

    if (dateRange === 'custom' && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    return ranges[dateRange] || ranges['last-28-days'];
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num) => {
    return num.toFixed(2) + '%';
  };

  // ========== API Functions ==========
  const fetchSearchConsoleData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const dateRangeObj = getDateRange();
      
      const params = new URLSearchParams({
        start_date: dateRangeObj.start.toISOString().split('T')[0],
        end_date: dateRangeObj.end.toISOString().split('T')[0],
        device: filterDevice,
        country: filterCountry,
        search_type: filterSearchType
      });

      const response = await fetch(`${API_URL}/admin/search-console?${params}`, {
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
      if (data.overview) {
        setOverviewData(data.overview);
      } else {
        // Mock data for demo
        setOverviewData({
          clicks: 12450,
          impressions: 156780,
          ctr: 7.94,
          position: 3.2,
          clicksChange: 12.5,
          impressionsChange: 8.3,
          ctrChange: -2.1,
          positionChange: 0.3
        });
      }

      if (data.performance) {
        setPerformanceData(data.performance);
      } else {
        // Mock performance data
        const mockPerformance = [];
        const dateRangeObj = getDateRange();
        const days = Math.ceil((dateRangeObj.end - dateRangeObj.start) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < days; i++) {
          const date = new Date(dateRangeObj.start);
          date.setDate(date.getDate() + i);
          mockPerformance.push({
            date: date.toISOString().split('T')[0],
            clicks: Math.floor(Math.random() * 500) + 200,
            impressions: Math.floor(Math.random() * 5000) + 2000,
            ctr: (Math.random() * 5 + 5).toFixed(2),
            position: (Math.random() * 3 + 2).toFixed(1)
          });
        }
        setPerformanceData(mockPerformance);
      }

      if (data.top_queries) {
        setTopQueries(data.top_queries);
      } else {
        setTopQueries([
          { query: 'giày thể thao nike', clicks: 1234, impressions: 15678, ctr: 7.87, position: 2.1 },
          { query: 'giày chạy bộ', clicks: 987, impressions: 12345, ctr: 8.00, position: 2.5 },
          { query: 'giày sneaker', clicks: 856, impressions: 10987, ctr: 7.79, position: 3.2 },
          { query: 'nike air max', clicks: 743, impressions: 9876, ctr: 7.53, position: 2.8 },
          { query: 'adidas ultraboost', clicks: 654, impressions: 8765, ctr: 7.46, position: 3.5 }
        ]);
      }

      if (data.top_pages) {
        setTopPages(data.top_pages);
      } else {
        setTopPages([
          { page: '/products', clicks: 2345, impressions: 23456, ctr: 10.00, position: 1.8 },
          { page: '/products/nike-air-max-270', clicks: 1234, impressions: 12345, ctr: 10.00, position: 2.1 },
          { page: '/blog/xu-huong-giay-2024', clicks: 987, impressions: 9876, ctr: 10.00, position: 2.5 },
          { page: '/sale', clicks: 856, impressions: 8765, ctr: 9.77, position: 2.8 },
          { page: '/brands', clicks: 743, impressions: 7654, ctr: 9.71, position: 3.2 }
        ]);
      }

      if (data.top_countries) {
        setTopCountries(data.top_countries);
      } else {
        setTopCountries([
          { country: 'Vietnam', clicks: 8567, impressions: 98765, ctr: 8.67 },
          { country: 'United States', clicks: 2345, impressions: 23456, ctr: 10.00 },
          { country: 'Thailand', clicks: 1234, impressions: 12345, ctr: 10.00 },
          { country: 'Singapore', clicks: 987, impressions: 9876, ctr: 10.00 },
          { country: 'Malaysia', clicks: 654, impressions: 7654, ctr: 8.54 }
        ]);
      }

      if (data.top_devices) {
        setTopDevices(data.top_devices);
      } else {
        setTopDevices([
          { device: 'mobile', clicks: 8567, impressions: 98765, ctr: 8.67 },
          { device: 'desktop', clicks: 2345, impressions: 23456, ctr: 10.00 },
          { device: 'tablet', clicks: 654, impressions: 7654, ctr: 8.54 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching search console data:', error);
      showToast('Không thể tải dữ liệu Search Console', 'error');
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate, filterDevice, filterCountry, filterSearchType, showToast]);

  // ========== Event Handlers ==========
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleExport = () => {
    const data = {
      overview: overviewData,
      performance: performanceData,
      top_queries: topQueries,
      top_pages: topPages,
      top_countries: topCountries,
      top_devices: topDevices
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-console-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất dữ liệu thành công!', 'success');
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

  const renderMetricCard = (title, value, change, icon, color = 'blue') => {
    const isPositive = change >= 0;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <FiArrowUp /> : <FiArrowDown />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    );
  };

  const renderPerformanceChart = () => {
    const maxClicks = Math.max(...performanceData.map(d => d.clicks), 1);
    
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Performance</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Clicks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Impressions</span>
            </div>
          </div>
        </div>
        <div className="h-64 flex items-end gap-2">
          {performanceData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end justify-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(data.clicks / maxClicks) * 100}%` }}
                  title={`Clicks: ${data.clicks}`}
                ></div>
                <div 
                  className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors opacity-70"
                  style={{ height: `${(data.impressions / maxClicks) * 100}%` }}
                  title={`Impressions: ${data.impressions}`}
                ></div>
              </div>
              <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                {new Date(data.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTable = (title, data, columns) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="Search Console - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Search Console</h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FiDownload />
                  Xuất dữ liệu
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
            {/* Filters */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-500" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="last-7-days">7 ngày qua</option>
                    <option value="last-28-days">28 ngày qua</option>
                    <option value="last-90-days">90 ngày qua</option>
                    <option value="last-year">1 năm qua</option>
                    <option value="custom">Tùy chỉnh</option>
                  </select>
                </div>

                {dateRange === 'custom' && (
                  <>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-500">đến</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </>
                )}

                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-500" />
                  <select
                    value={filterDevice}
                    onChange={(e) => setFilterDevice(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Tất cả thiết bị</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tất cả quốc gia</option>
                  <option value="VN">Vietnam</option>
                  <option value="US">United States</option>
                  <option value="TH">Thailand</option>
                  <option value="SG">Singapore</option>
                </select>
              </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {renderMetricCard(
                'Clicks',
                formatNumber(overviewData.clicks),
                overviewData.clicksChange,
                <FiMousePointer className="text-xl" />,
                'blue'
              )}
              {renderMetricCard(
                'Impressions',
                formatNumber(overviewData.impressions),
                overviewData.impressionsChange,
                <FiEye className="text-xl" />,
                'purple'
              )}
              {renderMetricCard(
                'CTR',
                formatPercentage(overviewData.ctr),
                overviewData.ctrChange,
                <FiTrendingUp className="text-xl" />,
                'green'
              )}
              {renderMetricCard(
                'Avg. Position',
                overviewData.position.toFixed(1),
                overviewData.positionChange,
                <FiBarChart2 className="text-xl" />,
                'orange'
              )}
            </div>

            {/* Performance Chart */}
            {renderPerformanceChart()}

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {renderTable(
                'Top Queries',
                topQueries,
                [
                  { key: 'query', label: 'Query' },
                  { key: 'clicks', label: 'Clicks', render: (val) => formatNumber(val) },
                  { key: 'impressions', label: 'Impressions', render: (val) => formatNumber(val) },
                  { key: 'ctr', label: 'CTR', render: (val) => formatPercentage(val) },
                  { key: 'position', label: 'Position', render: (val) => val.toFixed(1) }
                ]
              )}

              {renderTable(
                'Top Pages',
                topPages,
                [
                  { key: 'page', label: 'Page' },
                  { key: 'clicks', label: 'Clicks', render: (val) => formatNumber(val) },
                  { key: 'impressions', label: 'Impressions', render: (val) => formatNumber(val) },
                  { key: 'ctr', label: 'CTR', render: (val) => formatPercentage(val) },
                  { key: 'position', label: 'Position', render: (val) => val.toFixed(1) }
                ]
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {renderTable(
                'Top Countries',
                topCountries,
                [
                  { key: 'country', label: 'Country' },
                  { key: 'clicks', label: 'Clicks', render: (val) => formatNumber(val) },
                  { key: 'impressions', label: 'Impressions', render: (val) => formatNumber(val) },
                  { key: 'ctr', label: 'CTR', render: (val) => formatPercentage(val) }
                ]
              )}

              {renderTable(
                'Top Devices',
                topDevices,
                [
                  { key: 'device', label: 'Device', render: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
                  { key: 'clicks', label: 'Clicks', render: (val) => formatNumber(val) },
                  { key: 'impressions', label: 'Impressions', render: (val) => formatNumber(val) },
                  { key: 'ctr', label: 'CTR', render: (val) => formatPercentage(val) }
                ]
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminSearchConsole;

