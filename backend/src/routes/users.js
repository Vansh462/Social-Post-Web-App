import express from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

export default router;

