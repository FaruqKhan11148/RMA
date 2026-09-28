const express = require('express');

const {
  getGuestOrders,
  cancelOrder,
  rejectDelivery,
} = require('./customer.controller');

const router = express.Router();

router.get('/guest/:guestId', getGuestOrders);
router.post('/:orderId/cancel', cancelOrder);
router.post('/:orderId/reject-delivery', rejectDelivery);

module.exports = router;
