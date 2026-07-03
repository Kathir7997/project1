import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFarmerProducts,
} from '../controllers/productController.js';
import { authenticateUser, requireFarmer } from '../middleware/auth.js';

import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/farmer/:farmerId', getFarmerProducts);
router.get('/:id', getProductById);

// Protected routes (Farmer only)
router.post('/', authenticateUser, requireFarmer, (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({
                success: false,
                message: `Upload Error: ${err.message}`,
                error: err.message
            });
        }
        next();
    });
}, createProduct);

router.put('/:id', authenticateUser, requireFarmer, (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({
                success: false,
                message: `Upload Error: ${err.message}`,
                error: err.message
            });
        }
        next();
    });
}, updateProduct);

router.delete('/:id', authenticateUser, requireFarmer, deleteProduct);

// Temporary routes removed, implementing secure routes above

export default router;
