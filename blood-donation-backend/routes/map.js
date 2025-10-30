// routes/map.js
import express from 'express';
import {
  getNearbyHospitals,
  getNearbyDonors,
  getBloodRequests
} from '../controllers/mapController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/hospitals', protect, getNearbyHospitals);
router.get('/donors', protect, getNearbyDonors);
router.get('/blood-requests', protect, getBloodRequests);

export default router;