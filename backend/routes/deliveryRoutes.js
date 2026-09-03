const express = require('express');
const crypto = require('crypto');

const DeliveryPerson = require('../models/DeliveryPerson');
const Owner = require('../models/Owner');
const Order = require('../models/Order');
const deliveryAuth = require('../middleware/deliveryAuth');

const router = express.Router();

// REGISTER DELIVERY PERSON
router.post('/register', async (req, res) => {
  try {
    const { shopId, name, phone } = req.body;

    // VALIDATION

    if (!shopId || !name || !phone) {
      return res.status(400).json({
        message: 'Shop ID, name and phone are required',
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

    res.status(201).json({
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

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// REQUEST DELIVERY LOGIN OTP
router.post('/request-otp', async (req, res) => {
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

    res.status(200).json({
      message: 'OTP sent successfully',

      // ONLY FOR LOCAL TESTING
      // Remove this in production.
      otp,
    });
  } catch (error) {
    console.error('Request delivery OTP error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// VERIFY DELIVERY PERSON LOGIN OTP
router.post('/verify-otp', async (req, res) => {
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

    // OTP verified successfully

    // Generate secure login token
    const loginToken = crypto.randomBytes(32).toString('hex');

    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;
    deliveryPerson.loginToken = loginToken;

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
});

// GET DELIVERY ORDERS FOR LOGGED-IN DELIVERY PERSON
router.get('/orders', deliveryAuth, async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const orders = await Order.find({
      ownerId: deliveryPerson.ownerId,
      status: 'OutForDelivery',
      orderType: 'delivery',
    })
      .populate('ownerId', 'ownerName shopName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get delivery orders failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;
