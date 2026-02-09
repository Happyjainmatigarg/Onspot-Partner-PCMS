const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true, match: /^\d{6}$/ }
}, { _id: false });

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        match: /^CUST-[6-9]\d{9}-[A-Z0-9]{4}$/
    },
    partnerId: {
        type: String,
        required: true,
        match: /^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/
    },
    customerName: {
        type: String,
        required: true,
        minlength: 3
    },
    mobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    password: String,
    passwordSet: {
        type: Boolean,
        default: false
    },
    passwordResetToken: String,
    passwordResetExpiry: Date,
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'],
        default: 'PENDING'
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    termsAcceptedAt: Date,
    registrationDate: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

// Indexes
customerSchema.index({ customerId: 1 }, { unique: true });
customerSchema.index({ partnerId: 1 });
customerSchema.index({ mobile: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
