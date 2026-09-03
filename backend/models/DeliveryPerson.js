const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      unique: true,
    },

    shopId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    loginToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);

module.exports = DeliveryPerson;
