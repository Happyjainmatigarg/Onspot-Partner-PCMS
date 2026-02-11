const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    resourceId: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['EQUIPMENT', 'VEHICLE', 'TOOL', 'SOFTWARE', 'FURNITURE', 'IT_ASSET', 'OTHER']
    },
    description: String,
    serialNumber: { type: String, unique: true, sparse: true },
    purchaseDate: Date,
    purchaseValue: { type: Number, min: 0 },
    currentValue: { type: Number, min: 0 },
    depreciationRate: { type: Number, default: 10 }, // % per year
    location: {
        office: String,
        floor: String,
        room: String
    },
    assignedTo: { type: String, default: null }, // employeeId
    assignedAt: Date,
    condition: {
        type: String,
        enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'DISPOSED'],
        default: 'NEW'
    },
    maintenanceSchedule: {
        lastMaintenance: Date,
        nextMaintenance: Date,
        frequency: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'] }
    },
    warranty: {
        provider: String,
        expiryDate: Date,
        terms: String
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'],
        default: 'AVAILABLE'
    },
    notes: String
}, {
    timestamps: true
});

// Indexes
resourceSchema.index({ resourceId: 1 }, { unique: true });
resourceSchema.index({ category: 1 });
resourceSchema.index({ assignedTo: 1 });
resourceSchema.index({ status: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
