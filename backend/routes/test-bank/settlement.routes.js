const express = require('express');

const { runSettlement } = require('./settlement.controller');

const router = express.Router();

router.post('/run', runSettlement);

module.exports = router;
