const express = require('express');

const {
  getAllOwners,
  getNearbyShops,
  getShopById,
  getOwnerReferralCode,
} = require('./shop.controller');

const router = express.Router();

router.get('/', getAllOwners);
router.get('/nearby', getNearbyShops);
router.get('/shop/:shopId', getShopById);
router.get('/owner/:ownerId/referral-code', getOwnerReferralCode);

module.exports = router;
