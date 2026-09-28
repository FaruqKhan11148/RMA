const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  getDeliveryPerson,
  updateDeliveryPersonStatus,
  updateDeliveryPerson,
} = require('./owner.controller');

const router = express.Router();

// ==========================================
// GET DELIVERY PERSON
// ==========================================

router.get('/person', ownerAuth, getDeliveryPerson);

// ==========================================
// ACTIVATE / DEACTIVATE DELIVERY PERSON
// ==========================================

router.patch('/person/status', ownerAuth, updateDeliveryPersonStatus);

// ==========================================
// UPDATE DELIVERY PERSON DETAILS
// ==========================================

router.patch('/person', ownerAuth, updateDeliveryPerson);

module.exports = router;
