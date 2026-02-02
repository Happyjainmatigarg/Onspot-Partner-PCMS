const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS']
    },
    permissions: {
        createPartner: { type: Boolean, default: false },
        editPartner: { type: Boolean, default: false },
        deletePartner: { type: Boolean, default: false },
        createCustomer: { type: Boolean, default: false },
        editCustomer: { type: Boolean, default: false },
        deleteCustomer: { type: Boolean, default: false },
        approveCustomer: { type: Boolean, default: false },
        approveService: { type: Boolean, default: false },
        createService: { type: Boolean, default: false },
        editService: { type: Boolean, default: false },
        deleteService: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        exportData: { type: Boolean, default: false },
        manageAdmins: { type: Boolean, default: false },
        manageSettings: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    createdBy: String,
    lastLoginAt: Date
}, {
    timestamps: true
});

// Indexes
adminSchema.index({ adminId: 1 }, { unique: true });
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

// Set default permissions based on role before save
adminSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('role')) {
        const rolePermissions = {
            SUPER_ADMIN: {
                createPartner: true, editPartner: true, deletePartner: true,
                createCustomer: true, editCustomer: true, deleteCustomer: true,
                approveCustomer: true, approveService: true,
                createService: true, editService: true, deleteService: true,
                viewReports: true, exportData: true,
                manageAdmins: true, manageSettings: true
            },
            ACCOUNTS: {
                approveCustomer: true, approveService: true,
                viewReports: true, exportData: true
            },
            OPERATIONS: {
                viewReports: true
            }
        };
        this.permissions = rolePermissions[this.role] || {};
    }
    next();
});

module.exports = mongoose.model('Admin', adminSchema);
