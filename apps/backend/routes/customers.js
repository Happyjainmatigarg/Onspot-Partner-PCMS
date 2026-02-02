const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Partner = require('../models/Partner');
const { generateCustomerId, generateProductId, generateServiceId } = require('../utils/idGenerator');
const { generateToken, authenticate } = require('../middleware/auth');
const { createAuditLog, extractAuditInfo } = require('../services/audit');
const { sendCustomerPendingEmail } = require('../services/email');
const { SERVICE_PERCENTAGES } = require('../services/commission');

// POST /api/customers/verify-partner
router.post('/verify-partner', async (req, res) => {
    try {
        const { partnerId } = req.body;

        if (!/^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/.test(partnerId)) {
            return res.status(400).json({
                valid: false,
                error: 'Invalid Partner ID format'
            });
        }

        const partner = await Partner.findOne({ partnerId, status: 'ACTIVE' });

        if (!partner) {
            return res.status(404).json({
                valid: false,
                error: 'Partner not found or inactive'
            });
        }

        res.json({
            valid: true,
            partner: {
                partnerId: partner.partnerId,
                applicantName: partner.applicantName,
                city: partner.billingAddress.city,
                partnerType: partner.partnerType
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify partner' });
    }
});

// POST /api/customers/calculate-service
router.post('/calculate-service', async (req, res) => {
    try {
        const { deviceValue, serviceType } = req.body;

        if (!deviceValue || !serviceType) {
            return res.status(400).json({ error: 'Device value and service type required' });
        }

        if (deviceValue < 1000 || deviceValue > 1000000) {
            return res.status(400).json({ error: 'Device value must be between ₹1,000 and ₹10,00,000' });
        }

        const servicePercentage = SERVICE_PERCENTAGES[serviceType];
        if (!servicePercentage) {
            return res.status(400).json({ error: 'Invalid service type' });
        }

        const serviceCost = deviceValue * (servicePercentage / 100);

        res.json({
            deviceValue,
            serviceType,
            servicePercentage,
            serviceCost: Math.round(serviceCost * 100) / 100,
            formattedCost: serviceCost.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
            })
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate service cost' });
    }
});

// POST /api/customers/register
router.post('/register', async (req, res) => {
    try {
        const {
            customerName,
            mobile,
            email,
            address,
            partnerId,
            serviceType,
            device,
            termsAccepted
        } = req.body;

        // Validate terms acceptance
        if (!termsAccepted) {
            return res.status(400).json({ error: 'Terms and conditions must be accepted' });
        }

        // Validate partner exists and is active
        const partner = await Partner.findOne({ partnerId, status: 'ACTIVE' });
        if (!partner) {
            return res.status(400).json({ error: 'Invalid or inactive Partner ID' });
        }

        // Validate device
        if (device.purchaseValue < 1000 || device.purchaseValue > 1000000) {
            return res.status(400).json({ error: 'Device value must be between ₹1,000 and ₹10,00,000' });
        }

        // Check serial number uniqueness
        const serialExists = await Product.findOne({ serialNumber: device.serialNumber });
        if (serialExists) {
            return res.status(400).json({ error: 'Device with this serial number already registered' });
        }

        // Validate purchase date
        const purchaseDate = new Date(device.purchaseDate);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (purchaseDate > now) {
            return res.status(400).json({ error: 'Purchase date cannot be in the future' });
        }
        if (purchaseDate < thirtyDaysAgo) {
            return res.status(400).json({ error: 'Purchase date cannot be more than 30 days old' });
        }

        // Generate IDs
        const customerId = generateCustomerId(mobile);
        const productId = generateProductId();
        const serviceId = generateServiceId();

        // Calculate service cost
        const servicePercentage = SERVICE_PERCENTAGES[serviceType];
        const serviceCost = device.purchaseValue * (servicePercentage / 100);

        // Create customer
        const customer = new Customer({
            customerId,
            partnerId,
            customerName,
            mobile,
            email: email.toLowerCase(),
            address,
            status: 'PENDING',
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            passwordSet: false
        });
        await customer.save();

        // Create product
        const product = new Product({
            productId,
            customerId,
            partnerId,
            productType: device.productType,
            brand: device.brand,
            model: device.model,
            serialNumber: device.serialNumber,
            purchaseValue: device.purchaseValue,
            purchaseDate: purchaseDate
        });
        await product.save();

        // Create service (PENDING - commission calculated on approval)
        const service = new Service({
            serviceId,
            customerId,
            partnerId,
            productId,
            serviceType,
            servicePercentage,
            serviceCost,
            status: 'PENDING'
        });
        await service.save();

        // Send notification email to accounts
        await sendCustomerPendingEmail(customer, product, service, partner);

        // Audit logs
        await createAuditLog({
            action: 'CREATE',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: email,
            performedByRole: 'CUSTOMER',
            newData: customer.toObject(),
            ...extractAuditInfo(req),
            details: 'Customer registration submitted'
        });

        await createAuditLog({
            action: 'CREATE',
            entity: 'PRODUCT',
            entityId: productId,
            performedBy: email,
            performedByRole: 'CUSTOMER',
            newData: product.toObject(),
            ...extractAuditInfo(req)
        });

        await createAuditLog({
            action: 'CREATE',
            entity: 'SERVICE',
            entityId: serviceId,
            performedBy: email,
            performedByRole: 'CUSTOMER',
            newData: service.toObject(),
            ...extractAuditInfo(req)
        });

        res.status(201).json({
            success: true,
            customerId,
            serviceId,
            message: 'Registration submitted successfully. Pending admin approval.',
            serviceCost
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

        if (!/^CUST-[6-9]\d{9}-[A-Z0-9]{4}$/.test(customerId)) {
            return res.status(400).json({ error: 'Invalid Customer ID format' });
        }

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Status checks
        if (customer.status === 'PENDING') {
            return res.status(403).json({
                error: 'UNDER_REVIEW',
                message: 'Your registration is under review. Please wait for approval.'
            });
        }

        if (customer.status === 'REJECTED') {
            return res.status(403).json({
                error: 'REJECTED',
                message: `Registration rejected: ${customer.rejectionReason || 'Please contact support.'}`
            });
        }

        if (!customer.passwordSet) {
            return res.status(403).json({
                error: 'PASSWORD_NOT_SET',
                message: 'Please set your password first.',
                customerId,
                customerName: customer.customerName
            });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Audit log
        await createAuditLog({
            action: 'LOGIN',
            entity: 'CUSTOMER',
            entityId: customerId,
            performedBy: customer.email,
            performedByRole: 'CUSTOMER',
            ...extractAuditInfo(req)
        });

        const token = generateToken({
            id: customer._id,
            customerId: customer.customerId,
            partnerId: customer.partnerId,
            email: customer.email,
            role: 'CUSTOMER'
        });

        res.json({
            success: true,
            token,
            customer: {
                customerId: customer.customerId,
                customerName: customer.customerName,
                email: customer.email
            }
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Login failed' });
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

module.exports = router;
