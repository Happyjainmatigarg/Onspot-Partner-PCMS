const Partner = require('../models/Partner');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateRandom(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return result;
}

// ONSPOT-DD-MM-YYYY-{P|G|S}-XXXXX
async function generatePartnerId(partnerType) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();

    const tierCode = { PLATINUM: 'P', GOLD: 'G', SILVER: 'S' }[partnerType];
    const random = generateRandom(5);

    const id = `ONSPOT-${dd}-${mm}-${yyyy}-${tierCode}-${random}`;

    // Check uniqueness
    const exists = await Partner.findOne({ partnerId: id });
    if (exists) {
        return generatePartnerId(partnerType); // Recurse on collision
    }

    return id;
}

// CUST-{10DIGITMOBILE}-{4RAND}
function generateCustomerId(mobile) {
    const random = generateRandom(4);
    return `CUST-${mobile}-${random}`;
}

// PRD-{6RAND}
function generateProductId() {
    return `PRD-${generateRandom(6)}`;
}

// SVC-{6RAND}
function generateServiceId() {
    return `SVC-${generateRandom(6)}`;
}

// ADM-{6RAND}
function generateAdminId() {
    return `ADM-${generateRandom(6)}`;
}

module.exports = {
    generatePartnerId,
    generateCustomerId,
    generateProductId,
    generateServiceId,
    generateAdminId
};
