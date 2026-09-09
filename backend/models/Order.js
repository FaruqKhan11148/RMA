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

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
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

    // =========================
    // ORDER AMOUNT BREAKDOWN
    // =========================

    // Product subtotal before delivery charge
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryDistance: {
      type: Number,
      required: true,
      min: 0,
    },

    // Delivery charge paid by customer
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    // RMA platform fee = 1% of product subtotal
    rmaFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // Amount belonging to the shop owner
    // = subtotal - rmaFee
    ownerAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Final amount paid/payable by customer
    // = subtotal + deliveryCharge
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
        'OutForDelivery',
        'Completed',
        'Rejected',
      ],
      default: 'Pending',
    },

    // =========================
    // ORDER TIMELINE
    // =========================

    acceptedAt: {
      type: Date,
      default: null,
    },

    preparingAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    outForDeliveryAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // DELIVERY OTP
    // =========================

    deliveryOtp: {
      type: String,
      default: null,
    },

    deliveryOtpGeneratedAt: {
      type: Date,
      default: null,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // PAYMENT
    // =========================

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: ['ONLINE'],
      required: true,
      default: 'ONLINE',
    },

    onlinePaymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'RUPAY', 'NETBANKING'],
      default: null,
    },

    // PayU payment ID (mihpayid)
    paymentId: {
      type: String,
      default: null,
    },

    // PayU transaction ID (txnid)
    paymentOrderId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // =========================
    // SETTLEMENT
    // =========================

    // Payment is received first.
    // Settlement happens only after owner accepts the order.
    settlementStatus: {
      type: String,
      enum: ['NotRequired', 'Pending', 'Processing', 'Settled', 'Failed'],
      default: 'NotRequired',
    },

    settledAt: {
      type: Date,
      default: null,
    },

    // =========================
    // REFUND
    // =========================

    // Refund is required only when a paid order is rejected.
    refundStatus: {
      type: String,
      enum: ['NotRequired', 'Pending', 'Processing', 'Completed', 'Failed'],
      default: 'NotRequired',
    },

    // Total amount returned to customer
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // PayU refund transaction/reference ID
    refundId: {
      type: String,
      default: null,
    },

    refundInitiatedAt: {
      type: Date,
      default: null,
    },

    refundCompletedAt: {
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
