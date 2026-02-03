const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const Partner = require('../../models/Partner');
const Customer = require('../../models/Customer');
const Service = require('../../models/Service');
const Product = require('../../models/Product');
const AuditLog = require('../../models/AuditLog');
const SystemSetting = require('../../models/SystemSetting');
const { generateAdminId } = require('../../utils/idGenerator');
const { generateToken, authenticate, authorize, requirePermission } = require('../../middleware/auth');
const { createAuditLog, extractAuditInfo } = require('../../services/audit');
const { calculateCommission } = require('../../services/commission');
const { sendCustomerApprovalEmail, sendPartnerWelcomeEmail } = require('../../services/email');
const { generatePartnerAgreementPDF } = require('../../services/pdf');

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        if (admin.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account inactive' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        admin.lastLoginAt = new Date();
        await admin.save();

        await createAuditLog({
            action: 'LOGIN',
            entity: 'ADMIN',
            entityId: admin.adminId,
            performedBy: admin.email,
            performedByRole: admin.role,
            ...extractAuditInfo(req)
        });

        const token = generateToken({
            id: admin._id,
            adminId: admin.adminId,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        });

        res.json({
            success: true,
            token,
            admin: {
                adminId: admin.adminId,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/admin/dashboard/summary
router.get('/dashboard/summary', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const [partners, customers, services] = await Promise.all([
            Partner.find(),
            Customer.find(),
            Service.find()
        ]);

        const totalPartners = partners.length;
        const totalCustomers = customers.length;
        const pendingApprovals = customers.filter(c => c.status === 'PENDING').length;
        const activeServices = services.filter(s => s.status === 'ACTIVE').length;

        const totalRevenue = services
            .filter(s => s.status === 'ACTIVE')
            .reduce((sum, s) => sum + (s.serviceCost || 0), 0);

        const now = new Date();
        const thisMonth = services.filter(s => {
            const d = new Date(s.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const thisMonthRevenue = thisMonth.reduce((sum, s) => sum + (s.serviceCost || 0), 0);
        const thisMonthServices = thisMonth.length;

        const commissionPayable = services
            .filter(s => s.status === 'ACTIVE' && !s.commissionPaid)
            .reduce((sum, s) => sum + (s.commissionAfterGST || 0), 0);

        res.json({
            totalPartners,
            totalCustomers,
            pendingApprovals,
            activeServices,
            totalRevenue,
            thisMonthRevenue,
            thisMonthServices,
            commissionPayable
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});

// GET /api/admin/dashboard/pending-approvals
router.get('/dashboard/pending-approvals', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const pendingCustomers = await Customer.find({ status: 'PENDING' })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Enrich with partner and service data
        const enriched = await Promise.all(pendingCustomers.map(async (customer) => {
            const partner = await Partner.findOne({ partnerId: customer.partnerId }).lean();
            const service = await Service.findOne({ customerId: customer.customerId }).lean();
            const product = await Product.findOne({ customerId: customer.customerId }).lean();

            return {
                ...customer,
                partner: partner ? { partnerId: partner.partnerId, applicantName: partner.applicantName } : null,
                service: service ? { serviceId: service.serviceId, serviceType: service.serviceType, serviceCost: service.serviceCost } : null,
                product: product ? { productType: product.productType, purchaseValue: product.purchaseValue } : null
            };
        }));

        res.json({ pendingApprovals: enriched });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
});

// GET /api/admin/dashboard/recent-activities
router.get('/dashboard/recent-activities', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const activities = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        res.json({ activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// PARTNERS CRUD
router.get('/partners', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { type, status, city, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (type) query.partnerType = type;
        if (status) query.status = status;
        if (city) query['billingAddress.city'] = new RegExp(city, 'i');
        if (search) {
            query.$or = [
                { partnerId: new RegExp(search, 'i') },
                { applicantName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { mobile: new RegExp(search, 'i') }
            ];
        }

        const partners = await Partner.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Partner.countDocuments(query);

        res.json({ partners, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

router.get('/partners/:id', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const partner = await Partner.findOne({ partnerId: req.params.id }).select('-password').lean();
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const customers = await Customer.countDocuments({ partnerId: req.params.id });
        const services = await Service.find({ partnerId: req.params.id }).lean();

        const stats = {
            totalCustomers: customers,
            totalServices: services.length,
            totalRevenue: services.reduce((sum, s) => sum + (s.serviceCost || 0), 0),
            totalCommission: services.reduce((sum, s) => sum + (s.commissionAfterGST || 0), 0),
            pendingCommission: services.filter(s => !s.commissionPaid).reduce((sum, s) => sum + (s.commissionAfterGST || 0), 0)
        };

        res.json({ partner, stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch partner' });
    }
});

// CUSTOMERS CRUD
router.get('/customers', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { partner, status, city, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (partner) query.partnerId = partner;
        if (status) query.status = status;
        if (city) query['address.city'] = new RegExp(city, 'i');
        if (search) {
            query.$or = [
                { customerId: new RegExp(search, 'i') },
                { customerName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { mobile: new RegExp(search, 'i') }
            ];
        }

        const customers = await Customer.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Customer.countDocuments(query);

        res.json({ customers, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

router.get('/customers/:id', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerId: req.params.id }).select('-password').lean();
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const partner = await Partner.findOne({ partnerId: customer.partnerId }).select('-password').lean();
        const product = await Product.findOne({ customerId: customer.customerId }).lean();
        const service = await Service.findOne({ customerId: customer.customerId }).lean();

        // Calculate preview commission if pending
        let commissionPreview = null;
        if (service && service.status === 'PENDING' && partner) {
            commissionPreview = calculateCommission(
                product.purchaseValue,
                service.serviceType,
                partner.partnerType
            );
        }

        res.json({ customer, partner, product, service, commissionPreview });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// POST /api/admin/customers/:id/approve
router.post('/customers/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { salesInvoiceNumber, serviceStartDate, notes } = req.body;

        if (!salesInvoiceNumber || !serviceStartDate) {
            return res.status(400).json({ error: 'Sales invoice number and start date required' });
        }

        const customer = await Customer.findOne({ customerId: req.params.id });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customer.status !== 'PENDING') {
            return res.status(400).json({ error: 'Customer is not pending approval' });
        }

        const partner = await Partner.findOne({ partnerId: customer.partnerId });
        const product = await Product.findOne({ customerId: customer.customerId });
        const service = await Service.findOne({ customerId: customer.customerId });

        if (!partner || !product || !service) {
            return res.status(400).json({ error: 'Missing related data' });
        }

        // Calculate commission
        const commission = calculateCommission(
            product.purchaseValue,
            service.serviceType,
            partner.partnerType
        );

        const startDate = new Date(serviceStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 365);

        const now = new Date();

        // Update customer
        const oldCustomer = customer.toObject();
        customer.status = 'APPROVED';
        customer.approvedBy = req.user.email;
        customer.approvedAt = now;
        await customer.save();

        // Update service with commission
        const oldService = service.toObject();
        service.salesInvoiceNumber = salesInvoiceNumber;
        service.serviceStartDate = startDate;
        service.serviceEndDate = endDate;
        service.commissionPercentage = commission.commissionPercentage;
        service.commissionBeforeGST = commission.commissionBeforeGST;
        service.gstAmount = commission.gstAmount;
        service.commissionAfterGST = commission.commissionAfterGST;
        service.status = 'ACTIVE';
        service.approvedBy = req.user.email;
        service.approvedAt = now;
        service.activatedAt = now;
        await service.save();

        // Audit logs
        await createAuditLog({
            action: 'APPROVE',
            entity: 'CUSTOMER',
            entityId: customer.customerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: oldCustomer,
            newData: customer.toObject(),
            ...extractAuditInfo(req),
            details: notes || 'Customer approved'
        });

        await createAuditLog({
            action: 'APPROVE',
            entity: 'SERVICE',
            entityId: service.serviceId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: oldService,
            newData: service.toObject(),
            ...extractAuditInfo(req),
            details: `Service activated with commission: ₹${commission.commissionAfterGST}`
        });

        // Send approval email
        await sendCustomerApprovalEmail(customer, service);

        res.json({
            success: true,
            message: 'Customer approved and service activated',
            commission,
            service: service.toObject()
        });
    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ error: 'Failed to approve customer' });
    }
});

// POST /api/admin/customers/:id/reject
router.post('/customers/:id/reject', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { reason, details } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason required' });
        }

        const customer = await Customer.findOne({ customerId: req.params.id });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const oldCustomer = customer.toObject();
        customer.status = 'REJECTED';
        customer.rejectionReason = `${reason}${details ? ': ' + details : ''}`;
        await customer.save();

        await createAuditLog({
            action: 'REJECT',
            entity: 'CUSTOMER',
            entityId: customer.customerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: oldCustomer,
            newData: customer.toObject(),
            ...extractAuditInfo(req),
            details: customer.rejectionReason
        });

        res.json({ success: true, message: 'Customer rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject customer' });
    }
});

// SERVICES
router.get('/services', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { type, status, partner, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        const query = {};

        if (type) query.serviceType = type;
        if (status) query.status = status;
        if (partner) query.partnerId = partner;
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const services = await Service.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Service.countDocuments(query);

        res.json({ services, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// COMMISSIONS
router.get('/commissions', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { partner, status, dateFrom, dateTo } = req.query;
        const query = { status: 'ACTIVE' };

        if (partner) query.partnerId = partner;
        if (status === 'paid') query.commissionPaid = true;
        if (status === 'unpaid') query.commissionPaid = false;
        if (dateFrom || dateTo) {
            query.activatedAt = {};
            if (dateFrom) query.activatedAt.$gte = new Date(dateFrom);
            if (dateTo) query.activatedAt.$lte = new Date(dateTo);
        }

        const services = await Service.find(query).sort({ activatedAt: -1 }).lean();

        res.json({ commissions: services });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch commissions' });
    }
});

router.post('/commissions/mark-paid', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { serviceIds, paymentDate, ref, mode, notes } = req.body;

        if (!serviceIds || !serviceIds.length || !paymentDate || !ref) {
            return res.status(400).json({ error: 'Service IDs, payment date, and reference required' });
        }

        const updates = await Service.updateMany(
            { serviceId: { $in: serviceIds } },
            {
                $set: {
                    commissionPaid: true,
                    commissionPaidDate: new Date(paymentDate),
                    commissionPaymentRef: ref
                }
            }
        );

        // Audit log for each
        for (const serviceId of serviceIds) {
            await createAuditLog({
                action: 'UPDATE',
                entity: 'SERVICE',
                entityId: serviceId,
                performedBy: req.user.email,
                performedByRole: req.user.role,
                ...extractAuditInfo(req),
                details: `Commission marked as paid. Ref: ${ref}, Mode: ${mode}, Notes: ${notes || 'N/A'}`
            });
        }

        res.json({ success: true, updated: updates.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark commissions as paid' });
    }
});

// AUDIT LOGS
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { action, entity, performedBy, dateFrom, dateTo, search, page = 1, limit = 50 } = req.query;
        const query = {};

        if (action) query.action = action;
        if (entity) query.entity = entity;
        if (performedBy) query.performedBy = new RegExp(performedBy, 'i');
        if (dateFrom || dateTo) {
            query.timestamp = {};
            if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
            if (dateTo) query.timestamp.$lte = new Date(dateTo);
        }
        if (search) {
            query.$or = [
                { entityId: new RegExp(search, 'i') },
                { details: new RegExp(search, 'i') }
            ];
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await AuditLog.countDocuments(query);

        res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// SETTINGS (SUPER_ADMIN only)
router.get('/settings', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};
        const settings = await SystemSetting.find(query).lean();
        res.json({ settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings/:key', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { settingValue } = req.body;

        const setting = await SystemSetting.findOneAndUpdate(
            { settingKey: req.params.key },
            { settingValue, updatedBy: req.user.email, updatedAt: new Date() },
            { new: true }
        );

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        await createAuditLog({
            action: 'UPDATE',
            entity: 'ADMIN',
            entityId: req.params.key,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            newData: { settingValue },
            ...extractAuditInfo(req),
            details: `System setting updated: ${req.params.key}`
        });

        res.json({ success: true, setting });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// ADMIN USERS
router.get('/users', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').lean();
        res.json({ admins });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin users' });
    }
});

router.post('/users', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { name, email, mobile, role, password } = req.body;

        const exists = await Admin.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const adminId = generateAdminId();
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            adminId,
            name,
            email: email.toLowerCase(),
            mobile,
            password: hashedPassword,
            role,
            createdBy: req.user.email
        });

        await admin.save();

        await createAuditLog({
            action: 'CREATE',
            entity: 'ADMIN',
            entityId: adminId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            newData: { name, email, role },
            ...extractAuditInfo(req)
        });

        res.status(201).json({ success: true, adminId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// ===== EMAIL RESEND ROUTES =====

// POST /api/admin/partners/:id/resend-welcome
// Resend welcome email with PDF agreement to partner
router.post('/partners/:id/resend-welcome', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const partner = await Partner.findOne({ partnerId: req.params.id });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Generate fresh PDF agreement
        let pdfBuffer = null;
        try {
            pdfBuffer = await generatePartnerAgreementPDF(partner);
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError);
        }

        // Send welcome email
        const result = await sendPartnerWelcomeEmail(partner, pdfBuffer);

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to send email', details: result.error });
        }

        // Audit log
        await createAuditLog({
            action: 'EMAIL_RESEND',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            ...extractAuditInfo(req),
            details: 'Welcome email with PDF agreement resent'
        });

        res.json({
            success: true,
            message: `Welcome email resent to ${partner.email}`,
            emailSent: partner.email
        });
    } catch (error) {
        console.error('Resend welcome email error:', error);
        res.status(500).json({ error: 'Failed to resend welcome email' });
    }
});

// POST /api/admin/partners/:id/resend-agreement
// Resend only the PDF agreement (no welcome content)
router.post('/partners/:id/resend-agreement', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const partner = await Partner.findOne({ partnerId: req.params.id });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Generate fresh PDF agreement
        const pdfBuffer = await generatePartnerAgreementPDF(partner);

        // Send agreement email (same as welcome, includes PDF)
        const result = await sendPartnerWelcomeEmail(partner, pdfBuffer);

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to send email', details: result.error });
        }

        // Audit log
        await createAuditLog({
            action: 'EMAIL_RESEND',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            ...extractAuditInfo(req),
            details: 'Partner agreement PDF resent'
        });

        res.json({
            success: true,
            message: `Agreement PDF resent to ${partner.email}`,
            emailSent: partner.email
        });
    } catch (error) {
        console.error('Resend agreement error:', error);
        res.status(500).json({ error: 'Failed to resend agreement' });
    }
});

// POST /api/admin/customers/:id/resend-approval
// Resend approval/activation email to customer
router.post('/customers/:id/resend-approval', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerId: req.params.id });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customer.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Customer is not approved. Cannot resend approval email.' });
        }

        const service = await Service.findOne({ customerId: customer.customerId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found for customer' });
        }

        // Send approval email
        const result = await sendCustomerApprovalEmail(customer, service);

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to send email', details: result.error });
        }

        // Audit log
        await createAuditLog({
            action: 'EMAIL_RESEND',
            entity: 'CUSTOMER',
            entityId: customer.customerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            ...extractAuditInfo(req),
            details: 'Approval email resent to customer'
        });

        res.json({
            success: true,
            message: `Approval email resent to ${customer.email}`,
            emailSent: customer.email
        });
    } catch (error) {
        console.error('Resend approval email error:', error);
        res.status(500).json({ error: 'Failed to resend approval email' });
    }
});

// GET /api/admin/email-history/:entityType/:entityId
// Get email resend history for an entity (from audit logs)
router.get('/email-history/:entityType/:entityId', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { entityType, entityId } = req.params;

        const logs = await AuditLog.find({
            entity: entityType.toUpperCase(),
            entityId: entityId,
            $or: [
                { action: 'EMAIL_RESEND' },
                { details: { $regex: /email/i } }
            ]
        }).sort({ timestamp: -1 }).limit(20).lean();

        res.json({ emailHistory: logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch email history' });
    }
});

module.exports = router;
