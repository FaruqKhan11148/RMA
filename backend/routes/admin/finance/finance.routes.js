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
} = require('./finance.controller');

const router = express.Router();

router.get('/daily', adminAuth, getDailyOrders);
router.get('/monthly-finance', adminAuth, getMonthlyFinance);

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
