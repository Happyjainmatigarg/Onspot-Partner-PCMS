const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        match: /^PRD-[A-Z0-9]{6}$/
    },
    customerId: {
        type: String,
        required: true
    },
    partnerId: {
        type: String,
        required: true
    },
    productType: {
        type: String,
        required: true,
        enum: ['Laptop', 'Washing Machine', 'Refrigerator', 'AC', 'TV', 'Mobile', 'Other']
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    purchaseValue: {
        type: Number,
        required: true,
        min: 1000,
        max: 1000000
    },
    purchaseDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return v <= now && v >= thirtyDaysAgo;
            },
            message: 'Purchase date must be within the last 30 days and not in the future'
        }
    },
    invoiceUrl: String
}, {
    timestamps: true
});

// Indexes
productSchema.index({ productId: 1 }, { unique: true });
productSchema.index({ customerId: 1 });
productSchema.index({ partnerId: 1 });
productSchema.index({ serialNumber: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
