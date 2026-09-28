const express = require('express');

const { onboardOwner } = require('./owner.controller');

const router = express.Router();

router.post('/onboard-owner', onboardOwner);

module.exports = router;
