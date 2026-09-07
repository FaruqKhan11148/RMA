const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../models/Customer');
const customerAuth = require('../middleware/customerAuth');

const Order = require('../models/Order');
const SupportIssue = require('../models/SupportIssue');

const router = express.Router();

// ===============================
// CUSTOMER REGISTER
// ===============================
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: 'Name, phone, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await Customer.findOne({
      $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: 'An account with this phone or email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Customer account created successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Customer registration error:', error);

    return res.status(500).json({
      message: 'Unable to create customer account',
    });
  }
});

// ==========================================
// GET LOGGED-IN CUSTOMER ORDERS
// ==========================================

router.get('/orders', customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.customer._id,
    })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get customer orders failed:', error.message);

    return res.status(500).json({
      message: 'Failed to fetch customer orders',
    });
  }
});

// ===============================
// CUSTOMER LOGIN
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, customer.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      {
        customerId: customer._id,
      },
      process.env.CUSTOMER_JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );

    customer.lastLoginAt = new Date();
    await customer.save();

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);

    return res.status(500).json({
      message: 'Unable to login',
    });
  }
});

// ===============================
// CUSTOMER ME
// ===============================
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.customer_token;

    if (!token) {
      return res.status(401).json({
        message: 'Customer authentication required',
      });
    }

    const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);

    const customer = await Customer.findById(decoded.customerId).select(
      '-passwordHash',
    );

    if (!customer) {
      return res.status(401).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    return res.status(200).json({
      customer,
    });
  } catch (error) {
    console.error('Customer authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired customer session',
    });
  }
});

// ===============================
// UPDATE CUSTOMER PROFILE
// ===============================
router.put('/me', customerAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required',
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: 'Name must be at least 2 characters',
      });
    }

    if (trimmedName.length > 80) {
      return res.status(400).json({
        message: 'Name cannot exceed 80 characters',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    customer.name = trimmedName;

    await customer.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Update customer profile failed:', error);

    return res.status(500).json({
      message: 'Unable to update customer profile',
    });
  }
});

// ==========================================
// GET CUSTOMER SAVED ADDRESSES
// ==========================================
router.get('/addresses', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select(
      'addresses',
    );

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    return res.status(200).json({
      addresses: customer.addresses || [],
    });
  } catch (error) {
    console.error('Get customer addresses failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch saved addresses',
    });
  }
});

// ==========================================
// ADD CUSTOMER SAVED ADDRESS
// ==========================================
router.post('/addresses', customerAuth, async (req, res) => {
  try {
    const { label, address, latitude, longitude } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const normalizedLabel = ['Home', 'Work', 'Other'].includes(label)
      ? label
      : 'Home';

    const hasAddresses = customer.addresses.length > 0;

    const newAddress = {
      label: normalizedLabel,
      address: address.trim(),
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      isDefault: !hasAddresses,
    };

    customer.addresses.push(newAddress);

    await customer.save();

    const savedAddress = customer.addresses[customer.addresses.length - 1];

    return res.status(201).json({
      message: 'Address saved successfully',
      address: savedAddress,
    });
  } catch (error) {
    console.error('Add customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to save address',
    });
  }
});

// ==========================================
// UPDATE CUSTOMER SAVED ADDRESS
// ==========================================
router.put('/addresses/:addressId', customerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, address, latitude, longitude } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const savedAddress = customer.addresses.id(addressId);

    if (!savedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    if (label && ['Home', 'Work', 'Other'].includes(label)) {
      savedAddress.label = label;
    }

    savedAddress.address = address.trim();

    savedAddress.latitude = typeof latitude === 'number' ? latitude : null;

    savedAddress.longitude = typeof longitude === 'number' ? longitude : null;

    await customer.save();

    return res.status(200).json({
      message: 'Address updated successfully',
      address: savedAddress,
    });
  } catch (error) {
    console.error('Update customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to update address',
    });
  }
});

// ==========================================
// DELETE CUSTOMER SAVED ADDRESS
// ==========================================
router.delete('/addresses/:addressId', customerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const savedAddress = customer.addresses.id(addressId);

    if (!savedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    const wasDefault = savedAddress.isDefault;

    savedAddress.deleteOne();

    // If the deleted address was the default,
    // make the first remaining address default.
    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();

    return res.status(200).json({
      message: 'Address deleted successfully',
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error('Delete customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to delete address',
    });
  }
});

// ==========================================
// SET DEFAULT CUSTOMER ADDRESS
// ==========================================
router.put('/addresses/:addressId/default', customerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const selectedAddress = customer.addresses.id(addressId);

    if (!selectedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    customer.addresses.forEach((savedAddress) => {
      savedAddress.isDefault = savedAddress._id.toString() === addressId;
    });

    await customer.save();

    return res.status(200).json({
      message: 'Default address updated successfully',
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error('Set default customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to set default address',
    });
  }
});

// ==========================================
// CREATE CUSTOMER SUPPORT ISSUE
// ==========================================
router.post('/support-issues', customerAuth, async (req, res) => {
  try {
    const { issueType, orderId, description } = req.body;

    if (!issueType) {
      return res.status(400).json({
        message: 'Issue type is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: 'Description is required',
      });
    }

    const validIssueTypes = [
      'order_not_received',
      'wrong_items',
      'missing_items',
      'damaged_items',
      'payment_problem',
      'delivery_problem',
      'shop_problem',
      'other',
    ];

    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({
        message: 'Invalid issue type',
      });
    }

    const trimmedDescription = description.trim();

    if (trimmedDescription.length > 1000) {
      return res.status(400).json({
        message: 'Description cannot exceed 1000 characters',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const supportIssue = await SupportIssue.create({
      customer: customer._id,
      issueType,
      orderId: orderId ? orderId.trim() : '',
      description: trimmedDescription,
    });

    return res.status(201).json({
      message: 'Issue reported successfully',
      issue: supportIssue,
    });
  } catch (error) {
    console.error('Create customer support issue failed:', error);

    return res.status(500).json({
      message: 'Unable to submit issue report',
    });
  }
});

// ===============================
// CUSTOMER LOGOUT
// ===============================
router.post('/logout', (req, res) => {
  res.clearCookie('customer_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({
    message: 'Logout successful',
  });
});

module.exports = router;
