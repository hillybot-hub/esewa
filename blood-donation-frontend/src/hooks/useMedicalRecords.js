// src/hooks/useMedicalRecords.js
import { useState, useEffect } from 'react';
import { medicalService } from '../services/medicalService';

export const useMedicalRecords = (donorId = null) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (donorId) {
        data = await medicalService.getDonorRecords(donorId);
      } else {
        data = await medicalService.getMedicalRecords();
      }
      
      setRecords(data.records || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (recordData) => {
    try {
      setError(null);
      const newRecord = await medicalService.createMedicalRecord(recordData);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err.message || 'Failed to create medical record');
      throw err;
    }
  };

  const verifyRecord = async (recordId) => {
    try {
      setError(null);
      const updatedRecord = await medicalService.verifyMedicalRecord(recordId);
      setRecords(prev =>
        prev.map(record => record._id === recordId ? updatedRecord : record)
      );
      return updatedRecord;
    } catch (err) {
      setError(err.message || 'Failed to verify record');
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [donorId]);

  return {
    records,
    loading,
    error,
    createRecord,
    verifyRecord,
    refetch: fetchRecords,
  };
};