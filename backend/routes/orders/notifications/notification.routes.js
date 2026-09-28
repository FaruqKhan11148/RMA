const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');
const ownerAuth = require('../../../middleware/ownerAuth');
const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  getCustomerNotifications,
  getOwnerNotifications,
  getDeliveryNotifications,
  markCustomerNotificationAsRead,
  markOwnerNotificationAsRead,
  markDeliveryNotificationAsRead,
} = require('./notification.controller');

const router = express.Router();

// ==========================================
// GET CUSTOMER NOTIFICATIONS
// ==========================================

router.get('/notifications/customer', customerAuth, getCustomerNotifications);

// ==========================================
// GET OWNER NOTIFICATIONS
// ==========================================

router.get('/notifications/owner', ownerAuth, getOwnerNotifications);

// ==========================================
// GET DELIVERY NOTIFICATIONS
// ==========================================

router.get('/notifications/delivery', deliveryAuth, getDeliveryNotifications);

// ==========================================
// MARK CUSTOMER NOTIFICATION AS READ
// ==========================================

router.patch(
  '/notifications/customer/:notificationId/read',
  customerAuth,
  markCustomerNotificationAsRead,
);

// ==========================================
// MARK OWNER NOTIFICATION AS READ
// ==========================================

router.patch(
  '/notifications/owner/:notificationId/read',
  ownerAuth,
  markOwnerNotificationAsRead,
);

// ==========================================
// MARK DELIVERY NOTIFICATION AS READ
// ==========================================

router.patch(
  '/notifications/delivery/:notificationId/read',
  deliveryAuth,
  markDeliveryNotificationAsRead,
);

module.exports = router;
