const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getPendingDeliveryPartners,
  approveDeliveryPartner,
  rejectDeliveryPartner,
} = require('./delivery-partner.controller');

const router = express.Router();

router.get('/delivery-partners/pending', adminAuth, getPendingDeliveryPartners);

router.patch(
  '/rma/:deliveryPersonId/approve',
  adminAuth,
  approveDeliveryPartner,
);

router.patch('/rma/:deliveryPersonId/reject', adminAuth, rejectDeliveryPartner);

module.exports = router;
