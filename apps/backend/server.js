require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security middleware
const { xssSanitizer, requestLogger, securityHeaders, mongoSanitize } = require('./middleware/security');

// Route imports
const otpRoutes = require('./routes/otp');
const partnerRoutes = require('./routes/partners');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const erpRoutes = require('./routes/admin/erp');

// Model imports for seeding
const SystemSetting = require('./models/SystemSetting');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const { generateAdminId } = require('./utils/idGenerator');
const { verifyCommissionEngine } = require('./services/commission');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.onspot.one"],
            connectSrc: ["'self'", "https://*.onspot.one", "https://api.razorpay.com"],
            frameSrc: ["'self'", "https://api.razorpay.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://partner.onspot.one',
        'https://customer.onspot.one',
        'https://onspotapp.onspot.one'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware stack
app.use(securityHeaders);
app.use(requestLogger);
app.use(xssSanitizer);
app.use(mongoSanitize);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later.' }
});
app.use('/api/partners/login', authLimiter);
app.use('/api/customers/login', authLimiter);
app.use('/api/admin/login', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'OnSpot Backend API'
    });
});

// API Routes
app.use('/api/otp', otpRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/erp', erpRoutes);
app.use('/api/push', require('./routes/push'));

// Root route
app.get('/api', (req, res) => {
    res.json({
        message: 'OnSpot™ Ecosystem API',
        version: '1.0.0',
        company: 'Ccommerce Ecosystem Pvt. Ltd.',
        endpoints: {
            health: '/api/health',
            otp: '/api/otp',
            partners: '/api/partners',
            customers: '/api/customers',
            admin: '/api/admin'
        }
    });
});

// Error handling middleware — never leak stack traces in production
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        error: isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
        ...(isProduction ? {} : { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Database connection and seeding
async function seedDatabase() {
    try {
        // Seed system settings
        await SystemSetting.seedDefaults();

        // Create default super admin if none exists
        const adminExists = await Admin.findOne({ role: 'SUPER_ADMIN' });
        if (!adminExists) {
            const adminId = generateAdminId();
            const hashedPassword = await bcrypt.hash('Admin@123', 10);

            await Admin.create({
                adminId,
                name: 'Super Admin',
                email: 'admin@onspot.one',
                mobile: '9999999999',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                createdBy: 'SYSTEM'
            });

            console.log('Default SUPER_ADMIN created:');
            console.log('  Email: admin@onspot.one');
            console.log('  Password: Admin@123');
        }

        // Verify commission engine
        await verifyCommissionEngine();

    } catch (error) {
        console.error('Database seeding error:', error);
    }
}

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onspot_ecosystem';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✓ Connected to MongoDB');
        console.log(`  Database: ${mongoose.connection.db.databaseName}`);

        await seedDatabase();

        app.listen(PORT, () => {
            console.log(`✓ OnSpot Backend API running on port ${PORT}`);
            console.log(`  Health: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing server...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
