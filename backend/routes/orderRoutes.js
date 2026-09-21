const express = require('express');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Order = require('../models/Order');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const DeliveryPerson = require('../models/DeliveryPerson');

const Notification = require('../models/Notification');

const customerAuth = require('../middleware/customerAuth');
const ownerAuth = require('../middleware/ownerAuth');
const deliveryAuth = require('../middleware/deliveryAuth');

const {
  createAndSendNotification,
} = require('../services/notificationService');

const router = express.Router();

// ==========================================
// CALCULATE DISTANCE BETWEEN TWO LOCATIONS
// ==========================================

// ==========================================
// PAYU REFUND
// ==========================================

async function initiatePayURefund(order, refundAmount) {
  if (!order.paymentId) {
    throw new Error('PayU payment ID is missing');
  }

  if (!order.paymentOrderId) {
    throw new Error('PayU payment order ID is missing');
  }

  const payuKey = process.env.PAYU_MERCHANT_KEY;
  const payuSalt = process.env.PAYU_SALT;

  if (!payuKey || !payuSalt) {
    throw new Error('PayU credentials are not configured');
  }

  const requestedRefundAmount = Number(refundAmount);

  if (!Number.isFinite(requestedRefundAmount) || requestedRefundAmount <= 0) {
    throw new Error('Invalid refund amount');
  }

  const paidAmount = Number(order.customerPayableAmount || order.totalPrice);

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error('Invalid original payment amount');
  }

  if (requestedRefundAmount > paidAmount) {
    throw new Error('Refund amount cannot exceed the original payment amount');
  }

  const finalRefundAmount = Number(requestedRefundAmount.toFixed(2));

  const refundToken = `RF${order.orderId}${Date.now()}`.slice(0, 23);

  const command = 'cancel_refund_transaction';

  // PayU refund hash:
  // sha512(key|command|var1|salt)
  const hashString = `${payuKey}|${command}|${order.paymentId}|${payuSalt}`;

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  const refundCallbackUrl = `${backendUrl}/api/payments/payu/refund-callback`;

  const formData = new URLSearchParams();

  formData.append('key', payuKey);
  formData.append('command', command);
  formData.append('var1', order.paymentId);
  formData.append('var2', refundToken);
  formData.append('var3', finalRefundAmount.toFixed(2));
  formData.append('var5', refundCallbackUrl);
  formData.append('hash', hash);

  const payuRefundUrl =
    process.env.PAYU_ENV === 'live'
      ? 'https://secure.payu.in/merchant/postservice.php?form=2'
      : 'https://test.payu.in/merchant/postservice.php?form=2';

  console.log('========== PAYU REFUND REQUEST ==========');

  console.log({
    orderId: order.orderId,
    paymentId: order.paymentId,
    originalPaidAmount: paidAmount.toFixed(2),
    refundAmount: finalRefundAmount.toFixed(2),
    refundToken,
    payuRefundUrl,
  });

  console.log('==========================================');

  const response = await fetch(payuRefundUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`PayU refund API returned HTTP ${response.status}`);
  }

  const data = await response.json();

  console.log('========== PAYU REFUND RESPONSE ==========');
  console.log(data);
  console.log('===========================================');

  if (Number(data.status) !== 1) {
    throw new Error(data.msg || 'PayU refund request failed');
  }

  return {
    refundToken,
    requestId: data.request_id || null,
    bankReferenceNumber: data.bank_ref_num || null,
    refundAmount: finalRefundAmount,
    response: data,
  };
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

// ==========================================
// PREVIEW DELIVERY CHARGE
// ==========================================

