const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../../models/Employee');
const Resource = require('../../models/Resource');
const Inventory = require('../../models/Inventory');
const Transaction = require('../../models/Transaction');
const AuditLog = require('../../models/AuditLog');
const { authenticate, authorize } = require('../../middleware/auth');
const { createAuditLog, extractAuditInfo } = require('../../services/audit');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const genId = (prefix, len) => `${prefix}-${Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')}`;

// ============================================================
// EMPLOYEE MANAGEMENT (ERM)
// ============================================================

// GET /api/admin/erp/employees
router.get('/employees', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { department, status, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (department) query.department = department;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { employeeId: new RegExp(search, 'i') },
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }
        const employees = await Employee.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const total = await Employee.countDocuments(query);
        res.json({ employees, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// GET /api/admin/erp/employees/:id
router.get('/employees/:id', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.params.id }).lean();
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json({ employee });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// POST /api/admin/erp/employees
router.post('/employees', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const employeeId = genId('EMP', 6);
        const employee = new Employee({ ...req.body, employeeId });
        await employee.save();

        await createAuditLog({
            action: 'CREATE', entity: 'ADMIN', entityId: employeeId,
            performedBy: req.user.email, performedByRole: req.user.role,
            newData: employee.toObject(), ...extractAuditInfo(req),
            details: `Employee created: ${req.body.firstName} ${req.body.lastName}`
        });

        res.status(201).json({ success: true, employee });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: error.message || 'Failed to create employee' });
    }
});

// PUT /api/admin/erp/employees/:id
router.put('/employees/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.params.id });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const oldData = employee.toObject();
        Object.assign(employee, req.body);
        await employee.save();

        await createAuditLog({
            action: 'UPDATE', entity: 'ADMIN', entityId: employee.employeeId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: employee.toObject(), ...extractAuditInfo(req),
            details: 'Employee updated'
        });

        res.json({ success: true, employee });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// DELETE /api/admin/erp/employees/:id (soft delete)
router.delete('/employees/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.params.id });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        employee.status = 'TERMINATED';
        employee.terminationDate = new Date();
        employee.terminationReason = req.body.reason || 'Terminated by admin';
        await employee.save();

        await createAuditLog({
            action: 'DELETE', entity: 'ADMIN', entityId: employee.employeeId,
            performedBy: req.user.email, performedByRole: req.user.role,
            ...extractAuditInfo(req), details: `Employee terminated: ${employee.terminationReason}`
        });

        res.json({ success: true, message: 'Employee terminated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to terminate employee' });
    }
});

// POST /api/admin/erp/employees/:id/attendance
router.post('/employees/:id/attendance', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { type } = req.body; // 'PRESENT', 'ABSENT', 'LEAVE'
        const employee = await Employee.findOne({ employeeId: req.params.id });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        if (type === 'PRESENT') employee.attendance.totalPresent += 1;
        else if (type === 'ABSENT') employee.attendance.totalAbsent += 1;
        else if (type === 'LEAVE') {
            if (employee.attendance.leaveBalance <= 0) {
                return res.status(400).json({ error: 'No leave balance remaining' });
            }
            employee.attendance.totalLeaves += 1;
            employee.attendance.leaveBalance -= 1;
        }
        await employee.save();
        res.json({ success: true, attendance: employee.attendance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record attendance' });
    }
});

// ============================================================
// RESOURCE MANAGEMENT (ERM)
// ============================================================

// GET /api/admin/erp/resources
router.get('/resources', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { category, status, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { resourceId: new RegExp(search, 'i') },
                { name: new RegExp(search, 'i') }
            ];
        }
        const resources = await Resource.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const total = await Resource.countDocuments(query);
        res.json({ resources, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// POST /api/admin/erp/resources
router.post('/resources', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const resourceId = genId('RES', 6);
        const resource = new Resource({ ...req.body, resourceId });
        await resource.save();
        await createAuditLog({
            action: 'CREATE', entity: 'ADMIN', entityId: resourceId,
            performedBy: req.user.email, performedByRole: req.user.role,
            newData: resource.toObject(), ...extractAuditInfo(req),
            details: `Resource created: ${req.body.name}`
        });
        res.status(201).json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create resource' });
    }
});

