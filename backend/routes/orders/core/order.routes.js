const express = require('express');

const {
  previewDeliveryCharge,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  createDeliveryAssignment,
} = require('./order.controller');

const router = express.Router();

router.post('/delivery-preview', previewDeliveryCharge);

router.get('/', getAllOrders);

router.post('/', createOrder);

router.post('/:orderId/delivery-assignment', createDeliveryAssignment);

router.patch('/:orderId/status', updateOrderStatus);

router.get('/:orderId', getOrderById);

module.exports = router;
