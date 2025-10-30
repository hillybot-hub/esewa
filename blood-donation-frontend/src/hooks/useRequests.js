// src/hooks/useRequests.js
import { useState, useEffect } from 'react';
import { requestService } from '../services/requestService';

export const useRequests = (filters = {}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getRequests(filters);
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData) => {
    try {
      const newRequest = await requestService.createRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const updatedRequest = await requestService.acceptRequest(requestId);
      setRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      );
      return updatedRequest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  return {
    requests,
    loading,
    error,
    createRequest,
    acceptRequest,
    refetch: fetchRequests
  };
};