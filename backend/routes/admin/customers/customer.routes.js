const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getAllCustomers,
  getCustomerDetails,
} = require('./customer.controller');

const router = express.Router();

// GET ALL CUSTOMERS
router.get('/', adminAuth, getAllCustomers);

// GET SINGLE CUSTOMER DETAILS
router.get('/:phone', adminAuth, getCustomerDetails);

module.exports = router;
