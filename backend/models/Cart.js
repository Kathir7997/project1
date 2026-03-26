import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        consumerId: {
            type: String,
            required: true,
            ref: 'User',
            unique: true, // One cart per user
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                farmerId: {
                    type: String,
                    required: true,
                    ref: 'User',
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
