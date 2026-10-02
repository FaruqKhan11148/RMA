const express = require('express');
const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  getDeliveryAvailability,
  updateDeliveryAvailability,
} = require('./availability.controller');

const router = express.Router();

router.get('/availability', deliveryAuth, getDeliveryAvailability);

router.patch('/availability', deliveryAuth, updateDeliveryAvailability);

module.exports = router;
