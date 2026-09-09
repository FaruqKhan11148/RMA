const express = require('express');

const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .select(
        'customer deliveryLocation orderId totalPrice paymentStatus status createdAt updatedAt',
      )
      .sort({ createdAt: -1 });

    const customersMap = new Map();

    for (const order of orders) {
      const phone = order.customer?.phone;

      if (!phone) {
        continue;
      }

      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: order.customer?.name || '',
          phone,
          address: order.customer?.address || '',
          deliveryLocation: order.deliveryLocation || null,

          totalOrders: 0,
          completedOrders: 0,
          totalSpent: 0,

          lastOrderAt: order.createdAt,
          latestStatus: order.status || '',

          orders: [],
        });
      }

      const customer = customersMap.get(phone);

      customer.totalOrders += 1;

      if (order.status === 'Completed') {
        customer.completedOrders += 1;
      }

      if (order.paymentStatus === 'Paid') {
        customer.totalSpent += order.totalPrice || 0;
      }

      if (
        order.createdAt &&
        new Date(order.createdAt) > new Date(customer.lastOrderAt)
      ) {
        customer.lastOrderAt = order.createdAt;
      }

      customer.orders.push({
        orderId: order.orderId,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    const customers = Array.from(customersMap.values()).map((customer) => ({
      ...customer,
      totalSpent: Number(customer.totalSpent.toFixed(2)),
    }));

    return res.json({
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Admin customers fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch customers',
    });
  }
});

// ==========================================
// GET SINGLE CUSTOMER DETAILS
// ==========================================

router.get('/:phone', adminAuth, async (req, res) => {
  try {
    const { phone } = req.params;

    const orders = await Order.find({
      'customer.phone': phone,
    })
      .select(
        [
          'orderId',
          'customer',
          'orderType',
          'deliveryLocation',
          'items',
          'totalItems',
          'totalPrice',
          'paymentStatus',
          'paymentMethod',
          'onlinePaymentMethod',
          'paymentId',
          'paymentOrderId',
          'paidAt',
          'status',
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',
          'otpVerified',
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        message: 'Customer not found',
      });
    }

    const firstOrder = orders[0];

    let totalSpent = 0;
    let completedOrders = 0;
    let rejectedOrders = 0;
    let pendingOrders = 0;

    for (const order of orders) {
      if (order.paymentStatus === 'Paid') {
        totalSpent += Number(order.totalPrice || 0);
      }

      if (order.status === 'Completed') {
        completedOrders += 1;
      }

      if (order.status === 'Rejected') {
        rejectedOrders += 1;
      }

      if (order.status === 'Pending') {
        pendingOrders += 1;
      }
    }

    const customer = {
      name: firstOrder.customer?.name || '',
      phone: firstOrder.customer?.phone || phone,
      address: firstOrder.customer?.address || '',
      deliveryLocation: firstOrder.deliveryLocation || null,
    };

    return res.status(200).json({
      customer,

      stats: {
        totalOrders: orders.length,
        completedOrders,
        rejectedOrders,
        pendingOrders,
        totalSpent: Number(totalSpent.toFixed(2)),
        lastOrderAt: firstOrder.createdAt,
      },

      orders,
    });
  } catch (error) {
    console.error('Admin customer details fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch customer details',
    });
  }
});

module.exports = router;
