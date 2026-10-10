const mongoose = require('mongoose');

const testBankAccountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: [
        'RMA',
        'OWNER',
        'DELIVERY_PARTNER',
        'CUSTOMER',
        'PAYU',
        'CASHFREE',
      ],
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      default: null,
    },

    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      default: null,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    heldBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('TestBankAccount', testBankAccountSchema);
