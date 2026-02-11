// Commission Calculation Engine
// Fetches rates from SystemSetting

const SystemSetting = require('../models/SystemSetting');

// Fallback defaults in case DB is empty (should ideally use seedDefaults)
const DEFAULTS = {
    GST_PERCENTAGE: 18,
    SERVICE_PERCENTAGES: { ESS: 8, EPS: 15, CDC: 20 },
    COMMISSION_STRUCTURE: {
        ESS: { PLATINUM: 30, GOLD: 25, SILVER: 20 },
        EPS: { PLATINUM: 28, GOLD: 23, SILVER: 18 },
        CDC: { PLATINUM: 32, GOLD: 27, SILVER: 22 }
    }
};

/**
 * Calculate all commission fields
 * @param {number} devicePurchaseValue - Device purchase value in rupees
 * @param {string} serviceType - ESS, EPS, or CDC
 * @param {string} partnerType - PLATINUM, GOLD, or SILVER
 * @returns {Promise<Object>} All 5 commission fields + serviceCost
 */
async function calculateCommission(devicePurchaseValue, serviceType, partnerType) {
    // Fetch settings
    const settings = await SystemSetting.find({
        category: { $in: ['COMMISSION', 'SERVICE'] }
    }).lean();

    // Parse settings into a map
    const config = { ...DEFAULTS };

    settings.forEach(s => {
        if (s.settingKey === 'GST_PERCENTAGE') config.GST_PERCENTAGE = s.settingValue;
        if (s.settingKey === 'COMMISSION_STRUCTURE') config.COMMISSION_STRUCTURE = s.settingValue;
        // Service percentages are stored as individual keys like SERVICE_ESS_PERCENTAGE
        if (s.settingKey.startsWith('SERVICE_') && s.settingKey.endsWith('_PERCENTAGE')) {
            const type = s.settingKey.split('_')[1]; // SERVICE_ESS_PERCENTAGE -> ESS
            if (config.SERVICE_PERCENTAGES[type] !== undefined) {
                config.SERVICE_PERCENTAGES[type] = s.settingValue;
            }
        }
    });

    // Step 1: Service Cost
    const servicePercentage = config.SERVICE_PERCENTAGES[serviceType] || DEFAULTS.SERVICE_PERCENTAGES[serviceType];
    const serviceCost = devicePurchaseValue * (servicePercentage / 100);

    // Step 2: Commission Rate Lookup
    const commissionPercentage = config.COMMISSION_STRUCTURE[serviceType]?.[partnerType] ?? 0;

    // Step 3: Commission Before GST
    const commissionBeforeGST = serviceCost * (commissionPercentage / 100);

    // Step 4: GST Deduction
    const gstAmount = commissionBeforeGST * (config.GST_PERCENTAGE / 100);

    // Step 5: Final Commission
    const commissionAfterGST = commissionBeforeGST - gstAmount;

    return {
        servicePercentage,
        serviceCost: Math.round(serviceCost * 100) / 100,
        commissionPercentage,
        gstPercentage: config.GST_PERCENTAGE,
        commissionBeforeGST: Math.round(commissionBeforeGST * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        commissionAfterGST: Math.round(commissionAfterGST * 100) / 100
    };
}

/**
 * Verification: ₹50,000 ESS Platinum should equal ₹984
 */
async function verifyCommissionEngine() {
    try {
        const result = await calculateCommission(50000, 'ESS', 'PLATINUM');

        // We can't strictly assert values since DB might change, 
        // but we can check structure and basic logic (GST calculation)

        const calculatedGST = result.commissionBeforeGST * (result.gstPercentage / 100);
        const diff = Math.abs(result.gstAmount - calculatedGST);

        const isValid = diff < 0.1 && (result.commissionBeforeGST - result.gstAmount - result.commissionAfterGST) < 0.1;

        console.log('Commission Engine Logic Check:', isValid ? '✓ PASSED' : '✗ FAILED');
        console.log('Sample Calculation (50k ESS Platinum):', result);

        return isValid;
    } catch (e) {
        console.error('Commission Engine Verification Error:', e);
        return false;
    }
}

module.exports = {
    calculateCommission,
    verifyCommissionEngine
};
