// routes/admin.js
import express from 'express';
import {
  getDashboardStats,
  manageUsers,
  getAllRequests
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes protected and authorized for admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/users/manage', manageUsers);
router.get('/requests', getAllRequests);

export default router;