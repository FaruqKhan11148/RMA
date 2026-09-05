const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        message: 'Admin authentication required',
      });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select('-passwordHash');

    if (!admin) {
      return res.status(401).json({
        message: 'Admin account not found',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Admin account is inactive',
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired admin session',
    });
  }
};

module.exports = adminAuth;
