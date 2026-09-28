const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  protectedTest,
} = require('./auth.controller');

const router = express.Router();

router.post('/login', loginAdmin);

router.get('/me', adminAuth, getCurrentAdmin);

router.post('/logout', adminAuth, logoutAdmin);

router.get('/protected-test', adminAuth, protectedTest);

module.exports = router;
