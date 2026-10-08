const Order = require('../../../models/Order');
const DeliveryPerson = require('../../../models/DeliveryPerson');
const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');
const {
  settleCompletedOrder,
} = require('../../../services/orders/settlement.service');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

async function verifyDeliveryOtp(req, res) {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const deliveryPerson = req.deliveryPerson;

    if (!otp) {
      return res.status(400).json({
        message: 'Delivery OTP is required',
      });
    }

    const order = await Order.findOne({
      orderId,
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
      status: 'OutForDelivery',
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Check OTP
    if (order.deliveryOtp !== otp) {
      return res.status(400).json({
        message: 'Invalid delivery OTP',
      });
    }

    // OTP is correct
    order.otpVerified = true;
    order.status = 'Completed';
    order.completedAt = new Date();

    if (order.deliveryPersonId) {
      const remainingActiveOrders = await Order.countDocuments({
        deliveryPersonId: order.deliveryPersonId,
        deliveryAssignmentStatus: 'ACCEPTED',
        status: 'OutForDelivery',
        _id: { $ne: order._id },
      });

      const deliveryPerson = await DeliveryPerson.findById(
        order.deliveryPersonId,
      );

      if (deliveryPerson) {
        if (remainingActiveOrders === 0) {
          deliveryPerson.availabilityStatus = 'AVAILABLE';
          deliveryPerson.lastAvailabilityChangedAt = new Date();

          await deliveryPerson.save();
        }
      }
    }

    // ==========================================
    // DELIVERY PARTNER WALLET EARNING
    // ==========================================

    const deliveryEarning = Number(
      Number(order.deliveryRiderAmount || order.deliveryCharge || 0).toFixed(2),
    );

    if (deliveryEarning > 0) {
      try {
        await DeliveryWalletTransaction.create({
          deliveryPersonId: order.deliveryPersonId,
          orderId: order.orderId,
          type: 'ORDER_DELIVERY_EARNING',
          amount: deliveryEarning,
          status: 'PENDING',
          description: `Delivery earning for order ${order.orderId}`,
          metadata: {
            deliveryCharge: Number(order.deliveryCharge || 0),
            deliveryRiderAmount: deliveryEarning,
          },
        });
      } catch (walletError) {
        // Duplicate transaction means the earning was already created.
        if (walletError.code !== 11000) {
          throw walletError;
        }

        console.log(
          `Delivery earning already exists for order ${order.orderId}`,
        );
      }
    }

    await order.save();

    // ==========================================
    // TEST BANK SETTLEMENT
    // ==========================================

    if (
      order.paymentStatus === 'Paid' &&
      ['Pending', 'Processing', 'Failed'].includes(order.settlementStatus)
    ) {
      try {
        order.settlementStatus = 'Processing';
        await order.save();

        const settlementResult = await settleCompletedOrder(order.orderId);

        console.log(
          `TestBank settlement completed for ${order.orderId}:`,
          settlementResult,
        );

        const settledOrder = await Order.findOne({
          orderId: order.orderId,
        });

        if (settledOrder) {
          order.settlementStatus = settledOrder.settlementStatus;
          order.settledAt = settledOrder.settledAt;
        }
      } catch (settlementError) {
        console.error(
          `TestBank settlement failed for ${order.orderId}:`,
          settlementError,
        );

        order.settlementStatus = 'Failed';
        await order.save();

        return res.status(502).json({
          message:
            'Order delivered, but financial settlement failed. Please retry settlement from admin.',
          order,
        });
      }
    }

    // ==========================================
    // CUSTOMER COMPLETION NOTIFICATION
    // ==========================================

    if (order.customerId) {
      try {
        await createAndSendNotification({
          recipientType: 'customer',
          recipientId: order.customerId,
          type: 'ORDER_COMPLETED',
          title: 'Order Delivered',
          message: `Your order ${order.orderId} has been delivered. Thank you for ordering with RMA!`,
          orderId: order.orderId,
          data: {
            screen: 'order-status',
            orderId: order.orderId,
          },
        });
      } catch (notificationError) {
        console.error(
          'Customer completion notification failed:',
          notificationError,
        );
      }
    }

    // ==========================================
    // OWNER COMPLETION NOTIFICATION
    // ==========================================

    if (order.ownerId) {
      try {
        await createAndSendNotification({
          recipientType: 'owner',
          recipientId: order.ownerId,
          type: 'ORDER_COMPLETED',
          title: 'Order Completed',
          message: `Order ${order.orderId} has been delivered successfully.`,
          orderId: order.orderId,
          data: {
            screen: 'orders',
            orderId: order.orderId,
            status: 'Completed',
          },
        });
      } catch (notificationError) {
        console.error(
          'Owner completion notification failed:',
          notificationError,
        );
      }
    }

    await order.populate('ownerId', 'ownerName shopName phone');

    res.status(200).json({
      message: 'Delivery OTP verified successfully',
      order,
    });
  } catch (error) {
    console.error('Verify delivery OTP failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  verifyDeliveryOtp,
};
