const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');

const ownerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Owner authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.OWNER_JWT_SECRET);

    const owner = await Owner.findById(decoded.ownerId).select('-password');

    if (!owner) {
      return res.status(401).json({
        message: 'Owner account not found',
      });
    }

    req.owner = owner;

    next();
  } catch (error) {
    console.error('Owner authentication failed:', error.message);

    return res.status(401).json({
      message: 'Invalid or expired owner authentication',
    });
  }
};

module.exports = ownerAuth;
