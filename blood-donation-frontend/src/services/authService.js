// src/services/authService.js
const API_URL = 'http://localhost:3001/api';

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async verifyToken(token) {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Token invalid');
    return response.json();
  }
};

// src/services/mapService.js
export const mapService = {
  async getHospitals(center, radius) {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        name: 'City General Hospital',
        lat: 51.505,
        lng: -0.09,
        address: '123 Medical Center Dr',
        bloodInventory: {
          'A+': 15,
          'B+': 8,
          'O+': 20,
          'AB+': 5
        }
      }
    ];
  },

  async getDonors(center, radius, bloodType) {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        name: 'John Doe',
        lat: 51.51,
        lng: -0.1,
        bloodType: 'A+',
        lastDonation: '2024-01-15',
        available: true
      }
    ];
  },

  async getBloodRequests(center, radius, bloodType) {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        lat: 51.515,
        lng: -0.08,
        bloodType: 'O+',
        units: 3,
        urgency: 'high',
        hospital: 'City General'
      }
    ];
  }
};

// src/services/requestService.js
export const requestService = {
  async createRequest(requestData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) throw new Error('Failed to create request');
    return response.json();
  },

  async getRequests(filters = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters).toString();
    
    const response = await fetch(`${API_URL}/requests?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  async acceptRequest(requestId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to accept request');
    return response.json();
  }
};