// OTP Service - Open Source Multi-Channel Authentication
// Supports: Email (nodemailer), SMS (TextBelt free API), Console (dev mode)

const crypto = require('crypto');
const Redis = require('ioredis');
const { transporter } = require('./email');

// Initialize Redis client
// We use lazyConnect to avoid immediate connection errors crashing the script if handled manually, 
// strictly speaking ioredis handles reconnection, but for fallback logic we need to know state.
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    retryStrategy: (times) => {
        if (process.env.NODE_ENV !== 'production' && times > 3) {
            return null; // Stop retrying in dev after 3 attempts to allow fallback
        }
        return Math.min(times * 50, 2000);
    }
});

let redisAvailable = false;
// In-memory fallback
const memoryStore = new Map();

redis.connect().then(() => {
    console.log('[Redis] Connected to Redis for OTP storage');
    redisAvailable = true;
}).catch((err) => {
    console.error('[Redis] Connection failed, using in-memory store (Dev Mode):', err.message);
    redisAvailable = false;
});

redis.on('error', (err) => {
    // Suppress heavy logging of connection refused in dev
    if (process.env.NODE_ENV === 'production') {
        console.error('[Redis] Error:', err);
    }
});

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const MAX_OTP_ATTEMPTS = 3;
const MAX_SEND_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

/**
 * Generate secure 6-digit OTP
 */
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send OTP via Email
 */
