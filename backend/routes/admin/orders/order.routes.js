const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getAllOrders,
  getEligibleRmaDeliveryPartners,
  assignRmaDeliveryPartner,
} = require('./order.controller');

const router = express.Router();

// ============================================================
// GET ALL ORDERS
// GET /api/admin/orders
// ============================================================

router.get('/', adminAuth, getAllOrders);

// ============================================================
// GET ELIGIBLE RMA DELIVERY PARTNERS FOR AN ORDER
// GET /api/admin/orders/:orderId/rma-delivery-partners
// ============================================================

router.get(
  '/:orderId/rma-delivery-partners',
  adminAuth,
  getEligibleRmaDeliveryPartners,
);

router.patch(
  '/:orderId/rma-delivery-partner',
  adminAuth,
  assignRmaDeliveryPartner,
);

module.exports = router;
