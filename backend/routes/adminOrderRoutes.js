const express = require('express');

const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// GET ALL ORDERS FOR ADMIN
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('ownerId', 'ownerName shopName phone shopId')
      .select(
        [
          'orderId',
          'ownerId',
          'customer',
          'orderType',
          'deliveryLocation',
          'items',
          'totalItems',
          'totalPrice',
          'status',

          // Payment
          'paymentStatus',
          'paymentMethod',
          'onlinePaymentMethod',
          'paymentId',
          'paymentOrderId',
          'paidAt',

          // OTP / Delivery
          'otpVerified',
          'deliveryOtpGeneratedAt',

          // Timeline
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',

          // Mongo timestamps
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    // RMA platform fee = 1% of order amount
    const ordersWithFinance = orders.map((order) => {
      const orderData = order.toObject();

      const rmaFee = Number(((order.totalPrice || 0) * 0.01).toFixed(2));

      const ownerAmount = Number(((order.totalPrice || 0) - rmaFee).toFixed(2));

      return {
        ...orderData,

        // Admin finance numbers for now
        rmaFee,
        ownerAmount,
      };
    });

    return res.status(200).json({
      count: ordersWithFinance.length,
      orders: ordersWithFinance,
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch orders',
    });
  }
});

module.exports = router;
