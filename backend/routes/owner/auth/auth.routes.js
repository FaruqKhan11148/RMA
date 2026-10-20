const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  registerOwner,
  loginOwner,
  logoutOwner,
  saveOwnerNotificationToken,
  protectedOwnerTest,
  getOwnerProfile,
  forgotOwnerPassword,
  resetOwnerPassword,
} = require('./auth.controller');

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.post('/logout', ownerAuth, logoutOwner);
router.post('/notification-token', ownerAuth, saveOwnerNotificationToken);

router.get('/protected-test', ownerAuth, protectedOwnerTest);
router.get('/me', ownerAuth, getOwnerProfile);

router.post('/forgot-password', forgotOwnerPassword);
router.post('/reset-password', resetOwnerPassword);

module.exports = router;
