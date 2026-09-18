const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const ownerAuth = require('../middleware/ownerAuth');
const getShopStatus = require('../utils/shopStatus');

const Notification = require('../models/Notification');

const {
  createAndSendNotification,
} = require('../services/notificationService');

const router = express.Router();

// GET ALL OWNERS
router.get('/', async (req, res) => {
  try {
    const owners = await Owner.find().select('-password');

    res.status(200).json({
      owners,
    });
  } catch (error) {
    console.error('Get owners failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const customerLatitude = Number(latitude);
    const customerLongitude = Number(longitude);

    if (
      !Number.isFinite(customerLatitude) ||
      !Number.isFinite(customerLongitude)
    ) {
      return res.status(400).json({
        message: 'Valid latitude and longitude are required',
      });
    }

    if (
      customerLatitude < -90 ||
      customerLatitude > 90 ||
      customerLongitude < -180 ||
      customerLongitude > 180
    ) {
      return res.status(400).json({
        message: 'Invalid location coordinates',
      });
    }

    const shops = await Owner.find({
      'location.latitude': { $ne: null },
      'location.longitude': { $ne: null },
    }).select(
      'shopId shopName description address location isOpen delivery pickup deliverySettings products statusOverride statusOverrideAt',
    );

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const calculateDistance = (customerLat, customerLng, shopLat, shopLng) => {
      const earthRadiusKm = 6371;

      const latitudeDifference = toRadians(shopLat - customerLat);
      const longitudeDifference = toRadians(shopLng - customerLng);

      const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(customerLat)) *
          Math.cos(toRadians(shopLat)) *
          Math.sin(longitudeDifference / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadiusKm * c;
    };

    const nearbyShops = shops
      .map((shop) => {
        const distance = calculateDistance(
          customerLatitude,
          customerLongitude,
          shop.location.latitude,
          shop.location.longitude,
        );

        const currentIsOpen = getShopStatus(shop);

        return {
          shopId: shop.shopId,
          shopName: shop.shopName,
          description: shop.description,
          address: shop.address,
          location: shop.location,
          isOpen: currentIsOpen,
          delivery: shop.delivery,
          pickup: shop.pickup,
          deliverySettings: shop.deliverySettings,
          distance: Number(distance.toFixed(2)),
          products: shop.products,
        };
      })
      .filter((shop) => shop.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      shops: nearbyShops,
    });
  } catch (error) {
    console.error('Nearby shops fetch failed:', error);

    return res.status(500).json({
      message: 'Failed to fetch nearby shops',
    });
  }
});

// GET SHOP BY SHOP ID
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select('-password');

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    const currentIsOpen = getShopStatus(owner);

    return res.status(200).json({
      shop: {
        ...owner.toObject(),
        isOpen: currentIsOpen,
      },
    });
  } catch (error) {
    console.error('Get shop failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// REGISTER OWNER
router.post('/register', async (req, res) => {
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
});

router.post('/login', async (req, res) => {
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
});

// ==========================================
// SAVE OWNER FCM TOKEN
// ==========================================
router.post('/notification-token', ownerAuth, async (req, res) => {
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
});

router.get('/protected-test', ownerAuth, async (req, res) => {
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
});

router.get('/me', ownerAuth, async (req, res) => {
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
});

// ==========================================
// GET OWNER NOTIFICATIONS
// ==========================================

router.get('/notifications', ownerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'owner',
      recipientId: req.owner._id,
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientType: 'owner',
      recipientId: req.owner._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get owner notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch notifications',
    });
  }
});

// ==========================================
// MARK ALL OWNER NOTIFICATIONS AS READ
// ==========================================

router.patch('/notifications/read-all', ownerAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientType: 'owner',
        recipientId: req.owner._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all owner notifications as read failed:', error);

    return res.status(500).json({
      message: 'Unable to update notifications',
    });
  }
});

// ==========================================
// MARK ONE OWNER NOTIFICATION AS READ
// ==========================================

router.patch(
  '/notifications/:notificationId/read',
  ownerAuth,
  async (req, res) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientType: 'owner',
          recipientId: req.owner._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      console.error('Mark owner notification as read failed:', error);

      return res.status(500).json({
        message: 'Unable to update notification',
      });
    }
  },
);

