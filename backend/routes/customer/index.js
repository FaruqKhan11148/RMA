const express = require('express');

const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const orderRoutes = require('./orders/order.routes');
const notificationRoutes = require('./notifications/notification.routes');
const addressRoutes = require('./addresses/address.routes');
const supportRoutes = require('./support/support.routes');

const router = express.Router();

// CUSTOMER AUTH
router.use('/', authRoutes);

// CUSTOMER PROFILE
router.use('/', profileRoutes);

// CUSTOMER ORDERS
router.use('/orders', orderRoutes);

// CUSTOMER NOTIFICATIONS
router.use('/notifications', notificationRoutes);

// CUSTOMER ADDRESSES
router.use('/addresses', addressRoutes);

// CUSTOMER SUPPORT
router.use('/support-issues', supportRoutes);

module.exports = router;
