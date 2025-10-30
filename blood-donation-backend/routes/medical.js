// routes/medical.js
import express from 'express';
import {
  createMedicalRecord,
  getMedicalRecords,
  getDonorMedicalRecords,
  verifyMedicalRecord
} from '../controllers/medicalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('hospital'), createMedicalRecord);
router.get('/', protect, authorize('donor', 'hospital'), getMedicalRecords);
router.get('/donor/:donorId', protect, getDonorMedicalRecords);
router.put('/:id/verify', protect, authorize('hospital'), verifyMedicalRecord);

export default router;