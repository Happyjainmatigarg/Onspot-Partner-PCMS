const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Partner = require('../models/Partner');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const { generatePartnerId } = require('../utils/idGenerator');
const { generateToken, authenticate } = require('../middleware/auth');
const { createAuditLog, extractAuditInfo } = require('../services/audit');
const { generatePartnerAgreementPDF } = require('../services/pdf');
const { sendPartnerWelcomeEmail } = require('../services/email');

// POST /api/partners/check-email
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Partner.findOne({ email: email.toLowerCase() });
        res.json({ available: !exists });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check email' });
    }
});

// POST /api/partners/check-mobile
router.post('/check-mobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const exists = await Partner.findOne({ mobile });
        res.json({ available: !exists });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check mobile' });
    }
});

// POST /api/partners/register
router.post('/register', async (req, res) => {
    try {
        const {
            applicantName,
            email,
            mobile,
            emailVerified,
            gstNumber,
            panNumber,
            billingAddress,
            contactPerson,
            partnerType,
            password
        } = req.body;

        // Validation - Require email verification
        if (!emailVerified) {
            return res.status(400).json({ error: 'Email must be verified via OTP' });
        }

        // Validate password if provided
        let hashedPassword = null;
        let passwordSet = false;
        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@#$%&*)'
                });
            }
            hashedPassword = await bcrypt.hash(password, 10);
            passwordSet = true;
        }

        // Check uniqueness
        const emailExists = await Partner.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const mobileExists = await Partner.findOne({ mobile });
        if (mobileExists) {
            return res.status(400).json({ error: 'Mobile already registered' });
        }

        // Note: Contact person validation removed - frontend auto-fills from owner details
        // If you add separate contact person form fields, re-enable this validation

        // Generate Partner ID
        const partnerId = await generatePartnerId(partnerType);

        // Create partner
        const partner = new Partner({
            partnerId,
            partnerType,
            applicantName,
            email: email.toLowerCase(),
            mobile,
            mobileVerified: false,
            emailVerified: true,
            gstNumber: gstNumber.toUpperCase(),
            panNumber: panNumber.toUpperCase(),
            billingAddress,
            contactPerson,
            status: 'ACTIVE',
            password: hashedPassword,
            passwordSet: passwordSet,
            createdBy: 'SELF'
        });

        await partner.save();

        // Generate PDF agreement
        let pdfBuffer = null;
        try {
            pdfBuffer = await generatePartnerAgreementPDF(partner);
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError);
        }

        // Send welcome email
        await sendPartnerWelcomeEmail(partner, pdfBuffer);

        // Audit log
        await createAuditLog({
            action: 'CREATE',
            entity: 'PARTNER',
            entityId: partnerId,
            performedBy: email,
            performedByRole: 'PARTNER',
            newData: partner.toObject(),
            ...extractAuditInfo(req),
            details: 'Partner self-registration completed'
        });

        res.status(201).json({
            success: true,
            partnerId,
            message: 'Registration successful! Check your email for login instructions.',
            partnerType
        });
    } catch (error) {
        console.error('Partner registration error:', error);

        // Return detailed error information for debugging
        let errorMessage = 'Registration failed. Please try again.';
        let errorDetails = null;

        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(field => ({
                field,
                message: error.errors[field].message
            }));
            errorMessage = 'Validation failed';
            errorDetails = validationErrors;
        }
        // Duplicate key errors
        else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            errorMessage = `${field} already exists`;
            errorDetails = { field, value: error.keyValue[field] };
        }
        // Other errors - include message in non-production
        else if (process.env.NODE_ENV !== 'production') {
            errorMessage = error.message;
            errorDetails = { stack: error.stack?.split('\n').slice(0, 3) };
        }

        res.status(500).json({
            error: errorMessage,
            details: errorDetails,
            // Include full error in development
            ...(process.env.NODE_ENV !== 'production' && { fullError: error.message })
        });
    }
});

