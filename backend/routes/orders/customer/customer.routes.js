const express = require('express');

const {
  getGuestOrders,
  cancelOrder,
  rejectDelivery,
} = require('./customer.controller');

const customerAuth = require('../../../middleware/customerAuth');

const {
  requestCustomerRefund,
  getCustomerRefunds,
} = require('./customer.refund.controller');

const router = express.Router();

router.get('/guest/:guestId', getGuestOrders);
router.post('/:orderId/cancel', cancelOrder);
router.post('/:orderId/reject-delivery', rejectDelivery);
router.post('/:orderId/refund-request', customerAuth, requestCustomerRefund);
router.get('/:orderId/refunds', customerAuth, getCustomerRefunds);

module.exports = router;
