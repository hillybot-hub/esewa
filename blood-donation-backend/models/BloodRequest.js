// models/BloodRequest.js
import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: Number,
  patientGender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Blood Requirements
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Medical Details
  reason: {
    type: String,
    required: true
  },
  diagnosis: String,
  hospitalCaseNumber: String,
  notes: String,
  
  // Acceptance Details
  acceptedBy: {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acceptedAt: Date,
    notes: String
  },
  
  // Fulfillment Details
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfilledAt: Date,
  actualUnits: Number,
  
  // Timeline
  requiredDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    default: function() {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      return expiry;
    }
  },
  
  // Metadata
  priority: {
    type: Number,
    default: 1
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodType: 1 });
bloodRequestSchema.index({ requester: 1 });
bloodRequestSchema.index({ expiryDate: 1 });
bloodRequestSchema.index({ urgency: -1, createdAt: -1 });

// Virtual for time remaining
bloodRequestSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'pending') return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  return Math.max(0, expiry - now);
});

export default mongoose.model('BloodRequest', bloodRequestSchema);