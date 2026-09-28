const express = require('express');

const ownerRoutes = require('./owner/owner.routes');
const paymentRoutes = require('./payment/payment.routes');
const callbackRoutes = require('./callbacks/callback.routes');

const router = express.Router();

// PayU sends callback data as application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: false }));

router.use('/', ownerRoutes);
router.use('/', paymentRoutes);
router.use('/', callbackRoutes);

module.exports = router;
