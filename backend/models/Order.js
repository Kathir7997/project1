import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        consumerId: {
            type: String,
            required: true,
            ref: 'User',
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                farmerId: {
                    type: String,
                    required: true,
                },
                name: String,
                price: Number,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                image: String,
                status: {
                    type: String,
                    enum: ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
                    default: 'Pending',
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryCharge: {
            type: Number,
            default: 0,
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'upi', 'card', 'netbanking', 'wallet'],
            default: 'cod',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'processing'],
            default: 'pending',
        },
        shippingAddress: {
            fullName: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            addressLine1: {
                type: String,
                required: true,
            },
            addressLine2: String,
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
    },
    { timestamps: true }
);

// Index for faster queries
orderSchema.index({ consumerId: 1 });
orderSchema.index({ 'products.farmerId': 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
