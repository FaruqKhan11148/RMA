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

module.exports = router;
