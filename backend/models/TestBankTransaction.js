const mongoose = require('mongoose');

const testBankTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    debitAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    creditAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestBankAccount',
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    transactionType: {
      type: String,
      enum: [
        'ACCOUNT_DEPOSIT',
        'ACCOUNT_TRANSFER',
        'ACCOUNT_WITHDRAWAL',
        'ORDER_PAYMENT',
        'OWNER_SETTLEMENT',
        'RMA_FEE',
        'OWNER_OFFER',
        'REFERRAL_REWARD',
        'DP_EARNING_HELD',
        'DP_WALLET_CREDIT',
        'DP_WITHDRAWAL',
        'PAYU_FEE_LIABILITY',
        'PAYU_FEE_DEDUCTION',
        'REFUND',
        'REVERSAL',
        'ADJUSTMENT',
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
      default: 'COMPLETED',
    },

    referenceType: {
      type: String,
      enum: [
        'ORDER',
        'PAYMENT',
        'WITHDRAWAL',
        'SETTLEMENT',
        'MANUAL',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },

    referenceId: {
      type: String,
      default: null,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
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

testBankTransactionSchema.index(
  {
    transactionType: 1,
    referenceType: 1,
    referenceId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      referenceId: { $type: 'string' },
    },
  },
);

module.exports = mongoose.model(
  'TestBankTransaction',
  testBankTransactionSchema,
);
