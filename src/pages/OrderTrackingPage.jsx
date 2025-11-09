import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackOrder } from '../services/api';
import SEO from '../components/SEO';

const OrderTrackingPage = () => {
    const [orderCode, setOrderCode] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setOrderData(null);

        if (!orderCode.trim() || !phone.trim()) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            const data = await trackOrder(orderCode, phone);
            setOrderData(data);
        } catch (err) {
            console.error('Error tracking order:', err);
            setError(err.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng và số điện thoại.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') + ' VND' || '0 VND';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy',
        };
        return statusTexts[status] || status;
    };

    return (
        <>
            <SEO
                title="Tra cứu đơn hàng - ANKH Store"
                description="Tra cứu và theo dõi tình trạng đơn hàng của bạn tại ANKH. Nhập mã đơn hàng và số điện thoại để kiểm tra."
                keywords="tra cứu đơn hàng, theo dõi đơn hàng, order tracking, ANKH"
            />
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Banner */}
            <div className="relative h-[150px] md:h-[200px] bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="relative z-10 px-4 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wide">
                        Tra cứu đơn hàng
                    </h1>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-8">
                {/* Search Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Nhập thông tin đơn hàng
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã đơn hàng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    placeholder="Nhập mã đơn hàng"
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#ff6600]"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff6600] text-white py-3 rounded-lg font-bold uppercase hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'}
                        </button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-red-800">{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Details */}
                {orderData && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Thông tin đơn hàng
                                </h3>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(orderData.status)}`}>
                                    {getStatusText(orderData.status)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                                        <p className="font-semibold text-gray-900">{orderData.order_code}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Ngày đặt:</span>
                                        <p className="font-semibold text-gray-900">{formatDate(orderData.created_at)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                                        <p className="font-semibold text-gray-900">{orderData.payment_method}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-600">Người nhận:</span>
                                        <p className="font-semibold text-gray-900">{orderData.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Số điện thoại:</span>
                                        <p className="font-semibold text-gray-900">{orderData.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Địa chỉ:</span>
                                        <p className="font-semibold text-gray-900">{orderData.address}</p>
                                    </div>
                                </div>
                            </div>

                            {orderData.note && (
                                <div className="mt-4 pt-4 border-t">
                                    <span className="text-sm text-gray-600">Ghi chú:</span>
                                    <p className="text-gray-900 mt-1">{orderData.note}</p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Sản phẩm đã đặt
                            </h3>

                            <div className="space-y-4">
                                {orderData.items && orderData.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                                        <img 
                                            src={item.product_image || 'https://via.placeholder.com/100'}
                                            alt={item.product_name}
                                            className="w-20 h-20 object-cover rounded bg-gray-100"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {item.product_name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Số lượng: {item.quantity} | Giá: {formatPrice(item.price)}
                                            </p>
                                            <p className="text-sm font-semibold text-[#ff6600] mt-1">
                                                Thành tiền: {formatPrice(item.quantity * item.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-[#ff6600]">
                                        {formatPrice(orderData.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        {orderData.timeline && orderData.timeline.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Lịch sử đơn hàng
                                </h3>

                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    <div className="space-y-6">
                                        {orderData.timeline.map((event, index) => (
                                            <div key={index} className="relative flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 bg-[#ff6600] rounded-full flex items-center justify-center relative z-10">
                                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <p className="font-semibold text-gray-900">{event.status}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                                                    {event.note && (
                                                        <p className="text-sm text-gray-500 mt-1">{event.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/products"
                                className="bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
                            >
                                Tiếp tục mua hàng
                            </Link>
                            <button
                                onClick={() => {
                                    setOrderData(null);
                                    setOrderCode('');
                                    setPhone('');
                                }}
                                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition uppercase"
                            >
                                Tra cứu đơn khác
                            </button>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Hướng dẫn tra cứu đơn hàng
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                        <li>• Mã đơn hàng được gửi qua email sau khi đặt hàng thành công</li>
                        <li>• Số điện thoại phải trùng với số điện thoại khi đặt hàng</li>
                        <li>• Liên hệ hotline: <span className="font-semibold">1900 xxx xxx</span> nếu cần hỗ trợ</li>
                    </ul>
                </div>
            </div>
        </div>
        </>
    );
};

export default OrderTrackingPage;

