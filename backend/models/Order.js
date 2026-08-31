const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
        default: '',
      },
    },

    orderType: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },

    deliveryLocation: {
      latitude: {
        type: Number,
        required: function () {
          return this.orderType === 'delivery';
        },
      },

      longitude: {
        type: Number,
        required: function () {
          return this.orderType === 'delivery';
        },
      },

      address: {
        type: String,
        default: '',
        trim: true,
      },
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Preparing',
        'Ready',
        'Completed',
        'Rejected',
      ],
      default: 'Pending',
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },

    onlinePaymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'RUPAY'],
      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    paymentOrderId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
