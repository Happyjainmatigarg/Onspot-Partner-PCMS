const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    type: {
        type: String,
        required: true,
        enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'COMMISSION_PAYOUT', 'SALARY', 'TAX_PAYMENT']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'SERVICE_REVENUE', 'COMMISSION_EXPENSE', 'SALARY_EXPENSE', 'RENT',
            'UTILITIES', 'MARKETING', 'TRAVEL', 'OFFICE_SUPPLIES', 'SOFTWARE',
            'INSURANCE', 'LEGAL', 'TAX', 'GST_COLLECTED', 'GST_PAID',
            'PARTNER_PAYOUT', 'REFUND', 'MISCELLANEOUS'
        ]
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    description: { type: String, required: true },
    referenceNumber: String,
    referenceType: {
        type: String,
        enum: ['SERVICE', 'PARTNER', 'CUSTOMER', 'EMPLOYEE', 'VENDOR', 'MANUAL']
    },
    referenceId: String, // serviceId, partnerId, employeeId, etc.
    paymentMethod: {
        type: String,
        enum: ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'NEFT', 'RTGS', 'IMPS'],
        default: 'BANK_TRANSFER'
    },
    fromAccount: String,
    toAccount: String,
    gstDetails: {
        gstApplicable: { type: Boolean, default: false },
        gstRate: { type: Number, default: 18 },
        gstAmount: { type: Number, default: 0 },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        hsnCode: String
    },
    invoiceNumber: String,
    invoiceUrl: String,
    transactionDate: { type: Date, required: true, default: Date.now },
    dueDate: Date,
    paidDate: Date,
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
        default: 'COMPLETED'
    },
    approvedBy: String,
    approvalDate: Date,
    notes: String,
    tags: [String],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdBy: { type: String, required: true },
    fiscalYear: String, // e.g., "2025-26"
    quarter: { type: Number, enum: [1, 2, 3, 4] }
}, {
    timestamps: true
});

// Indexes
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ referenceType: 1, referenceId: 1 });
transactionSchema.index({ fiscalYear: 1 });

// Auto-set fiscal year and quarter
transactionSchema.pre('save', function (next) {
    const d = this.transactionDate || new Date();
    const month = d.getMonth() + 1; // 1-12
    const year = d.getFullYear();

    // Indian fiscal year: April to March
    if (month >= 4) {
        this.fiscalYear = `${year}-${String(year + 1).slice(2)}`;
        this.quarter = month <= 6 ? 1 : month <= 9 ? 2 : 3;
    } else {
        this.fiscalYear = `${year - 1}-${String(year).slice(2)}`;
        this.quarter = 4;
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
