const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const { getDailyOrders, getMonthlyFinance } = require('./finance.controller');

const router = express.Router();

router.get('/daily', adminAuth, getDailyOrders);
router.get('/monthly-finance', adminAuth, getMonthlyFinance);

module.exports = router;
