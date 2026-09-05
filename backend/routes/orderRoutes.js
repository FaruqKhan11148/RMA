const express = require('express');

const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Owner = require('../models/Owner');
const customerAuth = require('../middleware/customerAuth');
const Customer = require('../models/Customer');
const router = express.Router();

// GET ALL ORDERS
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('ownerId', 'ownerName shopName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET ORDERS FOR ONE OWNER
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const orders = await Order.find({ ownerId }).sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get owner orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET ONE ORDER BY ORDER ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate(
      'ownerId',
      'ownerName shopName phone',
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error('Get order failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const {
      ownerId,
      customer,
      orderType,
      items,
      totalItems,
      totalPrice,
      paymentMethod,
      deliveryLocation,
    } = req.body;

    if (
      !ownerId ||
      !customer ||
      !customer.name ||
      !customer.phone ||
      !orderType ||
      !items ||
      !paymentMethod ||
      items.length === 0 ||
      !totalItems ||
      totalPrice === undefined
    ) {
      return res.status(400).json({
        message: 'Required order fields are missing',
      });
    }

    // Delivery orders must have a valid location
    if (
      orderType === 'delivery' &&
      (!deliveryLocation ||
        deliveryLocation.latitude === undefined ||
        deliveryLocation.longitude === undefined)
    ) {
      return res.status(400).json({
        message: 'Delivery location is required',
      });
    }

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Shop owner not found',
      });
    }

    // ==========================================
    // IDENTIFY LOGGED-IN CUSTOMER
    // ==========================================

    let customerId = null;

    try {
      const token = req.cookies?.customer_token;

      if (token) {
        const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);

        const loggedInCustomer = await Customer.findById(decoded.customerId);

        if (loggedInCustomer && loggedInCustomer.isActive) {
          customerId = loggedInCustomer._id;
        }
      }
    } catch (error) {
      // Invalid/expired customer session should NOT
      // prevent guest checkout.
      console.log('No valid customer session. Creating guest order.');
    }

    console.log('ORDER DATA BEFORE MONGODB:', {
      ownerId,
      customerId,
      customer,
      orderType,
      deliveryLocation,
      items,
      totalItems,
      totalPrice,
      paymentMethod,
    });

    const order = await Order.create({
      orderId: `RMA${Date.now()}`,

      // Registered customer gets their Customer._id.
      // Guest customer gets null.
      customerId,

      ownerId,
      customer,
      orderType,
      deliveryLocation,
      items,
      totalItems,
      totalPrice,
      paymentMethod,
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('========== CREATE ORDER ERROR ==========');
    console.error(error);
    console.error('========================================');

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'OutForDelivery',
      'Completed',
      'Rejected',
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // RECORD STATUS TIMESTAMP
    // ==========================================

    if (status === 'Accepted' && order.status !== 'Accepted') {
      order.acceptedAt = new Date();
    }

    if (status === 'Preparing' && order.status !== 'Preparing') {
      order.preparingAt = new Date();
    }

    if (status === 'Ready' && order.status !== 'Ready') {
      order.readyAt = new Date();
    }

    if (status === 'OutForDelivery' && order.status !== 'OutForDelivery') {
      order.outForDeliveryAt = new Date();

      // Generate delivery OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      order.deliveryOtp = otp;
      order.deliveryOtpGeneratedAt = new Date();
      order.otpVerified = false;
    }

    if (status === 'Completed' && order.status !== 'Completed') {
      order.completedAt = new Date();
    }

    if (status === 'Rejected' && order.status !== 'Rejected') {
      order.rejectedAt = new Date();
    }

    order.status = status;

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});

// VERIFY DELIVERY OTP
router.post('/:orderId/verify-otp', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: 'Delivery OTP is required',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // OTP verification is only allowed for delivery orders
    if (order.orderType !== 'delivery') {
      return res.status(400).json({
        message: 'OTP verification is only required for delivery orders',
      });
    }

    // OTP can only be verified when order is out for delivery
    if (order.status !== 'OutForDelivery') {
      return res.status(400).json({
        message: 'Order is not out for delivery',
      });
    }

    // Check OTP
    if (order.deliveryOtp !== otp) {
      return res.status(400).json({
        message: 'Invalid delivery OTP',
      });
    }

    // OTP is correct
    // OTP is correct
    order.otpVerified = true;
    order.status = 'Completed';
    order.completedAt = new Date();

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    res.status(200).json({
      message: 'Delivery OTP verified successfully',
      order,
    });
  } catch (error) {
    console.error('Verify delivery OTP failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;
