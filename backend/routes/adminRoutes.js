const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

/*
  ADMIN LOGIN
*/
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    const admin = await Admin.findOne({
      username: username.trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid admin credentials',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Admin account is inactive',
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid admin credentials',
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: '8h',
      },
    );

    admin.lastLoginAt = new Date();
    await admin.save();

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});

/*
  CHECK CURRENT ADMIN SESSION
*/
router.get('/me', adminAuth, async (req, res) => {
  return res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      isActive: req.admin.isActive,
      lastLoginAt: req.admin.lastLoginAt,
    },
  });
});

/*
  ADMIN DASHBOARD
  Real platform statistics
*/
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalOwners,
      totalCustomers,
      totalOrders,

      pendingOrders,
      acceptedOrders,
      preparingOrders,
      readyOrders,
      outForDeliveryOrders,
      completedOrders,
      rejectedOrders,

      completedPaidOrders,
    ] = await Promise.all([
      Owner.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),

      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Accepted' }),
      Order.countDocuments({ status: 'Preparing' }),
      Order.countDocuments({ status: 'Ready' }),
      Order.countDocuments({ status: 'OutForDelivery' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Rejected' }),

      Order.find({
        status: 'Completed',
        paymentStatus: 'Paid',
      }).select('totalPrice'),
    ]);

    /*
      RMA platform fee = 1% of order amount

      We calculate this from completed + paid orders
      because these are actual successful transactions.
    */
    const totalRmaFees = completedPaidOrders.reduce((total, order) => {
      const orderAmount = Number(order.totalPrice || 0);

      const rmaFee = orderAmount * 0.01;

      return total + rmaFee;
    }, 0);

    return res.status(200).json({
      stats: {
        totalOwners,
        totalCustomers,
        totalOrders,

        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus: {
        Pending: pendingOrders,
        Accepted: acceptedOrders,
        Preparing: preparingOrders,
        Ready: readyOrders,
        OutForDelivery: outForDeliveryOrders,
        Completed: completedOrders,
        Rejected: rejectedOrders,
      },
    });
  } catch (error) {
    console.error('Admin dashboard fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch admin dashboard',
    });
  }
});

/*
  ADMIN LOGOUT
*/
router.post('/logout', adminAuth, async (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  return res.json({
    message: 'Admin logged out successfully',
  });
});

/*
  TEMPORARY PROTECTED TEST ROUTE

  We will remove/replace this later.
*/
router.get('/protected-test', adminAuth, async (req, res) => {
  return res.json({
    message: 'Admin authorization is working',
    admin: {
      id: req.admin._id,
      username: req.admin.username,
    },
  });
});

module.exports = router;
