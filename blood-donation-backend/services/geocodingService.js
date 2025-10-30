// services/geocodingService.js
import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async geocodeAddress(address) {
    try {
      // Check cache first
      const cachedResult = cache.get(address);
      if (cachedResult) {
        return cachedResult;
      }

      if (!this.apiKey) {
        // Fallback to OpenStreetMap Nominatim if no Google API key
        return await this.geocodeWithNominatim(address);
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: address,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components,
        };

        // Cache the result
        cache.set(address, location);
        return location;
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      // Fallback to Nominatim
      return await this.geocodeWithNominatim(address);
    }
  }

  async geocodeWithNominatim(address) {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'BloodDonation-Server/1.0'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
          addressComponents: result.address,
        };

        // Cache the result
        cache.set(address, location);
        return location;
      } else {
        throw new Error('No results found from Nominatim');
      }
    } catch (error) {
      console.error('Nominatim geocoding error:', error.message);
      throw new Error('Failed to geocode address');
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      const cacheKey = `reverse_${lat}_${lng}`;
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      if (!this.apiKey) {
        return await this.reverseGeocodeWithNominatim(lat, lng);
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${lat},${lng}`,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const address = {
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components,
        };

        cache.set(cacheKey, address);
        return address;
      } else {
        throw new Error('Reverse geocoding failed');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return await this.reverseGeocodeWithNominatim(lat, lng);
    }
  }

  async reverseGeocodeWithNominatim(lat, lng) {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat: lat,
            lon: lng,
            format: 'json',
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'BloodDonation-Server/1.0'
          }
        }
      );

      if (response.data) {
        const address = {
          formattedAddress: response.data.display_name,
          addressComponents: response.data.address,
        };
        return address;
      } else {
        throw new Error('Reverse geocoding with Nominatim failed');
      }
    } catch (error) {
      console.error('Nominatim reverse geocoding error:', error.message);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  async calculateDistance(origin, destination) {
    try {
      if (!this.apiKey) {
        return this.calculateHaversineDistance(origin, destination);
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: `${origin.lat},${origin.lng}`,
            destinations: `${destination.lat},${destination.lng}`,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status === 'OK') {
        const element = response.data.rows[0].elements[0];
        if (element.status === 'OK') {
          return {
            distance: element.distance,
            duration: element.duration,
          };
        }
      }

      // Fallback to Haversine
      return this.calculateHaversineDistance(origin, destination);
    } catch (error) {
      console.error('Distance calculation error:', error.message);
      return this.calculateHaversineDistance(origin, destination);
    }
  }

  calculateHaversineDistance(origin, destination) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return {
      distance: {
        text: `${distance.toFixed(1)} km`,
        value: distance * 1000, // meters
      },
      duration: {
        text: 'Unknown',
        value: 0,
      },
    };
  }
}

export default new GeocodingService();