async function sendEmailOTP(email, otp) {
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'OnSpot Partner Portal';

    try {
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Your OnSpot Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #10b981; margin: 0;">OnSpot</h1>
                        <p style="color: #666; margin-top: 5px;">Partner Portal</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 30px; text-align: center; color: white;">
                        <p style="margin: 0 0 15px 0; font-size: 16px;">Your verification code is:</p>
                        <div style="background: white; color: #10b981; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; font-family: monospace;">
                            ${otp}
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
                        <p style="margin: 0; color: #374151; font-size: 14px;">
                            <strong>⏱ Valid for ${OTP_EXPIRY_MINUTES} minutes</strong>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 13px;">
                            Do not share this code with anyone. OnSpot will never ask for your OTP.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p>If you didn't request this code, please ignore this email.</p>
                        <p style="margin-top: 10px;">© ${new Date().getFullYear()} OnSpot Partner Portal</p>
                    </div>
                </div>
            `,
            text: `Your OnSpot verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[OTP] Email sent:', info.messageId);
        return { success: true, messageId: info.messageId, method: 'email' };

    } catch (error) {
        console.error('[OTP] Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via SMS - DISABLED
 */
async function sendSMSOTP(mobile, otp) {
    console.log('[OTP] SMS OTP is disabled. Use Email OTP instead.');
    return { success: false, error: 'SMS_DISABLED', message: 'SMS OTP is disabled. Please use Email OTP.' };
}

/**
 * Send OTP via WhatsApp (Demo)
 */
function sendWhatsAppOTP(mobile, otp) {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║             WHATSAPP OTP (Demo Mode)               ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  To: ${mobile.padEnd(44)}║`);
    console.log(`║  OTP: ${otp.padEnd(43)}║`);
    console.log(`║  Valid: ${OTP_EXPIRY_MINUTES} minutes${' '.repeat(35 - String(OTP_EXPIRY_MINUTES).length)}║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    return { success: true, method: 'whatsapp', mode: 'demo' };
}

/**
 * Send OTP via console (Development)
 */
function sendConsoleOTP(identifier, otp) {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║              OTP VERIFICATION CODE                 ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  Recipient: ${identifier.padEnd(38)}║`);
    console.log(`║  OTP Code:  ${otp.padEnd(38)}║`);
    console.log(`║  Valid for: ${OTP_EXPIRY_MINUTES} minutes${' '.repeat(32 - String(OTP_EXPIRY_MINUTES).length)}║`);
    console.log('║                                                    ║');
    console.log('║  💡 For testing, use this code or "123456"         ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    return { success: true, method: 'console' };
}

/**
 * Send OTP to recipient
 */
async function sendOTP(identifier, method = 'auto') {
    const key = `otp:${identifier}`;
    const rateLimitKey = `otp_rate:${identifier}`;

    let attempts = 0;

    // Rate Limiting
    if (redisAvailable) {
        attempts = await redis.get(rateLimitKey);
    } else {
        // Simple in-memory rate limit check (optional, or simplify for dev)
        // For simplicity in dev fallback, we might skip strict rate limiting or use memory map
    }

    if (attempts && parseInt(attempts) >= MAX_SEND_ATTEMPTS) {
        // Calculate TTL
        let ttl = 60 * 60; // default
        if (redisAvailable) {
            ttl = await redis.ttl(rateLimitKey);
        }
        return {
            success: false,
            error: 'MAX_SEND_ATTEMPTS',
            message: `Maximum ${MAX_SEND_ATTEMPTS} OTP requests reached. Please wait.`,
            retryAfter: ttl
        };
    }

    const code = generateOTP();

    // Store OTP
    if (redisAvailable) {
        await redis.set(key, JSON.stringify({
            code,
            attempts: 0
        }), 'EX', OTP_EXPIRY_MINUTES * 60);

        if (!attempts) {
            await redis.set(rateLimitKey, 1, 'EX', RATE_LIMIT_WINDOW);
        } else {
            await redis.incr(rateLimitKey);
        }
    } else {
        // In-memory store
        memoryStore.set(key, {
            code,
            attempts: 0,
            expiresAt: Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000)
        });
        // Cleanup memory store occasionally would be needed, but for dev it handles itself on restart
    }

    const isEmail = identifier.includes('@');
    if (method === 'auto' || method === 'sms') method = 'email'; // Force email

    if (process.env.NODE_ENV !== 'production') {
        sendConsoleOTP(identifier, code);
    }

    let sendResult = { success: true };

    if (method === 'email' && isEmail && process.env.EMAIL_USER) {
        sendResult = await sendEmailOTP(identifier, code);
    } else if (method === 'sms' && !isEmail) {
        sendResult = await sendSMSOTP(identifier, code);
        if (!sendResult.success) {
            console.log('[OTP] SMS failed, using console mode');
            sendResult = sendConsoleOTP(identifier, code);
        }
    } else if (method === 'whatsapp' && !isEmail) {
        sendResult = sendWhatsAppOTP(identifier, code);
    } else {
        sendResult = sendConsoleOTP(identifier, code);
    }

    // Special Dev Handling: If email failed but we are in dev, return success with warning and the OTP
    if (!sendResult.success && process.env.NODE_ENV !== 'production') {
        return {
            success: true,
            method: 'console',
            message: 'Email failed (missing creds?), but OTP generated for testing.',
            warning: sendResult.error,
            devOTP: code
        };
    }

    if (!sendResult.success) {
        return sendResult;
    }

    let message = '';
    switch (sendResult.method) {
        case 'email': message = 'OTP sent to your email address'; break;
        case 'sms': message = 'OTP sent via SMS to your mobile'; break;
        case 'whatsapp': message = 'OTP sent via WhatsApp'; break;
        default: message = 'OTP generated (check server logs in dev mode)';
    }

    return {
        success: true,
        method: sendResult.method,
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { devOTP: code })
    };
}

/**
 * Verify OTP
 */
async function verifyOTP(identifier, code) {
    const key = `otp:${identifier}`;

    let storedData = null;
    if (redisAvailable) {
        storedData = await redis.get(key);
    } else {
        const data = memoryStore.get(key);
        if (data) {
            // Check expiry for in-memory
            if (Date.now() > data.expiresAt) {
                memoryStore.delete(key);
                storedData = null;
            } else {
                storedData = JSON.stringify(data);
            }
        }
    }

    console.log(`[OTP] Verifying for ${identifier}. Code: ${code}`);

    // Allow test OTP "123456" in development
    if (process.env.NODE_ENV !== 'production' && code === '123456') {
        if (storedData) {
            if (redisAvailable) await redis.del(key);
            else memoryStore.delete(key);
        }
        return {
            success: true,
            verified: true,
            message: 'OTP verified successfully (test mode)'
        };
    }

    if (!storedData) {
        return {
            success: false,
            verified: false,
            error: 'OTP_NOT_FOUND',
            message: 'OTP not found or expired. Please request a new one.'
        };
    }

    const otpData = JSON.parse(storedData);

    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
        if (redisAvailable) await redis.del(key);
        else memoryStore.delete(key);
        return {
            success: false,
            verified: false,
            error: 'MAX_ATTEMPTS',
            message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
    }

    if (otpData.code !== code) {
        otpData.attempts += 1;
        if (redisAvailable) {
            await redis.set(key, JSON.stringify(otpData), 'KEEPTTL');
        } else {
            // Update memory
            const existing = memoryStore.get(key);
            if (existing) {
                existing.attempts = otpData.attempts;
                memoryStore.set(key, existing);
            }
        }

        return {
            success: false,
            verified: false,
            error: 'INVALID_OTP',
            message: 'Invalid OTP. Please try again.',
            remainingAttempts: MAX_OTP_ATTEMPTS - otpData.attempts
        };
    }

    if (redisAvailable) await redis.del(key);
    else memoryStore.delete(key);

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
    sendEmailOTP,
    sendSMSOTP,
    sendWhatsAppOTP
};
