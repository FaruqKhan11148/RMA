const mongoose = require('mongoose');
const Order = require('../../../models/Order');
const PaymentRefund = require('../../../models/PaymentRefund');

const {
  validateDirectUpiRefund,
  recordPaymentAudit,
} = require('../../../services/payments/paymentState.service');

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

async function requestCustomerRefund(req, res) {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;
    const reason =
      typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    const requestedAmount = req.body?.amount;

    if (!reason || reason.length > 1000) {
      return res.status(400).json({
        message: 'Please provide a refund reason (maximum 1000 characters).',
      });
    }

    if (
      requestedAmount !== undefined &&
      (!Number.isFinite(Number(requestedAmount)) ||
        Number(requestedAmount) <= 0)
    ) {
      return res.status(400).json({
        message: 'Refund amount must be greater than zero.',
      });
    }

    let createdRefund;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        orderId,
        customerId: req.customer._id,
      }).session(session);

      if (!order) {
        const error = new Error('Order not found for this customer.');
        error.statusCode = 404;
        throw error;
      }

      if (
        order.paymentProvider !== 'DIRECT_UPI' ||
        order.paymentMethod !== 'DIRECT_UPI'
      ) {
        const error = new Error('This endpoint is only for Direct UPI orders.');
        error.statusCode = 409;
        throw error;
      }

      if (!['Pending', 'Accepted'].includes(order.status)) {
        const error = new Error(
          'A refund request can only be submitted for a Pending or Accepted order.',
        );
        error.statusCode = 409;
        throw error;
      }

      // Keep cancellation/refund processing consistent with the order state.
      // Do not allow partial refunds while leaving an order active.
      const payableAmount = roundMoney(
        Number(order.customerPayableAmount || order.totalPrice),
      );

      const amount =
        requestedAmount === undefined
          ? payableAmount
          : roundMoney(Number(requestedAmount));

      if (amount !== payableAmount) {
        const error = new Error(
          'Only full-order refunds are supported by this endpoint currently.',
        );
        error.statusCode = 400;
        throw error;
      }

      await validateDirectUpiRefund(order, amount, { session });

      const [refund] = await PaymentRefund.create(
        [
          {
            order: order._id,
            orderId: order.orderId,
            requestedByType: 'CUSTOMER',
            requestedById: req.customer._id,
            amount,
            reason,
            status: 'REQUESTED',
            activeRefund: true,
          },
        ],
        { session },
      );

      order.refundStatus = 'Pending';
      order.refundAmount = 0;
      order.refundType = 'FULL';
      order.refundReason = reason;
      order.refundInitiatedAt = new Date();
      order.settlementStatus = 'NotRequired';

      // Prevent the order from being fulfilled while the refund is reviewed.
      order.status = 'Rejected';
      order.customerRejectedAt = new Date();
      order.customerRejectionReason = reason;

      await order.save({ session });

      await recordPaymentAudit({
        order,
        actorType: 'CUSTOMER',
        actorId: req.customer._id,
        action: 'REFUND_REQUESTED',
        previousStatus: null,
        newStatus: 'REQUESTED',
        reason,
        metadata: {
          refundId: String(refund._id),
          amount,
          provider: 'DIRECT_UPI',
        },
        session,
      });

      createdRefund = refund;
    });

    return res.status(201).json({
      message: 'Refund request submitted for review.',
      refund: createdRefund,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (
      error.code === 11000 ||
      /refund exceeds|only paid|payment has not been confirmed|remaining refundable amount|not a Direct UPI/i.test(
        error.message || '',
      )
    ) {
      return res.status(409).json({
        message:
          error.code === 11000
            ? 'An active refund request already exists for this order.'
            : error.message,
      });
    }

    console.error('Customer refund request error:', error);

    return res.status(500).json({
      message: 'Unable to submit the refund request.',
    });
  } finally {
    await session.endSession();
  }
}

async function getCustomerRefunds(req, res) {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      customerId: req.customer._id,
    }).select('_id orderId');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found for this customer.',
      });
    }

    const refunds = await PaymentRefund.find({
      order: order._id,
    })
      .select(
        'orderId amount reason status shopResponse refundReference refundEvidenceUrl refundSentAt verifiedAt createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      orderId: order.orderId,
      refunds,
    });
  } catch (error) {
    console.error('Customer refund status error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve refund status.',
    });
  }
}

module.exports = {
  requestCustomerRefund,
  getCustomerRefunds,
};
