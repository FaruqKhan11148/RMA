const Order = require('../../../models/Order');
const Owner = require('../../../models/Owner');

// ==========================================
// GET DAILY REWARD PROGRESS
// ==========================================

async function getDailyReward(req, res) {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    const completedOrders = await Order.countDocuments({
      ownerId,
      status: 'Completed',
      completedAt: {
        $gte: startOfDay,
        $lt: startOfNextDay,
      },
    });

    return res.status(200).json({
      completedOrders,
      targetOrders: 60,
      rewardAmount: 150,
      rewardUnlocked: completedOrders >= 60,
      startOfDay,
      startOfNextDay,
    });
  } catch (error) {
    console.error('Daily reward order count failed:', error);

    return res.status(500).json({
      message: 'Failed to fetch daily reward progress',
    });
  }
}

// ==========================================
// GET OWNER EARNINGS
// ==========================================

async function getOwnerEarnings(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const orders = await Order.find({
      ownerId,
      paymentStatus: 'Paid',
      settlementStatus: {
        $in: ['Pending', 'Processing', 'Settled'],
      },
    }).sort({ createdAt: -1 });

    let totalEarnings = 0;
    let pendingEarnings = 0;
    let processingEarnings = 0;
    let settledEarnings = 0;

    let pendingOrders = 0;
    let processingOrders = 0;
    let settledOrders = 0;

    orders.forEach((order) => {
      const amount = Number(order.ownerAmount || 0);

      if (order.settlementStatus === 'Pending') {
        pendingEarnings += amount;
        pendingOrders += 1;
      }

      if (order.settlementStatus === 'Processing') {
        processingEarnings += amount;
        processingOrders += 1;
      }

      if (order.settlementStatus === 'Settled') {
        settledEarnings += amount;
        settledOrders += 1;
      }

      totalEarnings += amount;
    });

    return res.status(200).json({
      earnings: {
        totalEarnings: Number(totalEarnings.toFixed(2)),
        pendingEarnings: Number(pendingEarnings.toFixed(2)),
        processingEarnings: Number(processingEarnings.toFixed(2)),
        settledEarnings: Number(settledEarnings.toFixed(2)),
      },

      orders: {
        total: orders.length,
        pending: pendingOrders,
        processing: processingOrders,
        settled: settledOrders,
      },

      recentOrders: orders.slice(0, 20).map((order) => ({
        orderId: order.orderId,
        orderDate: order.createdAt,
        totalPrice: order.totalPrice,
        ownerAmount: order.ownerAmount,
        settlementStatus: order.settlementStatus,
        settledAt: order.settledAt,
        orderStatus: order.status,
      })),
    });
  } catch (error) {
    console.error('Get owner earnings failed:', error.message);

    return res.status(500).json({
      message: 'Failed to fetch owner earnings',
    });
  }
}

// ==========================================
// GET ORDERS FOR ONE OWNER
// ==========================================

async function getOwnerOrders(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const orders = await Order.find({
      ownerId,
      paymentStatus: 'Paid',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get owner orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  getDailyReward,
  getOwnerEarnings,
  getOwnerOrders,
};
