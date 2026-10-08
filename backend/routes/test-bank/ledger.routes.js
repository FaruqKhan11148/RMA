const express = require('express');

const {
  receivePayment,
  settleOwner,
  creditRma,
  holdDpEarning,
  releaseDpEarning,
  withdrawDp,
  createPayuFeeLiability,
  deductPayuFee,
} = require('./ledger.controller');

const router = express.Router();

router.post('/receive-payment', receivePayment);

router.post('/owner-settlement', settleOwner);

router.post('/rma-fee', creditRma);

router.post('/dp/hold', holdDpEarning);

router.post('/dp/release', releaseDpEarning);

router.post('/dp/withdraw', withdrawDp);

router.post('/payu-fee/liability', createPayuFeeLiability);

router.post('/payu-fee/deduct', deductPayuFee);

module.exports = router;
