const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../models/Customer');
const customerAuth = require('../middleware/customerAuth');

const Order = require('../models/Order');
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
