import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar, 
  FiTrendingUp, FiDollarSign, FiHelpCircle, FiSettings, 
  FiLogOut, FiMenu, FiBell, FiEye, FiTrash2, FiCheck, FiX,
  FiTag, FiDroplet, FiFilter, FiImage, FiFileText, FiSearch
} from 'react-icons/fi';
import { API_URL } from '../../config/env';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Đánh giá');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    pendingReviews: 0,
    approvedReviews: 0
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
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setReviews(data.data || []);
      calculateStats(data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Mock data
      const mockReviews = [
        { id: 1, user_name: 'Nguyễn Văn A', product_name: 'Nike Air Max 270', rating: 5, comment: 'Sản phẩm rất tốt, đúng như mô tả', status: 'approved', created_at: '2025-01-15' },
        { id: 2, user_name: 'Trần Thị B', product_name: 'Adidas Ultraboost', rating: 4, comment: 'Giày đẹp, giao hàng nhanh', status: 'approved', created_at: '2025-01-14' },
        { id: 3, user_name: 'Lê Văn C', product_name: 'Puma RS-X', rating: 5, comment: 'Chất lượng tuyệt vời!', status: 'pending', created_at: '2025-01-13' },
        { id: 4, user_name: 'Phạm Thị D', product_name: 'New Balance 574', rating: 3, comment: 'Sản phẩm tạm ổn', status: 'approved', created_at: '2025-01-12' },
        { id: 5, user_name: 'Hoàng Văn E', product_name: 'Converse Chuck Taylor', rating: 2, comment: 'Không đúng size', status: 'pending', created_at: '2025-01-11' }
      ];
      setReviews(mockReviews);
      calculateStats(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const avgRating = total > 0 
      ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;
    const pending = reviewsData.filter(r => r.status === 'pending').length;
    const approved = reviewsData.filter(r => r.status === 'approved').length;

    setStats({
      totalReviews: total,
      avgRating: parseFloat(avgRating),
      pendingReviews: pending,
      approvedReviews: approved
    });
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

  const handleApprove = async (reviewId) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/admin/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Đã duyệt đánh giá!');
      fetchReviews();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn từ chối đánh giá này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/admin/reviews/${reviewId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Đã từ chối đánh giá!');
      fetchReviews();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Đã xóa đánh giá!');
      fetchReviews();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus !== 'all' && review.status !== filterStatus) return false;
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false;
    return true;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FiStar
        key={index}
        className={`${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <SEO title="Quản lý Đánh giá - Admin ANKH Store" />

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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h1>
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Tổng đánh giá</span>
                  <FiStar className="text-2xl text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalReviews}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Đánh giá TB</span>
                  <FiStar className="text-2xl text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.avgRating}/5</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Chờ duyệt</span>
                  <FiHelpCircle className="text-2xl text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingReviews}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Đã duyệt</span>
                  <FiCheck className="text-2xl text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.approvedReviews}</p>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                </select>

                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tất cả sao</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">{review.user_name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{review.product_name}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">{review.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            review.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {review.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        {review.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <FiCheck />
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(review.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <FiX />
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <FiTrash2 />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không có đánh giá nào</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminReviews;