// PUT /api/admin/erp/resources/:id
router.put('/resources/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const resource = await Resource.findOne({ resourceId: req.params.id });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        const oldData = resource.toObject();
        Object.assign(resource, req.body);
        await resource.save();
        await createAuditLog({
            action: 'UPDATE', entity: 'ADMIN', entityId: resource.resourceId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: resource.toObject(), ...extractAuditInfo(req)
        });
        res.json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// POST /api/admin/erp/resources/:id/assign
router.post('/resources/:id/assign', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { employeeId } = req.body;
        const resource = await Resource.findOne({ resourceId: req.params.id });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        resource.assignedTo = employeeId;
        resource.assignedAt = new Date();
        resource.status = employeeId ? 'ASSIGNED' : 'AVAILABLE';
        await resource.save();
        res.json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign resource' });
    }
});

// ============================================================
// INVENTORY MANAGEMENT (ERP)
// ============================================================

// GET /api/admin/erp/inventory
router.get('/inventory', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'), async (req, res) => {
    try {
        const { category, status, search, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };
        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { itemId: new RegExp(search, 'i') },
                { name: new RegExp(search, 'i') },
                { sku: new RegExp(search, 'i') }
            ];
        }
        const items = await Inventory.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const total = await Inventory.countDocuments(query);

        // Summary stats
        const allItems = await Inventory.find({ isActive: true }).lean();
        const summary = {
            totalItems: allItems.length,
            totalValue: allItems.reduce((sum, i) => sum + (i.totalValue || 0), 0),
            lowStock: allItems.filter(i => i.status === 'LOW_STOCK').length,
            outOfStock: allItems.filter(i => i.status === 'OUT_OF_STOCK').length
        };

        res.json({ items, total, summary, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// POST /api/admin/erp/inventory
router.post('/inventory', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const itemId = genId('INV', 6);
        const item = new Inventory({ ...req.body, itemId });
        await item.save();
        await createAuditLog({
            action: 'CREATE', entity: 'ADMIN', entityId: itemId,
            performedBy: req.user.email, performedByRole: req.user.role,
            newData: item.toObject(), ...extractAuditInfo(req),
            details: `Inventory item created: ${req.body.name}`
        });
        res.status(201).json({ success: true, item });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create inventory item' });
    }
});

// PUT /api/admin/erp/inventory/:id
router.put('/inventory/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const item = await Inventory.findOne({ itemId: req.params.id });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        const oldData = item.toObject();
        Object.assign(item, req.body);
        await item.save();
        await createAuditLog({
            action: 'UPDATE', entity: 'ADMIN', entityId: item.itemId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: item.toObject(), ...extractAuditInfo(req)
        });
        res.json({ success: true, item });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
});

// POST /api/admin/erp/inventory/:id/movement
router.post('/inventory/:id/movement', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { type, quantity, reference, notes } = req.body;
        const item = await Inventory.findOne({ itemId: req.params.id });
        if (!item) return res.status(404).json({ error: 'Item not found' });

        if (type === 'IN' || type === 'RETURN') {
            item.quantity += quantity;
            if (type === 'IN') item.lastRestocked = new Date();
        } else if (type === 'OUT') {
            if (item.quantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });
            item.quantity -= quantity;
        } else if (type === 'ADJUSTMENT') {
            item.quantity = quantity; // Direct set
        }

        item.movements.push({
            type, quantity, reference, performedBy: req.user.email, notes
        });

        await item.save();
        res.json({ success: true, item });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record movement' });
    }
});

// ============================================================
// FINANCIAL TRANSACTIONS (ERP)
// ============================================================

