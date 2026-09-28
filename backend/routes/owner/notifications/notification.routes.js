const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  getOwnerNotifications,
  markAllOwnerNotificationsAsRead,
  markOwnerNotificationAsRead,
} = require('./notification.controller');

const router = express.Router();

router.get('/notifications', ownerAuth, getOwnerNotifications);

router.patch(
  '/notifications/read-all',
  ownerAuth,
  markAllOwnerNotificationsAsRead,
);

router.patch(
  '/notifications/:notificationId/read',
  ownerAuth,
  markOwnerNotificationAsRead,
);

module.exports = router;
