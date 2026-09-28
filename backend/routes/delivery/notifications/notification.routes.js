const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const { saveDeliveryNotificationToken } = require('./notification.controller');

const router = express.Router();

// ==========================================
// DELIVERY NOTIFICATIONS
// ==========================================

router.post('/notification-token', deliveryAuth, saveDeliveryNotificationToken);

module.exports = router;
