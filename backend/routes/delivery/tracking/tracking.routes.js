const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  getDeliveryRoute,
  updateDeliveryLocation,
} = require('./tracking.controller');

const router = express.Router();

// ==========================================
// GET ROAD ROUTE FOR DELIVERY ORDER
// ==========================================

router.get('/route/:orderId', deliveryAuth, getDeliveryRoute);

// ==========================================
// UPDATE DELIVERY PERSON LOCATION
// ==========================================

router.post('/location', deliveryAuth, updateDeliveryLocation);

module.exports = router;
