import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile } from '../services/api';
import SEO from '../components/SEO';

const ProfileEditPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const profileData = await getProfile();
                setFormData({
                    name: profileData.name || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            
            const updatedData = await updateProfile(formData);
            
            // Update local auth store
            updateUser(updatedData);

            alert('Cập nhật thông tin thành công!');
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    // Bỏ loading state - load data ngầm

    return (
        <>
            <SEO
                title="Chỉnh sửa hồ sơ - ANKH Store"
                description="Cập nhật thông tin cá nhân của bạn tại ANKH. Chỉnh sửa tên, email, số điện thoại và địa chỉ giao hàng."
                keywords="chỉnh sửa profile, cập nhật thông tin, edit profile, ANKH"
            />
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Banner */}
            <div className="relative h-[150px] md:h-[200px] bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="relative z-10 px-4 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wide">
                        Chỉnh sửa thông tin
                    </h1>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 md:space-y-6">
                            {/* Họ và tên */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600]"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600]"
                                    required
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600]"
                                />
                            </div>

                            {/* Địa chỉ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ"
                                    rows="3"
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600] resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col-reverse md:flex-row items-stretch gap-3 md:gap-4 pt-4 border-t">
                                <Link
                                    to="/profile"
                                    className="flex-1 bg-gray-200 text-gray-800 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-bold uppercase hover:bg-gray-300 transition text-center no-underline"
                                >
                                    Hủy
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-[#ff6600] text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-bold uppercase hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Lưu ý:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Thông tin email sẽ được sử dụng để đăng nhập</li>
                                <li>• Số điện thoại sẽ được dùng để liên hệ khi giao hàng</li>
                                <li>• Địa chỉ có thể để trống và điền khi đặt hàng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ProfileEditPage;

