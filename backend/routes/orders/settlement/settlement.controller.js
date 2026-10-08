const {
  settleCompletedOrder,
} = require('../../../services/orders/settlement.service');

async function settleOwnerOrder(req, res) {
  try {
    const { orderId } = req.params;

    const result = await settleCompletedOrder(orderId);

    return res.status(200).json({
      message: result.alreadySettled
        ? 'Order is already settled'
        : 'Order settled successfully',
      order: {
        orderId: result.order.orderId,
        ownerId: result.order.ownerId,
        ownerAmount: result.order.ownerAmount,
        settlementStatus: result.order.settlementStatus,
        settledAt: result.order.settledAt,
      },
    });
  } catch (error) {
    console.error('Order settlement failed:', error.message);

    return res.status(500).json({
      message: error.message || 'Server error',
    });
  }
}

module.exports = {
  settleOwnerOrder,
};
