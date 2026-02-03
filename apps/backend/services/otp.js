// OTP Service - Open Source Email-Based Authentication
// Uses nodemailer for email delivery (no paid third-party services)

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
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
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
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('[OTP] Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via console (for development/testing)
 * @param {string} identifier - Mobile or email
 * @param {string} otp - OTP code
 */
function sendConsoleOTP(identifier, otp) {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║         OTP VERIFICATION CODE          ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Recipient: ${identifier.padEnd(26)}║`);
    console.log(`║  OTP Code:  ${otp.padEnd(26)}║`);
    console.log(`║  Valid for: ${OTP_EXPIRY_MINUTES} minutes${' '.repeat(20 - String(OTP_EXPIRY_MINUTES).length)}║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    return { success: true, mode: 'console' };
}

/**
 * Send OTP to recipient
 * @param {string} identifier - Email address or mobile number
 * @param {string} method - 'email' or 'console' (default: 'email')
 */
async function sendOTP(identifier, method = 'email') {
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

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
        sendConsoleOTP(identifier, code);
    }

    // Send based on method
    let sendResult = { success: true };

    // Check if identifier is an email
    const isEmail = identifier.includes('@');

    if (method === 'email' && isEmail && process.env.EMAIL_USER) {
        sendResult = await sendEmailOTP(identifier, code);
    } else if (method === 'email' && !isEmail) {
        // For mobile numbers without SMS gateway, just use console mode
        console.log('[OTP] Mobile OTP requested - using console mode (no SMS gateway configured)');
        sendResult = { success: true, mode: 'console' };
    }

    // If email failed in production, return error
    if (!sendResult.success && process.env.NODE_ENV === 'production') {
        return {
            success: false,
            error: 'DELIVERY_FAILED',
            message: 'Failed to send OTP. Please try again.'
        };
    }

    return {
        success: true,
        method: isEmail ? 'email' : 'console',
        message: isEmail
            ? 'OTP sent successfully to your email'
            : 'OTP sent successfully',
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
    for (const [key, value] of otpStore.entries()) {
        if (now > value.expiresAt) {
            otpStore.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
    sendOTP,
    verifyOTP,
    generateOTP,
    sendEmailOTP,
    sendConsoleOTP
};
