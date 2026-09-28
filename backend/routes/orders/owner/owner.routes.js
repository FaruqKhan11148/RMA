const express = require('express');

const {
  getDailyReward,
  getOwnerEarnings,
  getOwnerOrders,
} = require('./owner.controller');

const router = express.Router();

// ==========================================
// OWNER DAILY REWARD
// ==========================================

router.get('/owner/:ownerId/daily-reward', getDailyReward);

// ==========================================
// OWNER EARNINGS
// ==========================================

router.get('/owner/:ownerId/earnings', getOwnerEarnings);

// ==========================================
// OWNER ORDERS
// ==========================================

router.get('/owner/:ownerId', getOwnerOrders);

module.exports = router;
