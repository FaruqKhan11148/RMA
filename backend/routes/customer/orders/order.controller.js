const Order = require('../../../models/Order');

// ==========================================
// GET LOGGED-IN CUSTOMER ORDERS
// ==========================================
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.customer._id,
    })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get customer orders failed:', error.message);

    return res.status(500).json({
      message: 'Failed to fetch customer orders',
    });
  }
};

// ==========================================
// DELETE LOGGED-IN CUSTOMER ORDERS
// ==========================================
const deleteCustomerOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one order ID',
      });
    }

    const validOrderIds = orderIds.filter(
      (orderId) => typeof orderId === 'string' && orderId.trim(),
    );

    if (validOrderIds.length === 0) {
      return res.status(400).json({
        message: 'No valid order IDs provided',
      });
    }

    const result = await Order.deleteMany({
      orderId: { $in: validOrderIds },
      customerId: req.customer._id,
      $or: [
        {
          status: 'Completed',
        },
        {
          status: 'Rejected',
          refundStatus: 'Completed',
        },
      ],
    });

    return res.status(200).json({
      message: 'Orders deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete customer orders failed:', error.message);

    return res.status(500).json({
      message: 'Failed to delete customer orders',
    });
  }
};

module.exports = {
  getCustomerOrders,
  deleteCustomerOrders,
};
