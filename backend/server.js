import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// CORS Configuration - Allow requests from specified frontend origin
const corsOptions = {
    // In production: use FRONTEND_URL_PRODUCTION if available, otherwise use FRONTEND_URL
    // In development: use FRONTEND_URL (localhost:5173)
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'https://agricart7997.vercel.app',
            process.env.FRONTEND_URL_PRODUCTION,
            // Also allow Vercel deployment URLs
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
        ].filter(Boolean); // Remove undefined values

        // For development: allow all origins (set ALLOW_ALL_ORIGINS=true)
        if (process.env.ALLOW_ALL_ORIGINS === 'true') {
            console.log('[CORS] ⚠️  All origins allowed (development mode)');
            callback(null, true);
            return;
        }

        // For production: strict origin checking
        if (!origin || allowedOrigins.includes(origin)) {
            console.log(`[CORS] ✓ Request from allowed origin: ${origin || 'same-origin'}`);
            callback(null, true);
        } else {
            console.warn(`[CORS] ✗ Blocked request from origin: ${origin}`);
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/cart', cartRoutes);
app.use('/uploads', express.static('uploads'));

// Root route for backend health checking (important for Render)
app.get('/', (req, res) => {
    res.send('Agricart Backend API is running successfully.');
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ status: 'success', message: 'Backend connected to frontend successfully!' });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
