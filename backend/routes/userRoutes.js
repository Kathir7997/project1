import express from 'express';
import { syncUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Public route for Clerk webhook/sync
router.post('/sync', syncUser);

// Protected routes
router.get('/:clerkId', authenticateUser, getUserProfile);
router.put('/:clerkId', authenticateUser, updateUserProfile);

export default router;
