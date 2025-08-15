// Load environment variables first, before any other imports
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Validate critical environment variables
const criticalEnvVars = [
    'MONGODB_URI',
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

const missingCriticalEnvVars = criticalEnvVars.filter(envVar => !process.env[envVar]);
if (missingCriticalEnvVars.length > 0) {
    console.error('❌ Missing critical environment variables:', missingCriticalEnvVars);
    console.error('Please check your .env file');
    process.exit(1);
}

// Check optional environment variables and log warnings
const optionalEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CURRENCY'
];

const missingOptionalEnvVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
if (missingOptionalEnvVars.length > 0) {
    console.warn('⚠️ Missing optional environment variables:', missingOptionalEnvVars);
    console.warn('Cloudinary features will be disabled');
}

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Connect to services
const startServer = async () => {
    try {
        await connectDB();
        
        // Only connect to Cloudinary if all required env vars are present
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET) {
            await connectCloudinary();
        } else {
            console.warn('⚠️ Cloudinary connection skipped - missing environment variables');
        }
        
        // Middlewares
        app.use(cors());
        
        // Stripe webhook must receive the raw body for signature verification
        app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);
        
        // JSON parser for the rest of the API
        app.use(express.json());
        app.use(clerkMiddleware());

        // Routes
        app.get('/', (req, res) => res.send("API working"));

        app.post('/clerk', express.json(), clerkWebhooks);
        app.use('/api/educator', express.json(), educatorRouter);
        app.use('/api/courses', express.json(), courseRouter);
        app.use('/api/user', express.json(), userRouter);

        // Port
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌐 API available at http://localhost:${PORT}`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (missingOptionalEnvVars.length > 0) {
                console.log(`⚠️ Cloudinary features disabled due to missing env vars`);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();