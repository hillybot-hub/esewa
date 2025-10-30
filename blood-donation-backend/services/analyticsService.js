// services/analyticsService.js
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import MedicalRecord from '../models/MedicalRecord.js';

class AnalyticsService {
  async getDashboardStats(timeRange = '30d') {
    const dateRange = this.getDateRange(timeRange);
    
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalReceivers,
      totalRequests,
      completedDonations,
      pendingRequests,
      activeDonors,
      bloodTypeStats,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'hospital' }),
      User.countDocuments({ role: 'receiver' }),
      BloodRequest.countDocuments({ createdAt: { $gte: dateRange.start } }),
      Donation.countDocuments({ 
        status: 'completed',
        donationDate: { $gte: dateRange.start }
      }),
      BloodRequest.countDocuments({ 
        status: 'pending',
        createdAt: { $gte: dateRange.start }
      }),
      User.countDocuments({ 
        role: 'donor', 
        isAvailable: true,
        lastLogin: { $gte: dateRange.start }
      }),
      this.getBloodTypeStatistics(),
      this.getRecentActivity()
    ]);

    const growthMetrics = await this.getGrowthMetrics(dateRange);
    const geographicStats = await this.getGeographicStats();

    return {
      overview: {
        totalUsers,
        totalDonors,
        totalHospitals,
        totalReceivers,
        totalRequests: {
          total: totalRequests,
          pending: pendingRequests,
          completed: completedDonations
        },
        activeDonors
      },
      bloodTypeStats,
      growthMetrics,
      geographicStats,
      recentActivity,
      timeRange
    };
  }

  async getBloodTypeStatistics() {
    const donors = await User.find({ 
      role: 'donor',
      bloodType: { $ne: null }
    });
    
    const bloodTypeCount = {};
    const eligibleDonors = {};
    
    donors.forEach(donor => {
      const bloodType = donor.bloodType;
      if (!bloodTypeCount[bloodType]) {
        bloodTypeCount[bloodType] = 0;
        eligibleDonors[bloodType] = 0;
      }
      bloodTypeCount[bloodType]++;
      
      if (donor.isAvailable && donor.isEligible) {
        eligibleDonors[bloodType]++;
      }
    });

    return {
      distribution: bloodTypeCount,
      eligibleDonors: eligibleDonors
    };
  }

  async getGrowthMetrics(dateRange) {
    const previousRange = this.getPreviousDateRange(dateRange);
    
    const [
      currentUsers,
      previousUsers,
      currentDonations,
      previousDonations,
      currentRequests,
      previousRequests
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: dateRange.start } }),
      User.countDocuments({ 
        createdAt: { 
          $gte: previousRange.start,
          $lt: dateRange.start
        }
      }),
      Donation.countDocuments({ 
        donationDate: { $gte: dateRange.start }
      }),
      Donation.countDocuments({ 
        donationDate: { 
          $gte: previousRange.start,
          $lt: dateRange.start
        }
      }),
      BloodRequest.countDocuments({ 
        createdAt: { $gte: dateRange.start }
      }),
      BloodRequest.countDocuments({ 
        createdAt: { 
          $gte: previousRange.start,
          $lt: dateRange.start
        }
      })
    ]);

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      userGrowth: calculateGrowth(currentUsers, previousUsers),
      donationGrowth: calculateGrowth(currentDonations, previousDonations),
      requestGrowth: calculateGrowth(currentRequests, previousRequests),
      newUsers: currentUsers,
      newDonations: currentDonations,
      newRequests: currentRequests
    };
  }

  async getGeographicStats() {
    const users = await User.find({
      'location.coordinates': { $ne: [0, 0] }
    }).select('location address');

    const cityStats = {};
    const stateStats = {};

    users.forEach(user => {
      const city = user.address?.city || 'Unknown';
      const state = user.address?.state || 'Unknown';
      
      cityStats[city] = (cityStats[city] || 0) + 1;
      stateStats[state] = (stateStats[state] || 0) + 1;
    });

    return {
      byCity: Object.entries(cityStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((acc, [city, count]) => {
          acc[city] = count;
          return acc;
        }, {}),
      byState: stateStats
    };
  }

  async getRecentActivity(limit = 10) {
    const [recentDonations, recentRequests, newUsers] = await Promise.all([
      Donation.find({ status: 'completed' })
        .populate('donor', 'name bloodType')
        .populate('hospital', 'hospitalName')
        .sort({ donationDate: -1 })
        .limit(limit),
      BloodRequest.find({ status: 'accepted' })
        .populate('requester', 'name')
        .populate('acceptedBy.donor', 'name bloodType')
        .sort({ updatedAt: -1 })
        .limit(limit),
      User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name role createdAt')
    ]);

    return {
      donations: recentDonations,
      requests: recentRequests,
      newUsers: newUsers
    };
  }

  async getUserAnalytics(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let analytics = {};

    if (user.role === 'donor') {
      analytics = await this.getDonorAnalytics(userId);
    } else if (user.role === 'hospital') {
      analytics = await this.getHospitalAnalytics(userId);
    } else if (user.role === 'receiver') {
      analytics = await this.getReceiverAnalytics(userId);
    }

    return analytics;
  }

  async getDonorAnalytics(donorId) {
    const [donations, medicalRecords, acceptedRequests] = await Promise.all([
      Donation.find({ donor: donorId }),
      MedicalRecord.find({ donor: donorId }),
      BloodRequest.find({ 'acceptedBy.donor': donorId })
    ]);

    const totalDonations = donations.length;
    const totalVolume = donations.reduce((sum, donation) => sum + (donation.volume || 450), 0);
    const lastDonation = donations.sort((a, b) => 
      new Date(b.donationDate) - new Date(a.donationDate)
    )[0];

    return {
      totalDonations,
      totalVolume: `${(totalVolume / 1000).toFixed(1)} L`,
      donationFrequency: this.calculateDonationFrequency(donations),
      lastDonation: lastDonation?.donationDate || null,
      healthStats: this.calculateHealthStats(medicalRecords),
      impact: {
        livesPotentiallySaved: totalDonations * 3, // Each donation can save up to 3 lives
        requestsAccepted: acceptedRequests.length
      }
    };
  }

  calculateDonationFrequency(donations) {
    if (donations.length < 2) return 'N/A';
    
    const sortedDates = donations
      .map(d => new Date(d.donationDate))
      .sort((a, b) => a - b);
    
    const totalDays = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);
    const frequency = totalDays / (donations.length - 1);
    
    if (frequency <= 60) return 'Frequent (≤ 2 months)';
    if (frequency <= 120) return 'Regular (2-4 months)';
    return 'Occasional (> 4 months)';
  }

  calculateHealthStats(medicalRecords) {
    if (medicalRecords.length === 0) return {};
    
    const latestRecord = medicalRecords.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )[0];
    
    return {
      hemoglobin: latestRecord.hemoglobin,
      bloodPressure: latestRecord.bloodPressure,
      lastCheckup: latestRecord.date,
      isEligible: latestRecord.isEligible
    };
  }

  getDateRange(timeRange) {
    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return { start, end: now };
  }

  getPreviousDateRange(currentRange) {
    const duration = currentRange.end - currentRange.start;
    return {
      start: new Date(currentRange.start.getTime() - duration),
      end: currentRange.start
    };
  }
}

export default new AnalyticsService();