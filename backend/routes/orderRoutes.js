const express = require('express');

const Order = require('../models/Order');
const Owner = require('../models/Owner');

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

    console.log('ORDER DATA BEFORE MONGODB:', {
      ownerId,
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

// UPDATE ORDER STATUS
// UPDATE ORDER STATUS
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

    // Generate OTP when order goes OUT FOR DELIVERY
    if (status === 'OutForDelivery' && order.status !== 'OutForDelivery') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      order.deliveryOtp = otp;
      order.deliveryOtpGeneratedAt = new Date();
      order.otpVerified = false;
    }

    order.status = status;

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status failed:', error.message);

    res.status(500).json({
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
    order.otpVerified = true;
    order.status = 'Completed';

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