router.patch('/settings/phone', ownerAuth, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: 'Phone number is required',
      });
    }

    const normalizedPhone = phone.trim();

    if (normalizedPhone === req.owner.phone) {
      return res.status(400).json({
        message: 'This is already your current phone number',
      });
    }

    const existingOwner = await Owner.findOne({
      phone: normalizedPhone,
      _id: { $ne: req.owner._id },
    });

    if (existingOwner) {
      return res.status(409).json({
        message: 'This phone number is already registered with another owner',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        phone: normalizedPhone,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    res.status(200).json({
      message: 'Phone number updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update phone number failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

router.patch('/settings/email', ownerAuth, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address',
      });
    }

    if (email === req.owner.email) {
      return res.status(400).json({
        message: 'This is already your current email address',
      });
    }

    const existingOwner = await Owner.findOne({
      email,
      _id: { $ne: req.owner._id },
    });

    if (existingOwner) {
      return res.status(409).json({
        message: 'This email address is already registered',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        email,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    return res.status(200).json({
      message: 'Email updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update owner email failed:', error);

    return res.status(500).json({
      message: 'Failed to update email',
    });
  }
});

router.patch('/settings/password', ownerAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long',
      });
    }

    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      owner.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    const samePassword = await bcrypt.compare(newPassword, owner.password);

    if (samePassword) {
      return res.status(400).json({
        message: 'New password must be different from your current password',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    owner.password = hashedPassword;

    await owner.save();

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update owner password failed:', error);

    return res.status(500).json({
      message: 'Failed to update password',
    });
  }
});

router.patch('/settings/shop-name', ownerAuth, async (req, res) => {
  try {
    const shopName = req.body.shopName?.trim();

    if (!shopName) {
      return res.status(400).json({
        message: 'Shop name is required',
      });
    }

    if (shopName.length < 2) {
      return res.status(400).json({
        message: 'Shop name must be at least 2 characters long',
      });
    }

    if (shopName === req.owner.shopName) {
      return res.status(400).json({
        message: 'This is already your current shop name',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        shopName,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop name updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update shop name failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop name',
    });
  }
});

router.patch('/settings/description', ownerAuth, async (req, res) => {
  try {
    const description = req.body.description?.trim() || '';

    if (description.length > 500) {
      return res.status(400).json({
        message: 'Description cannot exceed 500 characters',
      });
    }

    if (description === req.owner.description) {
      return res.status(400).json({
        message: 'This is already your current shop description',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop description updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
      },
    });
  } catch (error) {
    console.error('Update shop description failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop description',
    });
  }
});

router.patch('/settings/address', ownerAuth, async (req, res) => {
  try {
    const address = req.body.address?.trim();

    if (!address) {
      return res.status(400).json({
        message: 'Shop address is required',
      });
    }

    if (address.length < 5) {
      return res.status(400).json({
        message: 'Shop address must be at least 5 characters long',
      });
    }

    if (address.length > 500) {
      return res.status(400).json({
        message: 'Shop address cannot exceed 500 characters',
      });
    }

    if (address === req.owner.address) {
      return res.status(400).json({
        message: 'This is already your current shop address',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        address,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop address updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
        address: updatedOwner.address,
      },
    });
  } catch (error) {
    console.error('Update shop address failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop address',
    });
  }
});

router.patch('/settings/location', ownerAuth, async (req, res) => {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        message: 'Valid latitude and longitude are required',
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        message: 'Latitude must be between -90 and 90',
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: 'Longitude must be between -180 and 180',
      });
    }

    if (
      req.owner.location?.latitude === latitude &&
      req.owner.location?.longitude === longitude
    ) {
      return res.status(400).json({
        message: 'These are already your current shop coordinates',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        location: {
          latitude,
          longitude,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop location updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
        address: updatedOwner.address,
        location: updatedOwner.location,
      },
    });
  } catch (error) {
    console.error('Update shop location failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop location',
    });
  }
});

