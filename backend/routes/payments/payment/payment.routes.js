const express = require('express');

const { createPayUPayment } = require('./payment.controller');
const { createCashfreePayment } = require('./cashfree.controller');

const router = express.Router();

// Existing PayU route
router.post('/create-order', createPayUPayment);

// New Cashfree route
router.post('/cashfree/create-order', createCashfreePayment);

module.exports = router;
