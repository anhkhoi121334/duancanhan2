/**
 * Validation Utilities
 * Helper functions for form validation
 */

import { VALIDATION } from '../constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {object} Validation result
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Tên không được để trống' };
  }
  
  if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Tên phải có ít nhất ${VALIDATION.NAME_MIN_LENGTH} ký tự` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate form data
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} Validation errors
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Required validation
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        return;
      }
    }
    
    // Email validation
    if (rule.type === 'email' && value) {
      if (!isValidEmail(value)) {
        errors[field] = 'Email không hợp lệ';
        return;
      }
    }
    
    // Phone validation
    if (rule.type === 'phone' && value) {
      if (!isValidPhone(value)) {
        errors[field] = 'Số điện thoại không hợp lệ';
        return;
      }
    }
    
    // Password validation
    if (rule.type === 'password' && value) {
      const result = validatePassword(value);
      if (!result.isValid) {
        errors[field] = result.message;
        return;
      }
    }
    
    // Min length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} phải có ít nhất ${rule.minLength} ký tự`;
      return;
    }
    
    // Max length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label || field} không được quá ${rule.maxLength} ký tự`;
      return;
    }
    
    // Custom validation
    if (rule.validator && value) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    }
  });
  
  return errors;
};

/**
 * Check if object has errors
 * @param {object} errors - Errors object
 * @returns {boolean} Has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  validateName,
  validateRequired,
  validateForm,
  hasErrors
};

