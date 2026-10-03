const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getAllDeliveryPersons,
  getDeliveryPerson,
} = require('./delivery.controller');

const router = express.Router();

// ============================================================
// GET ALL DELIVERY PERSONS
// ============================================================

router.get('/', adminAuth, getAllDeliveryPersons);

// ============================================================
// GET SINGLE DELIVERY PERSON
// ============================================================

router.get('/:deliveryPersonId', adminAuth, getDeliveryPerson);

module.exports = router;
