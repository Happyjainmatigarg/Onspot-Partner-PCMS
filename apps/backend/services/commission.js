// Commission Calculation Engine
// Exact formulas as per spec

const COMMISSION_STRUCTURE = {
    ESS: { PLATINUM: 30, GOLD: 25, SILVER: 20 },
    EPS: { PLATINUM: 28, GOLD: 23, SILVER: 18 },
    CDC: { PLATINUM: 32, GOLD: 27, SILVER: 22 }
};

const SERVICE_PERCENTAGES = {
    ESS: 8,
    EPS: 15,
    CDC: 20
};

const GST_PERCENTAGE = 18;

/**
 * Calculate all commission fields
 * @param {number} devicePurchaseValue - Device purchase value in rupees
 * @param {string} serviceType - ESS, EPS, or CDC
 * @param {string} partnerType - PLATINUM, GOLD, or SILVER
 * @returns {Object} All 5 commission fields + serviceCost
 */
function calculateCommission(devicePurchaseValue, serviceType, partnerType) {
    // Step 1: Service Cost
    const servicePercentage = SERVICE_PERCENTAGES[serviceType];
    const serviceCost = devicePurchaseValue * (servicePercentage / 100);

    // Step 2: Commission Rate Lookup
    const commissionPercentage = COMMISSION_STRUCTURE[serviceType][partnerType];

    // Step 3: Commission Before GST
    const commissionBeforeGST = serviceCost * (commissionPercentage / 100);

    // Step 4: GST Deduction (always 18%)
    const gstAmount = commissionBeforeGST * (GST_PERCENTAGE / 100);

    // Step 5: Final Commission
    const commissionAfterGST = commissionBeforeGST - gstAmount;

    return {
        servicePercentage,
        serviceCost: Math.round(serviceCost * 100) / 100,
        commissionPercentage,
        gstPercentage: GST_PERCENTAGE,
        commissionBeforeGST: Math.round(commissionBeforeGST * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        commissionAfterGST: Math.round(commissionAfterGST * 100) / 100
    };
}

/**
 * Verification: ₹50,000 ESS Platinum should equal ₹984
 * serviceCost = 50000 × 0.08 = ₹4,000
 * commissionBeforeGST = 4000 × 0.30 = ₹1,200
 * gstAmount = 1200 × 0.18 = ₹216
 * commissionAfterGST = 1200 − 216 = ₹984 ✓
 */
function verifyCommissionEngine() {
    const result = calculateCommission(50000, 'ESS', 'PLATINUM');
    const expected = {
        serviceCost: 4000,
        commissionBeforeGST: 1200,
        gstAmount: 216,
        commissionAfterGST: 984
    };

    const isValid =
        result.serviceCost === expected.serviceCost &&
        result.commissionBeforeGST === expected.commissionBeforeGST &&
        result.gstAmount === expected.gstAmount &&
        result.commissionAfterGST === expected.commissionAfterGST;

    console.log('Commission Engine Verification:', isValid ? '✓ PASSED' : '✗ FAILED');
    console.log('Expected:', expected);
    console.log('Got:', result);

    return isValid;
}

module.exports = {
    calculateCommission,
    verifyCommissionEngine,
    COMMISSION_STRUCTURE,
    SERVICE_PERCENTAGES,
    GST_PERCENTAGE
};