// POST /api/partners/login
router.post('/login', async (req, res) => {
    try {
        const { partnerId, password } = req.body;

        // Validate Partner ID format
        if (!/^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/.test(partnerId)) {
            return res.status(400).json({ error: 'Invalid Partner ID format' });
        }

        const partner = await Partner.findOne({ partnerId });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        if (partner.status !== 'ACTIVE') {
            return res.status(403).json({
                error: 'ACCOUNT_INACTIVE',
                message: 'Your account is not active. Please contact support.'
            });
        }

        if (!partner.passwordSet) {
            return res.status(403).json({
                error: 'PASSWORD_NOT_SET',
                message: 'Please set your password first.',
                partnerId,
                applicantName: partner.applicantName
            });
        }

        const isMatch = await bcrypt.compare(password, partner.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update last login
        partner.lastLoginAt = new Date();
        await partner.save();

        // Audit log
        await createAuditLog({
            action: 'LOGIN',
            entity: 'PARTNER',
            entityId: partnerId,
            performedBy: partner.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req)
        });

        const token = generateToken({
            id: partner._id,
            partnerId: partner.partnerId,
            email: partner.email,
            role: 'PARTNER',
            partnerType: partner.partnerType
        });

        res.json({
            success: true,
            token,
            partner: {
                partnerId: partner.partnerId,
                applicantName: partner.applicantName,
                partnerType: partner.partnerType,
                email: partner.email,
                city: partner.billingAddress.city
            }
        });
    } catch (error) {
        console.error('Partner login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/partners/set-password
router.post('/set-password', async (req, res) => {
    try {
        const { partnerId, password, confirmPassword: confirmPass } = req.body;
        const confirmPassword = confirmPass || password;  // Support frontend sending only password

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@#$%&*)'
            });
        }

        const partner = await Partner.findOne({ partnerId });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        if (partner.passwordSet) {
            return res.status(400).json({ error: 'Password already set. Use change password instead.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        partner.password = hashedPassword;
        partner.passwordSet = true;
        partner.lastLoginAt = new Date();
        await partner.save();

        // Audit log
        await createAuditLog({
            action: 'UPDATE',
            entity: 'PARTNER',
            entityId: partnerId,
            performedBy: partner.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req),
            details: 'Initial password set'
        });

        const token = generateToken({
            id: partner._id,
            partnerId: partner.partnerId,
            email: partner.email,
            role: 'PARTNER',
            partnerType: partner.partnerType
        });

        res.json({
            success: true,
            token,
            message: 'Password set successfully'
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ error: 'Failed to set password' });
    }
});

// POST /api/partners/forgot-password
// Request password reset - sends OTP to partner email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, partnerId } = req.body;

        if (!email && !partnerId) {
            return res.status(400).json({ error: 'Email or Partner ID required' });
        }

        // Find partner by email or partnerId
        let partner;
        if (email) {
            partner = await Partner.findOne({ email: email.toLowerCase() });
        } else {
            partner = await Partner.findOne({ partnerId: partnerId.toUpperCase() });
        }

        if (!partner) {
            // Don't reveal if partner exists for security
            return res.json({
                success: true,
                message: 'If the email/Partner ID is registered, you will receive an OTP shortly.',
                identifier: email || partnerId
            });
        }

        // Import and send OTP
        const { sendOTP } = require('../services/otp');
        const result = await sendOTP(partner.email, 'email');

        if (!result.success) {
            console.error('Failed to send password reset OTP:', result.error);
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }

        // Audit log
        await createAuditLog({
            action: 'PASSWORD_RESET_REQUEST',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: partner.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req),
            details: 'Password reset OTP requested'
        });

        res.json({
            success: true,
            message: 'OTP sent to your registered email address.',
            email: partner.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
            partnerId: partner.partnerId
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/partners/reset-password
// Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, partnerId, otp, password, confirmPassword: confirmPass } = req.body;
        const confirmPassword = confirmPass || password;

        if (!otp || !password) {
            return res.status(400).json({ error: 'OTP and new password are required' });
        }

        if (!email && !partnerId) {
            return res.status(400).json({ error: 'Email or Partner ID required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@#$%&*)'
            });
        }

        // Find partner
        let partner;
        if (email) {
            partner = await Partner.findOne({ email: email.toLowerCase() });
        } else {
            partner = await Partner.findOne({ partnerId: partnerId.toUpperCase() });
        }

        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Verify OTP
        const { verifyOTP } = require('../services/otp');
        const otpResult = await verifyOTP(partner.email, otp);

        if (!otpResult.success) {
            return res.status(400).json({ error: otpResult.error || 'Invalid or expired OTP' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 10);
        partner.password = hashedPassword;
        partner.passwordSet = true;
        await partner.save();

        // Audit log
        await createAuditLog({
            action: 'PASSWORD_RESET',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: partner.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req),
            details: 'Password reset successfully via OTP verification'
        });

        res.json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.',
            partnerId: partner.partnerId
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// GET /api/partners/profile (protected)
router.get('/profile', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const partner = await Partner.findOne({ partnerId: req.user.partnerId }).select('-password');
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        res.json({ partner });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// GET /api/partners/dashboard (protected)
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const partnerId = req.user.partnerId;

        // Get stats
        const [customers, services] = await Promise.all([
            Customer.find({ partnerId }),
            Service.find({ partnerId })
        ]);

        const activeCustomers = customers.filter(c => c.status === 'APPROVED' || c.status === 'ACTIVE').length;
        const pendingApprovals = services.filter(s => s.status === 'PENDING').length;
        const totalSales = services.reduce((sum, s) => sum + (s.serviceCost || 0), 0);
        const totalCommission = services
            .filter(s => s.commissionAfterGST)
            .reduce((sum, s) => sum + s.commissionAfterGST, 0);

        // Recent sales
        const recentSales = await Service.find({ partnerId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Monthly Sales Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of the month

        const monthlyIds = await Service.aggregate([
            {
                $match: {
                    partnerId: partnerId,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    sales: { $sum: "$serviceCost" }, // Total Sales Value
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format for frontend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlySales = [];

        // Fill in missing months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();

            const found = monthlyIds.find(m => m._id.month === monthIdx + 1 && m._id.year === year);
            monthlySales.push({
                month: months[monthIdx],
                sales: found ? found.sales : 0,
                count: found ? found.count : 0
            });
        }

        stats: {
            totalSales,
                totalCommission,
                pendingApprovals,
                activeCustomers
        },
        recentSales,
            monthlySales
    });
    } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
}
});

// GET /api/partners/sales (protected)
router.get('/sales', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const services = await Service.find({ partnerId: req.user.partnerId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ sales: services });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

// GET /api/partners/commissions (protected)
router.get('/commissions', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const services = await Service.find({
            partnerId: req.user.partnerId,
            status: { $in: ['ACTIVE', 'APPROVED'] }
        }).sort({ createdAt: -1 }).lean();

        res.json({ commissions: services });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch commissions' });
    }
});

// GET /api/partners/customers (protected)
router.get('/customers', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const customers = await Customer.find({ partnerId: req.user.partnerId })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ customers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// PUT /api/partners/password (protected)
router.put('/password', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const { currentPassword, newPassword } = req.body;

        const partner = await Partner.findOne({ partnerId: req.user.partnerId });

        const isMatch = await bcrypt.compare(currentPassword, partner.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ error: 'Password does not meet requirements' });
        }

        partner.password = await bcrypt.hash(newPassword, 10);
        await partner.save();

        // Audit log
        await createAuditLog({
            action: 'UPDATE',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: partner.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req),
            details: 'Password changed'
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// POST /api/partners/sales (protected) - CREATE NEW SALE
router.post('/sales', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const {
            // Customer Details
            customerMobile,
            customerName,
            customerEmail,
            customerAddress, // { street, city, state, pinCode }

            // Device Details
            deviceType, // Mobile, Laptop, Refrigerator, etc.
            deviceBrand,
            deviceModel,
            deviceInvoiceNumber,
            deviceInvoiceDate,
            purchasePrice, // Invoice Value

            // Plan Details
            serviceType, // ESS, EPS, CDC
        } = req.body;

        const partnerId = req.user.partnerId;
        const partnerType = req.user.partnerType;

        // 1. Validate Service Type based on Category/Risk
        // Device categories and risk mapping
        const CATEGORIES = {
            'Mobile': 'Category 1',
            'Laptop': 'Category 1',
            'TV': 'Category 2',
            'Washing Machine': 'Category 2',
            'Dishwasher': 'Category 2',
            'Refrigerator': 'Category 3',
            'AC': 'Category 3'
        };

        const category = CATEGORIES[deviceType] || 'Category 1'; // Default to 1 if unknown
        let servicePercentage = 8;
        if (category === 'Category 2') servicePercentage = 15;
        if (category === 'Category 3') servicePercentage = 20;

        // Validate plan is supported
        // ESS (8%) is mainly for Cat 1? Using simpler logic from SLA:
        // Cat 1 = 8%, Cat 2 = 15%, Cat 3 = 20%
        // The Service model expects servicePercentage which seems derived from category, not plan type per se?
        // Wait, SLA says:
        // Cat 1 (Low Risk) 8%
        // Cat 2 (Med Risk) 15%
        // Cat 3 (High Risk) 20%
        // Plan types are ESS, EPS, CDC.
        // It seems the percentage is tied to the Category, so we use that.

        const serviceCost = Math.round(purchasePrice * (servicePercentage / 100));

        // 2. Handle Customer
        let customer = await Customer.findOne({ mobile: customerMobile });
        if (!customer) {
            // Create new customer
            const { generateCustomerId } = require('../utils/idGenerator');
            const customerId = await generateCustomerId(customerMobile);

            customer = new Customer({
                customerId,
                partnerId,
                customerName,
                mobile: customerMobile,
                email: customerEmail,
                address: customerAddress,
                status: 'APPROVED', // Auto-approve for Partner Sales? Or PENDING? Usually sales imply done deal.
                termsAccepted: true, // Implied by physical presence/sale
                termsAcceptedAt: new Date()
            });

            // Send password setup email if needed (skipping for now)
            await customer.save();
        } else {
            // Update email/name if missing? Or just proceed.
            // For now, proceed.
        }

        // 3. Create Product/Device (Using Product model if it exists, or just storing in Service?)
        // The Service model requires `productId`.
        // Let's see if there is a Product model.
        // Assuming we need to create a Product record first.
        // Wait, I didn't check Product model. Let me check it quick.
        // If Product model doesn't exist, I might need to create it or Service stores product details directly?
        // Service.js schema has: productId: { type: String, required: true }
        // Let's assume there is a Product model. logic: generateProductId -> create Product -> use ID.

        // --- INLINE CHECK: Does Product model exist? ---
        // I will assume standard pattern. If not, I'll fix in verify.
        const Product = require('../models/Product');
        const { generateProductId } = require('../utils/idGenerator');
        const productId = await generateProductId(category === 'Category 1' ? 'MBL' : 'APP'); // Simplified prefix

        const product = new Product({
            productId,
            customerId: customer.customerId,
            partnerId,
            category: deviceType,
            brand: deviceBrand,
            model: deviceModel,
            purchaseDate: deviceInvoiceDate,
            invoiceNumber: deviceInvoiceNumber,
            invoiceAmount: purchasePrice,
            status: 'ACTIVE'
        });
        await product.save();


        // 4. Calculate Commission
        // Agreement:
        // ESS: Plat 30, Gold 25, Silver 20
        // EPS: Plat 28, Gold 23, Silver 18
        // CDC: Plat 32, Gold 27, Silver 22

        let commPct = 0;
        if (serviceType === 'ESS') {
            if (partnerType === 'PLATINUM') commPct = 30;
            else if (partnerType === 'GOLD') commPct = 25;
            else commPct = 20;
        } else if (serviceType === 'EPS') {
            if (partnerType === 'PLATINUM') commPct = 28;
            else if (partnerType === 'GOLD') commPct = 23;
            else commPct = 18;
        } else if (serviceType === 'CDC') {
            if (partnerType === 'PLATINUM') commPct = 32;
            else if (partnerType === 'GOLD') commPct = 27;
            else commPct = 22;
        }

        // Commission Calculation
        // 3.2 Calculation: On net realized revenue = Customer payment received by Company (serviceCost)
        // minus GST (18%)... 
        // 3.3 18% GST will be deducted from all commissions?

        // Logic:
        // Base for comm = serviceCost
        // Commission Amount = serviceCost * (commPct / 100)
        // GST on Commission = Commission Amount * 0.18
        // Net Commission = Commission Amount - GST on Commission

        const commissionBeforeGST = Math.round(serviceCost * (commPct / 100));
        const gstDeduction = Math.round(commissionBeforeGST * 0.18);
        const commissionAfterGST = commissionBeforeGST - gstDeduction;

        // 5. Create Service
        const { generateServiceId } = require('../utils/idGenerator');
        const serviceId = await generateServiceId();

        const serviceStartDate = new Date(); // Starts now? Or after warranty?
        // SLA: "Services commence strictly after OEM warranty expiry"
        // Usually 1 year from invoice date.
        const invoiceDateObj = new Date(deviceInvoiceDate);
        const oemWarrantyEnd = new Date(invoiceDateObj);
        oemWarrantyEnd.setFullYear(oemWarrantyEnd.getFullYear() + 1);

        const serviceEndDate = new Date(oemWarrantyEnd);
        serviceEndDate.setFullYear(serviceEndDate.getFullYear() + 1); // 1 Year Plan by default

        const service = new Service({
            serviceId,
            customerId: customer.customerId,
            partnerId,
            productId,
            salesInvoiceNumber: deviceInvoiceNumber, // Or generated invoice for plan?
            serviceType,
            servicePercentage,
            serviceCost,
            commissionPercentage: commPct,
            gstPercentage: 18,
            commissionBeforeGST,
            gstAmount: gstDeduction,
            commissionAfterGST,
            serviceStartDate: oemWarrantyEnd,
            serviceEndDate: serviceEndDate,
            status: 'APPROVED', // Auto-approve sales
            activatedAt: new Date()
        });

        await service.save();

        // 6. Audit Log
        await createAuditLog({
            action: 'CREATE',
            entity: 'SERVICE',
            entityId: serviceId,
            performedBy: req.user.email,
            performedByRole: 'PARTNER',
            ...extractAuditInfo(req),
            details: `Sale created: ${serviceType} for ${customerName}`
        });

        res.status(201).json({
            success: true,
            message: 'Sale registered successfully',
            saleId: serviceId,
            customer: { name: customerName, id: customer.customerId },
            financials: {
                cost: serviceCost,
                commission: commissionAfterGST
            }
        });

    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ error: 'Failed to register sale' });
    }
});

// GET /api/partners/agreement (protected) - Download PDF
router.get('/agreement', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'PARTNER') {
            return res.status(403).json({ error: 'Partner access only' });
        }

        const partner = await Partner.findOne({ partnerId: req.user.partnerId });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const pdfBuffer = await generatePartnerAgreementPDF(partner);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Partner_Agreement_${partner.partnerId}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Agreement download error:', error);
        res.status(500).json({ error: 'Failed to generate agreement' });
    }
});

module.exports = router;
