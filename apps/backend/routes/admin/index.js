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

// PUT /api/admin/partners/:id
router.put('/partners/:id', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { firm_name, contact_person, mobile, email, city, address, gst_number } = req.body;

        const partner = await Partner.findOne({ partnerId: req.params.id });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const oldData = partner.toObject();

        if (firm_name) partner.firm_name = firm_name;
        if (contact_person) partner.contact_person = contact_person;
        if (mobile) partner.mobile = mobile;
        if (email) partner.email = email.toLowerCase();
        if (gst_number) partner.gst_number = gst_number;

        if (city || address) {
            partner.billingAddress = {
                ...partner.billingAddress,
                ...(city && { city }),
                ...(address && { address })
            };
        }

        await partner.save();

        await createAuditLog({
            action: 'UPDATE',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: oldData,
            newData: partner.toObject(),
            ...extractAuditInfo(req),
            details: 'Partner details updated by admin'
        });

        res.json({ success: true, partner });
    } catch (error) {
        console.error('Update partner error:', error);
        res.status(500).json({ error: 'Failed to update partner details' });
    }
});

// PATCH /api/admin/partners/:id/status
router.patch('/partners/:id/status', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { status, reason } = req.body;
        const validStatuses = ['ACTIVE', 'SUSPENDED', 'REJECTED', 'APPROVED', 'PENDING'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const partner = await Partner.findOne({ partnerId: req.params.id });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const oldStatus = partner.status;
        partner.status = status;
        if (reason) partner.statusReason = reason;

        // If approving, ensure mobile verified
        if (status === 'APPROVED' || status === 'ACTIVE') {
            partner.mobileVerified = true;
        }

        await partner.save();

        // Audit log
        await createAuditLog({
            action: 'UPDATE_STATUS',
            entity: 'PARTNER',
            entityId: partner.partnerId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: { status: oldStatus },
            newData: { status },
            ...extractAuditInfo(req),
            details: `Partner status updated to ${status}${reason ? ': ' + reason : ''}`
        });

        res.json({ success: true, message: `Partner status updated to ${status}` });
    } catch (error) {
        console.error('Update partner status error:', error);
        res.status(500).json({ error: 'Failed to update partner status' });
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

// PUT /api/admin/services/:id
router.put('/services/:id', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const service = await Service.findOne({ serviceId: req.params.id });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const oldData = service.toObject();

        if (status) service.status = status;
        // You might want to update other fields too

        await service.save();

        await createAuditLog({
            action: 'UPDATE',
            entity: 'SERVICE',
            entityId: service.serviceId,
            performedBy: req.user.email,
            performedByRole: req.user.role,
            oldData: oldData,
            newData: service.toObject(),
            ...extractAuditInfo(req),
            details: `Service updated. Remarks: ${remarks || 'None'}`
        });

        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
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

// ===== DELETE OPERATIONS (Soft Delete) =====

// DELETE /api/admin/partners/:id
router.delete('/partners/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { reason } = req.body;
        const partner = await Partner.findOne({ partnerId: req.params.id });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });

        const oldData = partner.toObject();
        partner.status = 'INACTIVE';
        await partner.save();

        await createAuditLog({
            action: 'DELETE', entity: 'PARTNER', entityId: partner.partnerId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: partner.toObject(), ...extractAuditInfo(req),
            details: `Partner soft-deleted: ${reason || 'No reason provided'}`
        });

        res.json({ success: true, message: 'Partner deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete partner' });
    }
});

