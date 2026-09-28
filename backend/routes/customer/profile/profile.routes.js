const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');

const { updateCustomerProfile } = require('./profile.controller');

const router = express.Router();

// CUSTOMER PROFILE
router.put('/me', customerAuth, updateCustomerProfile);

module.exports = router;
