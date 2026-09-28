const express = require('express');

const { getShopByShopId } = require('./shop.controller');

const router = express.Router();

// GET SHOP BY SHOP ID

router.get('/:shopId', getShopByShopId);

module.exports = router;
