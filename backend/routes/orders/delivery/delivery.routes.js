const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const { verifyDeliveryOtp } = require('./delivery.controller');

const router = express.Router();

router.post('/:orderId/verify-otp', deliveryAuth, verifyDeliveryOtp);

module.exports = router;
