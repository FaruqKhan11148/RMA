const express = require('express');

const {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  logoutCustomer,
} = require('./auth.controller');

const router = express.Router();

// ===============================
// CUSTOMER AUTH
// ===============================

router.post('/register', registerCustomer);

router.post('/login', loginCustomer);

router.get('/me', getCurrentCustomer);

router.post('/logout', logoutCustomer);

module.exports = router;
