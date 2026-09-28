const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');

const {
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} = require('./address.controller');

const router = express.Router();

// ==========================================
// CUSTOMER SAVED ADDRESSES
// ==========================================

router.get('/', customerAuth, getCustomerAddresses);

router.post('/', customerAuth, addCustomerAddress);

router.put('/:addressId', customerAuth, updateCustomerAddress);

router.delete('/:addressId', customerAuth, deleteCustomerAddress);

router.put('/:addressId/default', customerAuth, setDefaultCustomerAddress);

module.exports = router;
