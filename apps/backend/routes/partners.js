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
            mobileVerified,
            gstNumber,
            panNumber,
            billingAddress,
            contactPerson,
            partnerType
        } = req.body;

        // Validation - Skip OTP verification if Fonoster is not configured
        const fonosterConfigured = process.env.FONOSTER_API_KEY && process.env.FONOSTER_API_SECRET;
        if (!mobileVerified && fonosterConfigured) {
            return res.status(400).json({ error: 'Mobile number must be verified via OTP' });
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

        // Validate contact person differs from applicant
        if (contactPerson.name.toLowerCase() === applicantName.toLowerCase()) {
            return res.status(400).json({ error: 'Contact person name must differ from applicant name' });
        }
        if (contactPerson.mobile === mobile) {
            return res.status(400).json({ error: 'Contact person mobile must differ from owner mobile' });
        }
        if (contactPerson.email.toLowerCase() === email.toLowerCase()) {
            return res.status(400).json({ error: 'Contact person email must differ from owner email' });
        }

        // Generate Partner ID
        const partnerId = await generatePartnerId(partnerType);

        // Create partner
        const partner = new Partner({
            partnerId,
            partnerType,
            applicantName,
            email: email.toLowerCase(),
            mobile,
            mobileVerified: true,
            gstNumber: gstNumber.toUpperCase(),
            panNumber: panNumber.toUpperCase(),
            billingAddress,
            contactPerson,
            status: 'ACTIVE',
            passwordSet: false,
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
        res.status(500).json({ error: 'Registration failed. Please try again.' });
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
        const { partnerId, password, confirmPassword } = req.body;

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

        res.json({
            stats: {
                totalSales,
                totalCommission,
                pendingApprovals,
                activeCustomers
            },
            recentSales
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

module.exports = router;
