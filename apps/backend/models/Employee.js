const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    firstName: { type: String, required: true, minlength: 2 },
    lastName: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    department: {
        type: String,
        required: true,
        enum: ['MANAGEMENT', 'OPERATIONS', 'ACCOUNTS', 'SALES', 'SUPPORT', 'TECHNICAL', 'HR', 'MARKETING']
    },
    designation: { type: String, required: true },
    role: {
        type: String,
        enum: ['DIRECTOR', 'MANAGER', 'TEAM_LEAD', 'SENIOR', 'JUNIOR', 'INTERN'],
        default: 'JUNIOR'
    },
    reportingTo: { type: String, default: null }, // employeeId of manager
    dateOfJoining: { type: Date, required: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    address: {
        street: String,
        city: String,
        state: String,
        pinCode: { type: String, match: /^\d{6}$/ }
    },
    salary: {
        basic: { type: Number, required: true, min: 0 },
        hra: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        netSalary: { type: Number, default: 0 }
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        panNumber: String
    },
    emergencyContact: {
        name: String,
        mobile: String,
        relation: String
    },
    documents: [{
        type: { type: String }, // 'AADHAR', 'PAN', 'RESUME', 'OFFER_LETTER'
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    attendance: {
        totalPresent: { type: Number, default: 0 },
        totalAbsent: { type: Number, default: 0 },
        totalLeaves: { type: Number, default: 0 },
        leaveBalance: { type: Number, default: 24 } // 24 leaves per year
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED'],
        default: 'ACTIVE'
    },
    terminationDate: Date,
    terminationReason: String,
    notes: String
}, {
    timestamps: true
});

// Indexes
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ reportingTo: 1 });

// Calculate net salary before save
employeeSchema.pre('save', function(next) {
    if (this.salary) {
        this.salary.netSalary = (this.salary.basic || 0) + (this.salary.hra || 0) +
            (this.salary.allowances || 0) - (this.salary.deductions || 0);
    }
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
