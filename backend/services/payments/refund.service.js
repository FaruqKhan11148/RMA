const mongoose = require('mongoose');

const PaymentRefund = require('../../models/PaymentRefund');
const Order = require('../../models/Order');
const { recordPaymentAudit } = require('./paymentState.service');

const ALLOWED_TRANSITIONS = {
  REQUESTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['MARKED_SENT', 'CANCELLED'],
  MARKED_SENT: ['VERIFIED', 'FAILED'],
  FAILED: ['UNDER_REVIEW'],
  VERIFIED: [],
  REJECTED: [],
  CANCELLED: [],
};

const ALLOWED_ACTORS = {
  UNDER_REVIEW: ['OWNER', 'ADMIN'],
  APPROVED: ['ADMIN'],
  REJECTED: ['ADMIN'],
  CANCELLED: ['ADMIN'],
  MARKED_SENT: ['OWNER', 'ADMIN'],
  VERIFIED: ['ADMIN'],
  FAILED: ['ADMIN'],
};

const AUDIT_ACTIONS = {
  UNDER_REVIEW: 'REFUND_UNDER_REVIEW',
  APPROVED: 'REFUND_APPROVED',
  REJECTED: 'REFUND_REJECTED',
  MARKED_SENT: 'REFUND_MARKED_SENT',
  VERIFIED: 'REFUND_VERIFIED',
  FAILED: 'REFUND_FAILED',
  CANCELLED: 'REFUND_CANCELLED',
};

const ACTIVE_REFUND_STATUSES = [
  'REQUESTED',
  'UNDER_REVIEW',
  'APPROVED',
  'MARKED_SENT',
  'FAILED',
];

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/**
 * Recalculate order-level refund fields from the refund records.
 *
 * FAILED refunds remain active to prevent another payout while the
 * failed transfer is investigated. Only VERIFIED refunds count as
 * money actually refunded.
 */
async function recalculateOrderRefundState(order, session) {
  const refunds = await PaymentRefund.find({
    order: order._id,
  })
    .select('amount status activeRefund')
    .session(session)
    .lean();

  const verifiedRefunds = refunds.filter(
    (refund) => refund.status === 'VERIFIED',
  );

  const totalRefunded = roundMoney(
    verifiedRefunds.reduce(
      (total, refund) => total + Number(refund.amount || 0),
      0,
    ),
  );

  const activeRefunds = refunds.filter(
    (refund) =>
      refund.activeRefund && ACTIVE_REFUND_STATUSES.includes(refund.status),
  );

  const totalPaidAmount = roundMoney(
    order.customerPayableAmount ?? order.totalPrice ?? 0,
  );

  if (totalRefunded > totalPaidAmount + 0.001) {
    throw new Error('Total refunds cannot exceed the original payment');
  }

  const isFullyRefunded =
    totalPaidAmount > 0 && totalRefunded >= totalPaidAmount - 0.001;

  order.refundAmount = totalRefunded;

  if (isFullyRefunded) {
    order.refundStatus = 'Completed';
    order.paymentStatus = 'Refunded';
    order.refundCompletedAt = order.refundCompletedAt || new Date();
    return;
  }

  order.refundCompletedAt = null;

  // A partial refund does not mean the original payment was fully
  // refunded. Keep the payment marked Paid until the full amount is
  // verified as refunded.
  if (totalRefunded > 0) {
    order.paymentStatus = 'Paid';
  }

  if (activeRefunds.length > 0) {
    if (activeRefunds.some((refund) => refund.status === 'FAILED')) {
      order.refundStatus = 'Failed';
    } else if (
      activeRefunds.some((refund) => refund.status === 'MARKED_SENT')
    ) {
      order.refundStatus = 'Processing';
    } else {
      order.refundStatus = 'Pending';
    }

    return;
  }

  if (totalRefunded > 0) {
    order.refundStatus = 'PartiallyRefunded';
  } else {
    order.refundStatus = 'NotRequired';
  }
}

