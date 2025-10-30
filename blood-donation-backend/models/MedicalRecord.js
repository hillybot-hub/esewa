// models/MedicalRecord.js
import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
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
  recordType: {
    type: String,
    enum: ['donation', 'examination', 'test', 'vaccination', 'screening'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Vital Signs
  bloodPressure: {
    systolic: { type: Number, min: 60, max: 250 },
    diastolic: { type: Number, min: 40, max: 150 }
  },
  hemoglobin: { type: Number, min: 10, max: 20 },
  weight: { type: Number, min: 30, max: 200 },
  height: { type: Number, min: 100, max: 250 },
  temperature: { type: Number, min: 35, max: 42 },
  pulse: { type: Number, min: 40, max: 150 },
  
  // Medical History
  medicalHistory: {
    hasDiabetes: { type: Boolean, default: false },
    hasHypertension: { type: Boolean, default: false },
    hasHeartDisease: { type: Boolean, default: false },
    hasKidneyDisease: { type: Boolean, default: false },
    hasLiverDisease: { type: Boolean, default: false },
    recentSurgery: { type: Boolean, default: false },
    recentMedication: { type: Boolean, default: false },
    recentTravel: { type: Boolean, default: false }
  },
  
  // Test Results
  tests: {
    hiv: { type: Boolean, default: false },
    hepatitisB: { type: Boolean, default: false },
    hepatitisC: { type: Boolean, default: false },
    syphilis: { type: Boolean, default: false },
    malaria: { type: Boolean, default: false },
    hemoglobinTest: { type: Boolean, default: false }
  },
  testResults: {
    hiv: { type: Boolean, default: null },
    hepatitisB: { type: Boolean, default: null },
    hepatitisC: { type: Boolean, default: null },
    syphilis: { type: Boolean, default: null },
    malaria: { type: Boolean, default: null },
    hemoglobinLevel: Number
  },
  
  // Donation Specific
  donationVolume: Number, // in ml
  reaction: {
    type: String,
    enum: ['none', 'mild', 'moderate', 'severe']
  },
  reactionNotes: String,
  
  // General
  notes: String,
  recommendations: String,
  nextCheckup: Date,
  
  // Files and Attachments
  files: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  isEligible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

medicalRecordSchema.index({ donor: 1, date: -1 });
medicalRecordSchema.index({ hospital: 1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ isVerified: 1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);