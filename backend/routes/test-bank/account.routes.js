const express = require('express');

const {
  createAccount,
  getAccount,
  deposit,
  getTransactions,
  transfer,
} = require('./account.controller');

const router = express.Router();

router.post('/', createAccount);

router.post('/transfer', transfer);

router.get('/:accountId', getAccount);

router.post('/:accountId/deposit', deposit);

router.get('/:accountId/transactions', getTransactions);

module.exports = router;
