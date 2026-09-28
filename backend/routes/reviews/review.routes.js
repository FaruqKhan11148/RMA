const express = require('express');

const customerAuth = require('../../middleware/customerAuth');

const { createReview, getShopRating } = require('./review.controller');

const router = express.Router();

// =========================
// CREATE REVIEW
// =========================

router.post('/', customerAuth, createReview);

// =========================
// GET SHOP RATING
// =========================

router.get('/shop/:ownerId', getShopRating);

module.exports = router;
