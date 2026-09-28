const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const { getAllOrders } = require('./order.controller');

const router = express.Router();

router.get('/', adminAuth, getAllOrders);

module.exports = router;
