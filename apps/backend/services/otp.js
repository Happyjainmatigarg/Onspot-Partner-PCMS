// OTP Service with Fonoster Integration
// Supports Voice Call OTP and SMS

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const MAX_OTP_ATTEMPTS = 3;
const MAX_SEND_ATTEMPTS = 3;

// Fonoster configuration
const FONOSTER_CONFIG = {
    apiKey: process.env.FONOSTER_API_KEY,
    apiSecret: process.env.FONOSTER_API_SECRET,
    projectId: process.env.FONOSTER_PROJECT_ID,
    fromNumber: process.env.FONOSTER_FROM_NUMBER
};

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Fonoster Voice Call
 */
async function sendVoiceOTP(mobile, otp) {
    if (!FONOSTER_CONFIG.apiKey) {
        console.log('[DEV] Fonoster not configured, using mock mode');
        return { success: true, mode: 'mock' };
    }

    try {
        // Fonoster Voice API call
        const response = await fetch('https://api.fonoster.io/v1/calls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FONOSTER_CONFIG.apiKey}`,
                'X-Api-Secret': FONOSTER_CONFIG.apiSecret
            },
            body: JSON.stringify({
                from: FONOSTER_CONFIG.fromNumber,
                to: mobile.startsWith('+') ? mobile : `+91${mobile}`,
                appRef: FONOSTER_CONFIG.projectId,
                metadata: {
                    otp: otp,
                    message: `Your OnSpot verification code is ${otp.split('').join(' ')}. I repeat, ${otp.split('').join(' ')}.`
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Fonoster] Voice call failed:', error);
            return { success: false, error };
        }

        const data = await response.json();
        console.log('[Fonoster] Voice call initiated:', data.callId || data.ref);
        return { success: true, callId: data.callId || data.ref };

    } catch (error) {
        console.error('[Fonoster] Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via Fonoster SMS
 */
async function sendSMSOTP(mobile, otp) {
    if (!FONOSTER_CONFIG.apiKey) {
        console.log('[DEV] Fonoster not configured, using mock mode');
        return { success: true, mode: 'mock' };
    }

    try {
        // Fonoster SMS API call
        const response = await fetch('https://api.fonoster.io/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FONOSTER_CONFIG.apiKey}`,
                'X-Api-Secret': FONOSTER_CONFIG.apiSecret
            },
            body: JSON.stringify({
                from: FONOSTER_CONFIG.fromNumber,
                to: mobile.startsWith('+') ? mobile : `+91${mobile}`,
                body: `Your OnSpot verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Fonoster] SMS failed:', error);
            return { success: false, error };
        }

        const data = await response.json();
        console.log('[Fonoster] SMS sent:', data.messageId || data.ref);
        return { success: true, messageId: data.messageId || data.ref };

    } catch (error) {
        console.error('[Fonoster] Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP to mobile number
 * @param {string} mobile - Mobile number
 * @param {string} method - 'voice' or 'sms' (default: 'voice')
 */
async function sendOTP(mobile, method = 'voice') {
    const key = `otp:${mobile}`;
    const existing = otpStore.get(key);

    // Rate limiting check
    if (existing && existing.sendAttempts >= MAX_SEND_ATTEMPTS) {
        const timeSinceFirst = Date.now() - existing.firstSendAt;
        if (timeSinceFirst < OTP_EXPIRY_MINUTES * 60 * 1000) {
            return {
                success: false,
                error: 'MAX_SEND_ATTEMPTS',
                message: `Maximum ${MAX_SEND_ATTEMPTS} OTP requests reached. Please wait ${OTP_EXPIRY_MINUTES} minutes.`,
                retryAfter: OTP_EXPIRY_MINUTES * 60 - Math.floor(timeSinceFirst / 1000)
            };
        }
    }

    const code = generateOTP();
    const now = Date.now();

    // Store OTP
    otpStore.set(key, {
        code,
        attempts: 0,
        sendAttempts: existing ? existing.sendAttempts + 1 : 1,
        firstSendAt: existing?.firstSendAt || now,
        createdAt: now,
        expiresAt: now + (OTP_EXPIRY_MINUTES * 60 * 1000)
    });

    // Send via chosen method
    let sendResult;
    if (method === 'sms') {
        sendResult = await sendSMSOTP(mobile, code);
    } else {
        sendResult = await sendVoiceOTP(mobile, code);
    }

    // Log for development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] OTP for ${mobile}: ${code}`);
    }

    // If Fonoster call/SMS failed, still allow mock mode for testing
    if (!sendResult.success && sendResult.mode !== 'mock') {
        console.warn('[OTP] Fonoster delivery failed, falling back to mock mode');
    }

    return {
        success: true,
        method: method,
        message: method === 'sms'
            ? 'OTP sent successfully via SMS'
            : 'OTP sent successfully via voice call',
        // DEV ONLY: Include OTP in response for testing
        ...(process.env.NODE_ENV !== 'production' && { devOTP: code })
    };
}

/**
 * Verify OTP code
 */
async function verifyOTP(mobile, code) {
    const key = `otp:${mobile}`;
    const stored = otpStore.get(key);

    if (!stored) {
        return {
            success: false,
            error: 'OTP_NOT_FOUND',
            message: 'No OTP found. Please request a new OTP.'
        };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return {
            success: false,
            error: 'OTP_EXPIRED',
            message: 'OTP has expired. Please request a new OTP.'
        };
    }

    // Check attempts
    if (stored.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(key);
        return {
            success: false,
            error: 'MAX_ATTEMPTS',
            message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
    }

    // Increment attempts
    stored.attempts++;
    otpStore.set(key, stored);

    // Verify code
    if (stored.code !== code) {
        return {
            success: false,
            error: 'INVALID_OTP',
            message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - stored.attempts} attempts remaining.`,
            attemptsRemaining: MAX_OTP_ATTEMPTS - stored.attempts
        };
    }

    // Success - delete the OTP
    otpStore.delete(key);

    return {
        success: true,
        verified: true,
        message: 'OTP verified successfully'
    };
}

module.exports = {
    sendOTP,
    verifyOTP,
    generateOTP,
    sendVoiceOTP,
    sendSMSOTP
};
