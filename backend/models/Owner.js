const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    catalogueProductId: {
      type: String,
      default: null,
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

    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },

    isCustom: {
      type: Boolean,
      default: false,
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
    // SHOP ID

    shopId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // OWNER DETAILS

    ownerName: {
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

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // SHOP DETAILS

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

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    payment: {
      provider: {
        type: String,
        default: 'RAZORPAY',
      },

      accountId: {
        type: String,
        default: null,
      },

      onboardingStatus: {
        type: String,
        enum: ['NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED'],
        default: 'NOT_STARTED',
      },

      kycStatus: {
        type: String,
        enum: ['NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED'],
        default: 'NOT_STARTED',
      },

      bankStatus: {
        type: String,
        enum: ['NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED'],
        default: 'NOT_STARTED',
      },

      onboardingUrl: {
        type: String,
        default: null,
      },

      onboardedAt: {
        type: Date,
        default: null,
      },
    },

    // SHOP SETTINGS

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

    // PRODUCTS

    products: {
      type: [productSchema],
      default: [],
    },

    // RAZORPAY PAYMENT / ONBOARDING

    razorpay: {
      accountId: {
        type: String,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'NOT_STARTED',
          'CREATED',
          'KYC_PENDING',
          'UNDER_REVIEW',
          'ACTIVATED',
          'SUSPENDED',
          'REJECTED',
        ],
        default: 'NOT_STARTED',
      },

      kycStatus: {
        type: String,
        enum: [
          'NOT_STARTED',
          'PENDING',
          'UNDER_REVIEW',
          'VERIFIED',
          'REJECTED',
        ],
        default: 'NOT_STARTED',
      },

      settlementEnabled: {
        type: Boolean,
        default: false,
      },

      onboardedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
