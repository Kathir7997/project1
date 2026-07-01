import express from 'express';
import {
    createOrder,
    getConsumerOrders,
    getFarmerOrders,
    updateOrderStatus,
    updatePaymentMethod,
} from '../controllers/orderController.js';
import { authenticateUser, requireConsumer, requireFarmer } from '../middleware/auth.js';

const router = express.Router();

// Consumer routes
router.post('/', authenticateUser, requireConsumer, createOrder);
router.get('/me', authenticateUser, requireConsumer, getConsumerOrders);
router.get('/consumer/:consumerId', authenticateUser, getConsumerOrders);
router.put('/:id/payment-method', authenticateUser, requireConsumer, updatePaymentMethod);

// Farmer routes
router.get('/farmer/:farmerId', authenticateUser, requireFarmer, getFarmerOrders);

// Update order status (can be called by system after payment)
router.put('/:id/status', authenticateUser, updateOrderStatus);

export default router;
