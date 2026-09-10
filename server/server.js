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
    console.error('Please check your environment variables in Vercel');
    // Don't exit in serverless environment, just log the error
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
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

// Initialize services
let isInitialized = false;

const initializeServices = async () => {
    if (isInitialized) return;
    
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
        
        isInitialized = true;
        console.log('✅ Services initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize services:', error);
        throw error;
    }
};

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (process.env.NODE_ENV === 'production') {
            const allowed = process.env.FRONTEND_URL;
            return callback(null, !allowed || origin === allowed);
        }

        // Local dev: reflect any localhost origin back
        if (/^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, origin);
        }

        callback(null, origin === process.env.FRONTEND_URL ? origin : false);
    },
    credentials: true
}));

// JSON parser for the API
app.use(express.json({ limit: '10mb' }));

// Clerk middleware
app.use(clerkMiddleware());

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: "API working",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Initialize services before handling requests
app.use(async (req, res, next) => {
    try {
        await initializeServices();
        next();
    } catch (error) {
        console.error('❌ Service initialization failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Service initialization failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Webhook routes (must be before other routes)
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);
app.post('/clerk', clerkWebhooks);

// API routes
app.use('/api/educator', educatorRouter);
app.use('/api/courses', courseRouter);
app.use('/api/user', userRouter);

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Export for Vercel
export default app;

// Start server for local development
const PORT = process.env.PORT || 5000;
initializeServices()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/`);
            console.log(`🔗 API base: http://localhost:${PORT}/api/`);
        });
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Stop the other server first, or run:`);
                console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
                process.exit(1);
            }
            throw error;
        });
    })
    .catch((error) => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });
