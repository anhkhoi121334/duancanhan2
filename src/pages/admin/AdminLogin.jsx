import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@components';
import { FaFacebookF, FaInstagram, FaPinterestP } from 'react-icons/fa';
import { API_URL } from '../../config/env';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockWarning, setShowMockWarning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      let isUsingMockMode = false;
      
      console.log('🔐 Đang gọi API login:', `${API_URL}/auth/login`);
      
      // Try to call real API first
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        console.log('📡 API Response status:', response.status);

        // Parse response
        const responseText = await response.text();
        console.log('📦 API Response:', responseText);

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Không thể parse JSON response:', parseError);
          throw new Error('Server trả về response không hợp lệ');
        }

        if (!response.ok) {
          console.error('❌ API Error:', data.message || 'Đăng nhập thất bại');
          throw new Error(data.message || 'Đăng nhập thất bại');
        }

        console.log('✅ API Login thành công:', data);
      } catch (apiError) {
        console.error('⚠️ API Error:', apiError.message);
        
        // Fallback sang mock nếu:
        // 1. Network error (không connect được server)
        // 2. Route not found (backend chưa có endpoint)
        // 3. Server error (500+)
        const shouldUseMock = 
          apiError.message.includes('fetch') || 
          apiError.message.includes('Network') || 
          apiError.message.includes('Failed to fetch') ||
          apiError.message.includes('not found') ||
          apiError.message.includes('Not Found') ||
          apiError.message.includes('route') ||
          apiError.message.includes('Server');
        
        if (shouldUseMock) {
          console.warn('🔄 Backend không sẵn sàng, chuyển sang Mock Mode');
          console.warn('💡 Để dùng API thật, đảm bảo backend có endpoint: POST /api/auth/login');
          isUsingMockMode = true;
          setShowMockWarning(true);
          
          // Mock admin accounts
          const mockAdmins = [
            {
              email: 'luonganhkhoi2004@gmail.com',
              password: 'LuongKhoi@2004',
              user: {
                id: 3,
                name: 'Lương Anh Khôi',
                email: 'luonganhkhoi2004@gmail.com',
                phone: '0123456789',
                role: 'admin'
              },
              token: '1|5v5hS0JwVpuVMrsvn9pB0jV2OGT3sTz4hzcN7N1t21a5e178'
            },
            {
              email: 'admin@ankhstore.com',
              password: 'admin',
              user: {
                id: 1,
                name: 'Admin ANKH',
                email: 'admin@ankhstore.com',
                phone: '0987654321',
                role: 'admin'
              },
              token: 'mock_admin_token_123'
            }
          ];

          // Check mock credentials
          const mockUser = mockAdmins.find(
            admin => admin.email === formData.email && admin.password === formData.password
          );

          if (mockUser) {
            console.log('✅ Mock Login thành công');
            data = {
              message: 'Đăng nhập thành công (Mock Mode - Backend offline)',
              user: mockUser.user,
              token: mockUser.token
            };
          } else {
            throw new Error('❌ Backend offline. Dùng mock account: admin@ankhstore.com / admin');
          }
        } else {
          // Nếu không phải network error, throw lỗi gốc (validation error từ API)
          throw apiError;
        }
      }

      // Kiểm tra role - chỉ cho phép admin
      if (data.user.role !== 'admin') {
        throw new Error('Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập bằng tài khoản admin.');
      }

      // Lưu thông tin admin
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      if (isUsingMockMode) {
        localStorage.setItem('admin_mock_mode', 'true');
      } else {
        localStorage.removeItem('admin_mock_mode');
      }

      console.log('✅ Login thành công, redirect to dashboard');
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('❌ Login Error:', err);
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Admin Login - ANKH Store"
        description="Đăng nhập quản trị viên"
      />

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circles */}
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
          
          {/* Geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 border-4 border-purple-400/20 rotate-45 backdrop-blur-sm"></div>
          <div className="absolute bottom-40 right-20 w-16 h-16 border-4 border-pink-400/20 rounded-full backdrop-blur-sm"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-blue-400/20 backdrop-blur-sm"></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-32 bg-gradient-to-b from-pink-400/20 to-blue-400/20 backdrop-blur-sm"></div>
          
          {/* Small decorative circles with glow */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-purple-300/40 rounded-full shadow-[0_0_20px_rgba(216,180,254,0.4)] animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-pink-300/40 rounded-full shadow-[0_0_25px_rgba(249,168,212,0.4)] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-300/40 rounded-full shadow-[0_0_15px_rgba(147,197,253,0.4)] animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Additional floating particles */}
          <div className="absolute top-1/3 left-[15%] w-2 h-2 bg-white/20 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute bottom-1/4 right-[30%] w-2 h-2 bg-white/20 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute top-[60%] left-[40%] w-1.5 h-1.5 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
          <div className="absolute bottom-[45%] right-[15%] w-1.5 h-1.5 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Welcome Section */}
            <div className={`text-white space-y-8 p-8 transition-all duration-1000 ${
              mounted ? 'animate-slideRight opacity-100' : 'opacity-0 translate-x-[-50px]'
            }`}>
              {/* Logo */}
              <div className={`flex items-center gap-3 mb-12 transition-all duration-700 delay-200 ${
                mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
              }`}>
                <div className="flex gap-1">
                  <div className="w-8 h-12 bg-white rounded"></div>
                  <div className="w-8 h-12 bg-white rounded"></div>
                </div>
              </div>

              {/* Welcome Text */}
              <div>
                <h1 className={`text-7xl font-bold mb-6 transition-all duration-700 delay-300 ${
                  mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                }`}>Welcome!</h1>
                <div className={`w-16 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mb-8 transition-all duration-700 delay-400 ${
                  mounted ? 'animate-scaleX opacity-100' : 'opacity-0 scale-x-0'
                }`}></div>
                <p className={`text-lg text-purple-200 leading-relaxed max-w-md transition-all duration-700 delay-500 ${
                  mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                }`}>
                  Chào mừng đến với trang quản trị ANKH Store. 
                  Đăng nhập để quản lý sản phẩm, đơn hàng và khách hàng của bạn.
                </p>
              </div>

              {/* Learn More Button */}
              <button className={`px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:scale-105 transition-all duration-300 shadow-lg ${
                mounted ? 'animate-slideUp opacity-100 delay-600' : 'opacity-0 translate-y-10'
              }`}>
                Tìm hiểu thêm
              </button>
            </div>

            {/* Right Side - Login Form */}
            <div className={`w-full max-w-md mx-auto transition-all duration-1000 delay-300 ${
              mounted ? 'animate-slideLeft opacity-100' : 'opacity-0 translate-x-[50px]'
            }`}>
              <div className="backdrop-blur-2xl bg-white/5 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]">
                {/* Sign in Title */}
                <h2 className={`text-4xl font-bold text-white text-center mb-8 drop-shadow-lg transition-all duration-700 delay-400 ${
                  mounted ? 'animate-slideDown opacity-100' : 'opacity-0 translate-y-[-20px]'
                }`}>Sign in</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mock Mode Warning */}
                  {showMockWarning && (
                    <div className="bg-yellow-500/10 backdrop-blur-md border border-yellow-300/30 text-white px-4 py-3 rounded-xl text-xs animate-pulse">
                      <p className="font-semibold mb-1">⚠️ Backend chưa sẵn sàng - Đang dùng Mock Mode</p>
                      <p className="text-[10px] opacity-75">Endpoint cần có: <code className="bg-white/10 px-1 rounded">POST /api/auth/login</code></p>
                    </div>
                  )}

                  {/* Demo Account Info */}
                  <div className="bg-blue-500/10 backdrop-blur-md border border-blue-300/30 text-white px-4 py-3 rounded-xl text-xs">
                    <p className="font-semibold mb-2">🔑 Test Accounts:</p>
                    <div className="space-y-2">
                      <div>
                        <p className="opacity-75 text-[10px] mb-0.5">Account 1 (Real credentials):</p>
                        <p>Email: <code className="bg-white/10 px-2 py-0.5 rounded">luonganhkhoi2004@gmail.com</code></p>
                        <p>Pass: <code className="bg-white/10 px-2 py-0.5 rounded">LuongKhoi@2004</code></p>
                      </div>
                      <div>
                        <p className="opacity-75 text-[10px] mb-0.5">Account 2 (Demo):</p>
                        <p>Email: <code className="bg-white/10 px-2 py-0.5 rounded">admin@ankhstore.com</code></p>
                        <p>Pass: <code className="bg-white/10 px-2 py-0.5 rounded">admin</code></p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] opacity-75">💡 Mở Console (F12) để xem API logs</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 backdrop-blur-md border border-red-300/30 text-white px-4 py-3 rounded-xl text-sm shadow-lg">
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div className={`transition-all duration-700 delay-500 ${
                    mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                  }`}>
                    <label htmlFor="email" className="block text-white text-sm font-semibold mb-3 drop-shadow">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-pink-400/60 focus:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 hover:border-white/30"
                      placeholder="admin@ankhstore.com"
                    />
                  </div>

                  {/* Password */}
                  <div className={`transition-all duration-700 delay-600 ${
                    mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                  }`}>
                    <label htmlFor="password" className="block text-white text-sm font-semibold mb-3 drop-shadow">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-pink-400/60 focus:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 hover:border-white/30"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform ${
                      mounted ? 'animate-slideUp opacity-100 delay-700' : 'opacity-0 translate-y-10'
                    } ${
                      loading
                        ? 'bg-gray-400/30 backdrop-blur-md cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-400 via-pink-500 to-pink-600 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-[1.02] shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang đăng nhập...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>

                  {/* Social Media Icons */}
                  <div className={`flex items-center justify-center gap-6 pt-4 transition-all duration-700 delay-800 ${
                    mounted ? 'animate-slideUp opacity-100' : 'opacity-0 translate-y-10'
                  }`}>
                    {[
                      { icon: FaFacebookF, delay: 0 },
                      { icon: FaInstagram, delay: 100 },
                      { icon: FaPinterestP, delay: 200 }
                    ].map(({ icon: Icon, delay }, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/10 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-110 transition-all duration-300"
                        style={{ animationDelay: `${delay}ms` }}
                      >
                        <Icon className="text-lg" />
                      </button>
                    ))}
                  </div>
                </form>

                {/* Back to Site */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/')}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300 drop-shadow"
                  >
                    ← Quay lại trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-purple-200 text-sm z-10">
          <p>© 2025 ANKH Store. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
