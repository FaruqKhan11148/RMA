const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

const ownerSchema = new mongoose.Schema(
  {
    shopId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    address: {
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

    password: {
      type: String,
      required: true,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    delivery: {
      type: Boolean,
      default: true,
    },

    pickup: {
      type: Boolean,
      default: true,
    },

    categories: {
      type: [String],
      default: [],
    },

    products: {
      type: [productSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
