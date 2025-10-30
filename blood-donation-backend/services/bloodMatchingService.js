// services/bloodMatchingService.js
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';

class BloodMatchingService {
  // Blood type compatibility matrix
  compatibilityMatrix = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  // Check if donor blood type is compatible with recipient blood type
  isCompatible(donorBloodType, recipientBloodType) {
    if (!donorBloodType || !recipientBloodType) return false;
    return this.compatibilityMatrix[recipientBloodType]?.includes(donorBloodType) || false;
  }

  // Find compatible donors for a blood request
  async findCompatibleDonors(requestId, maxDistance = 50) {
    const bloodRequest = await BloodRequest.findById(requestId)
      .populate('requester', 'name phone');
    
    if (!bloodRequest) {
      throw new Error('Blood request not found');
    }

    const { bloodType, location, units, urgency } = bloodRequest;

    // Find compatible and available donors within the specified distance
    const compatibleDonors = await User.find({
      role: 'donor',
      bloodType: { $in: this.compatibilityMatrix[bloodType] },
      isAvailable: true,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    })
    .select('name bloodType location phone lastDonationDate donationCount isEligible')
    .limit(20); // Limit results for performance

    // Score and rank donors based on multiple factors
    const rankedDonors = compatibleDonors.map(donor => {
      const score = this.calculateDonorScore(donor, bloodRequest);
      return {
        ...donor.toObject(),
        matchScore: score,
        distance: this.calculateDistance(
          location.coordinates[1], // latitude
          location.coordinates[0], // longitude
          donor.location.coordinates[1],
          donor.location.coordinates[0]
        )
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

    return {
      request: bloodRequest,
      compatibleDonors: rankedDonors,
      totalMatches: rankedDonors.length
    };
  }

  // Calculate donor score based on multiple factors
  calculateDonorScore(donor, request) {
    let score = 0;

    // Base compatibility score
    score += 100;

    // Recency of last donation (prefer donors who haven't donated recently)
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastDonation >= 56) { // 8 weeks - fully eligible
        score += 50;
      } else if (daysSinceLastDonation >= 28) { // 4 weeks - partially eligible
        score += 25;
      }
    } else {
      // No previous donations - highest priority
      score += 60;
    }

    // Donation experience (slight preference for experienced donors)
    if (donor.donationCount > 0) {
      score += Math.min(donor.donationCount * 2, 20);
    }

    // Urgency bonus
    if (request.urgency === 'critical') {
      score += 30;
    } else if (request.urgency === 'high') {
      score += 15;
    }

    // Eligibility status
    if (donor.isEligible) {
      score += 20;
    }

    return Math.min(score, 200); // Cap score at 200
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Find alternative blood types that could work in emergency
  async findAlternativeMatches(requestId) {
    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      throw new Error('Blood request not found');
    }

    const { bloodType } = bloodRequest;
    const alternatives = [];

    // For critical situations, consider universal donors
    if (bloodType !== 'O-') {
      alternatives.push({
        bloodType: 'O-',
        reason: 'Universal donor - compatible with all blood types',
        priority: 'high'
      });
    }

    // For Rh-positive recipients, O+ can be an alternative
    if (bloodType.endsWith('+') && bloodType !== 'O+') {
      alternatives.push({
        bloodType: 'O+',
        reason: 'Universal Rh-positive donor',
        priority: 'medium'
      });
    }

    // Find actual donors for these alternatives
    const alternativeDonors = [];
    for (const alt of alternatives) {
      const donors = await User.find({
        role: 'donor',
        bloodType: alt.bloodType,
        isAvailable: true,
        isActive: true
      })
      .select('name bloodType location phone lastDonationDate')
      .limit(5);

      alternativeDonors.push({
        ...alt,
        availableDonors: donors.length,
        sampleDonors: donors.slice(0, 3) // Show first 3 donors as samples
      });
    }

    return {
      originalRequest: bloodType,
      alternatives: alternativeDonors
    };
  }

  // Get blood supply overview by location
  async getBloodSupplyOverview(location, radius = 50) {
    const donors = await User.find({
      role: 'donor',
      isAvailable: true,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates
          },
          $maxDistance: radius * 1000
        }
      }
    });

    const bloodSupply = {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Initialize counts
    bloodTypes.forEach(type => {
      bloodSupply[type] = {
        availableDonors: 0,
        eligibleDonors: 0,
        recentDonors: 0 // Donated in last 8 weeks
      };
    });

    // Count donors by blood type and status
    donors.forEach(donor => {
      if (donor.bloodType && bloodSupply[donor.bloodType]) {
        bloodSupply[donor.bloodType].availableDonors++;

        if (donor.isEligible) {
          bloodSupply[donor.bloodType].eligibleDonors++;
        }

        // Check if donated recently (within 8 weeks)
        if (donor.lastDonationDate) {
          const weeksSinceDonation = Math.floor(
            (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24 * 7)
          );
          if (weeksSinceDonation <= 8) {
            bloodSupply[donor.bloodType].recentDonors++;
          }
        }
      }
    });

    // Calculate supply status
    bloodTypes.forEach(type => {
      const supply = bloodSupply[type];
      const totalEligible = supply.eligibleDonors;

      if (totalEligible === 0) {
        supply.status = 'critical';
        supply.statusText = 'No donors available';
      } else if (totalEligible <= 2) {
        supply.status = 'low';
        supply.statusText = 'Very low supply';
      } else if (totalEligible <= 5) {
        supply.status = 'medium';
        supply.statusText = 'Low supply';
      } else if (totalEligible <= 10) {
        supply.status = 'good';
        supply.statusText = 'Adequate supply';
      } else {
        supply.status = 'excellent';
        supply.statusText = 'Good supply';
      }
    });

    return {
      location: {
        coordinates: location.coordinates,
        radius: radius
      },
      totalDonors: donors.length,
      bloodSupply,
      lastUpdated: new Date()
    };
  }
}

export default new BloodMatchingService();