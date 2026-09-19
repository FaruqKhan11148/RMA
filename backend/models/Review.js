const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // =========================
    // RELATIONSHIPS
    // =========================

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      index: true,
    },

    // =========================
    // RATINGS
    // =========================

    rmaRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    shopRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    deliveryRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // =========================
    // FEEDBACK
    // =========================

    feedback: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({
  ownerId: 1,
  createdAt: -1,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