router.post('/delivery-preview', async (req, res) => {
  try {
    const { ownerId, deliveryLocation } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    if (
      !deliveryLocation ||
      deliveryLocation.latitude === undefined ||
      deliveryLocation.longitude === undefined
    ) {
      return res.status(400).json({
        message: 'Valid delivery location is required',
      });
    }

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Shop owner not found',
      });
    }

    const shopLatitude = owner.location?.latitude;
    const shopLongitude = owner.location?.longitude;

    const customerLatitude = Number(deliveryLocation.latitude);

    const customerLongitude = Number(deliveryLocation.longitude);

    if (
      shopLatitude === undefined ||
      shopLongitude === undefined ||
      !Number.isFinite(customerLatitude) ||
      !Number.isFinite(customerLongitude)
    ) {
      return res.status(400).json({
        message: 'Valid shop and delivery locations are required',
      });
    }

    const deliveryDistance = calculateDistanceKm(
      Number(shopLatitude),
      Number(shopLongitude),
      customerLatitude,
      customerLongitude,
    );

    // RMA delivery pricing:
    // ₹18 base + ₹8 per kilometre
    const deliveryCharge = Number((18 + 8 * deliveryDistance).toFixed(2));

    return res.status(200).json({
      deliveryDistance: Number(deliveryDistance.toFixed(2)),
      deliveryCharge,
    });
  } catch (error) {
    console.error('Delivery preview failed:', error);

    return res.status(500).json({
      message: 'Failed to calculate delivery charge',
    });
  }
});

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

router.get('/owner/:ownerId/daily-reward', async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    const completedOrders = await Order.countDocuments({
      ownerId,
      status: 'Completed',
      completedAt: {
        $gte: startOfDay,
        $lt: startOfNextDay,
      },
    });

    return res.status(200).json({
      completedOrders,
      targetOrders: 60,
      rewardAmount: 199,
      rewardUnlocked: completedOrders >= 60,
      startOfDay,
      startOfNextDay,
    });
  } catch (error) {
    console.error('Daily reward order count failed:', error);

    return res.status(500).json({
      message: 'Failed to fetch daily reward progress',
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

    const orders = await Order.find({
      ownerId,
      paymentStatus: 'Paid',
    }).sort({ createdAt: -1 });

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

// GET ORDERS FOR ONE GUEST
router.get('/guest/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;

    if (!guestId) {
      return res.status(400).json({
        message: 'Guest ID is required',
      });
    }

    const orders = await Order.find({ guestId })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get guest orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// ==========================================
// GET CUSTOMER NOTIFICATIONS
// ==========================================
router.get('/notifications/customer', customerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'customer',
      recipientId: req.customer._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'customer',
      recipientId: req.customer._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get customer notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch customer notifications',
    });
  }
});

// ==========================================
// GET OWNER NOTIFICATIONS
// ==========================================
router.get('/notifications/owner', ownerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'owner',
      recipientId: req.owner._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'owner',
      recipientId: req.owner._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get owner notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch owner notifications',
    });
  }
});

// ==========================================
// GET DELIVERY NOTIFICATIONS
// ==========================================
router.get('/notifications/delivery', deliveryAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'delivery',
      recipientId: req.deliveryPerson._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'delivery',
      recipientId: req.deliveryPerson._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get delivery notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch delivery notifications',
    });
  }
});

// ==========================================
// MARK CUSTOMER NOTIFICATION AS READ
// ==========================================
router.patch(
  '/notifications/customer/:notificationId/read',
  customerAuth,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.notificationId,
          recipientType: 'customer',
          recipientId: req.customer._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      console.error('Mark customer notification as read failed:', error);

      return res.status(500).json({
        message: 'Unable to mark notification as read',
      });
    }
  },
);

// ==========================================
// MARK OWNER NOTIFICATION AS READ
// ==========================================
router.patch(
  '/notifications/owner/:notificationId/read',
  ownerAuth,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.notificationId,
          recipientType: 'owner',
          recipientId: req.owner._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      console.error('Mark owner notification as read failed:', error);

      return res.status(500).json({
        message: 'Unable to mark notification as read',
      });
    }
  },
);

