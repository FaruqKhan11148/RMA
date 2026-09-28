const express = require('express');

const { createPayUPayment } = require('./payment.controller');

const router = express.Router();

router.post('/create-order', createPayUPayment);

module.exports = router;
