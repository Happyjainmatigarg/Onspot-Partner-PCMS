const mongoose = require('mongoose');

// IMMUTABLE - No updates or deletes ever allowed
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN']
    },
    entity: {
        type: String,
        required: true,
        enum: ['PARTNER', 'CUSTOMER', 'SERVICE', 'PRODUCT', 'ADMIN']
    },
    entityId: {
        type: String,
        required: true
    },
    performedBy: {
        type: String,
        required: true
    },
    performedByRole: {
        type: String,
        required: true,
        enum: ['PARTNER', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'SYSTEM']
    },
    oldData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    newData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    details: String
}, {
    timestamps: false // We use our own timestamp field
});

// Indexes for efficient querying
auditLogSchema.index({ entity: 1 });
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });

// Prevent any modifications
auditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('updateOne', function () {
    throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('updateMany', function () {
    throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('findOneAndDelete', function () {
    throw new Error('Audit logs cannot be deleted');
});

auditLogSchema.pre('deleteOne', function () {
    throw new Error('Audit logs cannot be deleted');
});

auditLogSchema.pre('deleteMany', function () {
    throw new Error('Audit logs cannot be deleted');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
