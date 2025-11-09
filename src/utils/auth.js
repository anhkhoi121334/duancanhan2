/**
 * Auth Utilities
 * Helper functions for authentication
 */

/**
 * Lấy token từ localStorage
 * @returns {string|null} Token hoặc null
 */
export const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return null;
};

/**
 * Lấy thông tin user từ localStorage
 * @returns {Object|null} User object hoặc null
 */
export const getAuthUser = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user || null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
  }
  return null;
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null && token !== '';
};

/**
 * Log thông tin auth ra console (for debugging)
 */
export const logAuthInfo = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  const authenticated = isAuthenticated();
  
  console.group('🔐 Auth Info');
  console.log('Authenticated:', authenticated);
  console.log('Token:', token);
  console.log('User:', user);
  console.groupEnd();
};

/**
 * Clear all auth data
 */
export const clearAuth = () => {
  localStorage.removeItem('auth-storage');
  console.log('✅ Auth data cleared');
};

