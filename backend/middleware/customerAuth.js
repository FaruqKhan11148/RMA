const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const customerAuth = async (req, res, next) => {
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

    req.customer = customer;

    next();
  } catch (error) {
    console.error('Customer authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired customer session',
    });
  }
};

module.exports = customerAuth;
