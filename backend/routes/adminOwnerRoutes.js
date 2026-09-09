const express = require('express');

const Owner = require('../models/Owner');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

/*
  GET ALL OWNERS
  Protected: Admin only
*/

router.get('/', adminAuth, async (req, res) => {
  try {
    const owners = await Owner.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      count: owners.length,
      owners,
    });
  } catch (error) {
    console.error('Admin owners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch owners',
    });
  }
});

/*
  GET SHOP STATISTICS
  Protected: Admin only
*/
router.get('/stats/:shopId', adminAuth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select(
      'ownerName shopName phone shopId',
    );

    if (!owner) {
      return res.status(404).json({
        message: 'Owner/shop not found',
      });
    }

    const orders = await Order.find({
      ownerId: owner._id,
    }).select(
      [
        'orderId',
        'totalPrice',
        'status',
        'paymentStatus',
        'paymentMethod',
        'createdAt',
        'completedAt',
      ].join(' '),
    );

    let totalTransactionValue = 0;
    let completedTransactionValue = 0;
    let totalRmaFees = 0;

    const statusCounts = {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      OutForDelivery: 0,
      Completed: 0,
      Rejected: 0,
    };

    for (const order of orders) {
      const amount = Number(order.totalPrice || 0);

      totalTransactionValue += amount;

      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status] += 1;
      }

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        completedTransactionValue += amount;

        // RMA platform fee = 1%
        totalRmaFees += amount * 0.01;
      }
    }

    return res.status(200).json({
      shop: {
        shopId: owner.shopId,
        shopName: owner.shopName,
        ownerName: owner.ownerName,
        phone: owner.phone,
      },

      stats: {
        totalOrders: orders.length,

        completedOrders: statusCounts.Completed,

        totalTransactionValue: Number(totalTransactionValue.toFixed(2)),

        completedTransactionValue: Number(completedTransactionValue.toFixed(2)),

        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus: statusCounts,

      recentOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error('Admin shop statistics fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch shop statistics',
    });
  }
});

/*
  GET SINGLE OWNER
*/

router.get('/:shopId', adminAuth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select('-password');

    if (!owner) {
      return res.status(404).json({
        message: 'Owner/shop not found',
      });
    }

    return res.json({
      owner,
    });
  } catch (error) {
    console.error('Admin owner fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch owner',
    });
  }
});

module.exports = router;
