const mongoose = require('mongoose');

const paymentAuditLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    actorType: {
      type: String,
      enum: ['CUSTOMER', 'OWNER', 'ADMIN', 'SYSTEM'],
      required: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    action: {
      type: String,
      enum: [
        'PAYMENT_CONFIRMED',
        'PAYMENT_NOT_RECEIVED_CONFIRMED',
        'PAYMENT_DISPUTED',
        'REFUND_REQUESTED',
        'REFUND_UNDER_REVIEW',
        'REFUND_APPROVED',
        'REFUND_REJECTED',
        'REFUND_MARKED_SENT',
        'REFUND_VERIFIED',
        'REFUND_FAILED',
        'REFUND_CANCELLED',
        'DISPUTE_OPENED',
        'DISPUTE_UPDATED',
        'DISPUTE_RESOLVED',
      ],
      required: true,
    },

    previousStatus: {
      type: String,
      default: null,
      trim: true,
    },

    newStatus: {
      type: String,
      default: null,
      trim: true,
    },

    reason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    reference: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

paymentAuditLogSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentAuditLog', paymentAuditLogSchema);
