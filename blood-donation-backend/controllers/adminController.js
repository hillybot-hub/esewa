// controllers/adminController.js
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalReceivers,
      totalRequests,
      pendingRequests,
      completedDonations,
      recentDonations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'hospital' }),
      User.countDocuments({ role: 'receiver' }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.find({ status: 'completed' })
        .populate('donor', 'name bloodType')
        .populate('hospital', 'hospitalName')
        .sort({ donationDate: -1 })
        .limit(10)
    ]);

    // Blood type statistics
    const bloodTypeStats = await User.aggregate([
      { $match: { role: 'donor', bloodType: { $ne: null } } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalHospitals,
        totalReceivers,
        totalRequests,
        pendingRequests,
        completedDonations,
        bloodTypeStats,
        recentDonations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const manageUsers = async (req, res) => {
  try {
    const { action, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    switch (action) {
      case 'activate':
        user.isActive = true;
        break;
      case 'deactivate':
        user.isActive = false;
        break;
      case 'delete':
        await User.findByIdAndDelete(userId);
        return res.json({
          success: true,
          message: 'User deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${action}d successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, bloodType } = req.query;

    let query = {};
    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;

    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone')
      .populate('hospital', 'hospitalName')
      .populate('acceptedBy.donor', 'name bloodType')
      .populate('acceptedBy.hospital', 'hospitalName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};