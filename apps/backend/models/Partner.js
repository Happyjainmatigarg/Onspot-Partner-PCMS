const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pinCode: { type: String, default: '' }
}, { _id: false });

const contactPersonSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: addressSchema, required: false }
}, { _id: false });

const partnerSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        match: /^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/
    },
    partnerType: {
        type: String,
        required: true,
        enum: ['PLATINUM', 'GOLD', 'SILVER']
    },
    applicantName: {
        type: String,
        required: true,
        minlength: 2
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
        unique: true,
        match: /^[6-9]\d{9}$/
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    gstNumber: {
        type: String,
        default: 'N/A'
    },
    panNumber: {
        type: String,
        required: true
    },
    billingAddress: {
        type: addressSchema,
        default: () => ({})
    },
    contactPerson: {
        type: contactPersonSchema,
        default: () => ({})
    },
    password: String,
    passwordSet: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
        default: 'ACTIVE'
    },
    registrationDate: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    agreementPdfUrl: String,
    createdBy: {
        type: String,
        default: 'SELF'
    },
    lastLoginAt: Date
}, {
    timestamps: true
});

// Indexes
partnerSchema.index({ partnerId: 1 }, { unique: true });
partnerSchema.index({ email: 1 }, { unique: true });
partnerSchema.index({ mobile: 1 }, { unique: true });
partnerSchema.index({ status: 1 });
partnerSchema.index({ registrationDate: 1 });

module.exports = mongoose.model('Partner', partnerSchema);
