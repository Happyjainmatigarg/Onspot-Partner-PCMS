// Push Notification Routes
const express = require('express');
const router = express.Router();
const {
    storeSubscription,
    removeSubscription,
    sendPushNotification,
    broadcastPushNotification,
    getVapidPublicKey,
    NotificationTemplates
} = require('../services/push');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/push/vapid-public-key
// Get the VAPID public key for client-side subscription
router.get('/vapid-public-key', (req, res) => {
    res.json({
        publicKey: getVapidPublicKey(),
        success: true
    });
});

// POST /api/push/subscribe
// Subscribe a user to push notifications
router.post('/subscribe', authenticate, async (req, res) => {
    try {
        const { subscription } = req.body;
        const userId = req.user.partnerId || req.user.email || req.user.id;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Valid push subscription is required' });
        }

        const result = storeSubscription(userId, subscription);

        // Send a welcome notification
        await sendPushNotification(userId, {
            title: 'Notifications Enabled! 🔔',
            body: 'You will now receive updates about your account.',
            tag: 'subscription-success'
        });

        res.json({
            success: true,
            message: 'Push notifications enabled successfully'
        });
    } catch (error) {
        console.error('Push subscribe error:', error);
        res.status(500).json({ error: 'Failed to subscribe to notifications' });
    }
});

// POST /api/push/unsubscribe
// Unsubscribe a user from push notifications
router.post('/unsubscribe', authenticate, async (req, res) => {
    try {
        const userId = req.user.partnerId || req.user.email || req.user.id;

        removeSubscription(userId);

        res.json({
            success: true,
            message: 'Push notifications disabled'
        });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        res.status(500).json({ error: 'Failed to unsubscribe from notifications' });
    }
});

// POST /api/push/send (Admin only)
// Send a notification to a specific user
router.post('/send', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { userId, title, body, url, data } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const result = await sendPushNotification(userId, { title, body, url, data });

        res.json(result);
    } catch (error) {
        console.error('Push send error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// POST /api/push/broadcast (Admin only)
// Send a notification to all subscribed users
router.post('/broadcast', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { title, body, url, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const result = await broadcastPushNotification({ title, body, url, data });

        res.json(result);
    } catch (error) {
        console.error('Push broadcast error:', error);
        res.status(500).json({ error: 'Failed to broadcast notification' });
    }
});

// POST /api/push/test
// Test push notification (for development)
router.post('/test', authenticate, async (req, res) => {
    try {
        const userId = req.user.partnerId || req.user.email || req.user.id;

        const result = await sendPushNotification(userId, {
            title: 'Test Notification 🧪',
            body: 'If you see this, push notifications are working!',
            tag: 'test-notification'
        });

        res.json(result);
    } catch (error) {
        console.error('Push test error:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

module.exports = router;
