const express = require('express');

const authRoutes = require('./auth/auth.routes');
const ownerRoutes = require('./owner/owner.routes');
const partnerRoutes = require('./partners/partner.routes');
const notificationRoutes = require('./notifications/notification.routes');
const orderRoutes = require('./orders/order.routes');
const trackingRoutes = require('./tracking/tracking.routes');
const availabilityRoutes = require('./availability/availability.routes');
const assignmentRoutes = require('./assignments/assignment.routes');
const walletRoutes = require('./wallet/wallet.routes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/', ownerRoutes);
router.use('/', partnerRoutes);
router.use('/', notificationRoutes);
router.use('/', orderRoutes);
router.use('/', trackingRoutes);
router.use('/', availabilityRoutes);
router.use('/', assignmentRoutes);
router.use('/', walletRoutes);

module.exports = router;
