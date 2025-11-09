import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@store';
import { createOrder, getProvinces, getDistricts, getWards } from '@services/api';
import { LoginModal, RegisterModal, SEO } from '@components';
import { formatPrice } from '@lib/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart, showToast } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    
    // Use all items in cart
    const selectedCartItems = items;

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        note: '',
        _orderData: null, // Temporary storage for order data when showing QR modal
    });
    
    // Form validation errors
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const [submitting, setSubmitting] = useState(false);
    const debounceTimers = useRef({});

    // Location data from API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [fullLocationData, setFullLocationData] = useState([]); // Store full nested data from API

    const [useDefaultAddress, setUseDefaultAddress] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    
    // Login/Register Modal states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    
    // QR Payment states
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    // Validation functions
    const validatePhone = (phone) => {
        if (!phone) return 'Số điện thoại là bắt buộc';
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        const cleanedPhone = phone.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanedPhone)) {
            return 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email) return ''; // Email không bắt buộc
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Email không hợp lệ (VD: example@email.com)';
        }
        return '';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'phone':
                return validatePhone(value);
            case 'email':
                return validateEmail(value);
            case 'fullName':
                if (!value || value.trim().length < 2) {
                    return 'Họ và tên phải có ít nhất 2 ký tự';
                }
                return '';
            case 'address':
                if (!value || value.trim().length < 5) {
                    return 'Địa chỉ phải có ít nhất 5 ký tự';
                }
                return '';
            default:
                return '';
        }
    };

    // formatPrice is now imported from @lib/formatters

    // Shipping costs
    const shippingCosts = {
        standard: 0,
        express: 30000,
    };

    // Memoized calculations
    const shippingFee = useMemo(() => shippingCosts[shippingMethod], [shippingMethod]);
    const subtotal = useMemo(() => getTotalPrice() || 0, [getTotalPrice, items]);
    const discount = 0; // Placeholder for discount
    const total = useMemo(() => {
        return (isNaN(subtotal) ? 0 : subtotal) + shippingFee - discount;
    }, [subtotal, shippingFee, discount]);

    // Static provinces data - Không fetch từ API do SSL certificate issues
    const staticProvinces = [
        { code: 1, name: 'Hà Nội' },
        { code: 79, name: 'Hồ Chí Minh' },
        { code: 31, name: 'Hải Phòng' },
        { code: 48, name: 'Đà Nẵng' },
        { code: 92, name: 'Cần Thơ' },
        { code: 24, name: 'Hà Giang' },
        { code: 28, name: 'Cao Bằng' },
        { code: 2, name: 'Lào Cai' },
        { code: 4, name: 'Điện Biên' },
        { code: 6, name: 'Lai Châu' },
        { code: 8, name: 'Sơn La' },
        { code: 10, name: 'Yên Bái' },
        { code: 11, name: 'Tuyên Quang' },
        { code: 12, name: 'Lạng Sơn' },
        { code: 14, name: 'Quảng Ninh' },
        { code: 15, name: 'Bắc Giang' },
        { code: 17, name: 'Bắc Ninh' },
        { code: 19, name: 'Hải Dương' },
        { code: 20, name: 'Hưng Yên' },
        { code: 22, name: 'Hà Nam' },
        { code: 25, name: 'Nam Định' },
        { code: 26, name: 'Thái Bình' },
        { code: 27, name: 'Ninh Bình' },
        { code: 30, name: 'Thanh Hóa' },
        { code: 33, name: 'Nghệ An' },
        { code: 34, name: 'Hà Tĩnh' },
        { code: 35, name: 'Quảng Bình' },
        { code: 36, name: 'Quảng Trị' },
        { code: 37, name: 'Thừa Thiên Huế' },
        { code: 40, name: 'Quảng Nam' },
        { code: 42, name: 'Quảng Ngãi' },
        { code: 44, name: 'Bình Định' },
        { code: 45, name: 'Phú Yên' },
        { code: 46, name: 'Khánh Hòa' },
        { code: 49, name: 'Ninh Thuận' },
        { code: 51, name: 'Bình Thuận' },
        { code: 52, name: 'Kon Tum' },
        { code: 54, name: 'Gia Lai' },
        { code: 56, name: 'Đắk Lắk' },
        { code: 58, name: 'Đắk Nông' },
        { code: 60, name: 'Lâm Đồng' },
        { code: 62, name: 'Bình Phước' },
        { code: 64, name: 'Tây Ninh' },
        { code: 66, name: 'Bình Dương' },
        { code: 67, name: 'Đồng Nai' },
        { code: 68, name: 'Bà Rịa - Vũng Tàu' },
        { code: 70, name: 'Long An' },
        { code: 72, name: 'Tiền Giang' },
        { code: 74, name: 'Bến Tre' },
        { code: 75, name: 'Trà Vinh' },
        { code: 77, name: 'Vĩnh Long' },
        { code: 80, name: 'Đồng Tháp' },
        { code: 82, name: 'An Giang' },
        { code: 83, name: 'Kiên Giang' },
        { code: 84, name: 'Cà Mau' },
        { code: 86, name: 'Bạc Liêu' },
        { code: 87, name: 'Sóc Trăng' },
        { code: 89, name: 'Hậu Giang' },
    ];

    // Static districts data for major provinces
    const staticDistricts = {
        1: [ // Hà Nội
            { code: 1, name: 'Ba Đình' },
            { code: 2, name: 'Hoàn Kiếm' },
            { code: 3, name: 'Tây Hồ' },
            { code: 4, name: 'Long Biên' },
            { code: 5, name: 'Cầu Giấy' },
            { code: 6, name: 'Đống Đa' },
            { code: 7, name: 'Hai Bà Trưng' },
            { code: 8, name: 'Hoàng Mai' },
            { code: 9, name: 'Thanh Xuân' },
            { code: 10, name: 'Sóc Sơn' },
            { code: 11, name: 'Đông Anh' },
            { code: 12, name: 'Gia Lâm' },
            { code: 13, name: 'Nam Từ Liêm' },
            { code: 14, name: 'Bắc Từ Liêm' },
            { code: 15, name: 'Mê Linh' },
            { code: 16, name: 'Hà Đông' },
            { code: 17, name: 'Sơn Tây' },
            { code: 18, name: 'Ba Vì' },
            { code: 19, name: 'Phúc Thọ' },
            { code: 20, name: 'Đan Phượng' },
            { code: 21, name: 'Hoài Đức' },
            { code: 22, name: 'Quốc Oai' },
            { code: 23, name: 'Thạch Thất' },
            { code: 24, name: 'Chương Mỹ' },
            { code: 25, name: 'Thanh Oai' },
            { code: 26, name: 'Thường Tín' },
            { code: 27, name: 'Phú Xuyên' },
            { code: 28, name: 'Ứng Hòa' },
            { code: 29, name: 'Mỹ Đức' },
        ],
        79: [ // Hồ Chí Minh
            { code: 760, name: 'Quận 1' },
            { code: 761, name: 'Quận 2' },
            { code: 762, name: 'Quận 3' },
            { code: 763, name: 'Quận 4' },
            { code: 764, name: 'Quận 5' },
            { code: 765, name: 'Quận 6' },
            { code: 766, name: 'Quận 7' },
            { code: 767, name: 'Quận 8' },
            { code: 768, name: 'Quận 9' },
            { code: 769, name: 'Quận 10' },
            { code: 770, name: 'Quận 11' },
            { code: 771, name: 'Quận 12' },
            { code: 772, name: 'Quận Bình Thạnh' },
            { code: 773, name: 'Quận Tân Bình' },
            { code: 774, name: 'Quận Tân Phú' },
            { code: 775, name: 'Quận Phú Nhuận' },
            { code: 776, name: 'Quận Gò Vấp' },
            { code: 777, name: 'Quận Bình Tân' },
            { code: 778, name: 'Quận Thủ Đức' },
            { code: 779, name: 'Huyện Củ Chi' },
            { code: 780, name: 'Huyện Hóc Môn' },
            { code: 781, name: 'Huyện Bình Chánh' },
            { code: 782, name: 'Huyện Nhà Bè' },
            { code: 783, name: 'Huyện Cần Giờ' },
        ],
        19: [ // Hải Dương
            { code: 190, name: 'Thành phố Hải Dương' },
            { code: 191, name: 'Thành phố Chí Linh' },
            { code: 192, name: 'Huyện Nam Sách' },
            { code: 193, name: 'Thị xã Kinh Môn' },
            { code: 194, name: 'Huyện Kim Thành' },
            { code: 195, name: 'Huyện Thanh Hà' },
            { code: 196, name: 'Huyện Cẩm Giàng' },
            { code: 197, name: 'Huyện Bình Giang' },
            { code: 198, name: 'Huyện Gia Lộc' },
            { code: 199, name: 'Huyện Tứ Kỳ' },
            { code: 200, name: 'Huyện Ninh Giang' },
            { code: 201, name: 'Huyện Thanh Miện' },
        ],
    };

    // Initialize provinces on mount - Fetch from API with full nested data
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                console.log('🔄 Fetching provinces from API with depth=3...');
                const data = await getProvinces();
                
                if (data && data.length > 0) {
                    // API depth=3 returns full nested structure: provinces.districts.wards
                    // Store full data for later use
                    setFullLocationData(data);
                    
                    // Extract and normalize provinces for dropdown
                    const normalizedProvinces = data.map(province => ({
                        code: province.code,
                        name: province.name
                    }));
                    
                    setProvinces(normalizedProvinces);
                    console.log('✅ Loaded', normalizedProvinces.length, 'provinces with full data from API');
                } else {
                    // Fallback to static data
                    console.log('⚠️ API returned empty, using static data');
                    setProvinces(staticProvinces);
                    setFullLocationData([]);
                }
            } catch (error) {
                console.error('❌ Error fetching provinces:', error);
                // Fallback to static data
                console.log('⚠️ Using static data as fallback');
                setProvinces(staticProvinces);
                setFullLocationData([]);
            } finally {
                setLoadingProvinces(false);
            }
        };
        
        fetchProvinces();
    }, []);

    // Auto-fill user info if logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            // Auto-fill form with user data from store
            setFormData(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
        }
    }, [isAuthenticated, user]);

    // Cleanup debounce timers on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    // Handle province change - Get districts from fullLocationData or static data
    const handleProvinceChange = async (e) => {
        const provinceCode = parseInt(e.target.value);
        setFormData(prev => ({
            ...prev,
            province: provinceCode,
            district: '',
            ward: ''
        }));

        // Reset districts và wards
        setDistricts([]);
        setWards([]);

        if (!provinceCode) return;

        // Try to get districts from fullLocationData first
        if (fullLocationData.length > 0) {
            const province = fullLocationData.find(p => p.code === provinceCode);
            if (province && province.districts) {
                const normalizedDistricts = province.districts.map(district => ({
                    code: district.code,
                    name: district.name
                }));
                setDistricts(normalizedDistricts);
                console.log('✅ Loaded', normalizedDistricts.length, 'districts from cached data');
                return;
            }
        }

        // Fallback: Try API if fullLocationData not available
        try {
            console.log(`🔄 Fetching districts for province ${provinceCode} from API...`);
            const data = await getDistricts(provinceCode);
            
            if (data && data.length > 0) {
                const normalizedDistricts = data.map(district => ({
                    code: district.code || district.id || district.district_code,
                    name: district.name || district.district_name
                }));
                setDistricts(normalizedDistricts);
                console.log('✅ Loaded', normalizedDistricts.length, 'districts from API');
            } else if (staticDistricts[provinceCode]) {
                console.log('⚠️ Using static data');
                setDistricts(staticDistricts[provinceCode]);
            }
        } catch (error) {
            console.error('❌ Error fetching districts:', error);
            if (staticDistricts[provinceCode]) {
                console.log('⚠️ Using static data as fallback');
                setDistricts(staticDistricts[provinceCode]);
            }
        }
    };

    // Handle district change - Get wards from fullLocationData or API
    const handleDistrictChange = async (e) => {
        const districtCode = parseInt(e.target.value);
        setFormData(prev => ({
            ...prev,
            district: districtCode,
            ward: ''
        }));

        // Reset wards
        setWards([]);

        if (!districtCode) return;

        // Try to get wards from fullLocationData first
        if (fullLocationData.length > 0 && formData.province) {
            const province = fullLocationData.find(p => p.code === formData.province);
            if (province && province.districts) {
                const district = province.districts.find(d => d.code === districtCode);
                if (district && district.wards) {
                    const normalizedWards = district.wards.map(ward => ({
                        code: ward.code,
                        name: ward.name
                    }));
                    setWards(normalizedWards);
                    console.log('✅ Loaded', normalizedWards.length, 'wards from cached data');
                    return;
                }
            }
        }

        // Fallback: Try API if fullLocationData not available
        try {
            console.log(`🔄 Fetching wards for district ${districtCode} from API...`);
            const data = await getWards(districtCode);
            
            if (data && data.length > 0) {
                const normalizedWards = data.map(ward => ({
                    code: ward.code || ward.id || ward.ward_code,
                    name: ward.name || ward.ward_name
                }));
                setWards(normalizedWards);
                console.log('✅ Loaded', normalizedWards.length, 'wards from API');
            } else {
                console.log('⚠️ No wards available, user must input manually');
            }
        } catch (error) {
            console.error('❌ Error fetching wards:', error);
            console.log('⚠️ User must input ward manually');
        }
    };

    // Optimized input change handler with validation
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Clear previous debounce timer for this field
        if (debounceTimers.current[name]) {
            clearTimeout(debounceTimers.current[name]);
        }

        // Debounce validation for phone and email
        if (name === 'phone' || name === 'email') {
            debounceTimers.current[name] = setTimeout(() => {
                const error = validateField(name, value);
                setErrors(prev => ({
                    ...prev,
                    [name]: error
                }));
            }, 500);
        } else {
            // Immediate validation for other fields
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    }, []);

    // Handle blur for immediate validation
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    // Create QR Code for payment
    const createQRPayment = async (orderCode, amount) => {
        try {
            setQrLoading(true);
            
            console.log('📡 Calling QR Payment API...', {
                endpoint: `${API_URL}/payments/create-qr`,
                order_code: orderCode,
                amount: amount
            });
            
            const response = await fetch(`${API_URL}/payments/create-qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    order_code: orderCode,
                    amount: amount
                })
            });

            console.log('📦 QR Payment Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
                }
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ QR Payment Response:', data);

            if (data.success || data.qr_code_url || data.qr_data) {
                setQrData(data);
                setShowQRModal(true);
                
                // Calculate time remaining
                if (data.expired_at) {
                    const expiredTime = new Date(data.expired_at).getTime();
                    const now = new Date().getTime();
                    const remaining = Math.floor((expiredTime - now) / 1000);
                    setTimeRemaining(remaining > 0 ? remaining : 15 * 60); // Fallback to 15 min if invalid
                } else {
                    // Default 15 minutes if no expiry
                    setTimeRemaining(15 * 60);
                }
                
                return data; // Return QR data
            } else {
                throw new Error(data.message || 'Không thể tạo mã QR');
            }
        } catch (error) {
            console.error('❌ Error creating QR:', error);
            
            // Fallback: Hiển thị thông tin chuyển khoản thủ công
            console.log('ℹ️ Sử dụng fallback QR data (API không khả dụng)');
            
            const fallbackQRData = {
                success: true,
                message: 'Vui lòng chuyển khoản theo thông tin dưới đây',
                order_code: orderCode,
                amount: amount,
                qr_code_url: null,
                qr_data: null,
                bank_name: 'Vietcombank',
                account_no: '1234567890',
                account_name: 'CONG TY ANKH STORE',
                content: orderCode,
                expired_at: null
            };
            
            setQrData(fallbackQRData);
            setShowQRModal(true);
            setTimeRemaining(15 * 60); // 15 minutes
            
            showToast('⚠️ API QR không khả dụng. Vui lòng chuyển khoản thủ công theo thông tin hiển thị.', 'warning');
            
            return fallbackQRData; // Return fallback QR data
        } finally {
            setQrLoading(false);
        }
    };

    // Countdown timer for QR expiration
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    showToast('Mã QR đã hết hạn. Vui lòng tạo mã mới!', 'error');
                    setShowQRModal(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining]);

    // Format countdown timer
    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check authentication (should not reach here if not authenticated due to early return, but keep as safety check)
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để đặt hàng!', 'error');
            navigate('/profile');
            return;
        }

        // Validate all fields
        const newErrors = {};
        let hasErrors = false;

        // Validate required fields
        if (!formData.fullName || formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
            hasErrors = true;
        }

        const phoneError = validatePhone(formData.phone);
        if (phoneError) {
            newErrors.phone = phoneError;
            hasErrors = true;
        }

        if (!formData.address || formData.address.trim().length < 5) {
            newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
            hasErrors = true;
        }

        // Validate optional email if provided
        if (formData.email) {
            const emailError = validateEmail(formData.email);
            if (emailError) {
                newErrors.email = emailError;
                hasErrors = true;
            }
        }

        if (hasErrors) {
            setErrors(newErrors);
            setTouched({
                fullName: true,
                phone: true,
                email: true,
                address: true
            });
            showToast('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
            // Scroll to first error
            const firstErrorField = Object.keys(newErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }

        try {
            setSubmitting(true);

            // Get location names for full address
            const provinceName = provinces.find(p => p.code === parseInt(formData.province))?.name || '';
            const districtName = districts.find(d => d.code === parseInt(formData.district))?.name || '';
            const wardName = wards.find(w => w.code === parseInt(formData.ward))?.name || '';
            
            // Build full address
            const fullAddress = [
                formData.address,
                wardName,
                districtName,
                provinceName
            ].filter(Boolean).join(', ');

            // Map cart items to API format (only selected items)
            // Tìm variant_id từ product variants dựa trên size
            const orderItems = selectedCartItems.map((item, index) => {
                // Ưu tiên: variant_id đã được lưu trong cart item
                let variantId = item.variant_id || item.variantId;
                let selectedVariant = null;
                
                // Nếu không có variantId, tìm từ product variants
                if (!variantId && item.variants && Array.isArray(item.variants)) {
                    const variant = item.variants.find(v => {
                        // Match by size string hoặc size_id
                        return v.size === item.size || 
                               v.size_id === item.sizeId ||
                               String(v.size_id) === String(item.size);
                    });
                    if (variant) {
                        variantId = variant.id;
                        selectedVariant = variant;
                    }
                } else if (variantId && item.variants && Array.isArray(item.variants)) {
                    // Tìm variant từ variantId để lấy giá
                    selectedVariant = item.variants.find(v => v.id === variantId || v.id === parseInt(variantId));
                }
                
                // Nếu vẫn không tìm thấy, log warning nhưng vẫn gửi product.id
                // Vì backend có thể xử lý được (hoặc sẽ báo lỗi cụ thể)
                if (!variantId) {
                    console.warn(`⚠️ [Item ${index}] Không tìm thấy variant_id:`, {
                        productId: item.id,
                        productName: item.name,
                        size: item.size,
                        sizeId: item.sizeId,
                        hasVariants: !!item.variants,
                        variantsCount: item.variants?.length || 0,
                        itemVariantId: item.variant_id,
                        itemVariantIdAlt: item.variantId
                    });
                }
                
                const finalVariantId = variantId || item.id;
                
                // Validate variant_id phải là number
                const variantIdNum = parseInt(finalVariantId);
                if (isNaN(variantIdNum)) {
                    console.error(`❌ [Item ${index}] variant_id không phải số:`, finalVariantId);
                }
                
                // Lấy giá: ưu tiên item.price, fallback về variant price, rồi product price
                let itemPrice = parseFloat(item.price || item.price_sale);
                
                // Nếu giá = 0 hoặc không hợp lệ, thử lấy từ variant
                if (!itemPrice || itemPrice <= 0 || isNaN(itemPrice)) {
                    if (selectedVariant) {
                        itemPrice = parseFloat(selectedVariant.price_sale || selectedVariant.price || 0);
                    }
                    
                    // Nếu vẫn không có, thử lấy từ product
                    if (!itemPrice || itemPrice <= 0 || isNaN(itemPrice)) {
                        itemPrice = parseFloat(item.price_sale || item.price || 0);
                    }
                }
                
                // Log nếu vẫn không có giá
                if (!itemPrice || itemPrice <= 0 || isNaN(itemPrice)) {
                    console.warn(`⚠️ [Item ${index}] Không tìm thấy giá hợp lệ:`, {
                        productName: item.name,
                        itemPrice: item.price,
                        itemPriceSale: item.price_sale,
                        variantPrice: selectedVariant?.price,
                        variantPriceSale: selectedVariant?.price_sale,
                        finalPrice: itemPrice
                    });
                }
                
                return {
                    variant_id: variantIdNum || finalVariantId, // Đảm bảo là number
                    quantity: parseInt(item.quantity) || 1,
                    price: itemPrice || 0
                };
            });
            
            // Validate tất cả items có variant_id hợp lệ
            const invalidItems = orderItems.filter(item => !item.variant_id || isNaN(item.variant_id));
            if (invalidItems.length > 0) {
                console.error('❌ Items không có variant_id hợp lệ:', invalidItems);
                throw new Error('Một số sản phẩm trong giỏ hàng không có thông tin biến thể hợp lệ. Vui lòng xóa và thêm lại.');
            }
            
            // Kiểm tra nếu không có items
            if (orderItems.length === 0) {
                throw new Error('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.');
            }
            
            console.log('📦 Order items prepared:', orderItems);

            // Map payment method to backend format
            // Backend expect: "COD", "CARD" (UPPERCASE) hoặc "cod", "card" (lowercase)
            // Theo ví dụ API docs, backend chấp nhận UPPERCASE
            let backendPaymentMethod = paymentMethod.toUpperCase(); // COD, CARD
            
            // Map QR payment
            if (paymentMethod === 'qr') {
                // Một số backend map QR sang CARD
                // Nếu backend có endpoint riêng cho QR thì giữ nguyên 'QR'
                backendPaymentMethod = 'CARD'; // Hoặc 'QR' tùy backend
            }
            
            // Prepare order data for API
            // Format chuẩn theo API docs:
            // {
            //   "customer_name": "...",
            //   "phone": "...",
            //   "email": "...",
            //   "address": "...",
            //   "note": "...",
            //   "payment_method": "COD",
            //   "items": [{ "variant_id": 1, "quantity": 2, "price": 1500000 }]
            // }
            const orderData = {
                customer_name: formData.fullName.trim(),
                phone: formData.phone.trim(),
                email: formData.email?.trim() || '',
                address: fullAddress.trim(),
                note: formData.note?.trim() || '',
                payment_method: backendPaymentMethod, // 'COD', 'CARD'
                total_amount: total, // Thêm total_amount nếu backend yêu cầu
                items: orderItems.map(item => ({
                    variant_id: parseInt(item.variant_id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }))
            };
            
            // Validate order data trước khi gửi
            if (!orderData.customer_name || !orderData.phone || !orderData.address) {
                throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
            }
            
            if (!orderData.items || orderData.items.length === 0) {
                throw new Error('Giỏ hàng trống');
            }
            
            // Validate mỗi item
            for (const item of orderData.items) {
                if (!item.variant_id || isNaN(item.variant_id)) {
                    throw new Error(`Item không có variant_id hợp lệ: ${JSON.stringify(item)}`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error(`Item không có quantity hợp lệ: ${JSON.stringify(item)}`);
                }
                if (!item.price || item.price <= 0) {
                    throw new Error(`Item không có price hợp lệ: ${JSON.stringify(item)}`);
                }
            }

            console.log('📤 Sending order to API:', {
                customer_name: orderData.customer_name,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address.substring(0, 50) + '...',
                payment_method: orderData.payment_method,
                total_amount: orderData.total_amount,
                items_count: orderData.items.length,
                items: orderData.items
            });
            
            console.log('💳 Payment method mapping:', {
                frontend: paymentMethod,
                backend: backendPaymentMethod
            });
            
            // Log chi tiết từng item
            console.log('📦 Order items detail:', JSON.stringify(orderData.items.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                variant_id_type: typeof item.variant_id,
                variant_id_value: item.variant_id
            })), null, 2));
            
            // Log original cart items để so sánh
            console.log('🛒 Original cart items:', JSON.stringify(items.map(item => ({
                id: item.id,
                name: item.name,
                size: item.size,
                sizeId: item.sizeId,
                variantId: item.variantId,
                variant_id: item.variant_id,
                hasVariants: !!item.variants,
                variantsCount: item.variants?.length || 0,
                variants: item.variants ? item.variants.map(v => ({ id: v.id, size: v.size, size_id: v.size_id })) : null
            })), null, 2));
            
            // Log full order data để debug
            console.log('📋 Full order data being sent:', JSON.stringify(orderData, null, 2));

            // Call API
            const response = await createOrder(orderData);
            
            console.log('Order response:', response);

            // Check if payment method is QR/Card
            if (paymentMethod === 'qr' || paymentMethod === 'card') {
                // Create QR payment
                const orderCode = response.order_code || response.data?.order_code || response.id || `ORD${Date.now()}`;
                console.log('📱 Creating QR for order:', orderCode, 'Amount:', total);
                
                // Save order data for later use
                const savedOrderData = {
                    ...response,
                    order_code: orderCode,
                    items: selectedCartItems.map(item => ({
                        name: item.name,
                        image: item.image,
                        size: item.size,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    customer_name: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    address: fullAddress,
                    note: formData.note,
                    shipping_fee: shippingFee,
                    subtotal: subtotal,
                    discount_amount: discount,
                    total_amount: total,
                    payment_method: paymentMethod,
                    created_at: new Date().toISOString()
                };
                
                // Store order data in state for modal
                setFormData(prev => ({
                    ...prev,
                    _orderData: savedOrderData
                }));
                
                // Create QR and show modal (don't redirect yet)
                try {
                    await createQRPayment(orderCode, total);
                    // Modal sẽ được hiển thị bởi createQRPayment function
                    // User sẽ click "Đã thanh toán" để navigate
                } catch (qrError) {
                    console.error('❌ Error creating QR:', qrError);
                    // Vẫn hiển thị modal với thông tin chuyển khoản thủ công
                }
            } else {
                // COD payment - complete immediately
                showToast('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.', 'success');

                // Redirect to order success page with order data
                setTimeout(() => {
                    navigate('/order-success', {
                        state: {
                            orderData: {
                                ...response,
                                items: selectedCartItems.map(item => ({
                                    name: item.name,
                                    image: item.image,
                                    size: item.size,
                                    quantity: item.quantity,
                                    price: item.price
                                })),
                                customer_name: formData.fullName,
                                customer_phone: formData.phone,
                                customer_email: formData.email,
                                shipping_address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
                                note: formData.note,
                                shipping_fee: shippingFee,
                                subtotal: subtotal,
                                discount_amount: discount,
                                total_amount: total,
                                payment_method: paymentMethod
                            }
                        }
                    });
                    clearCart();
                }, 1500);
            }

        } catch (error) {
            console.error('❌ Error creating order:', error);
            console.error('📋 Error details:', {
                message: error.message,
                stack: error.stack,
                items: items,
                formData: formData
            });
            
            // Parse error message để hiển thị thân thiện hơn
            let errorMsg = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
            
            if (error.message) {
                errorMsg = error.message;
                
                // Nếu là lỗi validation từ Laravel
                if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
                    errorMsg = `Dữ liệu không hợp lệ: ${error.message}`;
                }
                
                // Nếu là lỗi variant không tồn tại
                if (error.message.includes('variant') || error.message.includes('product')) {
                    errorMsg = 'Một số sản phẩm trong giỏ hàng không còn hợp lệ. Vui lòng cập nhật giỏ hàng.';
                }
            }
            
            // Nếu là lỗi backend không chạy
            if (error.message && error.message.includes('Không thể kết nối')) {
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
            }
            
            // Nếu là lỗi 500
            if (error.message && error.message.includes('500')) {
                errorMsg = 'Lỗi server (500). Vui lòng kiểm tra console để xem chi tiết và liên hệ admin.';
            }
            
            showToast(errorMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Auto-open login modal if not authenticated when component mounts or when cart items exist
    useEffect(() => {
        if (!isAuthenticated) {
            if (selectedCartItems.length > 0) {
                // Có sản phẩm được chọn nhưng chưa đăng nhập -> hiển thị modal
                setShowLoginModal(true);
            } else {
                // Không có sản phẩm -> không hiển thị modal (sẽ hiển thị empty cart message)
                setShowLoginModal(false);
            }
        } else {
            // Đã đăng nhập -> đóng modal
            setShowLoginModal(false);
            setShowRegisterModal(false);
        }
    }, [isAuthenticated, selectedCartItems.length]);

    // Early return - Empty cart
    if (selectedCartItems.length === 0) {
        return (
            <>
                <SEO
                    title="Thanh toán - ANKH Store"
                    description="Hoàn tất đơn hàng của bạn tại ANKH. Thanh toán nhanh chóng, bảo mật và tiện lợi."
                    keywords="thanh toán, checkout, đặt hàng, ANKH"
                />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-10">
                    <div className="text-center">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có sản phẩm được chọn</h2>
                        <p className="text-gray-600 mb-6">Vui lòng chọn sản phẩm trong giỏ hàng để thanh toán</p>
                        <Link
                            to="/cart"
                            className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
                        >
                            Quay lại giỏ hàng
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // Early return - Not authenticated (only show login modal, hide checkout form)
    if (!isAuthenticated) {
        return (
            <>
                <SEO
                    title="Thanh toán - ANKH Store"
                    description="Hoàn tất đơn hàng của bạn tại ANKH. Thanh toán nhanh chóng, bảo mật và tiện lợi."
                    keywords="thanh toán, checkout, đặt hàng, ANKH"
                />
                <div className="min-h-screen bg-gray-50">
                    {/* Login Modal - Required on checkout page */}
                    <LoginModal 
                        isOpen={showLoginModal}
                        preventClose={true}
                        onClose={() => {
                            // Nếu user cố gắng đóng, quay lại giỏ hàng
                            navigate('/cart');
                        }}
                        onSwitchToRegister={() => {
                            setShowLoginModal(false);
                            setShowRegisterModal(true);
                        }}
                    />

                    {/* Register Modal */}
                    <RegisterModal 
                        isOpen={showRegisterModal}
                        preventClose={true}
                        onClose={() => {
                            navigate('/cart');
                        }}
                        onSwitchToLogin={() => {
                            setShowRegisterModal(false);
                            setShowLoginModal(true);
                        }}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <SEO
                title="Thanh toán - ANKH Store"
                description="Hoàn tất đơn hàng của bạn tại ANKH. Thanh toán nhanh chóng, bảo mật và tiện lợi."
                keywords="thanh toán, checkout, đặt hàng, ANKH"
            />
        <div className="min-h-screen bg-gray-50 pb-6">
            <div className="max-w-[1200px] mx-auto px-4 py-3">
                <h1 className="text-xl font-bold mb-4 uppercase text-gray-900">Thanh toán</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column - Shipping & Payment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* THÔNG TIN GIAO HÀNG */}
                            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                                <h2 className="text-base font-black uppercase text-gray-900 tracking-tight mb-1 pb-2 border-b-2 border-gray-900">
                                    THÔNG TIN GIAO HÀNG
                                </h2>

                                <div className="space-y-4 mt-5">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và Tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="Nhập họ và tên"
                                            autoComplete="name"
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                touched.fullName && errors.fullName
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-[#ff6600] focus:ring-[#ff6600]'
                                            }`}
                                            required
                                            aria-invalid={touched.fullName && errors.fullName ? 'true' : 'false'}
                                            aria-describedby={touched.fullName && errors.fullName ? 'fullName-error' : undefined}
                                        />
                                        {touched.fullName && errors.fullName && (
                                            <p id="fullName-error" className="mt-1 text-xs text-red-600" role="alert">
                                                {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="0912345678 hoặc +84912345678"
                                            autoComplete="tel"
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                touched.phone && errors.phone
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-[#ff6600] focus:ring-[#ff6600]'
                                            }`}
                                            required
                                            aria-invalid={touched.phone && errors.phone ? 'true' : 'false'}
                                            aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
                                        />
                                        {touched.phone && errors.phone && (
                                            <p id="phone-error" className="mt-1 text-xs text-red-600" role="alert">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-gray-400 text-xs">(Tùy chọn)</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="example@email.com"
                                            autoComplete="email"
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                touched.email && errors.email
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-[#ff6600] focus:ring-[#ff6600]'
                                            }`}
                                            aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                                            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                                        />
                                        {touched.email && errors.email && (
                                            <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="Số nhà, tên đường"
                                            autoComplete="street-address"
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                touched.address && errors.address
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-[#ff6600] focus:ring-[#ff6600]'
                                            }`}
                                            required
                                            aria-invalid={touched.address && errors.address ? 'true' : 'false'}
                                            aria-describedby={touched.address && errors.address ? 'address-error' : undefined}
                                        />
                                        {touched.address && errors.address && (
                                            <p id="address-error" className="mt-1 text-xs text-red-600" role="alert">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tỉnh/Thành Phố <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="province"
                                                name="province"
                                                value={formData.province}
                                                onChange={handleProvinceChange}
                                                className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                disabled={loadingProvinces}
                                                required
                                                autoComplete="address-level1"
                                            >
                                                <option value="">
                                                    {loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành Phố'}
                                                </option>
                                                {provinces.map((province) => (
                                                    <option key={province.code} value={province.code}>
                                                        {province.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* District - Select nếu có static data, text input nếu không */}
                                        <div>
                                            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                                                Quận/Huyện
                                            </label>
                                            {districts.length > 0 ? (
                                                <div className="relative">
                                                    <select
                                                        id="district"
                                                        name="district"
                                                        value={formData.district}
                                                        onChange={handleDistrictChange}
                                                        className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        disabled={!formData.province}
                                                        autoComplete="address-level2"
                                                    >
                                                        <option value="">Chọn Quận/Huyện</option>
                                                        {districts.map((district) => (
                                                            <option key={district.code} value={district.code}>
                                                                {district.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <input
                                                    id="district"
                                                    type="text"
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập Quận/Huyện"
                                                    autoComplete="address-level2"
                                                    className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    disabled={!formData.province}
                                                />
                                            )}
                                        </div>

                                        {/* Ward - Text input vì không có static data */}
                                        <div>
                                            <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                                                Xã/Phường
                                            </label>
                                            <input
                                                id="ward"
                                                type="text"
                                                name="ward"
                                                value={formData.ward}
                                                onChange={handleInputChange}
                                                placeholder="Nhập Xã/Phường"
                                                autoComplete="address-level3"
                                                className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                disabled={!formData.district}
                                            />
                                        </div>
                                    </div>

                                    {/* Checkbox Địa chỉ mặc định */}
                                    <div className="pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={useDefaultAddress}
                                                onChange={(e) => setUseDefaultAddress(e.target.checked)}
                                                className="w-4 h-4 text-[#ff6600] rounded"
                                            />
                                            <span className="text-sm text-gray-700">Sử dụng địa chỉ giao hàng mặc định</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* PHƯƠNG THỨC GIAO HÀNG */}
                            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                                <h2 className="text-base font-black uppercase text-gray-900 tracking-tight mb-1 pb-2 border-b-2 border-gray-900">
                                    PHƯƠNG THỨC GIAO HÀNG
                                </h2>

                                <div className="space-y-3 mt-5">
                                    <label className={`flex items-center justify-between p-4 border-2 rounded cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="standard"
                                                checked={shippingMethod === 'standard'}
                                                onChange={(e) => setShippingMethod(e.target.value)}
                                                className="w-4 h-4 text-[#ff6600]"
                                            />
                                            <span className="text-sm text-gray-900">Tốc độ tiêu chuẩn (từ 2 - 5 ngày làm việc)</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">0 VND</span>
                                    </label>

                                    <label className={`flex items-center justify-between p-4 border-2 rounded cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="express"
                                                checked={shippingMethod === 'express'}
                                                onChange={(e) => setShippingMethod(e.target.value)}
                                                className="w-4 h-4 text-[#ff6600]"
                                            />
                                            <span className="text-sm text-gray-900">Giao hàng hoả tốc (Chỉ áp dụng tại HN và HCM)</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">+30,000 VND</span>
                                    </label>
                                </div>
                            </div>

                            {/* PHƯƠNG THỨC THANH TOÁN */}
                            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                                <h2 className="text-base font-black uppercase text-gray-900 tracking-tight mb-1 pb-2 border-b-2 border-gray-900">
                                    PHƯƠNG THỨC THANH TOÁN
                                </h2>

                                <div className="space-y-3 mt-5">
                                    <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#ff6600] mr-3"
                                        />
                                        <span className="text-sm text-gray-900">Thanh toán trực tiếp khi giao hàng</span>
                                    </label>

                                    <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="qr"
                                            checked={paymentMethod === 'qr'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#ff6600] mr-3"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-900">Thanh toán qua QR Code / Chuyển khoản</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                                Nhanh
                                            </span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#ff6600] mr-3"
                                        />
                                        <span className="text-sm text-gray-900">Thanh toán bằng Thẻ quốc tế / Thẻ nội địa</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-4 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gray-50 px-4 py-3 border-b-2 border-gray-900">
                                    <h2 className="text-base font-black uppercase text-gray-900 tracking-tight">
                                        ĐƠN HÀNG
                                    </h2>
                                </div>

                                <div className="p-4">
                                    {/* Product List */}
                                    <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {selectedCartItems.map((item) => (
                                            <div key={item.cartItemId} className="flex gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 leading-snug mb-1">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Size: {item.size}
                                                        <span className="ml-3">x{item.quantity}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice((parseFloat(item.price || item.price_sale || 0)) * (parseInt(item.quantity || 1)))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-gray-300 mb-3"></div>

                                    {/* Price Summary */}
                                    <div className="space-y-1.5 mb-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">ĐƠN HÀNG</span>
                                            <span className="font-semibold text-gray-900">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700 font-medium">Giảm</span>
                                                <span className="font-semibold text-green-600">
                                                    - {formatPrice(discount)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">Phí vận chuyển</span>
                                            <span className="font-semibold text-gray-900">
                                                {shippingFee === 0 ? formatPrice(0) : formatPrice(shippingFee)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-gray-300 mb-2"></div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-base font-black uppercase text-gray-900">
                                            TỔNG CỘNG
                                        </span>
                                        <span className="text-xl font-black text-[#ff6600]">
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#ff6600] text-white py-4 rounded font-black uppercase tracking-wide hover:bg-orange-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang xử lý...
                                            </span>
                                        ) : (
                                            'HOÀN TẤT ĐẶT HÀNG'
                                        )}
                                    </button>

                                    <Link
                                        to="/cart"
                                        className="block text-center text-sm text-gray-600 mt-4 hover:text-[#ff6600] transition no-underline font-medium"
                                    >
                                        ← Quay lại giỏ hàng
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* QR Payment Modal */}
            {showQRModal && qrData && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Thanh toán QR Code</h3>
                                {timeRemaining !== null && (
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* QR Code Image */}
                            <div className="bg-gray-50 rounded-xl p-6 flex justify-center">
                                {qrData.qr_code_url ? (
                                    <img 
                                        src={qrData.qr_code_url} 
                                        alt="QR Payment" 
                                        className="w-64 h-64 object-contain"
                                    />
                                ) : qrData.qr_data ? (
                                    <img 
                                        src={`data:image/png;base64,${qrData.qr_data}`} 
                                        alt="QR Payment" 
                                        className="w-64 h-64 object-contain"
                                    />
                                ) : (
                                    <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Không có mã QR</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Instructions */}
                            <div className="space-y-3">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-orange-900 mb-2">
                                        📱 Hướng dẫn thanh toán:
                                    </p>
                                    <ol className="text-xs text-orange-800 space-y-1 list-decimal list-inside">
                                        <li>Mở ứng dụng Banking của bạn</li>
                                        <li>Quét mã QR hoặc nhập thông tin bên dưới</li>
                                        <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                    </ol>
                                </div>

                                {/* Bank Info */}
                                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-xs text-gray-600 font-medium">Ngân hàng:</span>
                                        <span className="text-sm font-bold text-gray-900">{qrData.bank_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-xs text-gray-600 font-medium">Số tài khoản:</span>
                                        <span className="text-sm font-mono font-bold text-gray-900">{qrData.account_no}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-xs text-gray-600 font-medium">Chủ tài khoản:</span>
                                        <span className="text-sm font-bold text-gray-900">{qrData.account_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-xs text-gray-600 font-medium">Số tiền:</span>
                                        <span className="text-base font-black text-orange-600">
                                            {formatPrice(qrData.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600 font-medium">Nội dung:</span>
                                        <span className="text-sm font-mono font-bold text-gray-900 bg-yellow-100 px-2 py-1 rounded">
                                            {qrData.content || qrData.order_code}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Code */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800 text-center">
                                        Mã đơn hàng: <span className="font-mono font-bold">{qrData.order_code}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowQRModal(false);
                                        setQrData(null);
                                        setTimeRemaining(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        // Get saved order data from formData
                                        const savedOrderData = formData._orderData;
                                        
                                        if (savedOrderData) {
                                            showToast('Đơn hàng đang chờ xác nhận thanh toán', 'info');
                                            
                                            // Navigate to payment success page
                                            navigate('/payment-success', {
                                                state: {
                                                    orderData: savedOrderData,
                                                    qrData: qrData
                                                }
                                            });
                                            
                                            // Close modal
                                            setShowQRModal(false);
                                            setQrData(null);
                                            setTimeRemaining(null);
                                            
                                            // Clear cart
                                            clearCart();
                                        } else {
                                            // Fallback: just navigate to orders page
                                            showToast('Đơn hàng đang chờ xác nhận thanh toán', 'info');
                                            navigate('/profile/orders');
                                            clearCart();
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                                >
                                    Đã thanh toán
                                </button>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-gray-500 text-center">
                                ⚠️ Vui lòng không tắt trang này cho đến khi hoàn tất thanh toán
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default CheckoutPage;

