// controllers/requestController.js
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';

export const createRequest = async (req, res) => {
  try {
    const { bloodType, units, urgency, location, address, reason, notes, patientName } = req.body;

    const bloodRequest = await BloodRequest.create({
      requester: req.user.id,
      bloodType,
      units,
      urgency,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      address,
      reason,
      notes,
      patientName,
      // If requester is hospital, auto-assign hospital
      ...(req.user.role === 'hospital' && { hospital: req.user.id })
    });

    await bloodRequest.populate('requester', 'name phone');

    res.status(201).json({
      success: true,
      request: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { status, bloodType, urgency } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'donor') {
      query.status = 'pending';
    } else if (req.user.role === 'hospital') {
      query.$or = [
        { hospital: req.user.id },
        { status: 'pending' }
      ];
    } else if (req.user.role === 'receiver') {
      query.requester = req.user.id;
    }

    // Additional filters
    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('requester', 'name phone')
      .populate('hospital', 'hospitalName phone')
      .populate('acceptedBy.donor', 'name phone bloodType')
      .populate('acceptedBy.hospital', 'hospitalName phone')
      .sort({ createdAt: -1 });

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

export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const bloodRequest = await BloodRequest.findById(id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer available'
      });
    }

    // Update based on acceptor role
    if (req.user.role === 'donor') {
      bloodRequest.acceptedBy = {
        donor: req.user.id,
        acceptedAt: new Date()
      };
    } else if (req.user.role === 'hospital') {
      bloodRequest.acceptedBy = {
        hospital: req.user.id,
        acceptedAt: new Date()
      };
    }

    bloodRequest.status = 'accepted';
    await bloodRequest.save();

    await bloodRequest.populate([
      { path: 'requester', select: 'name phone' },
      { path: 'acceptedBy.donor', select: 'name phone bloodType' },
      { path: 'acceptedBy.hospital', select: 'hospitalName phone' }
    ]);

    res.json({
      success: true,
      request: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bloodRequest = await BloodRequest.findById(id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check permissions
    if (req.user.role === 'receiver' && bloodRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    bloodRequest.status = status;
    if (status === 'fulfilled') {
      bloodRequest.fulfilledAt = new Date();
    }

    await bloodRequest.save();

    res.json({
      success: true,
      request: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};