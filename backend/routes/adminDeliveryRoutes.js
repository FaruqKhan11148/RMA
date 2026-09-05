const express = require('express');

const DeliveryPerson = require('../models/DeliveryPerson');
const Owner = require('../models/Owner');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET ALL DELIVERY PERSONS
// ============================================================

router.get('/', adminAuth, async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find()
      .populate('ownerId', 'ownerName shopName phone shopId')
      .select(
        [
          'ownerId',
          'shopId',
          'name',
          'phone',
          'isActive',
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    const deliveryData = await Promise.all(
      deliveryPersons.map(async (deliveryPerson) => {
        const person = deliveryPerson.toObject();

        // Currently out for delivery
        const activeOrders = await Order.countDocuments({
          ownerId: deliveryPerson.ownerId?._id,
          status: 'OutForDelivery',
          orderType: 'delivery',
        });

        // Completed deliveries
        const completedOrders = await Order.countDocuments({
          ownerId: deliveryPerson.ownerId?._id,
          status: 'Completed',
          orderType: 'delivery',
          otpVerified: true,
        });

        // Total delivery orders
        const totalDeliveryOrders = await Order.countDocuments({
          ownerId: deliveryPerson.ownerId?._id,
          orderType: 'delivery',
        });

        return {
          ...person,

          activeOrders,
          completedOrders,
          totalDeliveryOrders,
        };
      }),
    );

    return res.status(200).json({
      count: deliveryData.length,
      deliveryPersons: deliveryData,
    });
  } catch (error) {
    console.error('Admin delivery persons fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch delivery persons',
    });
  }
});

// ============================================================
// GET SINGLE DELIVERY PERSON
// ============================================================

router.get('/:shopId', adminAuth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({ shopId })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .select(
        [
          'ownerId',
          'shopId',
          'name',
          'phone',
          'isActive',
          'createdAt',
          'updatedAt',
        ].join(' '),
      );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found',
      });
    }

    // Get all delivery orders for this shop
    const orders = await Order.find({
      ownerId: deliveryPerson.ownerId?._id,
      orderType: 'delivery',
    })
      .select(
        [
          'orderId',
          'customer',
          'totalPrice',
          'status',
          'paymentStatus',
          'paymentMethod',
          'otpVerified',
          'deliveryOtpGeneratedAt',
          'createdAt',
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    const completedOrders = orders.filter(
      (order) => order.status === 'Completed' && order.otpVerified === true,
    ).length;

    const activeOrders = orders.filter(
      (order) => order.status === 'OutForDelivery',
    ).length;

    return res.status(200).json({
      deliveryPerson: {
        ...deliveryPerson.toObject(),

        activeOrders,
        completedOrders,
        totalDeliveryOrders: orders.length,

        orders,
      },
    });
  } catch (error) {
    console.error('Admin delivery person fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch delivery person',
    });
  }
});

module.exports = router;
