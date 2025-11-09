/**
 * Formatting Utilities
 * Helper functions for formatting data
 */

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format currency (short version)
 * @param {number|string} amount - Amount to format
 * @param {string} fallback - Fallback text if amount is invalid (default: 'Liên hệ')
 * @returns {string} Formatted currency string
 */
export const formatPrice = (amount, fallback = 'Liên hệ') => {
  if (!amount || amount === undefined || amount === null || isNaN(amount)) {
    return fallback;
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) {
    return fallback;
  }
  return `${numAmount.toLocaleString('vi-VN')} VND`;
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 0XXX XXX XXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return num.toLocaleString('vi-VN');
};

/**
 * Format discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {string} Discount percentage
 */
export const formatDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return '';
  
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `-${discount}%`;
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format slug to title
 * @param {string} slug - Slug to format
 * @returns {string} Formatted title
 */
export const slugToTitle = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
};

export default {
  formatCurrency,
  formatPrice,
  formatDate,
  formatPhoneNumber,
  truncateText,
  formatFileSize,
  formatNumber,
  formatDiscount,
  capitalize,
  slugToTitle
};

