const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    settingKey: {
        type: String,
        required: true,
        unique: true
    },
    settingValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['COMMISSION', 'SERVICE', 'PARTNER', 'SYSTEM'],
        required: true
    },
    updatedBy: String,
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
systemSettingSchema.index({ settingKey: 1 }, { unique: true });
systemSettingSchema.index({ category: 1 });

// Default seed values
systemSettingSchema.statics.seedDefaults = async function () {
    const defaults = [
        { settingKey: 'SERVICE_ESS_PERCENTAGE', settingValue: 8, category: 'SERVICE', description: 'ESS service percentage of device value' },
        { settingKey: 'SERVICE_EPS_PERCENTAGE', settingValue: 15, category: 'SERVICE', description: 'EPS service percentage of device value' },
        { settingKey: 'SERVICE_CDC_PERCENTAGE', settingValue: 20, category: 'SERVICE', description: 'CDC service percentage of device value' },
        { settingKey: 'GST_PERCENTAGE', settingValue: 18, category: 'COMMISSION', description: 'GST deduction percentage' },
        {
            settingKey: 'COMMISSION_STRUCTURE',
            settingValue: {
                ESS: { PLATINUM: 30, GOLD: 25, SILVER: 20 },
                EPS: { PLATINUM: 28, GOLD: 23, SILVER: 18 },
                CDC: { PLATINUM: 32, GOLD: 27, SILVER: 22 }
            },
            category: 'COMMISSION',
            description: 'Commission percentages by service type and partner tier'
        },
        { settingKey: 'OTP_EXPIRY_MINUTES', settingValue: 10, category: 'SYSTEM', description: 'OTP code expiration time in minutes' },
        { settingKey: 'MAX_OTP_ATTEMPTS', settingValue: 3, category: 'SYSTEM', description: 'Maximum OTP verification attempts' },
        { settingKey: 'SESSION_TIMEOUT_HOURS', settingValue: 24, category: 'SYSTEM', description: 'Session timeout in hours' },
        { settingKey: 'MAX_FILE_UPLOAD_MB', settingValue: 5, category: 'SYSTEM', description: 'Maximum file upload size in MB' }
    ];

    for (const setting of defaults) {
        await this.findOneAndUpdate(
            { settingKey: setting.settingKey },
            setting,
            { upsert: true, new: true }
        );
    }

    console.log('System settings seeded successfully');
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
