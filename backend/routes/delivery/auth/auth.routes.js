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
} = require('./auth.controller');

const router = express.Router();

// SHOP DELIVERY PERSON REGISTRATION
router.post('/register', ownerAuth, registerDeliveryPerson);

// RMA DELIVERY PARTNER REGISTRATION
router.post('/rma/register', registerRmaDeliveryPartner);

// REQUEST RMA DELIVERY PARTNER OTP
router.post('/rma/request-otp', requestRmaDeliveryOtp);

// VERIFY RMA DELIVERY PARTNER OTP
router.post('/rma/verify-otp', verifyRmaDeliveryOtp);

// ==========================================
// REQUEST DELIVERY LOGIN OTP
// ==========================================

router.post('/request-otp', requestDeliveryOtp);

// ==========================================
// LOGOUT DELIVERY PERSON
// ==========================================

router.post('/logout', deliveryAuth, logoutDeliveryPerson);

// ==========================================
// VERIFY DELIVERY PERSON LOGIN OTP
// ==========================================

router.post('/verify-otp', verifyDeliveryOtp);

module.exports = router;
