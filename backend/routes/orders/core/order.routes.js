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
  getOwnerRefundRequests,
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
  '/owner/:orderId/refund/:refundId/mark-sent',
  ownerAuth,
  markOwnerRefundSent,
);

router.get('/owner/:orderId/refunds', ownerAuth, getOwnerRefundRequests);

router.get('/:orderId', getOrderById);

module.exports = router;
