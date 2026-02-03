const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../services/otp');

// POST /api/otp/send
// Supports: email, sms, whatsapp, auto (default)
router.post('/send', async (req, res) => {
    try {
        const { mobile, email, method = 'auto' } = req.body;

        // Require either mobile or email
        if (!mobile && !email) {
            return res.status(400).json({ error: 'Mobile number or email is required' });
        }

        let identifier;

        if (email) {
            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            identifier = email.toLowerCase();
        } else {
            // Validate mobile format
            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return res.status(400).json({ error: 'Invalid mobile number format. Must be 10 digits starting with 6-9.' });
            }
            identifier = mobile;
        }

        // Valid methods: email, sms, whatsapp, auto
        const validMethods = ['email', 'sms', 'whatsapp', 'auto'];
        const selectedMethod = validMethods.includes(method) ? method : 'auto';

        const result = await sendOTP(identifier, selectedMethod);

        if (!result.success) {
            return res.status(429).json(result);
        }

        res.json({
            ...result,
            hint: result.method === 'email'
                ? 'Check your email inbox and spam folder'
                : result.method === 'sms'
                    ? 'OTP sent to your mobile via SMS'
                    : result.method === 'whatsapp'
                        ? 'OTP sent via WhatsApp'
                        : 'OTP logged to server console (development mode)'
        });
    } catch (error) {
        console.error('OTP send error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST /api/otp/verify
router.post('/verify', async (req, res) => {
    try {
        const { mobile, email, code, otp } = req.body;
        const verificationCode = code || otp;  // Accept both field names for compatibility
        const identifier = email ? email.toLowerCase() : mobile;

        if (!identifier || !verificationCode) {
            return res.status(400).json({ error: 'Identifier (mobile/email) and code are required' });
        }

        const result = verifyOTP(identifier, verificationCode);

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
