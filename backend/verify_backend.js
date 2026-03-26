import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('Sample product:', JSON.stringify(products[0], null, 2));
        } else {
            console.log('No products found. Seeding basic products...');
            await seedProducts();
        }
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedProducts = async () => {
    const products = [
        {
            farmerId: 'seed_farmer',
            name: 'Fresh Tomatoes',
            description: 'Organic red tomatoes from local farm',
            price: 50,
            category: 'Vegetables',
            stock: 100,
            quantity: '1 kg',
            images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60']
        },
        {
            farmerId: 'seed_farmer',
            name: 'Potatoes',
            description: 'Farm fresh potatoes',
            price: 30,
            category: 'Vegetables',
            stock: 200,
            quantity: '1 kg',
            images: ['https://images.unsplash.com/photo-1518977676605-dcad023188ee?w=500&auto=format&fit=crop&q=60']
        },
        {
            farmerId: 'seed_farmer',
            name: 'Apples',
            description: 'Sweet red apples',
            price: 120,
            category: 'Fruits',
            stock: 50,
            quantity: '1 kg',
            images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60']
        }
    ];
    
    await Product.insertMany(products);
    console.log('Products seeded!');
};

connectDB();
