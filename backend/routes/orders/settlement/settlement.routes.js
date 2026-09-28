const express = require('express');

const { settleOwnerOrder } = require('./settlement.controller');

const router = express.Router();

router.patch('/:orderId/settle', settleOwnerOrder);

module.exports = router;
