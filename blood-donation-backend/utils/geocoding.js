// utils/geocoding.js
import axios from 'axios';

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};