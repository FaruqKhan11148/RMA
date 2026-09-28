const express = require('express');

const customerAuth = require('../../../middleware/customerAuth');

const { createCustomerSupportIssue } = require('./support.controller');

const router = express.Router();

// ==========================================
// CUSTOMER SUPPORT ISSUES
// ==========================================

router.post('/', customerAuth, createCustomerSupportIssue);

module.exports = router;
