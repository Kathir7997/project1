import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    mergeCart,
    clearCart,
} from '../controllers/cartController.js';
import { authenticateUser, requireConsumer } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require consumer authentication
router.use(authenticateUser, requireConsumer);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/merge', mergeCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
