const mongoose = require('mongoose');

const paymentDisputeSchema = new mongoose.Schema(
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

    raisedByType: {
      type: String,
      enum: ['CUSTOMER', 'OWNER', 'ADMIN'],
      required: true,
    },

    raisedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    category: {
      type: String,
      enum: [
        'PAYMENT_NOT_RECEIVED',
        'PAYMENT_DEBITED_NOT_CONFIRMED',
        'WRONG_AMOUNT',
        'DUPLICATE_PAYMENT',
        'REFUND_NOT_RECEIVED',
        'REFUND_AMOUNT_MISMATCH',
        'OTHER',
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    transactionReference: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    refund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentRefund',
      default: null,
    },

    status: {
      type: String,
      enum: [
        'OPEN',
        'UNDER_REVIEW',
        'AWAITING_CUSTOMER',
        'AWAITING_OWNER',
        'RESOLVED',
        'REJECTED',
        'ESCALATED',
      ],
      default: 'OPEN',
      index: true,
    },

    resolution: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    resolvedByType: {
      type: String,
      enum: ['OWNER', 'ADMIN', null],
      default: null,
    },

    resolvedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

paymentDisputeSchema.index({ order: 1, createdAt: -1 });
paymentDisputeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentDispute', paymentDisputeSchema);
