const Order = require('../../../models/Order');
const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');

const {
  settleCompletedOrder,
} = require('../../../services/orders/settlement.service');

const {
  refreshDeliveryAvailability,
} = require('../../../services/deliveryWorkload.service');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

async function verifyDeliveryOtp(req, res) {
  try {
    const { orderId } = req.params;
    const otp = String(req.body.otp || '').trim();
    const deliveryPerson = req.deliveryPerson;

    if (!otp) {
      return res.status(400).json({
        message: 'Delivery OTP is required',
      });
    }

    if (!deliveryPerson?._id) {
      return res.status(401).json({
        message: 'Delivery partner authentication is required',
      });
    }

    const order = await Order.findOne({
      orderId,
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
      deliveryAssignmentStatus: 'ACCEPTED',
      status: 'OutForDelivery',
    });

    if (!order) {
      return res.status(404).json({
        message:
          'Order not found or is no longer awaiting delivery verification',
      });
    }

    // ==========================================
    // VERIFY OTP AND COMPLETE ORDER
    // ==========================================

    const completedAt = new Date();

    const completedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        orderId,
        deliveryPersonId: deliveryPerson._id,
        orderType: 'delivery',
        deliveryAssignmentStatus: 'ACCEPTED',
        status: 'OutForDelivery',
        deliveryOtp: otp,
        otpVerified: { $ne: true },
      },
      {
        $set: {
          otpVerified: true,
          status: 'Completed',
          completedAt,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!completedOrder) {
      const latestOrder = await Order.findOne({
        orderId,
        deliveryPersonId: deliveryPerson._id,
        orderType: 'delivery',
      }).select('status deliveryOtp otpVerified');

      if (!latestOrder) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }

      if (latestOrder.deliveryOtp !== otp) {
        return res.status(400).json({
          message: 'Invalid delivery OTP',
        });
      }

      return res.status(409).json({
        message:
          'This order has already been completed or its status has changed.',
      });
    }

    // Use the saved completion as the source of truth.
    const completed = completedOrder;

    // ==========================================
    // REFRESH DELIVERY PARTNER AVAILABILITY
    // ==========================================

    // Completed orders no longer consume an active-order slot.
    // Other accepted Ready/OutForDelivery orders must still count.
    try {
      const availability = await refreshDeliveryAvailability(
        deliveryPerson._id,
      );
    } catch (availabilityError) {
      console.error(
        `Failed to refresh availability for delivery partner ${deliveryPerson._id}:`,
        availabilityError,
      );
    }

    // ==========================================
    // DELIVERY PARTNER WALLET EARNING
    // ==========================================

    const deliveryEarning = Number(
      Number(
        completed.deliveryRiderAmount || completed.deliveryCharge || 0,
      ).toFixed(2),
    );

    if (deliveryEarning > 0) {
      try {
        await DeliveryWalletTransaction.create({
          deliveryPersonId: completed.deliveryPersonId,
          orderId: completed.orderId,
          type: 'ORDER_DELIVERY_EARNING',
          amount: deliveryEarning,
          status: 'PENDING',
          description: `Delivery earning for order ${completed.orderId}`,
          metadata: {
            deliveryCharge: Number(completed.deliveryCharge || 0),
            deliveryRiderAmount: deliveryEarning,
          },
        });
      } catch (walletError) {
        if (walletError.code === 11000) {
          console.log(
            `Delivery earning already exists for order ${completed.orderId}`,
          );
        } else {
          // Completion has already been saved. Do not report that
          // OTP verification failed; log the earning failure separately.
          console.error(
            `Failed to create delivery earning for ${completed.orderId}:`,
            walletError,
          );
        }
      }
    }

    // ==========================================
    // TEST BANK SETTLEMENT
    // ==========================================

    if (
      completed.paymentStatus === 'Paid' &&
      ['Pending', 'Processing', 'Failed'].includes(completed.settlementStatus)
    ) {
      try {
        completed.settlementStatus = 'Processing';
        await completed.save();

        const settlementResult = await settleCompletedOrder(completed.orderId);

        console.log(
          `TestBank settlement completed for ${completed.orderId}:`,
          settlementResult,
        );

        const settledOrder = await Order.findOne({
          orderId: completed.orderId,
        });

        if (settledOrder) {
          completed.settlementStatus = settledOrder.settlementStatus;
          completed.settledAt = settledOrder.settledAt;
        }
      } catch (settlementError) {
        console.error(
          `TestBank settlement failed for ${completed.orderId}:`,
          settlementError,
        );

        completed.settlementStatus = 'Failed';

        try {
          await completed.save();
        } catch (saveError) {
          console.error('Failed to save settlement failure status:', saveError);
        }

        return res.status(502).json({
          message:
            'Order delivered, but financial settlement failed. Please retry settlement from admin.',
          order: completed,
        });
      }
    }

    // ==========================================
    // CUSTOMER COMPLETION NOTIFICATION
    // ==========================================

    if (completed.customerId) {
      try {
        await createAndSendNotification({
          recipientType: 'customer',
          recipientId: completed.customerId,
          type: 'ORDER_COMPLETED',
          title: 'Order Delivered',
          message: `Your order ${completed.orderId} has been delivered. Thank you for ordering with RMA!`,
          orderId: completed.orderId,
          data: {
            screen: 'order-status',
            orderId: completed.orderId,
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

    if (completed.ownerId) {
      try {
        await createAndSendNotification({
          recipientType: 'owner',
          recipientId: completed.ownerId,
          type: 'ORDER_COMPLETED',
          title: 'Order Completed',
          message: `Order ${completed.orderId} has been delivered successfully.`,
          orderId: completed.orderId,
          data: {
            screen: 'orders',
            orderId: completed.orderId,
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

    await completed.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Delivery OTP verified successfully',
      order: completed,
    });
  } catch (error) {
    console.error('Verify delivery OTP failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  verifyDeliveryOtp,
};
