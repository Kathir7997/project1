import Razorpay from 'razorpay';
import crypto from 'crypto';
import { successResponse, errorResponse } from '../utils/helpers.js';

// Lazy initialize Razorpay to avoid crashes when keys are missing
let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private (Consumer only)
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        if (!amount) {
            return errorResponse(res, 400, 'Amount is required');
        }

        if (amount <= 0) {
            return errorResponse(res, 400, 'Amount must be greater than 0');
        }

        console.log('[PAYMENT] Creating Razorpay order with amount:', amount, 'currency:', currency);

        const razorpay = getRazorpayInstance();

        const amountInPaise = Math.round(amount * 100);
        console.log('[PAYMENT] Amount in paise:', amountInPaise);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        console.log('[PAYMENT] Creating Razorpay order with options:', options);
        const order = await razorpay.orders.create(options);

        console.log('[PAYMENT] Razorpay order created successfully:', {
            orderId: order.id,
            amount: order.amount,
            status: order.status
        });

        // Return formatted response with razorpayOrderId field
        const responseData = {
            razorpayOrderId: order.id,
            amount: order.amount / 100, // Convert back to rupees
            currency: order.currency,
            receipt: order.receipt
        };

        successResponse(res, 200, responseData, 'Razorpay order created successfully');
    } catch (error) {
        console.error('[PAYMENT] Error creating Razorpay order:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack
        });
        if (error.message.includes('Razorpay credentials not configured')) {
            return errorResponse(res, 500, 'Payment gateway not configured. Please contact support.');
        }
        if (error.statusCode) {
            return errorResponse(res, error.statusCode, `Razorpay Error: ${error.message}`);
        }
        errorResponse(res, 500, 'Failed to create Razorpay order', error.message);
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return errorResponse(res, 400, 'Missing payment verification details');
        }

        // Generate signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        // Compare signatures
        if (razorpay_signature === expectedSign) {
            successResponse(res, 200, { verified: true }, 'Payment verified successfully');
        } else {
            errorResponse(res, 400, 'Invalid payment signature');
        }
    } catch (error) {
        errorResponse(res, 500, 'Payment verification failed', error.message);
    }
};
