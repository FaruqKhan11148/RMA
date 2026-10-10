const express = require('express');

const {
  handlePayUSuccess,
  handlePayUFailure,
  handlePayURefundCallback,
} = require('./callback.controller');

const { handleCashfreeWebhook } = require('./cashfree.webhook.controller');

const router = express.Router();

router.post('/payu/success', handlePayUSuccess);
router.post('/payu/failure', handlePayUFailure);
router.post('/payu/refund-callback', handlePayURefundCallback);

router.post('/cashfree/webhook', handleCashfreeWebhook);

module.exports = router;
