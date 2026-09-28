const express = require('express');

const ownerRoutes = require('./owner/owner.routes');
const notificationRoutes = require('./notifications/notification.routes');
const customerRoutes = require('./customer/customer.routes');
const deliveryRoutes = require('./delivery/delivery.routes');
const settlementRoutes = require('./settlement/settlement.routes');
const coreRoutes = require('./core/order.routes');

const router = express.Router();

router.use('/', ownerRoutes);
router.use('/', notificationRoutes);
router.use('/', customerRoutes);
router.use('/', deliveryRoutes);
router.use('/', settlementRoutes);
router.use('/', coreRoutes);

module.exports = router;
