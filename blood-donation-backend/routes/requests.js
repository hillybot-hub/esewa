// routes/requests.js
import express from 'express';
import { body } from 'express-validator';
import {
  createRequest,
  getRequests,
  acceptRequest,
  updateRequestStatus
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/', [
  protect,
  authorize('receiver', 'hospital'),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('units').isInt({ min: 1, max: 10 }),
  body('urgency').isIn(['low', 'medium', 'high', 'critical'])
], handleValidationErrors, createRequest);

router.get('/', protect, getRequests);
router.post('/:id/accept', protect, authorize('donor', 'hospital'), acceptRequest);
router.put('/:id/status', protect, updateRequestStatus);

export default router;