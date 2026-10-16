const express = require('express');
const ownerAuth = require('../../../middleware/ownerAuth');

const {
  getDailyReward,
  getOwnerEarnings,
  getOwnerOrders,
  testFinalizeOwnerOffer,
  getReferralProgress,
  testFinalizeReferralQualification,
  archiveOwnerEarnings,
  getDeliveryChargePayment,
  markDeliveryChargePaymentSent,
  getDeliveryChargePaymentStatus,
} = require('./owner.controller');

const router = express.Router();

// ==========================================
// TEST OWNER OFFER FINALIZATION
// ==========================================

router.post(
  '/owner/:ownerId/daily-reward/test-finalize',
  testFinalizeOwnerOffer,
);

// ==========================================
// OWNER DAILY REWARD
// ==========================================

router.get('/owner/:ownerId/daily-reward', getDailyReward);

// ==========================================
// OWNER EARNINGS
// ==========================================

router.get('/owner/:ownerId/earnings', getOwnerEarnings);

// ==========================================
// OWNER ORDERS
// ==========================================

router.get('/owner/:ownerId', getOwnerOrders);

router.get('/owner/:ownerId/referrals', getReferralProgress);

router.post(
  '/referrals/:referralId/test-finalize',
  testFinalizeReferralQualification,
);

router.post(
  '/owner/:ownerId/earnings/archive',
  ownerAuth,
  archiveOwnerEarnings,
);

router.get(
  '/owner/orders/:orderId/delivery-charge-payment',
  ownerAuth,
  getDeliveryChargePayment,
);

router.post(
  '/owner/orders/:orderId/delivery-charge-payment/mark-sent',
  ownerAuth,
  markDeliveryChargePaymentSent,
);

router.get(
  '/owner/orders/:orderId/delivery-charge-payment/status',
  ownerAuth,
  getDeliveryChargePaymentStatus,
);

module.exports = router;
