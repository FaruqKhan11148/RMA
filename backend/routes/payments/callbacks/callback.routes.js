const express = require('express');

const {
  handlePayUSuccess,
  handlePayUFailure,
  handlePayURefundCallback,
} = require('./callback.controller');

const router = express.Router();

router.post('/payu/success', handlePayUSuccess);

router.post('/payu/failure', handlePayUFailure);

router.post('/payu/refund-callback', handlePayURefundCallback);

module.exports = router;
