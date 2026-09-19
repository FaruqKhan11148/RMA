const express = require('express');

const Order = require('../models/Order');
const Review = require('../models/Review');
const Owner = require('../models/Owner');

const customerAuth = require('../middleware/customerAuth');

const router = express.Router();

// =========================
// CREATE REVIEW
// =========================

router.post('/', customerAuth, async (req, res) => {
  try {
    const { orderId, rmaRating, shopRating, deliveryRating, feedback } =
      req.body;

    // =========================
    // BASIC VALIDATION
    // =========================

    if (!orderId) {
      return res.status(400).json({
        message: 'Order ID is required',
      });
    }

    if (!Number.isInteger(rmaRating) || rmaRating < 1 || rmaRating > 5) {
      return res.status(400).json({
        message: 'RMA rating must be between 1 and 5',
      });
    }

    if (!Number.isInteger(shopRating) || shopRating < 1 || shopRating > 5) {
      return res.status(400).json({
        message: 'Shop rating must be between 1 and 5',
      });
    }

    if (
      !Number.isInteger(deliveryRating) ||
      deliveryRating < 1 ||
      deliveryRating > 5
    ) {
      return res.status(400).json({
        message: 'Delivery rating must be between 1 and 5',
      });
    }

    // =========================
    // FIND ORDER
    // =========================

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // =========================
    // CHECK CUSTOMER
    // =========================

    if (
      !order.customerId ||
      order.customerId.toString() !== req.customer._id.toString()
    ) {
      return res.status(403).json({
        message: 'You are not allowed to review this order',
      });
    }

    // =========================
    // ONLY COMPLETED ORDERS
    // =========================

    if (order.status !== 'Completed') {
      return res.status(400).json({
        message: 'Only completed orders can be reviewed',
      });
    }

    // =========================
    // CHECK EXISTING REVIEW
    // =========================

    const existingReview = await Review.findOne({ orderId });

    if (existingReview) {
      return res.status(409).json({
        message: 'This order has already been reviewed',
      });
    }

    // =========================
    // VERIFY SHOP
    // =========================

    const owner = await Owner.findById(order.ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    // =========================
    // CREATE REVIEW
    // =========================

    const review = await Review.create({
      orderId: order.orderId,
      customerId: order.customerId,
      ownerId: order.ownerId,
      rmaRating,
      shopRating,
      deliveryRating,
      feedback: feedback || '',
    });

    // =========================
    // UPDATE SHOP RATING
    // =========================

    const currentRatingCount = owner.rating?.count || 0;
    const currentRatingAverage = owner.rating?.average || 0;

    const newRatingCount = currentRatingCount + 1;

    const newRatingAverage =
      (currentRatingAverage * currentRatingCount + shopRating) / newRatingCount;

    owner.rating = {
      average: Number(newRatingAverage.toFixed(1)),
      count: newRatingCount,
    };

    await owner.save();

    return res.status(201).json({
      message: 'Review submitted successfully',
      review,
      rating: owner.rating,
    });
  } catch (error) {
    console.error('Create review failed:', error);

    return res.status(500).json({
      message: 'Unable to submit review',
    });
  }
});

// =========================
// GET SHOP RATING
// =========================

router.get('/shop/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId).select('shopName rating');

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    return res.status(200).json({
      shopName: owner.shopName,
      rating: {
        average: owner.rating?.average || 0,
        count: owner.rating?.count || 0,
      },
    });
  } catch (error) {
    console.error('Get shop rating failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch shop rating',
    });
  }
});

module.exports = router;
