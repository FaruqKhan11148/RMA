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

    fcmTokens: [
      {
        type: String,
        trim: true,
      },
    ],

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
      // PAYMENT PROVIDER

      provider: {
        type: String,
        default: 'PAYU',
      },

      accountId: {
        type: String,
        default: null,
      },

      // ========================================
      // BANK DETAILS
      // ========================================

      bankHolderName: {
        type: String,
        default: null,
        trim: true,
      },

      bankAccountNumber: {
        type: String,
        default: null,
        trim: true,
      },

      ifscCode: {
        type: String,
        default: null,
        trim: true,
        uppercase: true,
      },

      // ========================================
      // RMA ADMIN APPROVAL
      // ========================================

      rmaApprovalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
      },

      rmaApprovedAt: {
        type: Date,
        default: null,
      },

      rmaRejectedAt: {
        type: Date,
        default: null,
      },

      // ========================================
      // PAYU ONBOARDING
      // ========================================

      onboardingStatus: {
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

      // ========================================
      // FUTURE PAYU CHILD MERCHANT
      // ========================================

      payuChildMerchantId: {
        type: String,
        default: null,
      },

      payuChildMerchantUuid: {
        type: String,
        default: null,
      },

      // ========================================
      // EXISTING PAYU FIELDS
      // ========================================

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

    statusOverride: {
      type: String,
      enum: ['none', 'open', 'closed'],
      default: 'none',
    },

    statusOverrideAt: {
      type: Date,
      default: null,
    },

    delivery: {
      type: Boolean,
      default: true,
    },

    pickup: {
      type: Boolean,
      default: true,
    },

    deliverySettings: {
      deliveryRadius: {
        type: Number,
        default: 5,
        min: 0,
      },

      minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      deliveryCharge: {
        type: Number,
        default: 20,
        min: 0,
      },

      freeDeliveryAbove: {
        type: Number,
        default: 0,
        min: 0,
      },

      estimatedDeliveryTime: {
        type: Number,
        default: 45,
        min: 1,
      },

      openingTime: {
        type: String,
        default: '10:00',
      },

      closingTime: {
        type: String,
        default: '22:00',
      },

      shopStatusMode: {
        type: String,
        enum: ['auto', 'open', 'closed'],
        default: 'auto',
      },
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
  },
  {
    timestamps: true,
  },
);

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
