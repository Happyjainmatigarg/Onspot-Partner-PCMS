const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../services/otp');

// POST /api/otp/send
router.post('/send', async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }

        // Validate mobile format
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).json({ error: 'Invalid mobile number format. Must be 10 digits starting with 6-9.' });
        }

        const result = await sendOTP(mobile);

        if (!result.success) {
            return res.status(429).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('OTP send error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST /api/otp/verify
router.post('/verify', async (req, res) => {
    try {
        const { mobile, code, otp } = req.body;
        const verificationCode = code || otp;  // Accept both field names for compatibility

        if (!mobile || !verificationCode) {
            return res.status(400).json({ error: 'Mobile and code are required' });
        }

        const result = await verifyOTP(mobile, verificationCode);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('OTP verify error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
