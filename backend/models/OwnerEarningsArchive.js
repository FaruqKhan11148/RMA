const mongoose = require('mongoose');

const ownerEarningsArchiveSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      trim: true,
    },

    archivedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// An owner can archive a particular order only once.
ownerEarningsArchiveSchema.index({ ownerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model(
  'OwnerEarningsArchive',
  ownerEarningsArchiveSchema,
);
