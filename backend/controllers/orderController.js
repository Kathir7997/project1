import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Consumer only)
export const createOrder = async (req, res) => {
    try {
        const {
            products,
            totalAmount,
            deliveryCharge,
            paymentMethod,
            paymentStatus,
            shippingAddress,
            razorpayOrderId,
            razorpayPaymentId,
            upiId
        } = req.body;

        if (!products || products.length === 0) {
            return errorResponse(res, 400, 'Order must contain at least one product');
        }

        if (!shippingAddress) {
            return errorResponse(res, 400, 'Shipping address is required');
        }

        // Validate stock availability
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return errorResponse(res, 404, `Product ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                return errorResponse(res, 400, `Insufficient stock for ${product.name}`);
            }
        }

        // Get user ID from custom auth (stored in localStorage)
        const userId = req.user?.clerkId || req.user?.id || req.body.consumerId;

        const order = await Order.create({
            consumerId: userId,
            products,
            totalAmount,
            deliveryCharge: deliveryCharge || 0,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentStatus || 'pending',
            shippingAddress,
            razorpayOrderId,
            razorpayPaymentId,
            upiId,
        });

        // For COD orders or paid orders, reduce stock immediately
        if (paymentMethod === 'cod' || paymentStatus === 'completed') {
            for (const item of products) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock -= item.quantity;
                    if (product.stock < 0) product.stock = 0;
                    product.totalSold = (product.totalSold || 0) + item.quantity;
                    await product.save();
                }
            }
        }

        // Clear the user's cart after successful order
        await Cart.findOneAndDelete({ consumerId: userId });

        successResponse(res, 201, order, 'Order created successfully');
    } catch (error) {
        console.error('Create order error:', error);
        errorResponse(res, 500, 'Failed to create order', error.message);
    }
};

// @desc    Get consumer orders
// @route   GET /api/orders/consumer/:consumerId
// @access  Private (Consumer only)
export const getConsumerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ consumerId: req.params.consumerId })
            .populate('products.productId')
            .sort('-createdAt');

        successResponse(res, 200, orders, 'Consumer orders fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch consumer orders', error.message);
    }
};

// @desc    Get farmer orders (products they sold)
// @route   GET /api/orders/farmer/:farmerId
// @access  Private (Farmer only)
export const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.params.farmerId;

        // Find all orders that contain products from this farmer
        // Include all payment statuses (COD orders are 'pending', online are 'completed')
        const orders = await Order.find({
            'products.farmerId': farmerId,
        })
            .populate('products.productId')
            .sort('-createdAt');

        // Filter products in each order to show only this farmer's products
        const filteredOrders = orders.map((order) => {
            const farmerProducts = order.products.filter(
                (p) => p.farmerId === farmerId
            );
            return {
                ...order.toObject(),
                products: farmerProducts,
            };
        });

        successResponse(res, 200, filteredOrders, 'Farmer orders fetched successfully');
    } catch (error) {
        console.error('Get farmer orders error:', error);
        errorResponse(res, 500, 'Failed to fetch farmer orders', error.message);
    }
};

// @desc    Update order payment status and reduce stock
// @desc    Update order status (payment or shipping)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
    try {
        const { paymentStatus, razorpayPaymentId, razorpaySignature, orderStatus, productId } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Handle Payment Status Update (Global for order)
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
            if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
            if (razorpaySignature) order.razorpaySignature = razorpaySignature;

            // If payment is completed, reduce stock and update totalSold
            if (paymentStatus === 'completed') {
                for (const item of order.products) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.stock -= item.quantity;
                        product.totalSold += item.quantity;
                        await product.save();
                    }
                }
            }
        }

        // Handle Shipping Status Update (Per Product Item)
        // Farmer can only update status of their own products
        if (orderStatus && productId) {
            // Verify if the user (Farmer) owns this product in the order
            const itemIndex = order.products.findIndex(
                p => p.productId.toString() === productId && p.farmerId === req.user.clerkId
            );

            if (itemIndex === -1 && req.user.role !== 'admin') { // Admin override optional
                return errorResponse(res, 403, 'You can only update status for your own products');
            }

            if (itemIndex !== -1) {
                order.products[itemIndex].status = orderStatus;
            }
        }

        await order.save();

        successResponse(res, 200, order, 'Order status updated successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to update order status', error.message);
    }
};

// @desc    Update payment method for pending COD orders
// @route   PUT /api/orders/:id/payment-method
// @access  Private (Consumer only)
export const updatePaymentMethod = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const { 
            paymentMethod, 
            upiId, 
            razorpayOrderId, 
            razorpayPaymentId, 
            razorpaySignature, 
            markAsCompleted 
        } = req.body;
        const orderId = req.params.id;

        // Validate payment method
        const validMethods = ['cod', 'upi', 'card', 'netbanking', 'wallet'];
        if (!validMethods.includes(paymentMethod)) {
            return errorResponse(res, 400, 'Invalid payment method');
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Only consumer who placed the order can update payment method
        const userId = req.user.clerkId || req.user._id;
        if (order.consumerId !== userId) {
            return errorResponse(res, 403, 'Not authorized to update this order');
        }

        // Only allow updating if order is pending payment
        if (order.paymentStatus !== 'pending') {
            return errorResponse(res, 400, `Cannot update payment method. Order payment status is already ${order.paymentStatus}`);
        }

        // Only allow changing from COD
        if (order.paymentMethod !== 'cod') {
            return errorResponse(res, 400, 'Can only update payment method from Cash on Delivery orders');
        }

        console.log(`[ORDERS] Updating order ${orderId}: changing from ${order.paymentMethod} to ${paymentMethod}`);

        // Update payment method
        order.paymentMethod = paymentMethod;
        
        // Store UPI ID if provided
        if (paymentMethod === 'upi' && upiId) {
            order.upiId = upiId;
            console.log(`[ORDERS] Updated UPI ID: ${upiId}`);
        }

        // Store Razorpay payment details if provided
        if (razorpayOrderId) {
            order.razorpayOrderId = razorpayOrderId;
        }
        if (razorpayPaymentId) {
            order.razorpayPaymentId = razorpayPaymentId;
            console.log(`[ORDERS] Stored Razorpay Payment ID: ${razorpayPaymentId}`);
        }
        if (razorpaySignature) {
            order.razorpaySignature = razorpaySignature;
        }

        // If marked as completed (payment successful), update status and reduce stock
        if (markAsCompleted && markAsCompleted === true) {
            console.log(`[ORDERS] Marking order ${orderId} as completed (payment received)`);
            order.paymentStatus = 'completed';

            // Reduce stock and update totalSold for completed orders
            for (const item of order.products) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        const previousStock = product.stock;
                        product.stock -= item.quantity;
                        if (product.stock < 0) product.stock = 0;
                        product.totalSold = (product.totalSold || 0) + item.quantity;
                        await product.save();
                        
                        console.log(`[ORDERS] Updated product ${product._id}: stock ${previousStock} -> ${product.stock}, sold: ${product.totalSold}`);
                    }
                } catch (productError) {
                    console.error(`[ORDERS] Error updating product stock:`, productError.message);
                }
            }
        } else if (paymentMethod !== 'cod') {
            // For online payments without markAsCompleted, set status to processing
            order.paymentStatus = 'processing';
            console.log(`[ORDERS] Set order to processing status for ${paymentMethod}`);
        }

        await order.save();

        console.log(`[ORDERS] Order ${orderId} updated successfully: method=${order.paymentMethod}, status=${order.paymentStatus}`);
        
        successResponse(res, 200, order, 'Payment method updated successfully');
    } catch (error) {
        console.error('[ORDERS] Update payment method error:', error);
        errorResponse(res, 500, 'Failed to update payment method', error.message);
    }
};
