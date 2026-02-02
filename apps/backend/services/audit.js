const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} params Audit log parameters
 * @param {string} params.action - CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN
 * @param {string} params.entity - PARTNER, CUSTOMER, SERVICE, PRODUCT, ADMIN
 * @param {string} params.entityId - The ID of the affected entity
 * @param {string} params.performedBy - Email or ID of performer
 * @param {string} params.performedByRole - PARTNER, CUSTOMER, ADMIN, SUPER_ADMIN, SYSTEM
 * @param {Object} params.oldData - Previous data snapshot (for updates)
 * @param {Object} params.newData - New data snapshot
 * @param {string} params.ipAddress - Request IP
 * @param {string} params.userAgent - Browser user agent
 * @param {string} params.details - Additional details
 */
async function createAuditLog({
    action,
    entity,
    entityId,
    performedBy,
    performedByRole,
    oldData = null,
    newData = null,
    ipAddress = null,
    userAgent = null,
    details = null
}) {
    try {
        const log = new AuditLog({
            action,
            entity,
            entityId,
            performedBy,
            performedByRole,
            oldData,
            newData,
            ipAddress,
            userAgent,
            details,
            timestamp: new Date()
        });

        await log.save();
        return log;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break main flow
        // But log the error for monitoring
    }
}

/**
 * Middleware to extract audit info from request
 */
function extractAuditInfo(req) {
    return {
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
}

module.exports = {
    createAuditLog,
    extractAuditInfo
};
