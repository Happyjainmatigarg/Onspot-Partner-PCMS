// Push Notification Service - Open Source Web Push API
// Uses VAPID keys for secure push notifications without third-party services

const webpush = require('web-push');

// Generate VAPID keys once and store in environment variables
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40tGzozmHfL8Ynl5dG2tqtlcdUj5PjXEe7X7O2Bl0mKdXm2tEeJPd1fgdGew';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAf7-1E5iHBbJzQIvkAP5Nsr5IYH_-M';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:partner@onspot.one';

// Configure web-push with VAPID details
webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// In-memory subscription store (use database in production)
const subscriptions = new Map();

/**
 * Store a push subscription for a user
 * @param {string} userId - User identifier (partnerId or email)
 * @param {object} subscription - PushSubscription object from browser
 */
function storeSubscription(userId, subscription) {
    subscriptions.set(userId, subscription);
    console.log(`[Push] Stored subscription for: ${userId}`);
    return { success: true };
}

/**
 * Remove a push subscription
 * @param {string} userId - User identifier
 */
function removeSubscription(userId) {
    subscriptions.delete(userId);
    console.log(`[Push] Removed subscription for: ${userId}`);
    return { success: true };
}

/**
 * Get subscription for a user
 * @param {string} userId - User identifier
 */
function getSubscription(userId) {
    return subscriptions.get(userId);
}

/**
 * Send push notification to a specific user
 * @param {string} userId - User identifier
 * @param {object} payload - Notification payload
 */
async function sendPushNotification(userId, payload) {
    const subscription = subscriptions.get(userId);

    if (!subscription) {
        console.log(`[Push] No subscription found for: ${userId}`);
        return { success: false, error: 'No subscription found' };
    }

    const notificationPayload = JSON.stringify({
        title: payload.title || 'OnSpot Notification',
        body: payload.body || '',
        icon: payload.icon || '/icons/notification-icon.png',
        badge: payload.badge || '/icons/badge-icon.png',
        image: payload.image,
        data: {
            url: payload.url || '/',
            timestamp: Date.now(),
            ...payload.data
        },
        actions: payload.actions || [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        tag: payload.tag || 'onspot-notification',
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false
    });

    try {
        await webpush.sendNotification(subscription, notificationPayload);
        console.log(`[Push] Notification sent to: ${userId}`);
        return { success: true };
    } catch (error) {
        console.error(`[Push] Error sending to ${userId}:`, error.message);

        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
            subscriptions.delete(userId);
            console.log(`[Push] Removed expired subscription for: ${userId}`);
        }

        return { success: false, error: error.message };
    }
}

/**
 * Send push notification to multiple users
 * @param {string[]} userIds - Array of user identifiers
 * @param {object} payload - Notification payload
 */
async function sendBulkPushNotification(userIds, payload) {
    const results = await Promise.allSettled(
        userIds.map(userId => sendPushNotification(userId, payload))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`[Push] Bulk notification: ${successful} sent, ${failed} failed`);

    return {
        success: true,
        sent: successful,
        failed: failed
    };
}

/**
 * Send notification to all subscribed users
 * @param {object} payload - Notification payload
 */
async function broadcastPushNotification(payload) {
    const userIds = Array.from(subscriptions.keys());
    return sendBulkPushNotification(userIds, payload);
}

// Notification templates for common events
const NotificationTemplates = {
    // OTP Notification
    otp: (code) => ({
        title: 'Your OTP Code',
        body: `Your verification code is: ${code}`,
        tag: 'otp-notification',
        requireInteraction: true
    }),

    // Registration Success
    registrationSuccess: (partnerId) => ({
        title: 'Registration Successful! 🎉',
        body: `Your Partner ID is ${partnerId}. Welcome to OnSpot!`,
        url: '/dashboard',
        tag: 'registration-success'
    }),

    // New Customer
    newCustomer: (customerName) => ({
        title: 'New Customer! 🆕',
        body: `${customerName} has been added to your network.`,
        url: '/customers',
        tag: 'new-customer'
    }),

    // Commission Earned
    commissionEarned: (amount) => ({
        title: 'Commission Earned! 💰',
        body: `You've earned ₹${amount} in commission.`,
        url: '/wallet',
        tag: 'commission-earned'
    }),

    // Payment Received
    paymentReceived: (amount) => ({
        title: 'Payment Received! ✅',
        body: `₹${amount} has been credited to your wallet.`,
        url: '/wallet',
        tag: 'payment-received'
    }),

    // Document Approved
    documentApproved: (docType) => ({
        title: 'Document Approved ✓',
        body: `Your ${docType} has been verified.`,
        url: '/profile',
        tag: 'document-approved'
    }),

    // General Alert
    alert: (title, message) => ({
        title: title,
        body: message,
        tag: 'general-alert'
    })
};

/**
 * Get VAPID public key for client-side subscription
 */
function getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
}

module.exports = {
    storeSubscription,
    removeSubscription,
    getSubscription,
    sendPushNotification,
    sendBulkPushNotification,
    broadcastPushNotification,
    getVapidPublicKey,
    NotificationTemplates
};
