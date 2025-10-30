// src/utils/formatters.js
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format numbers with commas
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat().format(number);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format blood type with emoji
export const formatBloodType = (bloodType) => {
  if (!bloodType) return 'Unknown';
  
  const emojiMap = {
    'A+': '🅰️➕',
    'A-': '🅰️➖',
    'B+': '🅱️➕',
    'B-': '🅱️➖',
    'AB+': '🆎➕',
    'AB-': '🆎➖',
    'O+': '🅾️➕',
    'O-': '🅾️➖'
  };
  
  return `${emojiMap[bloodType] || ''} ${bloodType}`;
};

// Format urgency level with color and icon
export const formatUrgency = (urgency) => {
  const urgencyMap = {
    low: { label: 'Low', color: 'green', icon: '🟢' },
    medium: { label: 'Medium', color: 'yellow', icon: '🟡' },
    high: { label: 'High', color: 'orange', icon: '🟠' },
    critical: { label: 'Critical', color: 'red', icon: '🔴' }
  };
  
  return urgencyMap[urgency] || { label: 'Unknown', color: 'gray', icon: '⚫' };
};

// Format user role
export const formatUserRole = (role) => {
  const roleMap = {
    donor: 'Blood Donor',
    receiver: 'Blood Receiver',
    hospital: 'Hospital',
    admin: 'Administrator'
  };
  
  return roleMap[role] || role;
};

// Format address
export const formatAddress = (address) => {
  if (!address) return 'No address provided';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ') || 'Address not specified';
};

// Format time duration
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};

// Format percentage
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};