// models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
  
  // Donation Details
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  volume: { // in ml
    type: Number,
    default: 450
  },
  
  // Timeline
  donationDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: Date,
  completionTime: Date,
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred', 'no_show'],
    default: 'scheduled'
  },
  
  // Medical Reference
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  
  // Donation Process
  process: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    phlebotomist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Post-Donation
  recovery: {
    startTime: Date,
    endTime: Date,
    reaction: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe']
    },
    reactionNotes: String,
    snacksProvided: Boolean
  },
  
  // Notes
  notes: String,
  deferralReason: String,
  
  // Next Eligibility
  nextEligibleDate: {
    type: Date,
    default: function() {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 56); // 56 days gap
      return nextDate;
    }
  },
  
  // Verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ hospital: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ bloodType: 1 });

// Pre-save middleware to update donor's last donation date
donationSchema.pre('save', async function(next) {
  if (this.status === 'completed' && this.isModified('status')) {
    // Update donor's last donation date and count
    await mongoose.model('User').findByIdAndUpdate(this.donor, {
      lastDonationDate: this.donationDate,
      nextEligibleDate: this.nextEligibleDate,
      $inc: { donationCount: 1 }
    });
    
    // Update hospital blood inventory
    if (this.bloodType) {
      await mongoose.model('User').findByIdAndUpdate(this.hospital, {
        $inc: { [`bloodInventory.${this.bloodType}`]: this.units }
      });
    }
  }
  next();
});

export default mongoose.model('Donation', donationSchema);