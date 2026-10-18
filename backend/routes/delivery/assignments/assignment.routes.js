const express = require('express');

const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  acceptDeliveryAssignment,
  rejectDeliveryAssignment,
  getPendingDeliveryAssignments,
  collectDeliveryOrder,
  getDeliveryChargePayment,
} = require('./assignment.controller');

const router = express.Router();

router.get('/assignments/pending', deliveryAuth, getPendingDeliveryAssignments);

router.post(
  '/assignments/:orderId/accept',
  deliveryAuth,
  acceptDeliveryAssignment,
);

router.post(
  '/assignments/:orderId/reject',
  deliveryAuth,
  rejectDeliveryAssignment,
);

router.patch('/orders/:orderId/collect', deliveryAuth, collectDeliveryOrder);

router.get(
  '/orders/:orderId/delivery-charge-payment',
  deliveryAuth,
  getDeliveryChargePayment,
);

module.exports = router;