// GET /api/admin/erp/transactions
router.get('/transactions', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const { type, category, status, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;
        if (dateFrom || dateTo) {
            query.transactionDate = {};
            if (dateFrom) query.transactionDate.$gte = new Date(dateFrom);
            if (dateTo) query.transactionDate.$lte = new Date(dateTo);
        }
        if (search) {
            query.$or = [
                { transactionId: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { referenceNumber: new RegExp(search, 'i') }
            ];
        }

        const transactions = await Transaction.find(query)
            .sort({ transactionDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const total = await Transaction.countDocuments(query);

        // Summary
        const allTx = await Transaction.find({ status: 'COMPLETED' }).lean();
        const summary = {
            totalIncome: allTx.filter(t => t.type === 'INCOME' || t.type === 'TRANSFER').reduce((s, t) => s + t.amount, 0),
            totalExpenses: allTx.filter(t => ['EXPENSE', 'COMMISSION_PAYOUT', 'SALARY', 'TAX_PAYMENT'].includes(t.type)).reduce((s, t) => s + t.amount, 0),
            totalGSTCollected: allTx.reduce((s, t) => s + (t.gstDetails?.gstAmount || 0), 0),
            transactionCount: allTx.length
        };
        summary.netProfit = summary.totalIncome - summary.totalExpenses;

        res.json({ transactions, total, summary, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// POST /api/admin/erp/transactions
router.post('/transactions', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const transactionId = genId('TXN', 8);
        const transaction = new Transaction({ ...req.body, transactionId, createdBy: req.user.email });
        await transaction.save();
        await createAuditLog({
            action: 'CREATE', entity: 'ADMIN', entityId: transactionId,
            performedBy: req.user.email, performedByRole: req.user.role,
            newData: transaction.toObject(), ...extractAuditInfo(req),
            details: `Transaction recorded: ${req.body.type} - ₹${req.body.amount}`
        });
        res.status(201).json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create transaction' });
    }
});

// PUT /api/admin/erp/transactions/:id
router.put('/transactions/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ transactionId: req.params.id });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        const oldData = transaction.toObject();
        Object.assign(transaction, req.body);
        await transaction.save();
        await createAuditLog({
            action: 'UPDATE', entity: 'ADMIN', entityId: transaction.transactionId,
            performedBy: req.user.email, performedByRole: req.user.role,
            oldData, newData: transaction.toObject(), ...extractAuditInfo(req)
        });
        res.json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// ============================================================
// ERP DASHBOARD SUMMARY
// ============================================================

router.get('/dashboard', authenticate, authorize('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
    try {
        const [employees, resources, inventory, transactions] = await Promise.all([
            Employee.find({ status: { $ne: 'TERMINATED' } }).lean(),
            Resource.find().lean(),
            Inventory.find({ isActive: true }).lean(),
            Transaction.find({ status: 'COMPLETED' }).lean()
        ]);

        const totalSalaryExpense = employees.reduce((s, e) => s + (e.salary?.netSalary || 0), 0);
        const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type !== 'INCOME').reduce((s, t) => s + t.amount, 0);

        res.json({
            employees: {
                total: employees.length,
                active: employees.filter(e => e.status === 'ACTIVE').length,
                onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
                byDepartment: employees.reduce((acc, e) => { acc[e.department] = (acc[e.department] || 0) + 1; return acc; }, {}),
                totalMonthlySalary: totalSalaryExpense
            },
            resources: {
                total: resources.length,
                available: resources.filter(r => r.status === 'AVAILABLE').length,
                assigned: resources.filter(r => r.status === 'ASSIGNED').length,
                underMaintenance: resources.filter(r => r.status === 'UNDER_MAINTENANCE').length,
                totalValue: resources.reduce((s, r) => s + (r.currentValue || r.purchaseValue || 0), 0)
            },
            inventory: {
                totalItems: inventory.length,
                totalValue: inventory.reduce((s, i) => s + (i.totalValue || 0), 0),
                lowStock: inventory.filter(i => i.status === 'LOW_STOCK').length,
                outOfStock: inventory.filter(i => i.status === 'OUT_OF_STOCK').length
            },
            finance: {
                totalIncome,
                totalExpenses,
                netProfit: totalIncome - totalExpenses,
                totalGST: transactions.reduce((s, t) => s + (t.gstDetails?.gstAmount || 0), 0),
                recentTransactions: transactions.slice(0, 5)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ERP dashboard' });
    }
});

module.exports = router;
