const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../../../models/Admin');

// ============================================================
// ADMIN LOGIN
// ============================================================

const loginAdmin = async (req, res) => {
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

    // res.cookie('admin_token', token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    //   maxAge: 8 * 60 * 60 * 1000,
    // });
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
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
};

// ============================================================
// CHECK CURRENT ADMIN SESSION
// ============================================================

const getCurrentAdmin = async (req, res) => {
  return res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      isActive: req.admin.isActive,
      lastLoginAt: req.admin.lastLoginAt,
    },
  });
};

const logoutAdmin = async (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return res.json({
    message: 'Admin logged out successfully',
  });
};

const protectedTest = async (req, res) => {
  return res.json({
    message: 'Admin authorization is working',
    admin: {
      id: req.admin._id,
      username: req.admin.username,
    },
  });
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  protectedTest,
};
