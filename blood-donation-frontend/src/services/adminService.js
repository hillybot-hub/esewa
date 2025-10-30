// src/services/adminService.js
import { apiClient } from './api.js';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats() {
    return apiClient.get('/admin/dashboard');
  },

  // Get all users with pagination and filters
  getUsers(filters = {}) {
    return apiClient.get('/admin/users', filters);
  },

  // Get user by ID
  getUser(userId) {
    return apiClient.get(`/admin/users/${userId}`);
  },

  // Update user status
  updateUserStatus(userId, updates) {
    return apiClient.patch(`/admin/users/${userId}`, updates);
  },

  // Delete user
  deleteUser(userId) {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  // Get all requests with filters
  getAllRequests(filters = {}) {
    return apiClient.get('/admin/requests', filters);
  },

  // Get system analytics
  getAnalytics(timeRange = '30d') {
    return apiClient.get('/admin/analytics', { timeRange });
  },

  // Get system logs
  getSystemLogs(filters = {}) {
    return apiClient.get('/admin/logs', filters);
  },

  // Update system settings
  updateSystemSettings(settings) {
    return apiClient.put('/admin/settings', settings);
  },

  // Send system announcement
  sendAnnouncement(announcement) {
    return apiClient.post('/admin/announcements', announcement);
  }
};