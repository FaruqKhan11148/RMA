const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  startPayuOnboarding,
  verifyOwnerBank,
  verifyOwnerKyc,
  completePayuOnboarding,
  getPendingSettlements,
  approveOwnerSettlement,
  rejectOwnerSettlement,
  getAllOwners,
  getShopStatistics,
  getSingleOwner,
} = require('./owner.controller');

const router = express.Router();

// PAYU ONBOARDING
router.patch('/:ownerId/payu/onboarding/start', adminAuth, startPayuOnboarding);

// VERIFY OWNER BANK
router.patch('/:ownerId/payu/bank/verify', adminAuth, verifyOwnerBank);

// VERIFY OWNER KYC
router.patch('/:ownerId/payu/kyc/verify', adminAuth, verifyOwnerKyc);

// COMPLETE PAYU ONBOARDING
router.patch(
  '/:ownerId/payu/onboarding/complete',
  adminAuth,
  completePayuOnboarding,
);

// GET PENDING SETTLEMENTS
router.get('/settlements', adminAuth, getPendingSettlements);

// APPROVE OWNER SETTLEMENT
router.patch('/:ownerId/settlement/approve', adminAuth, approveOwnerSettlement);

// REJECT OWNER SETTLEMENT
router.patch('/:ownerId/settlement/reject', adminAuth, rejectOwnerSettlement);

// GET SHOP STATISTICS
router.get('/stats/:shopId', adminAuth, getShopStatistics);

// GET ALL OWNERS
router.get('/', adminAuth, getAllOwners);

// GET SINGLE OWNER
router.get('/:shopId', adminAuth, getSingleOwner);

module.exports = router;
