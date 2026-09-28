const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  getDeliveryOrders,
  getDeliveryDashboard,
  getDeliveryEarnings,
} = require('./order.controller');

const router = express.Router();

// ==========================================
// GET DELIVERY ORDERS
// ==========================================

router.get('/orders', deliveryAuth, getDeliveryOrders);

// ==========================================
// GET DELIVERY DASHBOARD
// ==========================================

router.get('/dashboard', deliveryAuth, getDeliveryDashboard);

// ==========================================
// GET DELIVERY EARNINGS
// ==========================================

router.get('/earnings', deliveryAuth, getDeliveryEarnings);

module.exports = router;
