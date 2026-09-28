const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const { getAdminDashboard } = require('./dashboard.controller');

const router = express.Router();

router.get('/', adminAuth, getAdminDashboard);

module.exports = router;
