// OTP Service - Open Source Multi-Channel Authentication
// Supports: Email (nodemailer), SMS (TextBelt free API), Console (dev mode)

const nodemailer = require('nodemailer');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const MAX_OTP_ATTEMPTS = 3;
const MAX_SEND_ATTEMPTS = 5;

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
 * Send OTP via SMS using TextBelt (Free Open Source API)
 * TextBelt offers 1 free text per day for testing, unlimited with key
 * For production, use TEXTBELT_KEY environment variable
 */
async function sendSMSOTP(mobile, otp) {
    // Format mobile number (add country code if not present)
    let formattedMobile = mobile;
    if (!mobile.startsWith('+')) {
        formattedMobile = '+91' + mobile; // Default to India
    }

    const textbeltKey = process.env.TEXTBELT_KEY || 'textbelt'; // 'textbelt' = 1 free/day

    try {
        const response = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: formattedMobile,
                message: `Your OnSpot verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share.`,
                key: textbeltKey
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('[OTP] SMS sent via TextBelt:', data.textId);
            return { success: true, textId: data.textId, method: 'sms' };
        } else {
            console.error('[OTP] TextBelt error:', data.error);
            // Fall back to console OTP if SMS fails
            return { success: false, error: data.error, quotaRemaining: data.quotaRemaining };
        }

    } catch (error) {
        console.error('[OTP] SMS sending failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via WhatsApp-style notification (using console for demo)
 * For production, integrate with WhatsApp Business API
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
 * Send OTP via console (for development/testing)
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
 * @param {string} identifier - Email address or mobile number
 * @param {string} method - 'email', 'sms', 'whatsapp', or 'auto' (default)
 */
async function sendOTP(identifier, method = 'auto') {
    const key = `otp:${identifier}`;
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

    // Check if identifier is an email
    const isEmail = identifier.includes('@');

    // Auto-detect method if not specified
    if (method === 'auto') {
        method = isEmail ? 'email' : 'sms';
    }

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
        sendConsoleOTP(identifier, code);
    }

    // Send based on method
    let sendResult = { success: true };

    if (method === 'email' && isEmail && process.env.EMAIL_USER) {
        sendResult = await sendEmailOTP(identifier, code);
    } else if (method === 'sms' && !isEmail) {
        // Try SMS first
        sendResult = await sendSMSOTP(identifier, code);

        // If SMS failed (quota exceeded), use console mode
        if (!sendResult.success) {
            console.log('[OTP] SMS failed, using console mode');
            sendResult = sendConsoleOTP(identifier, code);
        }
    } else if (method === 'whatsapp' && !isEmail) {
        sendResult = sendWhatsAppOTP(identifier, code);
    } else {
        // Fallback to console
        sendResult = sendConsoleOTP(identifier, code);
    }

    // Return appropriate message
    let message = '';
    switch (sendResult.method) {
        case 'email':
            message = 'OTP sent to your email address';
            break;
        case 'sms':
            message = 'OTP sent via SMS to your mobile';
            break;
        case 'whatsapp':
            message = 'OTP sent via WhatsApp';
            break;
        default:
            message = 'OTP generated (check server logs in dev mode)';
    }

    return {
        success: true,
        method: sendResult.method,
        message: message,
        // DEV ONLY: Include OTP in response for testing
        ...(process.env.NODE_ENV !== 'production' && { devOTP: code })
    };
}

/**
 * Verify OTP
 * @param {string} identifier - Email or mobile that received the OTP
 * @param {string} code - OTP code to verify
 */
function verifyOTP(identifier, code) {
    const key = `otp:${identifier}`;
    const stored = otpStore.get(key);

    // Allow test OTP "123456" in development
    if (process.env.NODE_ENV !== 'production' && code === '123456') {
        console.log('[OTP] Test OTP accepted for:', identifier);
        otpStore.delete(key);
        return {
            success: true,
            verified: true,
            message: 'OTP verified successfully (test mode)'
        };
    }

    if (!stored) {
        return {
            success: false,
            verified: false,
            error: 'OTP_NOT_FOUND',
            message: 'OTP not found or expired. Please request a new one.'
        };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return {
            success: false,
            verified: false,
            error: 'OTP_EXPIRED',
            message: 'OTP has expired. Please request a new one.'
        };
    }

    // Check max attempts
    if (stored.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(key);
        return {
            success: false,
            verified: false,
            error: 'MAX_ATTEMPTS',
            message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
    }

    // Verify code
    if (stored.code !== code) {
        stored.attempts += 1;
        return {
            success: false,
            verified: false,
            error: 'INVALID_OTP',
            message: 'Invalid OTP. Please try again.',
            remainingAttempts: MAX_OTP_ATTEMPTS - stored.attempts
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

/**
 * Clean up expired OTPs (run periodically)
 */
function cleanupExpiredOTPs() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, value] of otpStore.entries()) {
        if (now > value.expiresAt) {
            otpStore.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`[OTP] Cleaned up ${cleaned} expired OTPs`);
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
    sendOTP,
    verifyOTP,
    generateOTP,
    sendEmailOTP,
    sendSMSOTP,
    sendWhatsAppOTP,
    sendConsoleOTP
};
