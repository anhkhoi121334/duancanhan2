import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

const ProfilePage = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [orderCode, setOrderCode] = useState('');

    const handleTrackOrder = (e) => {
        e.preventDefault();
        if (!orderCode.trim()) {
            alert('Vui lòng nhập mã đơn hàng');
            return;
        }
        // TODO: Implement order tracking
        console.log('Tracking order:', orderCode);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
                <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản</p>
                    <Link 
                        to="/login" 
                        className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Hồ sơ cá nhân - ANKH Store"
                description="Quản lý thông tin cá nhân, xem lịch sử đơn hàng và theo dõi giao hàng tại ANKH."
                keywords="hồ sơ, profile, tài khoản, lịch sử đơn hàng, ANKH"
            />
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-20">
            {/* Banner - Giảm chiều cao trên mobile */}
            <div className="relative h-[120px] md:h-[200px] bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="relative z-10 px-4 text-center">
                    <h1 className="text-xl md:text-4xl font-bold text-white uppercase tracking-wide">
                        Thông tin tài khoản
                    </h1>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-3 md:px-4 py-4 md:py-6">
                <div className="grid md:grid-cols-12 gap-6">
                    {/* Left Column - Avatar */}
                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 text-center">
                            {/* Avatar */}
                            <div className="mb-4">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name}
                                        className="w-24 h-24 md:w-48 md:h-48 mx-auto rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-48 md:h-48 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                        <svg className="w-16 h-16 md:w-32 md:h-32 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* User Role Badge */}
                            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - User Info */}
                    <div className="md:col-span-8">
                        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                {/* Họ và tên */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên:
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email:
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại:
                                    </label>
                                    <input
                                        type="tel"
                                        value={user?.phone || 'Chưa cập nhật'}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                {/* Địa chỉ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ:
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.address || 'Chưa cập nhật'}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                {/* Mật khẩu */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu:
                                    </label>
                                    <input
                                        type="password"
                                        value="********"
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                {/* Action Links */}
                                <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 pt-4 border-t">
                                    <Link
                                        to="/profile/edit"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium no-underline"
                                    >
                                        Thay đổi thông tin tài khoản
                                    </Link>
                                    <Link
                                        to="/profile/change-password"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium no-underline"
                                    >
                                        Đổi mật khẩu
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Theo dõi đơn hàng */}
                        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mt-4 md:mt-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                                Theo dõi đơn hàng của bạn
                            </h3>
                            
                            <form onSubmit={handleTrackOrder} className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Mã đơn hàng"
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#ff6600]"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#ff6600] text-white px-6 md:px-8 py-2 md:py-3 rounded text-sm md:text-base font-bold uppercase hover:bg-orange-700 transition whitespace-nowrap"
                                >
                                    Tra cứu đơn hàng
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ProfilePage;

