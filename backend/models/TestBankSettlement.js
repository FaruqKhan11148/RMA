const mongoose = require('mongoose');

const testBankSettlementSchema = new mongoose.Schema(
  {
    // ==========================================
    // ORDER
    // ==========================================

    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================================
    // TEST BANK ACCOUNTS
    // ==========================================

    payuAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    ownerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    rmaAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    dpAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    // ==========================================
    // ORDER AMOUNTS
    // ==========================================

    productSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    customerPayment: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // SETTLEMENT AMOUNTS
    // ==========================================

    ownerAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    rmaFee: {
      type: Number,
      required: true,
      min: 0,
    },

    dpAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    payuFee: {
      type: Number,
      required: true,
      min: 0,
    },

    payuGst: {
      type: Number,
      required: true,
      min: 0,
    },

    payuCharges: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // OWNER SETTLEMENT
    // ==========================================

    ownerSettlement: {
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      transactionId: {
        type: String,
        default: null,
      },
    },

    // ==========================================
    // RMA FEE
    // ==========================================

    rmaFeeSettlement: {
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      transactionId: {
        type: String,
        default: null,
      },
    },

    // ==========================================
    // DP EARNING
    // ==========================================

    dpSettlement: {
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      hold: {
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED'],
          default: 'PENDING',
        },

        transactionId: {
          type: String,
          default: null,
        },
      },

      release: {
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED'],
          default: 'PENDING',
        },

        transactionId: {
          type: String,
          default: null,
        },
      },

      withdrawal: {
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED'],
          default: 'PENDING',
        },

        transactionId: {
          type: String,
          default: null,
        },
      },
    },

    // ==========================================
    // PAYU FEE
    // ==========================================

    payuSettlement: {
      liability: {
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED'],
          default: 'PENDING',
        },

        transactionId: {
          type: String,
          default: null,
        },
      },

      deduction: {
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED'],
          default: 'PENDING',
        },

        transactionId: {
          type: String,
          default: null,
        },

        processedAt: {
          type: Date,
          default: null,
        },
      },
    },

    // ==========================================
    // OVERALL SETTLEMENT
    // ==========================================

    settlementStatus: {
      type: String,
      enum: [
        'PENDING',
        'PROCESSING',
        'PARTIALLY_COMPLETED',
        'COMPLETED',
        'FAILED',
      ],
      default: 'PENDING',
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    customerPaymentSettlement: {
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      transactionId: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('TestBankSettlement', testBankSettlementSchema);
