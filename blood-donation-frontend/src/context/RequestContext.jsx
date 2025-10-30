// src/context/RequestContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { requestService } from '../services/requestService';
import { useAuth } from './AuthContext';

const RequestContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    bloodType: 'all',
    urgency: 'all',
  });
  const { user } = useAuth();

  const fetchRequests = async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const data = await requestService.getRequests(mergedFilters);
      setRequests(data.requests || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData) => {
    try {
      setError(null);
      const newRequest = await requestService.createRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      setError(err.message || 'Failed to create request');
      throw err;
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      setError(null);
      const updatedRequest = await requestService.acceptRequest(requestId);
      setRequests(prev =>
        prev.map(req => req._id === requestId ? updatedRequest : req)
      );
      return updatedRequest;
    } catch (err) {
      setError(err.message || 'Failed to accept request');
      throw err;
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      setError(null);
      const updatedRequest = await requestService.updateRequestStatus(requestId, status);
      setRequests(prev =>
        prev.map(req => req._id === requestId ? updatedRequest : req)
      );
      return updatedRequest;
    } catch (err) {
      setError(err.message || 'Failed to update request');
      throw err;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, filters]);

  const value = {
    requests,
    loading,
    error,
    filters,
    fetchRequests,
    createRequest,
    acceptRequest,
    updateRequestStatus,
    updateFilters,
    refetch: fetchRequests,
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};