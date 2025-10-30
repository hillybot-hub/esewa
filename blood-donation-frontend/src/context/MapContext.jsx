// src/context/MapContext.jsx
import React, { createContext, useState, useContext } from 'react';

const MapContext = createContext();

export function useMap() {
  return useContext(MapContext);
}

export function MapProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(12);
  const [filters, setFilters] = useState({
    urgency: 'all',
    status: 'pending',
    dateRange: 'all'
  });

  const updateUserLocation = (location) => {
    setUserLocation(location);
    setMapCenter([location.lat, location.lng]);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    userLocation,
    searchRadius,
    selectedBloodType,
    mapCenter,
    mapZoom,
    filters,
    setSearchRadius,
    setSelectedBloodType,
    setMapCenter,
    setMapZoom,
    updateUserLocation,
    updateFilters
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}