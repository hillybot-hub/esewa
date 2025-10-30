// src/services/medicalService.js
import { apiClient } from './api.js';

export const medicalService = {
  // Get medical records for current user
  getMedicalRecords(filters = {}) {
    return apiClient.get('/medical', filters);
  },

  // Get medical records for specific donor
  getDonorRecords(donorId) {
    return apiClient.get(`/medical/donor/${donorId}`);
  },

  // Create new medical record (hospital only)
  createMedicalRecord(recordData) {
    return apiClient.post('/medical', recordData);
  },

  // Verify medical record (hospital only)
  verifyMedicalRecord(recordId) {
    return apiClient.put(`/medical/${recordId}/verify`);
  },

  // Upload medical files
  uploadMedicalFiles(recordId, formData) {
    return apiClient.post(`/medical/${recordId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get medical record by ID
  getMedicalRecordById(recordId) {
    return apiClient.get(`/medical/${recordId}`);
  },

  // Update medical record
  updateMedicalRecord(recordId, updates) {
    return apiClient.put(`/medical/${recordId}`, updates);
  },

  // Delete medical record
  deleteMedicalRecord(recordId) {
    return apiClient.delete(`/medical/${recordId}`);
  }
};