// DELETE /api/admin/customers/:id
router.delete('/customers/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { reason } = req.body;
        const customer = await Customer.findOne({ customerId: req.params.id });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const oldData = customer.toObject();
        customer.status = 'REJECTED';
        customer.rejectionReason = reason || 'Deleted by admin';
        await customer.save();

        await createAuditLog({
            action: 'DELETE', entity: 'CUSTOMER', entityId: customer.customerId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: customer.toObject(), ...extractAuditInfo(req),
            details: `Customer soft-deleted: ${reason || 'No reason provided'}`
        });

        res.json({ success: true, message: 'Customer deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { reason } = req.body;
        const service = await Service.findOne({ serviceId: req.params.id });
        if (!service) return res.status(404).json({ error: 'Service not found' });

        if (service.commissionPaid) {
            return res.status(400).json({
                error: 'Cannot delete service with paid commission. Manual reversal required.',
                commissionPaid: true
            });
        }

        const oldData = service.toObject();
        service.status = 'CANCELLED';
        await service.save();

        await createAuditLog({
            action: 'DELETE', entity: 'SERVICE', entityId: service.serviceId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: service.toObject(), ...extractAuditInfo(req),
            details: `Service cancelled: ${reason || 'Deleted by admin'}`
        });

        res.json({ success: true, message: 'Service cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// ===== ADMIN CREATE PARTNER =====

// POST /api/admin/partners
router.post('/partners', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { generatePartnerId } = require('../../utils/idGenerator');
        const {
            applicantName, email, mobile, partnerType, gstNumber, panNumber,
            billingAddress, contactPerson, skipOtp, sendWelcomeEmail, notes
        } = req.body;

        // Check uniqueness
        const emailExists = await Partner.findOne({ email: email.toLowerCase() });
        if (emailExists) return res.status(400).json({ error: 'Email already registered' });
        const mobileExists = await Partner.findOne({ mobile });
        if (mobileExists) return res.status(400).json({ error: 'Mobile already registered' });

        const partnerId = await generatePartnerId(partnerType);

        const partner = new Partner({
            partnerId, partnerType, applicantName,
            email: email.toLowerCase(), mobile,
            mobileVerified: skipOtp || false,
            gstNumber: gstNumber || 'N/A',
            panNumber, billingAddress, contactPerson,
            status: 'ACTIVE', passwordSet: false,
            createdBy: req.user.email
        });

        await partner.save();

        await createAuditLog({
            action: 'CREATE', entity: 'PARTNER', entityId: partnerId,
            performedBy: req.user.email, performedByRole: req.user.role,
            newData: partner.toObject(), ...extractAuditInfo(req),
            details: `Partner created by admin. Notes: ${notes || 'None'}`
        });

        // Generate & send welcome email if requested
        if (sendWelcomeEmail) {
            try {
                const pdfBuffer = await generatePartnerAgreementPDF(partner);
                await sendPartnerWelcomeEmail(partner, pdfBuffer);
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
            }
        }

        res.status(201).json({ success: true, partnerId, partner });
    } catch (error) {
        console.error('Admin create partner error:', error);
        res.status(500).json({ error: error.message || 'Failed to create partner' });
    }
});

// ===== REPORTS & ANALYTICS =====

// Helper: build date range query
function buildDateQuery(dateFrom, dateTo, field = 'createdAt') {
    const q = {};
    if (dateFrom || dateTo) {
        q[field] = {};
        if (dateFrom) q[field].$gte = new Date(dateFrom);
        if (dateTo) q[field].$lte = new Date(dateTo);
    }
    return q;
}

// GET /api/admin/reports/partner-performance
router.get('/reports/partner-performance', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { dateFrom, dateTo, type, city } = req.query;
        const partnerQuery = {};
        if (type) partnerQuery.partnerType = type;
        if (city) partnerQuery['billingAddress.city'] = new RegExp(city, 'i');

        const partners = await Partner.find(partnerQuery).select('-password').lean();

        const report = await Promise.all(partners.map(async (p) => {
            const serviceQuery = { partnerId: p.partnerId, ...buildDateQuery(dateFrom, dateTo) };
            const services = await Service.find(serviceQuery).lean();
            const customers = await Customer.countDocuments({ partnerId: p.partnerId });

            return {
                partnerId: p.partnerId, applicantName: p.applicantName,
                partnerType: p.partnerType, city: p.billingAddress?.city,
                totalCustomers: customers, totalServices: services.length,
                activeServices: services.filter(s => s.status === 'ACTIVE').length,
                totalRevenue: services.reduce((s, sv) => s + (sv.serviceCost || 0), 0),
                totalCommission: services.reduce((s, sv) => s + (sv.commissionAfterGST || 0), 0),
                pendingCommission: services.filter(sv => !sv.commissionPaid).reduce((s, sv) => s + (sv.commissionAfterGST || 0), 0)
            };
        }));

        report.sort((a, b) => b.totalRevenue - a.totalRevenue);
        res.json({ report, total: report.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate partner performance report' });
    }
});

// GET /api/admin/reports/customer-registration
router.get('/reports/customer-registration', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dateQuery = buildDateQuery(dateFrom, dateTo, 'registrationDate');
        const customers = await Customer.find(dateQuery).select('-password').lean();

        const byStatus = customers.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
        const byMonth = customers.reduce((acc, c) => {
            const key = new Date(c.registrationDate).toISOString().slice(0, 7);
            acc[key] = (acc[key] || 0) + 1; return acc;
        }, {});

        res.json({ total: customers.length, byStatus, byMonth, customers: customers.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate customer registration report' });
    }
});

// GET /api/admin/reports/service-activation
router.get('/reports/service-activation', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dateQuery = buildDateQuery(dateFrom, dateTo, 'activatedAt');
        const services = await Service.find({ status: 'ACTIVE', ...dateQuery }).lean();

        const byType = services.reduce((acc, s) => { acc[s.serviceType] = (acc[s.serviceType] || 0) + 1; return acc; }, {});
        const byMonth = services.reduce((acc, s) => {
            const key = new Date(s.activatedAt || s.createdAt).toISOString().slice(0, 7);
            acc[key] = (acc[key] || 0) + 1; return acc;
        }, {});
        const totalRevenue = services.reduce((s, sv) => s + (sv.serviceCost || 0), 0);

        res.json({ total: services.length, byType, byMonth, totalRevenue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate service activation report' });
    }
});

// GET /api/admin/reports/commission
router.get('/reports/commission', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dateQuery = buildDateQuery(dateFrom, dateTo, 'activatedAt');
        const services = await Service.find({ status: 'ACTIVE', ...dateQuery }).lean();

        const totalCommission = services.reduce((s, sv) => s + (sv.commissionAfterGST || 0), 0);
        const totalGST = services.reduce((s, sv) => s + (sv.gstAmount || 0), 0);
        const paid = services.filter(s => s.commissionPaid);
        const unpaid = services.filter(s => !s.commissionPaid);

        res.json({
            totalCommission, totalGST,
            totalPaid: paid.reduce((s, sv) => s + (sv.commissionAfterGST || 0), 0),
            totalUnpaid: unpaid.reduce((s, sv) => s + (sv.commissionAfterGST || 0), 0),
            paidCount: paid.length, unpaidCount: unpaid.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate commission report' });
    }
});

// GET /api/admin/reports/revenue
router.get('/reports/revenue', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dateQuery = buildDateQuery(dateFrom, dateTo, 'activatedAt');
        const services = await Service.find({ status: 'ACTIVE', ...dateQuery }).lean();

        const total = services.reduce((s, sv) => s + (sv.serviceCost || 0), 0);
        const byMonth = {};
        services.forEach(s => {
            const key = new Date(s.activatedAt || s.createdAt).toISOString().slice(0, 7);
            byMonth[key] = (byMonth[key] || 0) + (s.serviceCost || 0);
        });

        const byServiceType = {};
        services.forEach(s => {
            byServiceType[s.serviceType] = (byServiceType[s.serviceType] || 0) + (s.serviceCost || 0);
        });

        res.json({ totalRevenue: total, byMonth, byServiceType, serviceCount: services.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate revenue report' });
    }
});

// GET /api/admin/reports/product-category
router.get('/reports/product-category', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const products = await Product.find().lean();
        const byType = {};
        const byBrand = {};
        products.forEach(p => {
            byType[p.productType] = (byType[p.productType] || 0) + 1;
            byBrand[p.brand] = (byBrand[p.brand] || 0) + 1;
        });
        const avgValue = products.length > 0 ? products.reduce((s, p) => s + p.purchaseValue, 0) / products.length : 0;
        res.json({ total: products.length, byType, byBrand, averageValue: Math.round(avgValue) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate product category report' });
    }
});

// GET /api/admin/reports/city-distribution
router.get('/reports/city-distribution', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const partners = await Partner.find().lean();
        const customers = await Customer.find().lean();

        const partnersByCity = {};
        partners.forEach(p => {
            const city = p.billingAddress?.city || 'Unknown';
            partnersByCity[city] = (partnersByCity[city] || 0) + 1;
        });

        const customersByCity = {};
        customers.forEach(c => {
            const city = c.address?.city || 'Unknown';
            customersByCity[city] = (customersByCity[city] || 0) + 1;
        });

        res.json({ partnersByCity, customersByCity });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate city distribution report' });
    }
});

// GET /api/admin/reports/monthly-trend
router.get('/reports/monthly-trend', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [services, customers, partners] = await Promise.all([
            Service.find({ createdAt: { $gte: sixMonthsAgo } }).lean(),
            Customer.find({ registrationDate: { $gte: sixMonthsAgo } }).lean(),
            Partner.find({ registrationDate: { $gte: sixMonthsAgo } }).lean()
        ]);

        const months = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7);
            months[key] = { services: 0, customers: 0, partners: 0, revenue: 0, commission: 0 };
        }

        services.forEach(s => {
            const key = new Date(s.createdAt).toISOString().slice(0, 7);
            if (months[key]) {
                months[key].services++;
                months[key].revenue += s.serviceCost || 0;
                months[key].commission += s.commissionAfterGST || 0;
            }
        });

        customers.forEach(c => {
            const key = new Date(c.registrationDate).toISOString().slice(0, 7);
            if (months[key]) months[key].customers++;
        });

        partners.forEach(p => {
            const key = new Date(p.registrationDate).toISOString().slice(0, 7);
            if (months[key]) months[key].partners++;
        });

        res.json({ trend: months });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate monthly trend report' });
    }
});

// POST /api/admin/reports/export
router.post('/reports/export', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { reportType, format, filters } = req.body;

        await createAuditLog({
            action: 'CREATE', entity: 'ADMIN', entityId: `EXPORT-${reportType}`,
            performedBy: req.user.email, performedByRole: req.user.role,
            ...extractAuditInfo(req),
            details: `Report exported: ${reportType} as ${format}`
        });

        // For now, return JSON data. PDF/Excel export can be added with specific libraries.
        res.json({
            success: true,
            message: `Report ${reportType} exported as ${format}`,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to export report' });
    }
});

module.exports = router;
