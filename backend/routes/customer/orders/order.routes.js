const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');

const {
  getCustomerOrders,
  deleteCustomerOrders,
} = require('./order.controller');

const router = express.Router();

// CUSTOMER ORDERS

router.get('/', customerAuth, getCustomerOrders);

router.delete('/', customerAuth, deleteCustomerOrders);

module.exports = router;