// ==========================================
// MARK DELIVERY NOTIFICATION AS READ
// ==========================================
router.patch(
  '/notifications/delivery/:notificationId/read',
  deliveryAuth,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.notificationId,
          recipientType: 'delivery',
          recipientId: req.deliveryPerson._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      console.error('Mark delivery notification as read failed:', error);

      return res.status(500).json({
        message: 'Unable to mark notification as read',
      });
    }
  },
);

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
      paymentMethod,
      deliveryLocation,
      guestId,
    } = req.body;

    if (
      !ownerId ||
      !customer ||
      !customer.name ||
      !customer.phone ||
      !orderType ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      paymentMethod !== 'ONLINE'
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
    // CALCULATE ORDER AMOUNTS ON BACKEND
    // ==========================================

    // Find the actual products belonging to this shop
    const calculatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: 'Invalid product or quantity',
        });
      }

      const product = owner.products.find(
        (product) => product.productId === item.productId,
      );

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      const price = Number(product.price);
      const quantity = Number(item.quantity);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for product: ${item.productId}`,
        });
      }

      calculatedItems.push({
        productId: product.productId,
        productName: product.name,
        price,
        quantity,
        unit: product.unit,
      });
    }

    // ==========================================
    // PRODUCT SUBTOTAL
    // ==========================================

    const subtotal = calculatedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const calculatedTotalItems = calculatedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    // ==========================================
    // DELIVERY DISTANCE & DELIVERY CHARGE
    // ==========================================

    let deliveryDistance = 0;
    let deliveryCharge = 0;

    if (orderType === 'delivery') {
      const shopLatitude = owner.location?.latitude;
      const shopLongitude = owner.location?.longitude;

      const customerLatitude = deliveryLocation?.latitude;
      const customerLongitude = deliveryLocation?.longitude;

      if (
        shopLatitude === undefined ||
        shopLongitude === undefined ||
        customerLatitude === undefined ||
        customerLongitude === undefined
      ) {
        return res.status(400).json({
          message: 'Valid shop and delivery locations are required',
        });
      }

      deliveryDistance = calculateDistanceKm(
        shopLatitude,
        shopLongitude,
        customerLatitude,
        customerLongitude,
      );

      // RMA delivery pricing:
      // ₹18 base + ₹8 per kilometre
      deliveryCharge = Number((18 + 8 * deliveryDistance).toFixed(2));
    }

    // ==========================================
    // RMA PRODUCT FEE
    // ==========================================

    // RMA gets 1.5% of PRODUCT SUBTOTAL only.
    const rmaFee = Number((subtotal * 0.015).toFixed(2));

    // ==========================================
    // DELIVERY SPLIT
    // ==========================================

    // Delivery charge is split:
    // 88% -> Rider
    // 6%  -> RMA
    // 6%  -> Shop Owner

    const deliveryRiderAmount = Number((deliveryCharge * 0.88).toFixed(2));

    const deliveryRmaAmount = Number((deliveryCharge * 0.06).toFixed(2));

    // Calculate owner share as the remaining amount.
    // This guarantees all three shares add up exactly
    // to the original delivery charge even after rounding.
    const deliveryOwnerAmount = Number(
      (deliveryCharge - deliveryRiderAmount - deliveryRmaAmount).toFixed(2),
    );

    // ==========================================
    // TOTAL RMA AMOUNT
    // ==========================================

    // RMA earns:
    // 1.5% product fee
    // +
    // 6% delivery share
    const rmaAmount = Number((rmaFee + deliveryRmaAmount).toFixed(2));

    // ==========================================
    // TOTAL OWNER AMOUNT
    // ==========================================

    // Owner earns:
    // Product subtotal - RMA product fee
    // +
    // 6% delivery share
    const ownerAmount = Number(
      (subtotal - rmaFee + deliveryOwnerAmount).toFixed(2),
    );

    // ==========================================
    // BASE CUSTOMER TOTAL
    // ==========================================

    // This is the amount before PayU charges.
    const totalPrice = Number((subtotal + deliveryCharge).toFixed(2));

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

    const storedGuestId = customerId ? null : guestId;

    console.log('ORDER DATA BEFORE MONGODB:', {
      ownerId,
      customerId,
      customer,
      orderType,
      deliveryLocation,

      items: calculatedItems,
      totalItems: calculatedTotalItems,

      // Financial breakdown
      subtotal,
      deliveryDistance,
      deliveryCharge,

      rmaFee,
      deliveryRiderAmount,
      deliveryRmaAmount,
      deliveryOwnerAmount,
      rmaAmount,
      ownerAmount,

      totalPrice,

      paymentMethod,
    });

    const order = await Order.create({
      orderId: `RMA${Date.now()}`,

      customerId,
      guestId: storedGuestId,

      ownerId,
      customer,
      orderType,
      deliveryLocation,

      // Backend-calculated product data
      items: calculatedItems,
      totalItems: calculatedTotalItems,

      // Backend-calculated financial data
      subtotal,
      deliveryDistance,
      deliveryCharge,

      // RMA / Rider / Owner split
      rmaFee,
      deliveryRiderAmount,
      deliveryRmaAmount,
      deliveryOwnerAmount,
      rmaAmount,
      ownerAmount,

      // Base customer amount before PayU charges
      totalPrice,

      paymentMethod,
      status: 'Pending',
    });

    // ==========================================
    // NOTIFY SHOP OWNER ABOUT NEW ORDER
    // ==========================================
    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: ownerId,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message:
          `You received a new order ${order.orderId} ` +
          `from ${customer.name}.`,
        orderId: order.orderId,
        data: {
          screen: 'owner-orders',
          orderId: order.orderId,
        },
      });
    } catch (notificationError) {
      console.error('Owner new order notification failed:', notificationError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
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
// CUSTOMER CANCEL ORDER
// ==========================================
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // CHECK CANCELLATION ELIGIBILITY
    // ==========================================

    const cancellableStatuses = ['Pending', 'Accepted'];

    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message:
          'This order can no longer be cancelled because preparation has started or the order has progressed further.',
      });
    }

    // ==========================================
    // REQUIRE CANCELLATION REASON
    // ==========================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: 'Cancellation reason is required',
      });
    }

    // ==========================================
    // PREVENT DUPLICATE CANCELLATION
    // ==========================================

    if (order.cancelledAt) {
      return res.status(400).json({
        message: 'Order has already been cancelled',
      });
    }

    // ==========================================
    // ONLINE PAYMENT REFUND
    // ==========================================

    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
      const fullRefundAmount = Number(
        (order.customerPayableAmount || order.totalPrice).toFixed(2),
      );

      try {
        // Mark refund as processing before calling PayU.
        order.refundStatus = 'Processing';
        order.refundAmount = fullRefundAmount;
        order.refundType = 'FULL';
        order.refundReason = reason.trim();
        order.refundInitiatedAt = new Date();

        await order.save();

        // Initiate FULL customer refund through PayU.
        const refundResult = await initiatePayURefund(order, fullRefundAmount);

        order.refundStatus = 'Processing';
        order.refundAmount = refundResult.refundAmount;
        order.refundId = refundResult.requestId || refundResult.refundToken;

        // No settlement should happen after cancellation.
        order.settlementStatus = 'NotRequired';

        // ==========================================
        // RECORD CANCELLATION
        // ==========================================

        order.cancelledAt = new Date();
        order.cancelledBy = 'CUSTOMER';
        order.cancellationReason = reason.trim();

        // Keep payment as Paid until PayU confirms
        // the refund through the refund callback.
        order.paymentStatus = 'Paid';

        // ==========================================
        // CURRENT STATUS
        // ==========================================

        order.status = 'Rejected';

        await order.save();

        // ==========================================
        // CUSTOMER NOTIFICATION
        // ==========================================

        if (order.customerId) {
          try {
            await createAndSendNotification({
              recipientType: 'customer',
              recipientId: order.customerId,
              type: 'ORDER_CANCELLED',
              title: 'Order Cancelled',
              message: `Your order ${order.orderId} has been cancelled successfully. Your refund has been initiated.`,
              orderId: order.orderId,
              data: {
                screen: 'order-status',
                orderId: order.orderId,
              },
            });
          } catch (notificationError) {
            console.error(
              'Customer cancellation notification failed:',
              notificationError,
            );
          }
        }

        await order.populate('ownerId', 'ownerName shopName phone');

        return res.status(200).json({
          message: 'Order cancelled and full refund initiated successfully',
          order,
        });
      } catch (refundError) {
        console.error(
          'Customer cancellation refund failed:',
          refundError.message,
        );

        // Cancellation still happened, but refund initiation failed.
        order.cancelledAt = new Date();
        order.cancelledBy = 'CUSTOMER';
        order.cancellationReason = reason.trim();

        order.refundStatus = 'Failed';
        order.refundAmount = fullRefundAmount;
        order.refundType = 'FULL';
        order.refundReason = reason.trim();

        // Customer has NOT been confirmed as refunded.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';
        order.status = 'Rejected';

        await order.save();

        return res.status(502).json({
          message:
            'Order was cancelled, but the customer refund could not be initiated',
          error: refundError.message,
          order,
        });
      }
    }

    // ==========================================
    // FALLBACK FOR NON-PAID ORDER
    // ==========================================

    order.cancelledAt = new Date();
    order.cancelledBy = 'CUSTOMER';
    order.cancellationReason = reason.trim();
    order.status = 'Rejected';

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Customer cancel order failed:', error.message);

    return res.status(500).json({
      message: 'Unable to cancel order',
    });
  }
});

// ==========================================
// CUSTOMER REJECT DELIVERY
// ==========================================

router.post('/:orderId/reject-delivery', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // ONLY OUT FOR DELIVERY ORDERS
    // ==========================================

    if (order.status !== 'OutForDelivery') {
      return res.status(400).json({
        message:
          'Delivery can only be rejected while the order is out for delivery.',
      });
    }

    // ==========================================
    // OTP ALREADY VERIFIED
    // ==========================================

    if (order.otpVerified) {
      return res.status(400).json({
        message:
          'This order has already been delivered and cannot be rejected.',
      });
    }

    // ==========================================
    // REQUIRE REJECTION REASON
    // ==========================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: 'Rejection reason is required',
      });
    }

    // ==========================================
    // PREVENT DUPLICATE REJECTION
    // ==========================================

    if (order.customerRejectedAt) {
      return res.status(400).json({
        message: 'Delivery has already been rejected for this order',
      });
    }

    // ==========================================
    // REFUND AMOUNT
    // ==========================================

    /*
     * Delivery rejection refund policy:
     *
     * Refund:
     *   Product subtotal
     *   +
     *   PayU convenience charges
     *
     * Do NOT refund:
     *   Delivery charge
     */

    const subtotal = Number(order.subtotal || 0);

    const payuCharges = Number(order.payuCharges || 0);

    const deliveryRejectionRefund = Number((subtotal + payuCharges).toFixed(2));

    if (deliveryRejectionRefund <= 0) {
      return res.status(400).json({
        message: 'Unable to calculate the delivery rejection refund',
      });
    }

    // ==========================================
    // ONLINE PAYMENT REFUND
    // ==========================================

    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
      try {
        // Mark refund as processing before calling PayU.
        order.refundStatus = 'Processing';
        order.refundAmount = deliveryRejectionRefund;
        order.refundType = 'DELIVERY_REJECTION';
        order.refundReason = reason.trim();
        order.refundInitiatedAt = new Date();

        order.customerRejectedAt = new Date();
        order.customerRejectionReason = reason.trim();
        order.customerRejectionDescription = description?.trim() || null;

        order.settlementStatus = 'NotRequired';

        await order.save();

        // ==========================================
        // INITIATE REFUND
        // ==========================================

        const refundResult = await initiatePayURefund(
          order,
          deliveryRejectionRefund,
        );

        order.refundStatus = 'Processing';
        order.refundAmount = refundResult.refundAmount;
        order.refundId = refundResult.requestId || refundResult.refundToken;

        // Keep payment as Paid until PayU confirms
        // the refund through the refund callback.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';

        // ==========================================
        // MARK ORDER REJECTED
        // ==========================================

        order.status = 'Rejected';

        await order.save();

        // ==========================================
        // CUSTOMER NOTIFICATION
        // ==========================================

        if (order.customerId) {
          try {
            await createAndSendNotification({
              recipientType: 'customer',
              recipientId: order.customerId,
              type: 'ORDER_REJECTED',
              title: 'Delivery Rejected',
              message:
                `Your order ${order.orderId} has been rejected. ` +
                'Your eligible refund has been initiated.',
              orderId: order.orderId,
              data: {
                screen: 'order-status',
                orderId: order.orderId,
              },
            });
          } catch (notificationError) {
            console.error(
              'Customer delivery rejection notification failed:',
              notificationError,
            );
          }
        }

        await order.populate('ownerId', 'ownerName shopName phone');

        return res.status(200).json({
          message:
            'Delivery rejected and eligible refund initiated successfully',
          order,
        });
      } catch (refundError) {
        console.error('Delivery rejection refund failed:', refundError.message);

        // ==========================================
        // REJECTION STILL RECORDED
        // ==========================================

        order.customerRejectedAt = new Date();
        order.customerRejectionReason = reason.trim();
        order.customerRejectionDescription = description?.trim() || null;

        order.refundStatus = 'Failed';
        order.refundAmount = deliveryRejectionRefund;
        order.refundType = 'DELIVERY_REJECTION';
        order.refundReason = reason.trim();

        // Customer has NOT been confirmed as refunded.
        order.paymentStatus = 'Paid';

        order.settlementStatus = 'NotRequired';
        order.status = 'Rejected';

        await order.save();

        return res.status(502).json({
          message:
            'Delivery was rejected, but the customer refund could not be initiated',
          error: refundError.message,
          order,
        });
      }
    }

    // ==========================================
    // NON-PAID FALLBACK
    // ==========================================

    order.customerRejectedAt = new Date();
    order.customerRejectionReason = reason.trim();
    order.customerRejectionDescription = description?.trim() || null;

    order.status = 'Rejected';

    await order.save();

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Delivery rejected successfully',
      order,
    });
  } catch (error) {
    console.error('Customer delivery rejection failed:', error.message);

    return res.status(500).json({
      message: 'Unable to reject delivery',
    });
  }
});

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      status,
      rejectionReason,
      rejectionDescription,
      deliveryAssignmentType,
      deliveryPersonId,
    } = req.body;

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

    if (order.status === status) {
      return res.status(400).json({
        message: `Order is already ${status}`,
      });
    }

    // ==========================================
    // DELIVERY ASSIGNMENT VALIDATION
    // ==========================================

    if (status === 'OutForDelivery') {
      if (!['SHOP', 'RMA'].includes(deliveryAssignmentType)) {
        return res.status(400).json({
          message: 'Delivery assignment type is required',
        });
      }

      if (!deliveryPersonId) {
        return res.status(400).json({
          message: 'Delivery person is required',
        });
      }

      const selectedDeliveryPerson = await DeliveryPerson.findOne({
        _id: deliveryPersonId,
        deliveryType: deliveryAssignmentType,
        isActive: true,
      });

      if (!selectedDeliveryPerson) {
        return res.status(400).json({
          message: 'Selected delivery person is not available',
        });
      }

      // SHOP rider must belong to this shop
      if (
        deliveryAssignmentType === 'SHOP' &&
        String(selectedDeliveryPerson.ownerId) !== String(order.ownerId)
      ) {
        return res.status(400).json({
          message: 'Selected delivery person does not belong to this shop',
        });
      }

      // Save assignment
      order.deliveryAssignmentType = deliveryAssignmentType;
      order.deliveryPersonId = selectedDeliveryPerson._id;
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

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      order.deliveryOtp = otp;
      order.deliveryOtpGeneratedAt = new Date();
      order.otpVerified = false;
    }

    if (status === 'Completed' && order.status !== 'Completed') {
      order.completedAt = new Date();
    }

    // ==========================================
    // REJECT ORDER + REFUND PAID ONLINE ORDER
    // ==========================================

    if (status === 'Rejected' && order.status !== 'Rejected') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({
          message: 'Rejection reason is required',
        });
      }
      // Prevent rejection of an order that has already
      // moved beyond the Pending stage.
      if (order.status !== 'Pending') {
        return res.status(400).json({
          message: `Order cannot be rejected because it is already ${order.status}`,
        });
      }

      order.rejectedAt = new Date();

      order.rejectionReason = rejectionReason.trim();
      order.rejectionDescription = rejectionDescription?.trim() || null;

      // ==========================================
      // ONLINE PAYMENT REFUND
      // ==========================================

      if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
        try {
          // Mark refund as processing before calling PayU.
          order.refundStatus = 'Processing';
          order.refundAmount = Number(
            (order.customerPayableAmount || order.totalPrice).toFixed(2),
          );

          order.refundType = 'FULL';
          order.refundReason = rejectionReason.trim();

          order.refundInitiatedAt = new Date();

          await order.save();

          // Initiate FULL customer refund through PayU.
          const refundResult = await initiatePayURefund(
            order,
            order.customerPayableAmount || order.totalPrice,
          );

          // Store PayU refund information.
          order.refundStatus = 'Processing';
          order.refundAmount = refundResult.refundAmount;
          order.refundId = refundResult.requestId || refundResult.refundToken;

          // No settlement should happen because
          // the order was rejected.
          order.settlementStatus = 'NotRequired';

          order.status = 'Rejected';

          await order.save();

          // ==========================================
          // CUSTOMER REJECTION NOTIFICATION
          // ==========================================

          // if (order.customerId) {
          //   try {
          //     await createAndSendNotification({
          //       recipientType: 'customer',
          //       recipientId: order.customerId,
          //       type: 'ORDER_REJECTED',
          //       title: 'Order Rejected',
          //       message: `Your order ${order.orderId} has been rejected by the shop.`,
          //       orderId: order.orderId,
          //       data: {
          //         screen: 'orders',
          //       },
          //     });
          //   } catch (notificationError) {
          //     console.error(
          //       'Customer rejection notification failed:',
          //       notificationError,
          //     );
          //   }
          // }

          await order.populate('ownerId', 'ownerName shopName phone');

          return res.status(200).json({
            message: 'Order rejected and full refund initiated successfully',
            order,
          });
        } catch (refundError) {
          console.error('PayU refund failed:', refundError.message);

          // Refund did not get initiated successfully.
          // Keep payment as Paid because the customer
          // has NOT been confirmed as refunded.
          order.refundStatus = 'Failed';
          order.refundAmount = Number(
            (order.customerPayableAmount || order.totalPrice).toFixed(2),
          );

          // Do not mark the payment as Refunded here.
          order.paymentStatus = 'Paid';

          // The order can still be rejected, but the
          // unpaid refund must be visible for retry/admin action.
          order.status = 'Rejected';

          await order.save();

          return res.status(502).json({
            message:
              'Order was rejected, but the customer refund could not be initiated',
            error: refundError.message,
            order,
          });
        }
      }
    }

    order.status = status;

    await order.save();

    if (status === 'OutForDelivery') {
      try {
        if (order.deliveryPersonId) {
          await createAndSendNotification({
            recipientType: 'delivery',
            recipientId: order.deliveryPersonId,
            type: 'DELIVERY_ASSIGNED',
            title: 'New Delivery Assigned',
            message: `Order ${order.orderId} has been assigned to you.`,
            orderId: order.orderId,
            data: {
              screen: 'delivery-orders',
              orderId: order.orderId,
            },
          });
        }
      } catch (notificationError) {
        console.error(
          'Delivery assignment notification failed:',
          notificationError,
        );
      }
    }

    // ==========================================
    // CUSTOMER ORDER STATUS NOTIFICATION
    // ==========================================

    if (order.customerId) {
      try {
        const statusNotifications = {
          Accepted: {
            type: 'ORDER_ACCEPTED',
            title: 'Order Accepted',
            message: `Your order ${order.orderId} has been accepted by the shop.`,
            data: {
              screen: 'order-status',
            },
          },

          OutForDelivery: {
            type: 'ORDER_OUT_FOR_DELIVERY',
            title: 'Order On The Way',
            message: `Your order ${order.orderId} is out for delivery.`,
            data: {
              screen: 'order-status',
            },
          },

          Completed: {
            type: 'ORDER_COMPLETED',
            title: 'Order Delivered',
            message: `Your order ${order.orderId} has been delivered. Thank you for ordering with RMA!`,
            data: {
              screen: 'order-status',
            },
          },

          Rejected: {
            type: 'ORDER_REJECTED',
            title: 'Order Rejected',
            message:
              `Your order ${order.orderId} has been rejected by the shop. ` +
              `Reason: ${order.rejectionReason}.`,
            data: {
              screen: 'order-status',
            },
          },
        };

        const notification = statusNotifications[status];

        if (notification) {
          await createAndSendNotification({
            recipientType: 'customer',
            recipientId: order.customerId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            orderId: order.orderId,
            data: {
              ...notification.data,
              orderId: order.orderId,
            },
          });
        }
      } catch (notificationError) {
        console.error(
          'Customer order status notification failed:',
          notificationError,
        );
      }
    }

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

    // ==========================================
    // CUSTOMER COMPLETION NOTIFICATION
    // ==========================================

    if (order.customerId) {
      try {
        await createAndSendNotification({
          recipientType: 'customer',
          recipientId: order.customerId,
          type: 'ORDER_COMPLETED',
          title: 'Order Delivered',
          message: `Your order ${order.orderId} has been delivered. Thank you for ordering with RMA!`,
          orderId: order.orderId,
          data: {
            screen: 'order-status',
            orderId: order.orderId,
          },
        });
      } catch (notificationError) {
        console.error(
          'Customer completion notification failed:',
          notificationError,
        );
      }
    }

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
