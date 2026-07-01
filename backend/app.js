import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const app = express();

app.disable('x-powered-by');

const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://agricart7997.vercel.app',
    process.env.FRONTEND_URL_PRODUCTION,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (process.env.ALLOW_ALL_ORIGINS === 'true') {
            callback(null, true);
            return;
        }

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('CORS policy violation'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
};

app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests, please try again later.' },
    })
);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/cart', cartRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Agricart Backend API is running successfully.');
});

app.get('/api/test', (req, res) => {
    res.json({ status: 'success', message: 'Backend connected to frontend successfully!' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
    });
});

app.use(notFound);
app.use(errorHandler);

export default app;