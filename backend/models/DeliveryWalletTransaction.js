const mongoose = require('mongoose');

const deliveryWalletTransactionSchema = new mongoose.Schema(
  {
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'ORDER_DELIVERY_EARNING',
        'WITHDRAWAL_REQUEST',
        'WITHDRAWAL_COMPLETED',
        'WITHDRAWAL_FAILED',
        'ADJUSTMENT',
        'REFUND_REVERSAL',
        'INCENTIVE',
        'PENALTY',
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'AVAILABLE', 'PROCESSING', 'COMPLETED', 'FAILED'],
      required: true,
      default: 'PENDING',
    },

    description: {
      type: String,
      default: '',
    },

    availableAt: {
      type: Date,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

deliveryWalletTransactionSchema.index(
  {
    deliveryPersonId: 1,
    orderId: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      orderId: { $type: 'string' },
      type: 'ORDER_DELIVERY_EARNING',
    },
  },
);

module.exports = mongoose.model(
  'DeliveryWalletTransaction',
  deliveryWalletTransactionSchema,
);
