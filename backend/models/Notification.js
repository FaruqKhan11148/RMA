const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ['customer', 'owner', 'delivery'],
      required: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    type: {
      type: String,
      enum: [
        'NEW_ORDER',
        'ORDER_ACCEPTED',
        'ORDER_PREPARING',
        'ORDER_READY',
        'ORDER_OUT_FOR_DELIVERY',
        'ORDER_COMPLETED',
        'ORDER_REJECTED',
        'DELIVERY_ASSIGNED',
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: String,
      default: null,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  recipientType: 1,
  recipientId: 1,
  createdAt: -1,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
