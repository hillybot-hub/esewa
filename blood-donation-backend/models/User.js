// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['donor', 'receiver', 'hospital', 'admin'],
    required: true 
  },
  phone: { type: String, required: true },
  
  // Location
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  // Profile
  avatar: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Donor Specific
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null]
  },
  lastDonationDate: Date,
  nextEligibleDate: Date,
  donationCount: { type: Number, default: 0 },
  healthConditions: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Hospital Specific
  hospitalName: String,
  licenseNumber: String,
  facilities: [String],
  operatingHours: {
    open: String,
    close: String,
    days: [String]
  },
  
  // System
  lastLogin: { type: Date, default: Date.now },
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);