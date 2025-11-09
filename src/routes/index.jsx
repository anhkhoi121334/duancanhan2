/**
 * Application Routes Configuration
 * Centralized routing configuration for better maintainability
 */

import React from 'react';
import {
  Home,
  ProductList,
  ProductDetail,
  SearchPage,
  SalePage,
  NewArrivalsPage,
  BrandsPage,
  AboutPage,
  CartPage,
  CheckoutPage,
  OrderSuccessPage,
  PaymentSuccessPage,
  FavoritesPage,
  AccountPage,
  ProfilePage,
  ProfileEditPage,
  MyOrdersPage,
  MyOrderDetailPage,
  NotFoundPage
} from '@pages';
import { 
  AdminLogin, 
  AdminDashboard, 
  AdminProducts, 
  AdminProductAdd, 
  AdminProductEdit, 
  AdminProductImages, 
  AdminProductVariants, 
  AdminBrands, 
  AdminColors, 
  AdminSizes, 
  AdminBanners, 
  AdminBlogs,
  AdminSearchConsole,
  AdminOrders, 
  AdminOrderDetail, 
  AdminCustomers, 
  AdminReviews, 
  AdminAnalytics, 
  AdminRevenue,
  AdminSettings
} from '../pages/admin';

// Placeholder components for pages under development
const BlogPage = () => (
  <div className="max-w-6xl mx-auto px-6 py-20">
    <h1 className="text-3xl font-bold mb-4">Blog</h1>
    <p className="text-gray-600">Tin tức & bài viết đang được phát triển...</p>
  </div>
);

const ContactPage = () => (
  <div className="max-w-6xl mx-auto px-6 py-20">
    <h1 className="text-3xl font-bold mb-4">Liên hệ</h1>
    <p className="text-gray-600">Trang liên hệ đang được phát triển...</p>
  </div>
);

const StoresPage = () => (
  <div className="max-w-6xl mx-auto px-6 py-20">
    <h1 className="text-3xl font-bold mb-4">Tìm Cửa Hàng</h1>
    <p className="text-gray-600">Hệ thống cửa hàng đang được cập nhật...</p>
  </div>
);

const ChangePasswordPage = () => (
  <div className="max-w-6xl mx-auto px-6 py-20">
    <h1 className="text-3xl font-bold mb-4">Đổi Mật Khẩu</h1>
    <p className="text-gray-600">Chức năng đang được phát triển...</p>
  </div>
);

const LoginRedirectPage = () => (
  <div className="max-w-6xl mx-auto px-6 py-20">
    <h1 className="text-3xl font-bold mb-4">Đăng Nhập</h1>
    <p className="text-gray-600">Vui lòng sử dụng nút đăng nhập ở header...</p>
  </div>
);

/**
 * Public Routes (Customer-facing)
 */
export const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/products', element: <ProductList /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/order-success', element: <OrderSuccessPage /> },
  { path: '/payment-success', element: <PaymentSuccessPage /> },
  { path: '/sale', element: <SalePage /> },
  { path: '/new-arrivals', element: <NewArrivalsPage /> },
  { path: '/brands', element: <BrandsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/blog', element: <BlogPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/stores', element: <StoresPage /> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/profile/edit', element: <ProfileEditPage /> },
  { path: '/profile/change-password', element: <ChangePasswordPage /> },
  { path: '/login', element: <LoginRedirectPage /> },
  { path: '/orders', element: <MyOrdersPage /> },
  { path: '/my-orders', element: <MyOrdersPage /> },
  { path: '/my-orders/:id', element: <MyOrderDetailPage /> },
  { path: '/profile/orders', element: <MyOrdersPage /> },
];

/**
 * Admin Routes
 */
export const adminRoutes = [
  { path: '/admin', element: <AdminLogin /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/products', element: <AdminProducts /> },
  { path: '/admin/products/add', element: <AdminProductAdd /> },
  { path: '/admin/products/edit/:id', element: <AdminProductEdit /> },
  { path: '/admin/products/:productId/images', element: <AdminProductImages /> },
  { path: '/admin/products/:productId/variants', element: <AdminProductVariants /> },
  { path: '/admin/brands', element: <AdminBrands /> },
  { path: '/admin/colors', element: <AdminColors /> },
  { path: '/admin/sizes', element: <AdminSizes /> },
  { path: '/admin/banners', element: <AdminBanners /> },
  { path: '/admin/blogs', element: <AdminBlogs /> },
  { path: '/admin/search-console', element: <AdminSearchConsole /> },
  { path: '/admin/orders', element: <AdminOrders /> },
  { path: '/admin/orders/:id', element: <AdminOrderDetail /> },
  { path: '/admin/customers', element: <AdminCustomers /> },
  { path: '/admin/reviews', element: <AdminReviews /> },
  { path: '/admin/analytics', element: <AdminAnalytics /> },
  { path: '/admin/revenue', element: <AdminRevenue /> },
  { path: '/admin/settings', element: <AdminSettings /> },
];

/**
 * All Application Routes
 */
export const allRoutes = [
  ...publicRoutes,
  ...adminRoutes,
  // 404 page must be last
  { path: '*', element: <NotFoundPage /> },
];

