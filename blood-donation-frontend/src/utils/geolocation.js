// src/utils/geolocation.js
// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };
  
  // Format distance for display
  export const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)} m`;
    } else if (distanceInKm < 10) {
      return `${distanceInKm.toFixed(1)} km`;
    } else {
      return `${Math.round(distanceInKm)} km`;
    }
  };
  
  // Check if coordinates are valid
  export const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  };
  
  // Get current position with promise
  export const getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
  
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      };
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
          }
          
          reject(new Error(errorMessage));
        },
        { ...defaultOptions, ...options }
      );
    });
  };
  
  // Create bounding box for map searches
  export const createBoundingBox = (center, radiusInKm) => {
    const earthRadius = 6371; // km
    const lat = center.lat * Math.PI / 180;
    const lng = center.lng * Math.PI / 180;
    const angularDistance = radiusInKm / earthRadius;
  
    const minLat = (lat - angularDistance) * 180 / Math.PI;
    const maxLat = (lat + angularDistance) * 180 / Math.PI;
    const deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(lat));
    const minLng = (lng - deltaLng) * 180 / Math.PI;
    const maxLng = (lng + deltaLng) * 180 / Math.PI;
  
    return {
      minLat: Math.max(minLat, -90),
      maxLat: Math.min(maxLat, 90),
      minLng: Math.max(minLng, -180),
      maxLng: Math.min(maxLng, 180),
    };
  };