async function transitionRefund({
  refundId,
  nextStatus,
  actorType,
  actorId = null,
  reason = null,
  reference = null,
  evidenceUrl = null,
  refundSentAt = null,
}) {
  if (!mongoose.isValidObjectId(refundId)) {
    throw new Error('Invalid refund ID');
  }

  if (!Object.hasOwn(ALLOWED_TRANSITIONS, nextStatus)) {
    throw new Error('Invalid refund status');
  }

  if (!(ALLOWED_ACTORS[nextStatus] || []).includes(actorType)) {
    throw new Error(
      `Actor ${actorType} is not allowed to set refund status to ${nextStatus}`,
    );
  }

  const session = await mongoose.startSession();
  let updatedRefund;

  try {
    await session.withTransaction(async () => {
      const refund = await PaymentRefund.findById(refundId).session(session);

      if (!refund) {
        throw new Error('Refund request not found');
      }

      const allowed = ALLOWED_TRANSITIONS[refund.status] || [];

      if (!allowed.includes(nextStatus)) {
        throw new Error(
          `Refund cannot move from ${refund.status} to ${nextStatus}`,
        );
      }

      const order = await Order.findById(refund.order).session(session);

      if (!order || order.orderId !== refund.orderId) {
        throw new Error('Related order not found or does not match');
      }

      const effectiveReference = reference || refund.refundReference;
      const effectiveEvidenceUrl =
        evidenceUrl !== null ? evidenceUrl : refund.refundEvidenceUrl;

      if (nextStatus === 'MARKED_SENT') {
        if (!effectiveReference) {
          throw new Error(
            'A refund reference is required before marking it as sent',
          );
        }

        if (!effectiveEvidenceUrl) {
          throw new Error(
            'Refund evidence URL is required before marking it as sent',
          );
        }
      }

      if (nextStatus === 'VERIFIED') {
        if (refund.status !== 'MARKED_SENT') {
          throw new Error('Only a refund marked as sent can be verified');
        }

        if (!effectiveReference) {
          throw new Error('A refund reference is required before verification');
        }

        if (!effectiveEvidenceUrl) {
          throw new Error(
            'Refund evidence URL is required before verification',
          );
        }

        if (
          actorType !== 'ADMIN' ||
          typeof reason !== 'string' ||
          !reason.trim()
        ) {
          throw new Error(
            'Admin verification notes are required before verification',
          );
        }
      }

      const previousStatus = refund.status;

      refund.status = nextStatus;
      refund.activeRefund = !['VERIFIED', 'REJECTED', 'CANCELLED'].includes(
        nextStatus,
      );

      if (reason) {
        if (actorType === 'ADMIN') {
          refund.adminNotes = reason.trim();
        } else {
          refund.shopResponse = reason.trim();
        }
      }

      if (reference) {
        refund.refundReference = reference.trim();
      }

      if (evidenceUrl !== null) {
        refund.refundEvidenceUrl = evidenceUrl;
      }

      if (nextStatus === 'MARKED_SENT') {
        const sentAt = refundSentAt ? new Date(refundSentAt) : new Date();

        if (Number.isNaN(sentAt.getTime())) {
          throw new Error('Invalid refund transfer date and time');
        }

        if (sentAt.getTime() > Date.now() + 5 * 60 * 1000) {
          throw new Error(
            'Refund transfer date and time cannot be in the future',
          );
        }

        refund.refundSentAt = sentAt;
      }

      if (nextStatus === 'VERIFIED') {
        refund.verifiedAt = new Date();
        refund.verifiedByType = actorType;
        refund.verifiedById = actorId;
      }

      await refund.save({ session });

      await recalculateOrderRefundState(order, session);

      await order.save({ session });

      await recordPaymentAudit({
        order,
        actorType,
        actorId,
        action: AUDIT_ACTIONS[nextStatus],
        previousStatus,
        newStatus: nextStatus,
        reason,
        reference: effectiveReference,
        metadata: {
          refundId: String(refund._id),
          amount: refund.amount,
          evidenceUrl: effectiveEvidenceUrl,
          orderRefundStatus: order.refundStatus,
        },
        session,
      });

      updatedRefund = refund;
    });

    return updatedRefund;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  transitionRefund,
};
