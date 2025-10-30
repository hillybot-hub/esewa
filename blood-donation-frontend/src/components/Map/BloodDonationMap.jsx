// src/components/Map/BloodDonationMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { mapService } from '../../services/mapService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const bloodTypeIcons = {
  'A+': '🔴',
  'A-': '🔴',
  'B+': '🔵',
  'B-': '🔵',
  'AB+': '🟢',
  'AB-': '🟢',
  'O+': '🟡',
  'O-': '🟡'
};

function MapController({ center, radius }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);

  return null;
}

export default function BloodDonationMap() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userLocation, setUserLocation] = useState([51.505, -0.09]); // Default London
  const [radius, setRadius] = useState(10); // km
  const [selectedBloodType, setSelectedBloodType] = useState('all');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.log('Location access denied')
      );
    }

    loadMapData();
  }, [radius, selectedBloodType]);

  const loadMapData = async () => {
    try {
      const [hospitalsData, donorsData, requestsData] = await Promise.all([
        mapService.getHospitals(userLocation, radius),
        mapService.getDonors(userLocation, radius, selectedBloodType),
        mapService.getBloodRequests(userLocation, radius, selectedBloodType)
      ]);
      
      setHospitals(hospitalsData);
      setDonors(donorsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  return (
    <div className="h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search Radius: {radius}km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Blood Type
            </label>
            <select
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      <MapContainer
        center={userLocation}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={userLocation} radius={radius} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User Location */}
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>
        
        {/* Search Radius Circle */}
        <Circle
          center={userLocation}
          radius={radius * 1000}
          color="blue"
          fillColor="blue"
          fillOpacity={0.1}
        />
        
        {/* Hospitals */}
        {hospitals.map(hospital => (
          <Marker key={`hospital-${hospital.id}`} position={[hospital.lat, hospital.lng]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{hospital.name}</h3>
                <p>{hospital.address}</p>
                <div className="mt-2">
                  <h4 className="font-semibold">Available Blood:</h4>
                  {Object.entries(hospital.bloodInventory || {}).map(([type, quantity]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span className={quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {quantity} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Donors */}
        {donors.map(donor => (
          <Marker key={`donor-${donor.id}`} position={[donor.lat, donor.lng]}>
            <Popup>
              <div className="text-center">
                <div className="text-2xl">{bloodTypeIcons[donor.bloodType]}</div>
                <h3 className="font-bold">{donor.name}</h3>
                <p>Blood Type: {donor.bloodType}</p>
                <p>Last Donation: {new Date(donor.lastDonation).toLocaleDateString()}</p>
                <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Blood Requests */}
        {requests.map(request => (
          <Marker key={`request-${request.id}`} position={[request.lat, request.lng]}>
            <Popup>
              <div className="text-center">
                <div className="text-2xl">🩸</div>
                <h3 className="font-bold text-red-600">Blood Request</h3>
                <p>Type: {request.bloodType}</p>
                <p>Units Needed: {request.units}</p>
                <p>Urgency: {request.urgency}</p>
                <button className="mt-2 bg-red-500 text-white px-3 py-1 rounded">
                  Respond
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}