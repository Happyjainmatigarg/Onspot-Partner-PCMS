const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const { createAuditLog, extractAuditInfo } = require('../utils/audit');

// Helper function to generate customer ID
function generateCustomerId(mobile) {
    const timestamp = Date.now().toString().slice(-4);
    return `CUST-${mobile}-${timestamp}`;
}

// POST /api/customers/verify-partner
router.post('/verify-partner', async (req, res) => {
    try {
        const { partnerId } = req.body;
        const Partner = require('../models/Partner');
        const partner = await Partner.findOne({ partnerId, status: 'ACTIVE' });

        if (!partner) {
            return res.json({ valid: false, error: 'Invalid or inactive Partner ID' });
        }

        res.json({
            valid: true,
            partner: {
                partnerId: partner.partnerId,
                applicantName: partner.applicantName,
                city: partner.city
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/customers/calculate-service
router.post('/calculate-service', async (req, res) => {
    try {
        const { deviceValue, serviceType } = req.body;
        const percentages = { ESS: 8, EPS: 15, CDC: 20 };
        const percentage = percentages[serviceType] || 15;
        const serviceCost = Math.round((deviceValue * percentage) / 100);

        res.json({
            serviceCost,
            servicePercentage: percentage,
            deviceValue
        });
    } catch (error) {
        res.status(500).json({ error: 'Calculation failed' });
    }
});

// POST /api/customers/register
router.post('/register', async (req, res) => {
    try {
        const {
            partnerId,
            customerName,
            mobile,
            email,
            address,
            device,
            serviceType,
            termsAccepted
        } = req.body;

        // Validation
        if (!customerName || !mobile || !email || !address || !partnerId) {
            return res.status(400).json({ error: 'All customer fields are required' });
        }

        if (!device || !serviceType) {
            return res.status(400).json({ error: 'Device and service information required' });
        }

        if (!termsAccepted) {
            return res.status(400).json({ error: 'You must accept the terms and conditions' });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            $or: [{ mobile }, { email: email.toLowerCase() }]
        });

        if (existingCustomer) {
            return res.status(400).json({
                error: existingCustomer.mobile === mobile
                    ? 'Mobile number already registered'
                    : 'Email already registered'
            });
        }

        // Generate customer ID
        const customerId = generateCustomerId(mobile);

        // Create new customer
        const customer = new Customer({
            customerId,
            partnerId,
            customerName,
            mobile,
            email: email.toLowerCase(),
            address,
            termsAccepted,
            termsAcceptedAt: new Date(),
            status: 'PENDING'
        });

        await customer.save();

        // Create service record
        const percentages = { ESS: 8, EPS: 15, CDC: 20 };
        const percentage = percentages[serviceType] || 15;
        const serviceCost = Math.round((parseFloat(device.purchaseValue) * percentage) / 100);

        const serviceId = `SRV-${customerId}-${Date.now().toString().slice(-6)}`;
        const service = new Service({
            serviceId,
            customerId,
            partnerId,
            productType: device.productType,
            brand: device.brand,
            model: device.model,
            serialNumber: device.serialNumber,
            purchaseValue: parseFloat(device.purchaseValue),
            purchaseDate: new Date(device.purchaseDate),
            serviceType,
            serviceCost,
            status: 'PENDING'
        });

        await service.save();

        await createAuditLog({
            action: 'CUSTOMER_SERVICE_REGISTER',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req),
            details: `Customer+Service registration: ${customerName}, ${device.brand} ${device.model}, ${serviceType}`
        });

        res.status(201).json({
            success: true,
            customerId,
            serviceId,
            message: 'Registration successful. Your account is pending approval.'
        });
    } catch (error) {
        console.error('Customer registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
    try {
        const { customerId, password } = req.body;

        if (!customerId || !password) {
            return res.status(400).json({ error: 'Customer ID and password are required' });
        }

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(401).json({ error: 'Invalid customer ID or password' });
        }

        // Check if account is approved
        if (customer.status === 'PENDING') {
            return res.status(403).json({ error: 'Account pending approval' });
        }

        if (customer.status === 'REJECTED') {
            return res.status(403).json({ error: 'Account has been rejected' });
        }

        // Check if password is set
        if (!customer.passwordSet || !customer.password) {
            return res.status(403).json({
                error: 'PASSWORD_NOT_SET',
                customerName: customer.customerName
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, customer.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid customer ID or password' });
        }

        // Generate JWT token
        const token = generateToken({
            id: customer._id,
            customerId: customer.customerId,
            partnerId: customer.partnerId,
            email: customer.email,
            role: 'CUSTOMER'
        });

        await createAuditLog({
            action: 'CUSTOMER_LOGIN',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: customer.email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req),
            details: 'Customer login successful'
        });

        res.json({
            success: true,
            token,
            customer: {
                customerId: customer.customerId,
                customerName: customer.customerName,
                email: customer.email,
                mobile: customer.mobile
            }
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// POST /api/customers/set-password
router.post('/set-password', async (req, res) => {
    try {
        const { customerId, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customer.status !== 'APPROVED' && customer.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account not approved yet' });
        }

        customer.password = await bcrypt.hash(password, 10);
        customer.passwordSet = true;
        customer.status = 'ACTIVE';
        await customer.save();

        const token = generateToken({
            id: customer._id,
            customerId: customer.customerId,
            partnerId: customer.partnerId,
            email: customer.email,
            role: 'CUSTOMER'
        });

        res.json({ success: true, token, message: 'Password set successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to set password' });
    }
});

// POST /api/customers/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { customerId, contactMethod, mobile, email } = req.body;

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Verify contact method matches
        if (contactMethod === 'mobile' && customer.mobile !== mobile) {
            return res.status(400).json({ error: 'Mobile number does not match records' });
        }
        if (contactMethod === 'email' && customer.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ error: 'Email does not match records' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        customer.passwordResetToken = otp;
        customer.passwordResetExpiry = otpExpiry;
        await customer.save();

        // Send OTP via OTP service
        try {
            const { sendOTP } = require('../services/otp');
            await sendOTP({
                identifier: contactMethod === 'mobile' ? customer.mobile : customer.email,
                type: contactMethod === 'mobile' ? 'SMS' : 'EMAIL',
                otp,
                purpose: 'PASSWORD_RESET'
            });
        } catch (otpError) {
            console.error('OTP sending failed:', otpError);
            // Continue anyway - OTP is saved in DB
        }

        await createAuditLog({
            action: 'PASSWORD_RESET_REQUEST',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: customer.email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req),
            details: `Password reset requested via ${contactMethod}`
        });

        res.json({
            success: true,
            message: `Verification code sent to your ${contactMethod}`
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// POST /api/customers/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { customerId, otp, newPassword } = req.body;

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Verify OTP
        if (!customer.passwordResetToken || customer.passwordResetToken !== otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date() > customer.passwordResetExpiry) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // Validate new password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        // Update password
        customer.password = await bcrypt.hash(newPassword, 10);
        customer.passwordSet = true;
        customer.passwordResetToken = undefined;
        customer.passwordResetExpiry = undefined;
        await customer.save();

        await createAuditLog({
            action: 'PASSWORD_RESET',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: customer.email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req),
            details: 'Password reset completed successfully'
        });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// GET /api/customers/portal (protected)
router.get('/portal', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'CUSTOMER') {
            return res.status(403).json({ error: 'Customer access only' });
        }

        const customer = await Customer.findOne({ customerId: req.user.customerId }).select('-password');
        const services = await Service.find({ customerId: req.user.customerId });

        const activeServices = services.filter(s => s.status === 'ACTIVE').length;
        const validUntil = services
            .filter(s => s.serviceEndDate)
            .sort((a, b) => new Date(b.serviceEndDate) - new Date(a.serviceEndDate))[0]?.serviceEndDate;

        res.json({
            customer,
            stats: {
                activeServices,
                serviceClaims: 0, // Placeholder
                validUntil
            },
            services
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portal data' });
    }
});

// GET /api/customers/services (protected)
router.get('/services', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'CUSTOMER') {
            return res.status(403).json({ error: 'Customer access only' });
        }

        const services = await Service.find({ customerId: req.user.customerId }).lean();

        // Enrich with product data
        const products = await Product.find({
            productId: { $in: services.map(s => s.productId) }
        }).lean();

        const productMap = products.reduce((acc, p) => {
            acc[p.productId] = p;
            return acc;
        }, {});

        const enrichedServices = services.map(s => ({
            ...s,
            product: productMap[s.productId]
        }));

        res.json({ services: enrichedServices });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// PUT /api/customers/change-password (protected)
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const customer = await Customer.findOne({ customerId: req.user.customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*])[A-Za-z\d@#$%&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        await createAuditLog({
            action: 'UPDATE',
            entity: 'CUSTOMER',
            entityId: customer.customerId,
            performedBy: customer.email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req),
            details: 'Password changed by user'
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

module.exports = router;
