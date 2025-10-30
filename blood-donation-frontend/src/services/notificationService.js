// src/services/notificationService.js
import { apiClient } from './api.js';

export const notificationService = {
  // Get all notifications for current user
  getNotifications(filters = {}) {
    return apiClient.get('/notifications', filters);
  },

  // Mark notification as read
  markAsRead(notificationId) {
    return apiClient.put(`/notifications/${notificationId}`);
  },

  // Mark all notifications as read
  markAllAsRead() {
    return apiClient.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification(notificationId) {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  // Get notification statistics
  getNotificationStats() {
    return apiClient.get('/notifications/stats');
  },

  // Update notification preferences
  updatePreferences(preferences) {
    return apiClient.put('/notifications/preferences', preferences);
  }
};