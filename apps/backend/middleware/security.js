const xss = require('xss');

// ========== XSS Sanitization ==========
function sanitizeInput(obj) {
    if (typeof obj === 'string') {
        return xss(obj, {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeInput(item));
    }
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
            sanitized[key] = sanitizeInput(obj[key]);
        }
        return sanitized;
    }
    return obj;
}

function xssSanitizer(req, res, next) {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
}

// ========== Request Logging ==========
function requestLogger(req, res, next) {
    req.clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.connection?.remoteAddress
        || req.socket?.remoteAddress
        || 'unknown';
    req.clientUserAgent = req.headers['user-agent'] || 'unknown';
    req.requestTimestamp = new Date();
    next();
}

// ========== Input Validation Patterns ==========
const VALIDATION_PATTERNS = {
    mobile: /^[6-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    gstNumber: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    pinCode: /^\d{6}$/,
    partnerId: /^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/,
    customerId: /^CUST-[6-9]\d{9}-[A-Z0-9]{4}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*]).{8,}$/
};

function validateField(value, pattern, fieldName) {
    if (!value) return { valid: false, error: `${fieldName} is required` };
    if (!pattern.test(value)) return { valid: false, error: `${fieldName} format is invalid` };
    return { valid: true };
}

// ========== Indian States List ==========
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
    "Puducherry"
];

// ========== Security Headers Enhancement ==========
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.removeHeader('X-Powered-By');
    next();
}

// ========== File Upload Validation ==========
function validateFileUpload(allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB = 5) {
    return (req, res, next) => {
        if (!req.file && !req.files) return next();

        const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

        for (const file of files) {
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    error: `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`
                });
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                return res.status(400).json({
                    error: `File too large. Maximum size: ${maxSizeMB}MB`
                });
            }
        }
        next();
    };
}

// ========== Monetary Value Sanitizer ==========
function sanitizeMonetaryValue(value) {
    const num = Number(value);
    if (isNaN(num) || num < 0) return 0;
    return Math.round(num * 100) / 100;
}

// ========== Anti-Injection for MongoDB ==========
function mongoSanitize(req, res, next) {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
}

module.exports = {
    xssSanitizer,
    requestLogger,
    securityHeaders,
    validateFileUpload,
    sanitizeMonetaryValue,
    mongoSanitize,
    validateField,
    VALIDATION_PATTERNS,
    INDIAN_STATES
};
