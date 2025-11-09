/**
 * Environment Configuration
 * Centralized access to environment variables
 * 
 * Usage:
 * import { API_URL, APP_NAME } from '@/config/env';
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ANKH Store';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
export const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true';
export const ENABLE_CONSOLE_LOG = import.meta.env.VITE_ENABLE_CONSOLE_LOG === 'true';

// Social Media
export const SOCIAL_MEDIA = {
  facebook: import.meta.env.VITE_FACEBOOK_URL || '',
  instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
  twitter: import.meta.env.VITE_TWITTER_URL || '',
  tiktok: import.meta.env.VITE_TIKTOK_URL || ''
};

// Contact Information
export const CONTACT = {
  email: import.meta.env.VITE_CONTACT_EMAIL || 'contact@ankhstore.com',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+84 123 456 789',
  address: import.meta.env.VITE_CONTACT_ADDRESS || '123 Đường ABC, Quận XYZ, TP.HCM'
};

// SEO Configuration
export const SEO = {
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://ankh-store.com',
  siteName: import.meta.env.VITE_SITE_NAME || 'ANKH Store',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'Cửa hàng giày thể thao chính hãng',
  siteKeywords: import.meta.env.VITE_SITE_KEYWORDS || 'giày thể thao, sneaker'
};

// Third-party Services
export const ANALYTICS = {
  gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
  fbPixelId: import.meta.env.VITE_FB_PIXEL_ID || ''
};

// Cache & Performance
export const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED === 'true';
export const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION || '300000', 10);

// Security
export const SECURE_COOKIES = import.meta.env.VITE_SECURE_COOKIES === 'true';
export const CORS_ENABLED = import.meta.env.VITE_CORS_ENABLED === 'true';

// Helper Functions
export const isDevelopment = () => APP_ENV === 'development';
export const isProduction = () => APP_ENV === 'production';
export const isStaging = () => APP_ENV === 'staging';

// Debug logger (only logs in development)
export const debugLog = (...args) => {
  if (ENABLE_DEBUG && ENABLE_CONSOLE_LOG) {
    console.log('[DEBUG]', ...args);
  }
};

// Export all as default
export default {
  API_URL,
  API_BASE_URL,
  APP_NAME,
  APP_URL,
  APP_ENV,
  ENABLE_ANALYTICS,
  ENABLE_DEBUG,
  ENABLE_CONSOLE_LOG,
  SOCIAL_MEDIA,
  CONTACT,
  SEO,
  ANALYTICS,
  CACHE_ENABLED,
  CACHE_DURATION,
  SECURE_COOKIES,
  CORS_ENABLED,
  isDevelopment,
  isProduction,
  isStaging,
  debugLog
};

