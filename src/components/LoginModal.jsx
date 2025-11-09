import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@services/api';
import { useAuthStore, useCartStore } from '@store';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, preventClose = false, message }) => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { showToast } = useCartStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auto focus email input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100);
      }
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData);
      
      // Lưu thông tin user và token vào store
      if (response.token && response.user) {
        // Kiểm tra nếu là admin
        if (response.user.role === 'admin') {
          // Admin không được login qua modal trang chủ
          setError('Tài khoản Admin vui lòng đăng nhập tại trang Admin');
          showToast('Tài khoản Admin vui lòng đăng nhập tại trang Admin', 'error');
          
          // Redirect đến trang admin login sau 2 giây
          setTimeout(() => {
            onClose();
            navigate('/admin/login');
          }, 2000);
          
          return;
        }
        
        // User thường - cho phép login
        setAuth(response.user, response.token);
        showToast(`Chào mừng ${response.user.name}!`, 'success');
        
        // Reset form
        setFormData({
          email: '',
          password: ''
        });
        
        // Close modal immediately after successful login
        onClose();
      } else {
        throw new Error('Không nhận được thông tin đăng nhập');
      }
      
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      const errorMessage = error.message || 'Email hoặc mật khẩu không đúng!';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    showToast('Đăng nhập bằng Facebook đang được phát triển', 'info');
  };

  const handleGoogleLogin = () => {
    showToast('Đăng nhập bằng Google đang được phát triển', 'info');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[9999] bg-black bg-opacity-50"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        minHeight: '100vh'
      }}
      onClick={(e) => {
        // Close modal when clicking outside (only if not prevented)
        if (e.target === e.currentTarget && !preventClose) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full p-8 relative animate-fadeIn"
        style={{
          maxWidth: '450px',
          maxHeight: '90vh',
          overflowY: 'auto',
          marginTop: 'auto',
          marginBottom: 'auto'
        }}
      >
        {/* Close Button - Always show, but onClose behavior depends on preventClose */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          type="button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#ff6600] text-center mb-2">
          Đăng nhập
        </h2>

        {/* Message for checkout requirement */}
        {message && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        {/* Admin Login Hint */}
        <p className="text-center text-xs text-gray-500 mb-6">
          Dành cho khách hàng. Admin vui lòng{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/admin/login');
            }}
            className="text-[#ff6600] underline hover:text-orange-700"
          >
            đăng nhập tại đây
          </button>
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email của bạn"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#ff6600] text-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#ff6600] text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button type="button" className="text-xs text-gray-500 hover:text-[#ff6600]">
              Bạn quên mật khẩu? <span className="text-[#ff6600] underline">Khôi phục</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6600] text-white py-3 rounded-full font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">HOẶC</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          {/* Facebook Login */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-full font-semibold hover:bg-[#166FE5] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Đăng nhập bằng Facebook
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#ff6600] font-semibold hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

