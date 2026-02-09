/**
 * PIN Code lookup service for India
 * Provides city, state, and district information based on PIN code
 */

const pincodeCache = new Map();

/**
 * Get location details by PIN code
 * Uses India Post PIN code API
 * @param {string} pincode - 6 digit PIN code
 * @returns {Promise<{city: string, state: string, district: string}>}
*/
async function getPincodeDetails(pincode) {
    // Validate PIN code format
    if (!/^\d{6}$/.test(pincode)) {
        throw new Error('Invalid PIN code format. Must be 6 digits.');
    }

    // Check cache first
    if (pincodeCache.has(pincode)) {
        return pincodeCache.get(pincode);
    }

    try {
        // Use India Post API
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            const details = {
                city: postOffice.Division || postOffice.District,
                state: postOffice.State,
                district: postOffice.District,
                country: postOffice.Country
            };

            // Cache the result
            pincodeCache.set(pincode, details);
            return details;
        } else {
            throw new Error('PIN code not found');
        }
    } catch (error) {
        console.error('PIN code lookup failed:', error);
        throw new Error('Failed to fetch PIN code details. Please enter manually.');
    }
}

/**
 * Clear the PIN code cache (useful for testing or memory management)
 */
function clearCache() {
    pincodeCache.clear();
}

module.exports = {
    getPincodeDetails,
    clearCache
};
