// routes/auth.js
import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['donor', 'receiver', 'hospital']).withMessage('Invalid role'),
  body('phone').notEmpty().withMessage('Phone number is required')
], handleValidationErrors, register);

router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
], handleValidationErrors, login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;