const mongoose = require('mongoose');

const supportIssueSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    issueType: {
      type: String,
      enum: [
        'order_not_received',
        'wrong_items',
        'missing_items',
        'damaged_items',
        'payment_problem',
        'delivery_problem',
        'shop_problem',
        'other',
      ],
      required: true,
    },

    orderId: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },

    adminNote: {
      type: String,
      trim: true,
      default: '',
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('SupportIssue', supportIssueSchema);
    