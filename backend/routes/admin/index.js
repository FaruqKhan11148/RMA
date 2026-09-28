const express = require('express');

const authRoutes = require('./auth/auth.routes');
const customerRoutes = require('./customers/customer.routes');
const deliveryRoutes = require('./delivery/delivery.routes');
const deliveryPartnerRoutes = require('./delivery-partners/delivery-partner.routes');
const financeRoutes = require('./finance/finance.routes');
const orderRoutes = require('./orders/order.routes');
const ownerRoutes = require('./owners/owner.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/customers', customerRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/', deliveryPartnerRoutes);
router.use('/orders', financeRoutes);
router.use('/orders', orderRoutes);
router.use('/owners', ownerRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
