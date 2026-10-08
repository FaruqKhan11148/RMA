const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getDailyOrders,
  getMonthlyFinance,
  releaseDeliveryEarning,
  getDeliveryWithdrawalRequests,
  completeDeliveryWithdrawal,
  rejectDeliveryWithdrawal,
  getDeliveryWithdrawalHistory,
  getPendingDeliveryEarnings,
  setupRmaAccount,
  getRmaAccount,
  getOwnerTestBankAccounts,
  getDeliveryPartnerTestBankAccounts,
  getFinanceOverviewData,
  getFinanceSettlementsData,
  getFinanceTransactionsData,
  getFinanceWithdrawalsData,
} = require('./finance.controller');

const router = express.Router();

router.get('/daily', adminAuth, getDailyOrders);
router.get('/monthly-finance', adminAuth, getMonthlyFinance);

router.get('/overview', adminAuth, getFinanceOverviewData);
router.post('/rma-account/setup', adminAuth, setupRmaAccount);
router.get('/rma-account', adminAuth, getRmaAccount);
router.get('/owner-accounts', adminAuth, getOwnerTestBankAccounts);
router.get(
  '/delivery-partner-accounts',
  adminAuth,
  getDeliveryPartnerTestBankAccounts,
);
router.get('/settlements', adminAuth, getFinanceSettlementsData);
router.get('/transactions', adminAuth, getFinanceTransactionsData);
router.get('/withdrawals', adminAuth, getFinanceWithdrawalsData);

router.patch(
  '/withdrawals/:transactionId/complete',
  adminAuth,
  completeDeliveryWithdrawal,
);

router.patch(
  '/withdrawals/:transactionId/reject',
  adminAuth,
  rejectDeliveryWithdrawal,
);

router.get('/delivery-earnings/pending', adminAuth, getPendingDeliveryEarnings);

router.patch(
  '/delivery-earnings/:transactionId/release',
  adminAuth,
  releaseDeliveryEarning,
);
router.get('/delivery-withdrawals', adminAuth, getDeliveryWithdrawalRequests);

router.patch(
  '/delivery-withdrawals/:transactionId/complete',
  adminAuth,
  completeDeliveryWithdrawal,
);

router.patch(
  '/delivery-withdrawals/:transactionId/reject',
  adminAuth,
  rejectDeliveryWithdrawal,
);

router.get(
  '/delivery-withdrawals/history',
  adminAuth,
  getDeliveryWithdrawalHistory,
);

module.exports = router;
