import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        farmerId: {
            type: String,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic', 'Seeds', 'Tools', 'Other'],
        },
        quantity: {
            type: String,
            required: true,
            default: '1 unit',
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        images: [
            {
                type: String,
            },
        ],
        totalSold: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Index for faster searches
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ farmerId: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
