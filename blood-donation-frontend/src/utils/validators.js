// src/utils/validators.js
export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };
  
  export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };
  
  export const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };
  
  export const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return 'Please enter a valid phone number';
    }
    return '';
  };
  
  export const validateBloodType = (bloodType, isDonor = false) => {
    if (isDonor && !bloodType) {
      return 'Blood type is required for donors';
    }
    if (bloodType && !/^(A|B|AB|O)[+-]$/.test(bloodType)) {
      return 'Please select a valid blood type';
    }
    return '';
  };
  
  export const validateRequired = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return '';
  };
  
  export const validateNumber = (value, fieldName, min = 0, max = Infinity) => {
    if (value === '' || value === null || value === undefined) {
      return `${fieldName} is required`;
    }
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (num > max) return `${fieldName} must be at most ${max}`;
    return '';
  };
  
  export const validateDate = (date, fieldName) => {
    if (!date) return `${fieldName} is required`;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return `Please enter a valid ${fieldName}`;
    
    // Check if date is in the future
    if (dateObj > new Date()) {
      return `${fieldName} cannot be in the future`;
    }
    return '';
  };