router.patch('/settings/open-closed', ownerAuth, async (req, res) => {
  try {
    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({
        message: 'isOpen must be a boolean',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $set: {
          isOpen,
          statusOverride: isOpen ? 'open' : 'closed',
          statusOverrideAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    return res.status(200).json({
      message: `Shop is now ${updatedOwner.isOpen ? 'open' : 'closed'}`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        isOpen: updatedOwner.isOpen,
        statusOverride: updatedOwner.statusOverride,
        statusOverrideAt: updatedOwner.statusOverrideAt,
        deliverySettings: updatedOwner.deliverySettings,
      },
    });
  } catch (error) {
    console.error('Error updating shop status:', error);

    return res.status(500).json({
      message: 'Failed to update shop status',
    });
  }
});

router.patch('/settings/delivery-available', ownerAuth, async (req, res) => {
  try {
    const { delivery } = req.body;

    if (typeof delivery !== 'boolean') {
      return res.status(400).json({
        message: 'Delivery status must be true or false',
      });
    }

    if (req.owner.delivery === delivery) {
      return res.status(400).json({
        message: `Delivery is already ${
          delivery ? 'available' : 'unavailable'
        }`,
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      { delivery },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: `Delivery is now ${
        updatedOwner.delivery ? 'available' : 'unavailable'
      }`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        delivery: updatedOwner.delivery,
      },
    });
  } catch (error) {
    console.error('Update delivery availability failed:', error);

    return res.status(500).json({
      message: 'Failed to update delivery availability',
    });
  }
});

router.patch('/settings/pickup-available', ownerAuth, async (req, res) => {
  try {
    const { pickup } = req.body;

    if (typeof pickup !== 'boolean') {
      return res.status(400).json({
        message: 'Pickup status must be true or false',
      });
    }

    if (req.owner.pickup === pickup) {
      return res.status(400).json({
        message: `Pickup is already ${pickup ? 'available' : 'unavailable'}`,
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      { pickup },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: `Pickup is now ${
        updatedOwner.pickup ? 'available' : 'unavailable'
      }`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        pickup: updatedOwner.pickup,
      },
    });
  } catch (error) {
    console.error('Update pickup availability failed:', error);

    return res.status(500).json({
      message: 'Failed to update pickup availability',
    });
  }
});

router.patch('/settings/delivery-settings', ownerAuth, async (req, res) => {
  try {
    const {
      deliveryRadius,
      minimumOrderAmount,
      deliveryCharge,
      freeDeliveryAbove,
      estimatedDeliveryTime,
      openingTime,
      closingTime,
      shopStatusMode,
    } = req.body;

    const radius = Number(deliveryRadius);
    const minimumOrder = Number(minimumOrderAmount);
    const charge = Number(deliveryCharge);
    const freeAbove = Number(freeDeliveryAbove);
    const estimatedTime = Number(estimatedDeliveryTime);

    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (!timeRegex.test(openingTime)) {
      return res.status(400).json({
        message: 'Opening time must be in HH:mm format',
      });
    }

    if (!timeRegex.test(closingTime)) {
      return res.status(400).json({
        message: 'Closing time must be in HH:mm format',
      });
    }

    if (!['auto', 'open', 'closed'].includes(shopStatusMode)) {
      return res.status(400).json({
        message: 'Invalid shop status mode',
      });
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      return res.status(400).json({
        message: 'Delivery radius must be greater than 0',
      });
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      return res.status(400).json({
        message: 'Minimum order amount cannot be negative',
      });
    }

    if (!Number.isFinite(charge) || charge < 0) {
      return res.status(400).json({
        message: 'Delivery charge cannot be negative',
      });
    }

    if (!Number.isFinite(freeAbove) || freeAbove < 0) {
      return res.status(400).json({
        message: 'Free delivery amount cannot be negative',
      });
    }

    if (!Number.isFinite(estimatedTime) || estimatedTime <= 0) {
      return res.status(400).json({
        message: 'Estimated delivery time must be greater than 0',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $set: {
          'deliverySettings.deliveryRadius': radius,
          'deliverySettings.minimumOrderAmount': minimumOrder,
          'deliverySettings.deliveryCharge': charge,
          'deliverySettings.freeDeliveryAbove': freeAbove,
          'deliverySettings.estimatedDeliveryTime': estimatedTime,
          'deliverySettings.openingTime': openingTime,
          'deliverySettings.closingTime': closingTime,
          'deliverySettings.shopStatusMode': shopStatusMode,

          statusOverride: 'none',
          statusOverrideAt: null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Delivery settings updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        delivery: updatedOwner.delivery,
        deliverySettings: updatedOwner.deliverySettings,
      },
    });
  } catch (error) {
    console.error('Update delivery settings failed:', error);

    return res.status(500).json({
      message: 'Failed to update delivery settings',
    });
  }
});

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================

// GET ALL PRODUCTS
router.get('/products', ownerAuth, async (req, res) => {
  try {
    const owner = await Owner.findById(req.owner._id).select(
      'shopId shopName products',
    );

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      shopId: owner.shopId,
      shopName: owner.shopName,
      products: owner.products,
    });
  } catch (error) {
    console.error('Get owner products failed:', error);

    return res.status(500).json({
      message: 'Failed to load products',
    });
  }
});

// ADD PRODUCT
router.post('/products', ownerAuth, async (req, res) => {
  try {
    const {
      catalogueProductId,
      name,
      category,
      price,
      unit,
      imageUrl,
      isCustom,
    } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedCategory = String(category || '').trim();
    const trimmedUnit = String(unit || '').trim();
    const productPrice = Number(price);

    if (!trimmedName) {
      return res.status(400).json({
        message: 'Product name is required',
      });
    }

    if (!trimmedCategory) {
      return res.status(400).json({
        message: 'Product category is required',
      });
    }

    if (!trimmedUnit) {
      return res.status(400).json({
        message: 'Product unit is required',
      });
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const customProduct = Boolean(isCustom);

    // Catalogue product duplicate check
    if (!customProduct && catalogueProductId) {
      const alreadyExists = req.owner.products.some(
        (product) => product.catalogueProductId === catalogueProductId,
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: 'This catalogue product is already added',
        });
      }
    }

    const newProduct = {
      productId: customProduct ? `CUSTOM_${Date.now()}` : `P${Date.now()}`,

      catalogueProductId: customProduct ? null : catalogueProductId || null,

      name: trimmedName,
      category: trimmedCategory,
      price: productPrice,
      unit: trimmedUnit,
      imageUrl: String(imageUrl || '').trim(),

      isCustom: customProduct,
      available: true,
    };

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $push: {
          products: newProduct,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(201).json({
      message: 'Product added successfully',
      product: newProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Add product failed:', error);

    return res.status(500).json({
      message: 'Failed to add product',
    });
  }
});

// CHANGE PRODUCT PRICE
router.patch('/products/:productId/price', ownerAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const productPrice = Number(req.body.price);

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const productExists = req.owner.products.some(
      (product) => product.productId === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedOwner = await Owner.findOneAndUpdate(
      {
        _id: req.owner._id,
        'products.productId': productId,
      },
      {
        $set: {
          'products.$.price': productPrice,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedProduct = updatedOwner.products.find(
      (product) => product.productId === productId,
    );

    return res.status(200).json({
      message: 'Product price updated successfully',
      product: updatedProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Change product price failed:', error);

    return res.status(500).json({
      message: 'Failed to update product price',
    });
  }
});

// EDIT CUSTOM PRODUCT
router.patch('/products/:productId', ownerAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = req.owner.products.find(
      (item) => item.productId === productId,
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Catalogue products are controlled by RMA
    if (!product.isCustom) {
      return res.status(400).json({
        message:
          'Catalogue products cannot be edited. Only price and availability can be changed.',
      });
    }

    const { name, category, price, unit, imageUrl } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedCategory = String(category || '').trim();
    const trimmedUnit = String(unit || '').trim();
    const productPrice = Number(price);

    if (!trimmedName) {
      return res.status(400).json({
        message: 'Product name is required',
      });
    }

    if (!trimmedCategory) {
      return res.status(400).json({
        message: 'Product category is required',
      });
    }

    if (!trimmedUnit) {
      return res.status(400).json({
        message: 'Product unit is required',
      });
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const updatedOwner = await Owner.findOneAndUpdate(
      {
        _id: req.owner._id,
        'products.productId': productId,
      },
      {
        $set: {
          'products.$.name': trimmedName,
          'products.$.category': trimmedCategory,
          'products.$.price': productPrice,
          'products.$.unit': trimmedUnit,
          'products.$.imageUrl': String(imageUrl || '').trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedProduct = updatedOwner.products.find(
      (item) => item.productId === productId,
    );

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Edit product failed:', error);

    return res.status(500).json({
      message: 'Failed to update product',
    });
  }
});

// CHANGE PRODUCT AVAILABILITY
router.patch(
  '/products/:productId/availability',
  ownerAuth,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { available } = req.body;

      if (typeof available !== 'boolean') {
        return res.status(400).json({
          message: 'Product availability must be true or false',
        });
      }

      const updatedOwner = await Owner.findOneAndUpdate(
        {
          _id: req.owner._id,
          'products.productId': productId,
        },
        {
          $set: {
            'products.$.available': available,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).select('-password');

      if (!updatedOwner) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }

      const updatedProduct = updatedOwner.products.find(
        (product) => product.productId === productId,
      );

      return res.status(200).json({
        message: available
          ? 'Product is now available'
          : 'Product is now unavailable',

        product: updatedProduct,
        products: updatedOwner.products,
      });
    } catch (error) {
      console.error('Change product availability failed:', error);

      return res.status(500).json({
        message: 'Failed to update product availability',
      });
    }
  },
);

// REMOVE PRODUCT
router.delete('/products/:productId', ownerAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const productExists = req.owner.products.some(
      (product) => product.productId === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $pull: {
          products: {
            productId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Product removed successfully',
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Remove product failed:', error);

    return res.status(500).json({
      message: 'Failed to remove product',
    });
  }
});

module.exports = router;
