const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
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
