const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        match: /^SVC-[A-Z0-9]{6}$/
    },
    customerId: {
        type: String,
        required: true
    },
    partnerId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    salesInvoiceNumber: String,
    serviceType: {
        type: String,
        required: true,
        enum: ['ESS', 'EPS', 'CDC']
    },
    servicePercentage: {
        type: Number,
        required: true,
        enum: [8, 15, 20]
    },
    serviceCost: {
        type: Number,
        required: true
    },
    // Commission fields - calculated on approval
    commissionPercentage: Number,
    gstPercentage: {
        type: Number,
        default: 18
    },
    commissionBeforeGST: Number,
    gstAmount: Number,
    commissionAfterGST: Number,
    serviceStartDate: Date,
    serviceEndDate: Date,
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'ACTIVE', 'EXPIRED', 'CANCELLED'],
        default: 'PENDING'
    },
    approvedBy: String,
    approvedAt: Date,
    activatedAt: Date,
    commissionPaid: {
        type: Boolean,
        default: false
    },
    commissionPaidDate: Date,
    commissionPaymentRef: String
}, {
    timestamps: true
});

// Indexes
serviceSchema.index({ serviceId: 1 }, { unique: true });
serviceSchema.index({ customerId: 1 });
serviceSchema.index({ partnerId: 1 });
serviceSchema.index({ productId: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ salesInvoiceNumber: 1 });

// Pre-save validation: Ensure all three FKs are present
serviceSchema.pre('save', function (next) {
    if (!this.customerId || !this.partnerId || !this.productId) {
        return next(new Error('Service requires customerId, partnerId, and productId'));
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);
