// src/components/Requests/BloodRequestForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';

export default function BloodRequestForm({ onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodType: '',
    units: 1,
    urgency: 'medium',
    location: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestService.createRequest(formData);
      onSubmit?.();
      setFormData({
        bloodType: '',
        units: 1,
        urgency: 'medium',
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Create Blood Request</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Type</label>
          <select
            required
            value={formData.bloodType}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Blood Type</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Units Needed</label>
          <input
            type="number"
            min="1"
            max="10"
            required
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Urgency</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter location or address"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Any additional information..."
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Submit Request
      </button>
    </form>
  );
}