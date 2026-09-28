const express = require('express');

const {
  getAllOwners,
  getNearbyShops,
  getShopById,
} = require('./shop.controller');

const router = express.Router();

router.get('/', getAllOwners);
router.get('/nearby', getNearbyShops);
router.get('/shop/:shopId', getShopById);

module.exports = router;
