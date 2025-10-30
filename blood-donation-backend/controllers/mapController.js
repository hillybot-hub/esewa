// controllers/mapController.js
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import { getDistance } from 'geolib';

export const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const hospitals = await User.find({
      role: 'hospital',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('name hospitalName location address bloodInventory phone');

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getNearbyDonors = async (req, res) => {
  try {
    const { lat, lng, radius = 10, bloodType } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    let query = {
      role: 'donor',
      isActive: true,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    };

    if (bloodType && bloodType !== 'all') {
      query.bloodType = bloodType;
    }

    const donors = await User.find(query)
      .select('name bloodType location lastDonationDate donationCount gender')
      .limit(50);

    res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBloodRequests = async (req, res) => {
  try {
    const { lat, lng, radius = 10, bloodType, status = 'pending' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    let query = {
      status,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    };

    if (bloodType && bloodType !== 'all') {
      query.bloodType = bloodType;
    }

    const requests = await BloodRequest.find(query)
      .populate('requester', 'name phone')
      .populate('hospital', 'hospitalName phone')
      .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};