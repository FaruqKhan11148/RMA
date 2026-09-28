const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');

const {
  getCustomerNotifications,
  markAllCustomerNotificationsAsRead,
  markCustomerNotificationAsRead,
  testCustomerNotification,
  saveCustomerNotificationToken,
} = require('./notification.controller');

const router = express.Router();

// ==========================================
// CUSTOMER NOTIFICATIONS
// ==========================================

router.get('/', customerAuth, getCustomerNotifications);

router.patch('/read-all', customerAuth, markAllCustomerNotificationsAsRead);

router.patch(
  '/:notificationId/read',
  customerAuth,
  markCustomerNotificationAsRead,
);

router.post('/test-notification', customerAuth, testCustomerNotification);

router.post('/notification-token', customerAuth, saveCustomerNotificationToken);

module.exports = router;
