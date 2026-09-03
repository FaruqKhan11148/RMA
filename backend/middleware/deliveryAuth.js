const DeliveryPerson = require('../models/DeliveryPerson');

const deliveryAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization token is required',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        message: 'Invalid authorization token',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      loginToken: token,
      isActive: true,
    });

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Invalid or expired delivery login',
      });
    }

    // Attach delivery person to request
    req.deliveryPerson = deliveryPerson;

    next();
  } catch (error) {
    console.error('Delivery authentication failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = deliveryAuth;
