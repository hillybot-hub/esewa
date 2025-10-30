// src/utils/constants.js
export const BLOOD_TYPES = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];
  
  export const URGENCY_LEVELS = {
    low: { label: 'Low', color: 'green' },
    medium: { label: 'Medium', color: 'yellow' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };
  
  export const USER_ROLES = {
    donor: 'Donor',
    receiver: 'Receiver', 
    hospital: 'Hospital',
    admin: 'Administrator'
  };
  
  export const MAP_CONFIG = {
    defaultCenter: [51.505, -0.09],
    defaultZoom: 12,
    maxZoom: 18,
    minZoom: 3
  };