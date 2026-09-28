const express = require('express');

const authRoutes = require('./auth/auth.routes');
const ownerRoutes = require('./owner/owner.routes');
const partnerRoutes = require('./partners/partner.routes');
const notificationRoutes = require('./notifications/notification.routes');
const orderRoutes = require('./orders/order.routes');
const trackingRoutes = require('./tracking/tracking.routes');

const router = express.Router();

// ==========================================
// DELIVERY AUTH
// ==========================================
router.use('/', authRoutes);

// ==========================================
// DELIVERY OWNER
// ==========================================
router.use('/', ownerRoutes);

// ==========================================
// DELIVERY PARTNERS
// ==========================================
router.use('/', partnerRoutes);

// ==========================================
// DELIVERY NOTIFICATIONS
// ==========================================
router.use('/', notificationRoutes);

// ==========================================
// DELIVERY ORDERS
// ==========================================
router.use('/', orderRoutes);

// ==========================================
// DELIVERY TRACKING
// ==========================================
router.use('/', trackingRoutes);

module.exports = router;
