const { initiatePayURefund } = require('../core/order.controller');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

// ==========================================
// GET ORDERS FOR ONE GUEST
// ==========================================

async function getGuestOrders(req, res) {
  try {
    const { guestId } = req.params;

    if (!guestId) {
      return res.status(400).json({
        message: 'Guest ID is required',
      });
    }

    const orders = await Order.find({ guestId })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get guest orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

async function rejectDelivery(req, res) {
  try {
    const { orderId } = req.params;
    const { reason, description } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // ONLY OUT FOR DELIVERY ORDERS
    // ==========================================

    if (order.status !== 'OutForDelivery') {
      return res.status(400).json({
        message:
          'Delivery can only be rejected while the order is out for delivery.',
      });
    }

    // ==========================================
    // OTP ALREADY VERIFIED
    // ==========================================

    if (order.otpVerified) {
      return res.status(400).json({
        message:
          'This order has already been delivered and cannot be rejected.',
      });
    }

    // ==========================================
    // REQUIRE REJECTION REASON
    // ==========================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: 'Rejection reason is required',
      });
    }

    // ==========================================
    // PREVENT DUPLICATE REJECTION
    // ==========================================

    if (order.customerRejectedAt) {
      return res.status(400).json({
        message: 'Delivery has already been rejected for this order',
      });
    }

    // ==========================================
    // REFUND AMOUNT
    // ==========================================

    /*
     * Delivery rejection refund policy:
     *
     * Refund:
     *   Product subtotal
     *   +
     *   PayU convenience charges
     *
     * Do NOT refund:
     *   Delivery charge
     */

    const subtotal = Number(order.subtotal || 0);

    const payuCharges = Number(order.payuCharges || 0);

    const deliveryRejectionRefund = Number((subtotal + payuCharges).toFixed(2));

    if (deliveryRejectionRefund <= 0) {
      return res.status(400).json({
        message: 'Unable to calculate the delivery rejection refund',
      });
    }

    // ==========================================
    // ONLINE PAYMENT REFUND
    // ==========================================

    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
      try {
        // Mark refund as processing before calling PayU.
        order.refundStatus = 'Processing';
        order.refundAmount = deliveryRejectionRefund;
        order.refundType = 'DELIVERY_REJECTION';
        order.refundReason = reason.trim();
        order.refundInitiatedAt = new Date();

        order.customerRejectedAt = new Date();
        order.customerRejectionReason = reason.trim();
        order.customerRejectionDescription = description?.trim() || null;

        order.settlementStatus = 'NotRequired';

        await order.save();

        // ==========================================
        // INITIATE REFUND
        // ==========================================

        const refundResult = await initiatePayURefund(
          order,
          deliveryRejectionRefund,
        );

        order.refundStatus = 'Processing';
        order.refundAmount = refundResult.refundAmount;
        order.refundId = refundResult.requestId || refundResult.refundToken;

        // Keep payment as Paid until PayU confirms
        // the refund through the refund callback.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';

        // ==========================================
        // MARK ORDER REJECTED
        // ==========================================

        order.status = 'Rejected';

        await order.save();

        // ==========================================
        // CUSTOMER NOTIFICATION
        // ==========================================

        if (order.customerId) {
          try {
            await createAndSendNotification({
              recipientType: 'customer',
              recipientId: order.customerId,
              type: 'ORDER_REJECTED',
              title: 'Delivery Rejected',
              message:
                `Your order ${order.orderId} has been rejected. ` +
                'Your eligible refund has been initiated.',
              orderId: order.orderId,
              data: {
                screen: 'order-status',
                orderId: order.orderId,
              },
            });
          } catch (notificationError) {
            console.error(
              'Customer delivery rejection notification failed:',
              notificationError,
            );
          }
        }

        await order.populate('ownerId', 'ownerName shopName phone');

        return res.status(200).json({
          message:
            'Delivery rejected and eligible refund initiated successfully',
          order,
        });
      } catch (refundError) {
        console.error('Delivery rejection refund failed:', refundError.message);

        // ==========================================
        // REJECTION STILL RECORDED
        // ==========================================

        order.customerRejectedAt = new Date();
        order.customerRejectionReason = reason.trim();
        order.customerRejectionDescription = description?.trim() || null;

        order.refundStatus = 'Failed';
        order.refundAmount = deliveryRejectionRefund;
        order.refundType = 'DELIVERY_REJECTION';
        order.refundReason = reason.trim();

        // Customer has NOT been confirmed as refunded.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';
        order.status = 'Rejected';

        await order.save();

        return res.status(502).json({
          message:
            'Delivery was rejected, but the customer refund could not be initiated',
          error: refundError.message,
          order,
        });
      }
    }

    // ==========================================
    // NON-PAID FALLBACK
    // ==========================================

    order.customerRejectedAt = new Date();
    order.customerRejectionReason = reason.trim();
    order.customerRejectionDescription = description?.trim() || null;

    order.status = 'Rejected';

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Delivery rejected successfully',
      order,
    });
  } catch (error) {
    console.error('Customer delivery rejection failed:', error.message);

    return res.status(500).json({
      message: 'Unable to reject delivery',
    });
  }
}

