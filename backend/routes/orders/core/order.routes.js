const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  previewDeliveryCharge,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  createDeliveryAssignment,
  startRmaDispatch,
  confirmDirectUpiPayment,
  markOwnerRefundSent,
} = require('./order.controller');

const router = express.Router();

router.post('/delivery-preview', previewDeliveryCharge);

router.get('/', getAllOrders);

router.post('/', createOrder);

router.post(
  '/:orderId/delivery-assignment',
  ownerAuth,
  createDeliveryAssignment,
);

router.post('/:orderId/rma-dispatch', ownerAuth, startRmaDispatch);

router.patch('/:orderId/status', ownerAuth, updateOrderStatus);

router.patch(
  '/:orderId/confirm-direct-upi',
  ownerAuth,
  confirmDirectUpiPayment,
);

router.patch(
  '/:orderId/refund/:refundId/mark-sent',
  ownerAuth,
  markOwnerRefundSent,
);

router.get('/:orderId', getOrderById);

module.exports = router;
