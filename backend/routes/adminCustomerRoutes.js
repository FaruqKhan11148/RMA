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
          totalSpent: 0,

          lastOrderAt: order.createdAt,

          orders: [],
        });
      }

      const customer = customersMap.get(phone);

      customer.totalOrders += 1;

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

    const customers = Array.from(customersMap.values());

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

module.exports = router;
