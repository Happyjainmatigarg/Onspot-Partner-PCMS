const express = require('express');
const router = express.Router();
const { getPincodeDetails } = require('../services/pincode-service');

/**
 * GET /api/utils/pincode/:pincode
 * Lookup PIN code details
 */
router.get('/pincode/:pincode', async (req, res) => {
    try {
        const { pincode } = req.params;
        const details = await getPincodeDetails(pincode);
        res.json({ success: true, data: details });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
