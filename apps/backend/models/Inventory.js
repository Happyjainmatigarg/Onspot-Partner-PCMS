const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    name: { type: String, required: true },
    sku: { type: String, unique: true, sparse: true },
    category: {
        type: String,
        required: true,
        enum: ['SPARE_PARTS', 'TOOLS', 'PACKAGING', 'OFFICE_SUPPLIES', 'ELECTRONICS', 'RAW_MATERIAL', 'FINISHED_GOODS', 'OTHER']
    },
    description: String,
    unit: {
        type: String,
        default: 'PCS',
        enum: ['PCS', 'KG', 'LTR', 'MTR', 'BOX', 'SET', 'PAIR']
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    maxStock: { type: Number, default: 1000 },
    unitCost: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, min: 0 },
    totalValue: { type: Number, default: 0 },
    supplier: {
        name: String,
        contact: String,
        email: String,
        gstNumber: String
    },
    warehouse: {
        location: { type: String, default: 'MAIN' },
        rack: String,
        shelf: String
    },
    batchNumber: String,
    expiryDate: Date,
    lastRestocked: Date,
    lastAuditDate: Date,
    movements: [{
        type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'] },
        quantity: Number,
        reference: String,
        performedBy: String,
        date: { type: Date, default: Date.now },
        notes: String
    }],
    status: {
        type: String,
        enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'],
        default: 'IN_STOCK'
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes
inventorySchema.index({ itemId: 1 }, { unique: true });
inventorySchema.index({ category: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'supplier.name': 1 });

// Auto-update status based on quantity
inventorySchema.pre('save', function (next) {
    this.totalValue = this.quantity * this.unitCost;
    if (this.quantity <= 0) {
        this.status = 'OUT_OF_STOCK';
    } else if (this.quantity <= this.reorderLevel) {
        this.status = 'LOW_STOCK';
    } else {
        this.status = 'IN_STOCK';
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
