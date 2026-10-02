const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema(
  {
    // ==========================================
    // DELIVERY TYPE / SHOP RELATIONSHIP
    // ==========================================
    deliveryType: {
      type: String,
      enum: ['SHOP', 'RMA'],
      default: 'SHOP',
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      default: null,
    },

    shopId: {
      type: String,
      default: null,
      trim: true,
    },

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    fcmTokens: {
      type: [String],
      default: [],
    },

    // ==========================================
    // DELIVERY PERSON ID
    // ==========================================
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      default: null,
    },

    // ==========================================
    // BASIC IDENTITY
    // ==========================================
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

    profile: {
      dateOfBirth: {
        type: Date,
        default: null,
      },

      profilePhotoUrl: {
        type: String,
        default: null,
        trim: true,
      },
    },

    // ==========================================
    // ADDRESS
    // ==========================================
    address: {
      addressLine: {
        type: String,
        default: '',
        trim: true,
      },

      city: {
        type: String,
        default: '',
        trim: true,
      },

      state: {
        type: String,
        default: '',
        trim: true,
      },

      pincode: {
        type: String,
        default: '',
        trim: true,
      },
    },

    // ==========================================
    // APPLICATION
    // ==========================================
    applicationStatus: {
      type: String,
      enum: [
        'INCOMPLETE',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CORRECTION_REQUIRED',
        'APPROVED',
        'REJECTED',
      ],
      default: 'INCOMPLETE',
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    correctionReason: {
      type: String,
      default: null,
      trim: true,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // KYC
    // ==========================================
    kyc: {
      documentType: {
        type: String,
        default: null,
        trim: true,
      },

      documentNumber: {
        type: String,
        default: null,
        trim: true,
      },

      frontImageUrl: {
        type: String,
        default: null,
      },

      backImageUrl: {
        type: String,
        default: null,
      },

      selfieImageUrl: {
        type: String,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'NOT_SUBMITTED',
          'PENDING',
          'UNDER_REVIEW',
          'VERIFIED',
          'REJECTED',
        ],
        default: 'NOT_SUBMITTED',
      },

      rejectionReason: {
        type: String,
        default: null,
        trim: true,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // DRIVING LICENCE
    // ==========================================
    drivingLicence: {
      number: {
        type: String,
        default: null,
        trim: true,
      },

      frontImageUrl: {
        type: String,
        default: null,
      },

      backImageUrl: {
        type: String,
        default: null,
      },

      expiryDate: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'NOT_SUBMITTED',
          'PENDING',
          'UNDER_REVIEW',
          'VERIFIED',
          'REJECTED',
        ],
        default: 'NOT_SUBMITTED',
      },

      rejectionReason: {
        type: String,
        default: null,
        trim: true,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // VEHICLE
    // ==========================================
    vehicle: {
      type: {
        type: String,
        enum: ['BIKE', 'SCOOTER', 'OTHER'],
        default: null,
      },

      registrationNumber: {
        type: String,
        default: null,
        trim: true,
      },

      rcImageUrl: {
        type: String,
        default: null,
      },

      insuranceImageUrl: {
        type: String,
        default: null,
      },

      insuranceExpiry: {
        type: Date,
        default: null,
      },

      pucImageUrl: {
        type: String,
        default: null,
      },

      pucExpiry: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'NOT_SUBMITTED',
          'PENDING',
          'UNDER_REVIEW',
          'VERIFIED',
          'REJECTED',
        ],
        default: 'NOT_SUBMITTED',
      },

      rejectionReason: {
        type: String,
        default: null,
        trim: true,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // BANK ACCOUNT
    // ==========================================
    bankAccount: {
      accountHolderName: {
        type: String,
        default: null,
        trim: true,
      },

      accountNumber: {
        type: String,
        default: null,
        trim: true,
      },

      ifsc: {
        type: String,
        default: null,
        trim: true,
        uppercase: true,
      },

      bankName: {
        type: String,
        default: null,
        trim: true,
      },

      proofImageUrl: {
        type: String,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'NOT_SUBMITTED',
          'PENDING',
          'UNDER_REVIEW',
          'VERIFIED',
          'REJECTED',
        ],
        default: 'NOT_SUBMITTED',
      },

      rejectionReason: {
        type: String,
        default: null,
        trim: true,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: false,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspensionReason: {
      type: String,
      default: null,
      trim: true,
    },

    // ==========================================
    // AVAILABILITY
    // ==========================================
    availabilityStatus: {
      type: String,
      enum: ['OFFLINE', 'AVAILABLE', 'BUSY'],
      default: 'OFFLINE',
    },

    lastOnlineAt: {
      type: Date,
      default: null,
    },

    lastOfflineAt: {
      type: Date,
      default: null,
    },

    lastAvailabilityChangedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // CURRENT LOCATION
    // ==========================================
    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // OTP AUTHENTICATION
    // ==========================================
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

    loginTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);

module.exports = DeliveryPerson;
