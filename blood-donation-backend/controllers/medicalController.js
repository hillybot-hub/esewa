// controllers/medicalController.js
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';

export const createMedicalRecord = async (req, res) => {
  try {
    const { donorId, ...recordData } = req.body;

    // Check if hospital is creating record for a donor
    if (req.user.role === 'hospital') {
      const medicalRecord = await MedicalRecord.create({
        ...recordData,
        donor: donorId,
        hospital: req.user.id,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      });

      await medicalRecord.populate('donor', 'name bloodType');
      await medicalRecord.populate('hospital', 'hospitalName');

      res.status(201).json({
        success: true,
        record: medicalRecord
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Only hospitals can create medical records'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user.id;
    } else if (req.user.role === 'hospital') {
      query.hospital = req.user.id;
    }

    const records = await MedicalRecord.find(query)
      .populate('donor', 'name bloodType dateOfBirth gender')
      .populate('hospital', 'hospitalName')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDonorMedicalRecords = async (req, res) => {
  try {
    const { donorId } = req.params;

    // Check if user has permission to view donor records
    if (req.user.role !== 'hospital' && req.user.id !== donorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these records'
      });
    }

    const records = await MedicalRecord.find({ donor: donorId })
      .populate('hospital', 'hospitalName')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can verify medical records'
      });
    }

    medicalRecord.verifiedBy = req.user.id;
    medicalRecord.verifiedAt = new Date();
    await medicalRecord.save();

    res.json({
      success: true,
      record: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};