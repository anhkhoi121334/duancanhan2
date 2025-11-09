import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <SEO
        title="Tài khoản của tôi - ANKH Store"
        description="Quản lý tài khoản, đơn hàng và thông tin cá nhân tại ANKH Store."
        keywords="tài khoản, account, quản lý đơn hàng, ANKH"
      />
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 uppercase text-gray-900">
          TÀI KHOẢN CỦA TÔI
        </h1>

        {!isAuthenticated ? (
          // Not logged in
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg text-gray-600 mb-6">Bạn chưa đăng nhập</p>
            <Link 
              to="/login" 
              className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          // Logged in
          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#ff6600] flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                  <p className="text-gray-500 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <Link 
                to="/orders" 
                className="flex items-center justify-between p-4 hover:bg-gray-50 border-b no-underline text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">Đơn hàng của tôi</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link 
                to="/favorites" 
                className="flex items-center justify-between p-4 hover:bg-gray-50 border-b no-underline text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-medium">Sản phẩm yêu thích</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link 
                to="/profile" 
                className="flex items-center justify-between p-4 hover:bg-gray-50 border-b no-underline text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Thông tin cá nhân</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link 
                to="/stores" 
                className="flex items-center justify-between p-4 hover:bg-gray-50 border-b no-underline text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Tìm cửa hàng</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link 
                to="/contact" 
                className="flex items-center justify-between p-4 hover:bg-gray-50 no-underline text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Liên hệ hỗ trợ</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition uppercase"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AccountPage;

