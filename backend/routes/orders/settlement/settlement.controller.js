const Order = require('../../../models/Order');

async function settleOwnerOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // PAYMENT VALIDATION
    // ==========================================

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({
        message: 'Order payment is not completed',
      });
    }

    // ==========================================
    // ORDER COMPLETION VALIDATION
    // ==========================================

    if (order.status !== 'Completed') {
      return res.status(400).json({
        message: 'Order must be completed before settlement',
      });
    }

    // ==========================================
    // SETTLEMENT STATUS VALIDATION
    // ==========================================

    if (order.settlementStatus === 'NotRequired') {
      return res.status(400).json({
        message: 'Order is not eligible for settlement',
      });
    }

    if (order.settlementStatus === 'Settled') {
      return res.status(400).json({
        message: 'Order is already settled',
      });
    }

    if (order.settlementStatus !== 'Pending') {
      return res.status(400).json({
        message: `Order cannot be settled from ${order.settlementStatus} status`,
      });
    }

    // ==========================================
    // START SETTLEMENT
    // ==========================================

    order.settlementStatus = 'Processing';

    await order.save();

    // ==========================================
    // COMPLETE SETTLEMENT
    // ==========================================

    order.settlementStatus = 'Settled';
    order.settledAt = new Date();

    await order.save();

    return res.status(200).json({
      message: 'Order settled successfully',
      order: {
        orderId: order.orderId,
        ownerId: order.ownerId,
        ownerAmount: order.ownerAmount,
        settlementStatus: order.settlementStatus,
        settledAt: order.settledAt,
      },
    });
  } catch (error) {
    console.error('Order settlement failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  settleOwnerOrder,
};