// ==========================================
// CUSTOMER CANCEL ORDER
// ==========================================

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // CHECK CANCELLATION ELIGIBILITY
    // ==========================================

    const cancellableStatuses = ['Pending', 'Accepted'];

    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message:
          'This order can no longer be cancelled because preparation has started or the order has progressed further.',
      });
    }

    // ==========================================
    // REQUIRE CANCELLATION REASON
    // ==========================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: 'Cancellation reason is required',
      });
    }

    // ==========================================
    // PREVENT DUPLICATE CANCELLATION
    // ==========================================

    if (order.cancelledAt) {
      return res.status(400).json({
        message: 'Order has already been cancelled',
      });
    }

    // ==========================================
    // ONLINE PAYMENT REFUND
    // ==========================================

    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
      const fullRefundAmount = Number(
        (order.customerPayableAmount || order.totalPrice).toFixed(2),
      );

      try {
        // Mark refund as processing before calling PayU.
        order.refundStatus = 'Processing';
        order.refundAmount = fullRefundAmount;
        order.refundType = 'FULL';
        order.refundReason = reason.trim();
        order.refundInitiatedAt = new Date();

        await order.save();

        // Initiate FULL customer refund through PayU.
        const refundResult = await initiatePayURefund(order, fullRefundAmount);

        order.refundStatus = 'Processing';
        order.refundAmount = refundResult.refundAmount;
        order.refundId = refundResult.requestId || refundResult.refundToken;

        // No settlement should happen after cancellation.
        order.settlementStatus = 'NotRequired';

        // ==========================================
        // RECORD CANCELLATION
        // ==========================================

        order.cancelledAt = new Date();
        order.cancelledBy = 'CUSTOMER';
        order.cancellationReason = reason.trim();

        // Keep payment as Paid until PayU confirms
        // the refund through the refund callback.
        order.paymentStatus = 'Paid';

        // ==========================================
        // CURRENT STATUS
        // ==========================================

        order.status = 'Rejected';

        await order.save();

        // ==========================================
        // CUSTOMER NOTIFICATION
        // ==========================================

        if (order.customerId) {
          try {
            await createAndSendNotification({
              recipientType: 'customer',
              recipientId: order.customerId,
              type: 'ORDER_CANCELLED',
              title: 'Order Cancelled',
              message:
                `Your order ${order.orderId} has been cancelled successfully. ` +
                `Your refund has been initiated.`,
              orderId: order.orderId,
              data: {
                screen: 'order-status',
                orderId: order.orderId,
              },
            });
          } catch (notificationError) {
            console.error(
              'Customer cancellation notification failed:',
              notificationError,
            );
          }
        }

        await order.populate('ownerId', 'ownerName shopName phone');

        return res.status(200).json({
          message: 'Order cancelled and full refund initiated successfully',
          order,
        });
      } catch (refundError) {
        console.error(
          'Customer cancellation refund failed:',
          refundError.message,
        );

        // Cancellation still happened, but refund initiation failed.
        order.cancelledAt = new Date();
        order.cancelledBy = 'CUSTOMER';
        order.cancellationReason = reason.trim();

        order.refundStatus = 'Failed';
        order.refundAmount = fullRefundAmount;
        order.refundType = 'FULL';
        order.refundReason = reason.trim();

        // Customer has NOT been confirmed as refunded.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';
        order.status = 'Rejected';

        await order.save();

        return res.status(502).json({
          message:
            'Order was cancelled, but the customer refund could not be initiated',
          error: refundError.message,
          order,
        });
      }
    }

    // ==========================================
    // FALLBACK FOR NON-PAID ORDER
    // ==========================================

    order.cancelledAt = new Date();
    order.cancelledBy = 'CUSTOMER';
    order.cancellationReason = reason.trim();
    order.status = 'Rejected';

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Customer cancel order failed:', error.message);

    return res.status(500).json({
      message: 'Unable to cancel order',
    });
  }
}

module.exports = {
  getGuestOrders,
  cancelOrder,
  rejectDelivery,
};
