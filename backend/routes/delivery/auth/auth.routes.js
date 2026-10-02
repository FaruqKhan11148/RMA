const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');
const deliveryAuth = require('../../../middleware/deliveryAuth');

const {
  registerDeliveryPerson,
  registerRmaDeliveryPartner,
  requestRmaDeliveryOtp,
  verifyRmaDeliveryOtp,
  requestDeliveryOtp,
  logoutDeliveryPerson,
  verifyDeliveryOtp,
  getRmaDeliveryApplication,
  updateRmaDeliveryApplication,
  submitRmaDeliveryApplication,
} = require('./auth.controller');

const router = express.Router();

router.post('/register', ownerAuth, registerDeliveryPerson);
router.post('/rma/register', registerRmaDeliveryPartner);
router.post('/rma/request-otp', requestRmaDeliveryOtp);
router.post('/rma/verify-otp', verifyRmaDeliveryOtp);
router.post('/request-otp', requestDeliveryOtp);
router.post('/logout', deliveryAuth, logoutDeliveryPerson);
router.post('/verify-otp', verifyDeliveryOtp);
router.get('/rma/application', deliveryAuth, getRmaDeliveryApplication);
router.patch('/rma/application', deliveryAuth, updateRmaDeliveryApplication);
router.patch(
  '/rma/application/submit',
  deliveryAuth,
  submitRmaDeliveryApplication,
);

module.exports = router;
