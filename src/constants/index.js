/**
 * Application Constants
 * Centralized constants for the application
 */

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products',
  SEARCH: '/products/search/advanced',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  VOUCHERS: '/vouchers',
  VALIDATE_VOUCHER: '/vouchers/validate',
  ORDERS: '/orders',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    ME: '/user'
  },
  PROMOTIONS: '/promotions',
  PROVINCES: 'https://provinces.open-api.vn/api'
};

// App Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:slug',
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  FAVORITES: '/favorites',
  ORDERS: '/orders',
  ACCOUNT: '/account',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  NEW_ARRIVALS: '/new-arrivals',
  SALE: '/sale',
  BRANDS: '/brands',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  STORES: '/stores',
  NOT_FOUND: '*'
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  MOMO: 'momo',
  VNPAY: 'vnpay'
};

// Shipping Methods
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express'
};

// Filter Options
export const FILTER_OPTIONS = {
  SORT: {
    NEWEST: 'created_at',
    PRICE_LOW_HIGH: 'price_asc',
    PRICE_HIGH_LOW: 'price_desc',
    NAME_A_Z: 'name_asc',
    NAME_Z_A: 'name_desc'
  },
  GENDER: {
    ALL: '',
    MALE: 'Nam',
    FEMALE: 'Nữ',
    UNISEX: 'Unisex'
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  SEARCH_LIMIT: 5
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  CART: 'cart-storage',
  FAVORITES: 'favorites-storage',
  SEARCH: 'search-storage',
  THEME: 'theme-preference'
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(0|\+84)[0-9]{9}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2
};

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  SCROLL_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300
};

// Voucher Types
export const VOUCHER_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_SHIPPING: 'free_shipping'
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};

// Image Placeholders
export const PLACEHOLDERS = {
  PRODUCT: '/placeholder-product.jpg',
  AVATAR: '/placeholder-avatar.png',
  BANNER: '/placeholder-banner.jpg'
};

// Social Media
export const SOCIAL_MEDIA_NAMES = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TWITTER: 'Twitter',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  NOT_FOUND: 'Không tìm thấy trang bạn yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  SERVER_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  LOGOUT: 'Đã đăng xuất thành công!',
  REGISTER: 'Đăng ký thành công!',
  ADD_TO_CART: 'Đã thêm vào giỏ hàng!',
  REMOVE_FROM_CART: 'Đã xóa khỏi giỏ hàng!',
  ORDER_PLACED: 'Đặt hàng thành công!',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  VOUCHER_APPLIED: 'Áp dụng voucher thành công!'
};

// Animation Classes
export const ANIMATIONS = {
  FADE_IN: 'animate-fadeIn',
  FADE_OUT: 'animate-fadeOut',
  SLIDE_IN_RIGHT: 'animate-slideInRight',
  SLIDE_IN_LEFT: 'animate-slideInLeft',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export default {
  API_ENDPOINTS,
  ROUTES,
  TOAST_TYPES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  FILTER_OPTIONS,
  PAGINATION,
  STORAGE_KEYS,
  VALIDATION,
  UI,
  VOUCHER_TYPES,
  PRODUCT_STATUS,
  PLACEHOLDERS,
  SOCIAL_MEDIA_NAMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATIONS,
  HTTP_STATUS
};

