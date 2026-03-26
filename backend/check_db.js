import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const checkDb = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected');

        const productCount = await Product.countDocuments();
        console.log(`Number of products in DB: ${productCount}`);

        if (productCount === 0) {
            console.log('No products found. Seeding sample products...');
            const sampleProducts = [
                {
                    farmerId: 'farmer123',
                    name: 'Fresh Organic Apples',
                    description: 'Crisp and juicy organic apples directly from the orchard.',
                    price: 2.99,
                    category: 'Fruits',
                    stock: 50,
                    quantity: 'per kg',
                    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6']
                },
                {
                    farmerId: 'farmer123',
                    name: 'Carrots',
                    description: 'Freshly harvested carrots, rich in beta-carotene.',
                    price: 1.49,
                    category: 'Vegetables',
                    stock: 100,
                    quantity: 'per bunch',
                    images: ['https://images.unsplash.com/photo-1590868309235-ea34bed7bd1f']
                },
                 {
                    farmerId: 'farmer123',
                    name: 'Whole Grain Bread',
                    description: 'Nutritious whole grain bread baked daily.',
                    price: 3.50,
                    category: 'Grains',
                    stock: 20,
                    quantity: 'per loaf',
                    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff']
                },
                {
                    farmerId: 'farmer123',
                    name: 'Organic Milk',
                    description: 'Fresh organic milk from grass-fed cows.',
                    price: 4.00,
                    category: 'Dairy',
                    stock: 30,
                    quantity: 'per liter',
                    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b']
                },
                {
                     farmerId: 'farmer456',
                    name: 'Spinach',
                    description: 'Leafy green spinach, perfect for salads and cooking.',
                    price: 2.00,
                    category: 'Vegetables',
                    stock: 60,
                    quantity: 'per bunch',
                    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb']
                 },
                 {
                    farmerId: 'farmer456',
                    name: 'Strawberries',
                    description: 'Sweet and ripe strawberries.',
                    price: 3.99,
                    category: 'Fruits',
                    stock: 40,
                    quantity: 'per box',
                    images: ['https://images.unsplash.com/photo-1464965911861-746a04b4b0ae']
                 },
                 {
                    farmerId: 'farmer789',
                    name: 'Quinoa',
                    description: 'High-protein quinoa, a healthy grain alternative.',
                    price: 5.50,
                    category: 'Grains',
                    stock: 25,
                    quantity: 'per bag',
                    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c']
                 },
                 {
                    farmerId: 'farmer789',
                    name: 'Chicken Eggs',
                    description: 'Free-range chicken eggs.',
                    price: 4.50,
                    category: 'Dairy',
                    stock: 80,
                    quantity: 'per dozen',
                    images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03']
                 }

            ];
            await Product.insertMany(sampleProducts);
            console.log('Sample products seeded successfully.');
        } else {
             const products = await Product.find().limit(5);
             console.log('Sample products:', JSON.stringify(products, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
