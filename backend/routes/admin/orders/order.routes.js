const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getAllOrders,
  getEligibleRmaDeliveryPartners,
  assignRmaDeliveryPartner,
  confirmRmaCollectionPayment,
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

// ============================================================
// CONFIRM RMA COLLECTION PAYMENT
// PATCH /api/admin/orders/:orderId/rma-collection-payment/confirm
// ============================================================

router.patch(
  '/:orderId/rma-collection-payment/confirm',
  adminAuth,
  confirmRmaCollectionPayment,
);

module.exports = router;
