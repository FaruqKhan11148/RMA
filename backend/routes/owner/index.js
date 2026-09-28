const express = require('express');

const shopRoutes = require('./shop/shop.routes');
const authRoutes = require('./auth/auth.routes');
const notificationRoutes = require('./notifications/notification.routes');
const settingsRoutes = require('./settings/settings.routes');
const productRoutes = require('./products/product.routes');

const router = express.Router();

router.use('/', shopRoutes);
router.use('/', authRoutes);
router.use('/', notificationRoutes);
router.use('/', settingsRoutes);
router.use('/', productRoutes);

module.exports = router;
