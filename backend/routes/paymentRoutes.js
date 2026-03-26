import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import { authenticateUser, requireConsumer } from '../middleware/auth.js';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', authenticateUser, requireConsumer, createRazorpayOrder);

// Verify payment
router.post('/verify', authenticateUser, verifyPayment);

export default router;
