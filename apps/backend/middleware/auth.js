const jwt = require('jsonwebtoken');
const Partner = require('../models/Partner');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'onspot-jwt-secret-change-in-production';

/**
 * Generate JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Authentication middleware
 */
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

/**
 * Role-based authorization middleware
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

/**
 * Admin permission check middleware
 */
function requirePermission(permission) {
    return async (req, res, next) => {
        if (!req.user || !req.user.adminId) {
            return res.status(401).json({ error: 'Admin authentication required' });
        }

        const admin = await Admin.findOne({ adminId: req.user.adminId });
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found' });
        }

        if (!admin.permissions[permission]) {
            return res.status(403).json({ error: `Permission required: ${permission}` });
        }

        req.admin = admin;
        next();
    };
}

module.exports = {
    generateToken,
    verifyToken,
    authenticate,
    authorize,
    requirePermission,
    JWT_SECRET
};
