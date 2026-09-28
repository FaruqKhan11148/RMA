const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const { getAvailableDeliveryPartners } = require('./partner.controller');

const router = express.Router();

// ==========================================
// GET AVAILABLE DELIVERY PARTNERS
// FOR OWNER'S ORDER
// ==========================================

router.get(
  '/owner/available-partners/:orderId',
  ownerAuth,
  getAvailableDeliveryPartners,
);

module.exports = router;
