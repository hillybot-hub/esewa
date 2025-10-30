// models/Hospital.js
import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['government', 'private', 'trust', 'charity'],
    default: 'private'
  },
  category: {
    type: String,
    enum: ['multi_specialty', 'specialty', 'general', 'clinic'],
    default: 'general'
  },
  beds: {
    total: Number,
    occupied: Number,
    available: Number
  },
  facilities: [String],
  departments: [String],
  accreditation: [{
    name: String,
    authority: String,
    validUntil: Date
  }],
  staff: {
    doctors: Number,
    nurses: Number,
    technicians: Number,
    administrative: Number
  },
  services: {
    emergency: Boolean,
    opd: Boolean,
    ipd: Boolean,
    laboratory: Boolean,
    radiology: Boolean,
    pharmacy: Boolean,
    bloodBank: Boolean
  },
  bloodBank: {
    isOperational: {
      type: Boolean,
      default: false
    },
    license: String,
    capacity: Number,
    storageFacilities: [String],
    testingFacilities: [String]
  },
  contact: {
    email: String,
    phone: [String],
    emergencyPhone: String,
    website: String
  },
  operatingHours: {
    emergency: {
      open: String,
      close: String,
      is24x7: Boolean
    },
    opd: {
      open: String,
      close: String,
      days: [String]
    },
    bloodBank: {
      open: String,
      close: String,
      days: [String]
    }
  },
  statistics: {
    totalDonations: {
      type: Number,
      default: 0
    },
    activeDonors: {
      type: Number,
      default: 0
    },
    fulfilledRequests: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number // in minutes
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

hospitalSchema.index({ name: 1 });
hospitalSchema.index({ 'location.coordinates': '2dsphere' });
hospitalSchema.index({ isVerified: 1 });
hospitalSchema.index({ type: 1, category: 1 });

// Virtual for bed occupancy rate
hospitalSchema.virtual('bedOccupancyRate').get(function() {
  if (!this.beds?.total || this.beds.total === 0) return 0;
  return ((this.beds.occupied || 0) / this.beds.total) * 100;
});

// Update statistics when related data changes
hospitalSchema.methods.updateStatistics = async function() {
  const Donation = mongoose.model('Donation');
  const BloodRequest = mongoose.model('BloodRequest');
  const User = mongoose.model('User');

  const [totalDonations, fulfilledRequests, activeDonors] = await Promise.all([
    Donation.countDocuments({ hospital: this.user, status: 'completed' }),
    BloodRequest.countDocuments({ hospital: this.user, status: 'fulfilled' }),
    User.countDocuments({ 
      role: 'donor', 
      isAvailable: true,
      lastDonationDate: { 
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    })
  ]);

  this.statistics = {
    totalDonations,
    fulfilledRequests,
    activeDonors
  };

  await this.save();
};

export default mongoose.model('Hospital', hospitalSchema);