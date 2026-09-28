const crypto = require('crypto');

const DeliveryPerson = require('../../../models/DeliveryPerson');
const Owner = require('../../../models/Owner');

// ==========================================
// REGISTER SHOP DELIVERY PERSON
// ==========================================
const registerDeliveryPerson = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const shopId = req.owner.shopId;

    // VALIDATION
    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    // FIND SHOP
    const owner = await Owner.findOne({ shopId });

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    // CHECK IF DELIVERY PERSON ALREADY EXISTS
    const existingDeliveryPerson = await DeliveryPerson.findOne({
      shopId,
    });

    if (existingDeliveryPerson) {
      return res.status(409).json({
        message: 'A delivery person is already registered for this shop',
      });
    }

    // CHECK PHONE
    const existingPhone = await DeliveryPerson.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered',
      });
    }

    // CREATE DELIVERY PERSON
    const deliveryPerson = await DeliveryPerson.create({
      ownerId: owner._id,
      shopId: owner.shopId,
      name,
      phone,
      isActive: true,
    });

    // SAFE RESPONSE
    return res.status(201).json({
      message: 'Delivery person registered successfully',

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Register delivery person error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REGISTER RMA DELIVERY PARTNER
// ==========================================
const registerRmaDeliveryPartner = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    const existingDeliveryPerson = await DeliveryPerson.findOne({
      phone: phone.trim(),
    });

    if (existingDeliveryPerson) {
      return res.status(409).json({
        message: 'A delivery partner with this phone number already exists',
      });
    }

    const deliveryPerson = await DeliveryPerson.create({
      deliveryType: 'RMA',
      ownerId: null,
      shopId: null,
      name: name.trim(),
      phone: phone.trim(),
      isActive: false,
      applicationStatus: 'PENDING',
    });

    return res.status(201).json({
      message: 'RMA delivery partner application submitted successfully',
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner registration error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REQUEST RMA DELIVERY PARTNER OTP
// ==========================================
const requestRmaDeliveryOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      phone: phone.trim(),
      deliveryType: 'RMA',
      isActive: true,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found or not approved',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    deliveryPerson.otp = otp;
    deliveryPerson.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await deliveryPerson.save();

    console.log(`RMA delivery OTP for ${deliveryPerson.phone}: ${otp}`);

    return res.status(200).json({
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('RMA delivery OTP request error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// VERIFY RMA DELIVERY PARTNER OTP
// ==========================================
const verifyRmaDeliveryOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: 'Phone number and OTP are required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      phone: phone.trim(),
      deliveryType: 'RMA',
      isActive: true,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found or not approved',
      });
    }

    if (
      !deliveryPerson.otp ||
      deliveryPerson.otp !== otp ||
      !deliveryPerson.otpExpiresAt ||
      deliveryPerson.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    const loginToken = crypto.randomBytes(32).toString('hex');

    deliveryPerson.loginToken = loginToken;

    deliveryPerson.loginTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Login successful',

      token: loginToken,

      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('RMA delivery OTP verification error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REQUEST DELIVERY LOGIN OTP
// ==========================================
const requestDeliveryOtp = async (req, res) => {
  try {
    const { shopId, phone } = req.body;

    // VALIDATION
    if (!shopId || !phone) {
      return res.status(400).json({
        message: 'Shop ID and phone are required',
      });
    }

    // FIND DELIVERY PERSON
    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    // CHECK ACTIVE
    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // GENERATE 6 DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP VALID FOR 5 MINUTES
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    deliveryPerson.otp = otp;
    deliveryPerson.otpExpiresAt = otpExpiresAt;

    await deliveryPerson.save();

    console.log(`Delivery login OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      message: 'OTP sent successfully',

      // ONLY FOR LOCAL TESTING
      // Remove this in production.
      otp,
    });
  } catch (error) {
    console.error('Request delivery OTP error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// LOGOUT DELIVERY PERSON
// ==========================================
const logoutDeliveryPerson = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    deliveryPerson.loginToken = null;
    deliveryPerson.loginTokenExpiresAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Delivery person logout successful',
    });
  } catch (error) {
    console.error('Delivery logout failed:', error);
    return res.status(500).json({
      message: 'Unable to logout delivery person',
    });
  }
};

// ==========================================
// VERIFY DELIVERY PERSON LOGIN OTP
// ==========================================
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { shopId, phone, otp } = req.body;

    if (!shopId || !phone || !otp) {
      return res.status(400).json({
        message: 'Shop ID, phone and OTP are required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // Check whether an OTP was requested
    if (!deliveryPerson.otp || !deliveryPerson.otpExpiresAt) {
      return res.status(400).json({
        message: 'No OTP requested',
      });
    }

    // Check OTP expiry
    if (new Date() > deliveryPerson.otpExpiresAt) {
      deliveryPerson.otp = null;
      deliveryPerson.otpExpiresAt = null;

      await deliveryPerson.save();

      return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP',
      });
    }

    // Check OTP
    if (deliveryPerson.otp !== String(otp)) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    // Generate secure login token
    const loginToken = crypto.randomBytes(32).toString('hex');

    // Login session valid for 7 days
    const loginTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;
    deliveryPerson.loginToken = loginToken;
    deliveryPerson.loginTokenExpiresAt = loginTokenExpiresAt;

    await deliveryPerson.save();

    res.status(200).json({
      message: 'Delivery person login successful',

      token: loginToken,

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Verify delivery login OTP error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  registerDeliveryPerson,
  registerRmaDeliveryPartner,
  requestRmaDeliveryOtp,
  verifyRmaDeliveryOtp,
  requestDeliveryOtp,
  logoutDeliveryPerson,
  verifyDeliveryOtp,
};
