const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  getDeliveryWallet,
  requestWithdrawal,
  getDeliveryWithdrawalHistory,
  getDeliveryEarningHistory,
} = require('./wallet.controller');

const router = express.Router();

router.get('/wallet', deliveryAuth, getDeliveryWallet);

router.post('/wallet/withdraw', deliveryAuth, requestWithdrawal);

router.get('/wallet/withdrawals', deliveryAuth, getDeliveryWithdrawalHistory);

router.get('/wallet/earnings', deliveryAuth, getDeliveryEarningHistory);

module.exports = router;
