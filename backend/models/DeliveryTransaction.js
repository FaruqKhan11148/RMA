const mongoose = require('mongoose');

const deliveryTransactionSchema = new mongoose.Schema(
  {
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
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
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'PENDING',
        'AVAILABLE',
        'PROCESSING',
        'COMPLETED',
        'FAILED',
        'REVERSED',
      ],
      default: 'PENDING',
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

deliveryTransactionSchema.index({
  deliveryPersonId: 1,
  createdAt: -1,
});

deliveryTransactionSchema.index({
  deliveryPersonId: 1,
  status: 1,
});

deliveryTransactionSchema.index(
  {
    deliveryPersonId: 1,
    orderId: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: 'ORDER_DELIVERY_EARNING',
    },
  },
);

const DeliveryTransaction = mongoose.model(
  'DeliveryTransaction',
  deliveryTransactionSchema,
);

module.exports = DeliveryTransaction;
