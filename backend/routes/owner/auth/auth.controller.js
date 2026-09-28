const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Owner = require('../../../models/Owner');
const Counter = require('../../../models/Counter');
const getShopStatus = require('../../../utils/shopStatus');

// REGISTER OWNER
async function registerOwner(req, res) {
  try {
    const {
      ownerName,
      shopName,
      description,
      address,
      phone,
      email,
      password,
      delivery,
      pickup,
      products,
      location,

      // BANK DETAILS
      bankHolderName,
      bankAccountNumber,
      ifscCode,
    } = req.body;

    // Check required fields
    if (!ownerName || !shopName || !email || !address || !phone || !password) {
      return res.status(400).json({
        message: 'Required fields are missing',
      });
    }

    // Check bank details
    if (!bankHolderName || !bankAccountNumber || !ifscCode) {
      return res.status(400).json({
        message: 'Bank details are required',
      });
    }

    const normalizedBankHolderName = bankHolderName.trim();
    const normalizedBankAccountNumber = bankAccountNumber.trim();
    const normalizedIfscCode = ifscCode.trim().toUpperCase();

    if (!normalizedBankHolderName) {
      return res.status(400).json({
        message: 'Bank account holder name is required',
      });
    }

    if (!/^\d{9,18}$/.test(normalizedBankAccountNumber)) {
      return res.status(400).json({
        message: 'Invalid bank account number',
      });
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizedIfscCode)) {
      return res.status(400).json({
        message: 'Invalid IFSC code',
      });
    }

    // Check whether phone number already exists
    const existingOwner = await Owner.findOne({ phone });

    if (existingOwner) {
      return res.status(409).json({
        message: 'Owner with this phone number already exists',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await Owner.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'Owner with this email already exists',
      });
    }

    // Check products
    if (!products || products.length === 0) {
      return res.status(400).json({
        message: 'Please add at least one product',
      });
    }

    // Check order options
    if (!delivery && !pickup) {
      return res.status(400).json({
        message: 'Please select at least one order type',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate next Shop ID
    const counter = await Counter.findOneAndUpdate(
      { name: 'shopId' },
      { $inc: { sequenceValue: 1 } },
      {
        returnDocument: 'after',
        upsert: true,
      },
    );

    const shopId = `RMA-${String(counter.sequenceValue).padStart(6, '0')}`;

    // Check shop location
    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return res.status(400).json({
        message: 'Shop location is required',
      });
    }

    // Create owner
    const owner = await Owner.create({
      shopId,
      ownerName,
      shopName,
      description: description || '',
      address,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
      delivery,
      pickup,
      products,

      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },

      // PAYMENT / SETTLEMENT
      payment: {
        provider: 'PAYU',

        bankHolderName: normalizedBankHolderName,
        bankAccountNumber: normalizedBankAccountNumber,
        ifscCode: normalizedIfscCode,

        // Temporary RMA approval
        rmaApprovalStatus: 'PENDING',

        // Real PayU onboarding will be connected later
        onboardingStatus: 'NOT_STARTED',
        kycStatus: 'NOT_STARTED',
        bankStatus: 'PENDING',

        payuChildMerchantId: null,
        payuChildMerchantUuid: null,
      },
    });

    // Send safe owner data to frontend
    res.status(201).json({
      message: 'Owner registered successfully',

      owner: {
        id: owner._id,
        shopId: owner.shopId,
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        isOpen: getShopStatus(owner),
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
        location: owner.location,

        payment: {
          provider: owner.payment.provider,
          rmaApprovalStatus: owner.payment.rmaApprovalStatus,
          onboardingStatus: owner.payment.onboardingStatus,
          kycStatus: owner.payment.kycStatus,
          bankStatus: owner.payment.bankStatus,
        },
      },
    });
  } catch (error) {
    console.error('Owner registration failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// OWNER LOGIN
async function loginOwner(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: 'Phone and password are required',
      });
    }

    const owner = await Owner.findOne({ phone });

    if (!owner) {
      return res.status(401).json({
        message: 'Invalid phone number or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, owner.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid phone number or password',
      });
    }

    const token = jwt.sign(
      {
        ownerId: owner._id.toString(),
        shopId: owner.shopId,
        authVersion: owner.authVersion,
      },
      process.env.OWNER_JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );

    res.status(200).json({
      message: 'Login successful',

      token,

      owner: {
        id: owner._id,
        shopId: owner.shopId,
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        email: owner.email,
        isOpen: getShopStatus(owner),
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
        location: owner.location,
      },
    });
  } catch (error) {
    console.error('Owner login failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// OWNER LOGOUT
async function logoutOwner(req, res) {
  try {
    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    owner.authVersion += 1;

    await owner.save();

    return res.status(200).json({
      message: 'Owner logout successful',
    });
  } catch (error) {
    console.error('Owner logout failed:', error);

    return res.status(500).json({
      message: 'Unable to logout owner',
    });
  }
}

// SAVE OWNER FCM TOKEN
async function saveOwnerNotificationToken(req, res) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        message: 'FCM token is required',
      });
    }

    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    const trimmedToken = token.trim();

    await Owner.findByIdAndUpdate(owner._id, {
      $addToSet: {
        fcmTokens: trimmedToken,
      },
    });

    return res.status(200).json({
      message: 'Notification token saved successfully',
    });
  } catch (error) {
    console.error('Save owner FCM token failed:', error);

    return res.status(500).json({
      message: 'Unable to save notification token',
    });
  }
}

// PROTECTED TEST
async function protectedOwnerTest(req, res) {
  res.status(200).json({
    message: 'Owner authentication successful',
    owner: {
      id: req.owner._id,
      shopId: req.owner.shopId,
      ownerName: req.owner.ownerName,
      shopName: req.owner.shopName,
      email: req.owner.email,
    },
  });
}

// GET OWNER PROFILE
async function getOwnerProfile(req, res) {
  try {
    const currentIsOpen = getShopStatus(req.owner);

    res.status(200).json({
      owner: {
        id: req.owner._id,
        shopId: req.owner.shopId,
        ownerName: req.owner.ownerName,
        phone: req.owner.phone,
        email: req.owner.email,
        shopName: req.owner.shopName,
        description: req.owner.description,
        address: req.owner.address,
        location: req.owner.location,
        isOpen: currentIsOpen,
        delivery: req.owner.delivery,
        pickup: req.owner.pickup,
        categories: req.owner.categories,
        products: req.owner.products,
        payment: req.owner.payment,
      },
    });
  } catch (error) {
    console.error('Get owner profile failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  registerOwner,
  loginOwner,
  logoutOwner,
  saveOwnerNotificationToken,
  protectedOwnerTest,
  getOwnerProfile,
};
