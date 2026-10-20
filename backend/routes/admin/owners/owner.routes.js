const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getPendingRegistrations,
  approveOwnerRegistration,
  rejectOwnerRegistration,
  getAllOwners,
  getShopStatistics,
  getSingleOwner,
} = require('./owner.controller');

const router = express.Router();

// GET PENDING SHOP REGISTRATIONS
router.get('/registrations/pending', adminAuth, getPendingRegistrations);

// APPROVE SHOP REGISTRATION
router.patch(
  '/:ownerId/registration/approve',
  adminAuth,
  approveOwnerRegistration,
);

// REJECT SHOP REGISTRATION
router.patch(
  '/:ownerId/registration/reject',
  adminAuth,
  rejectOwnerRegistration,
);

// GET SHOP STATISTICS
router.get('/stats/:shopId', adminAuth, getShopStatistics);

// GET ALL OWNERS
router.get('/', adminAuth, getAllOwners);

// GET SINGLE OWNER
router.get('/:shopId', adminAuth, getSingleOwner);

module.exports = router;
