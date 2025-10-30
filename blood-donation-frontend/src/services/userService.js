// src/services/userService.js
import { apiClient } from './api.js';

export const userService = {
  // Get user profile
  getProfile() {
    return apiClient.get('/auth/me');
  },

  // Update user profile
  updateProfile(userData) {
    return apiClient.put('/auth/profile', userData);
  },

  // Get user by ID
  getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  // Get donors list
  getDonors(filters = {}) {
    return apiClient.get('/users/donors', filters);
  },

  // Get hospitals list
  getHospitals(filters = {}) {
    return apiClient.get('/users/hospitals', filters);
  },

  // Update user status (admin only)
  updateUserStatus(userId, status) {
    return apiClient.patch(`/admin/users/${userId}`, { status });
  },

  // Upload profile picture
  uploadAvatar(formData) {
    return apiClient.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};