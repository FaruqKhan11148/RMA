const mongoose = require('mongoose');

const paymentRefundSchema = new mongoose.Schema(
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

    requestedByType: {
      type: String,
      enum: ['CUSTOMER', 'OWNER', 'ADMIN'],
      required: true,
    },

    requestedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        'REQUESTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'MARKED_SENT',
        'VERIFIED',
        'FAILED',
        'CANCELLED',
      ],
      default: 'REQUESTED',
      index: true,
    },

    activeRefund: {
      type: Boolean,
      default: true,
      required: true,
      index: false,
    },

    shopResponse: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    refundReference: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    refundEvidenceUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    refundSentAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedByType: {
      type: String,
      enum: ['CUSTOMER', 'OWNER', 'ADMIN', null],
      default: null,
    },

    verifiedById: {
      type: mongoose.Schema.Types.ObjectId,
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

paymentRefundSchema.index({ order: 1, createdAt: -1 });

paymentRefundSchema.index(
  { order: 1 },
  {
    unique: true,
    partialFilterExpression: {
      activeRefund: true,
    },
    name: 'one_active_refund_per_order',
  },
);

module.exports = mongoose.model('PaymentRefund', paymentRefundSchema);
