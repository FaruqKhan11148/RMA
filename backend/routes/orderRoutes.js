const express = require('express');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Order = require('../models/Order');
const Owner = require('../models/Owner');
const customerAuth = require('../middleware/customerAuth');
const Customer = require('../models/Customer');

const router = express.Router();

// ==========================================
// CALCULATE DISTANCE BETWEEN TWO LOCATIONS
// ==========================================

// ==========================================
// PAYU REFUND
// ==========================================

async function initiatePayURefund(order) {
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

  const refundToken = `RF${order.orderId}${Date.now()}`.slice(0, 23);

  const command = 'cancel_refund_transaction';

  // PayU refund hash:
  // sha512(key|command|var1|salt)
  const hashString = `${payuKey}|${command}|${order.paymentId}|${payuSalt}`;

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const refundAmount = Number(order.totalPrice).toFixed(2);

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  const refundCallbackUrl = `${backendUrl}/api/payments/payu/refund-callback`;

  const formData = new URLSearchParams();

  formData.append('key', payuKey);
  formData.append('command', command);
  formData.append('var1', order.paymentId);
  formData.append('var2', refundToken);
  formData.append('var3', refundAmount);
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
    refundAmount,
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
    refundAmount: Number(refundAmount),
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
    // DELIVERY CHARGE
    // ==========================================

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
      // ₹13 base + ₹8 per kilometre
      deliveryCharge = Number((13 + 8 * deliveryDistance).toFixed(2));
    }

    // ==========================================
    // RMA PLATFORM FEE
    // ==========================================

    // RMA gets 1% of PRODUCT SUBTOTAL only.
    const rmaFee = Number((subtotal * 0.01).toFixed(2));

    // ==========================================
    // OWNER AMOUNT
    // ==========================================

    // Owner receives 99% of product subtotal.
    const ownerAmount = Number((subtotal - rmaFee).toFixed(2));

    // ==========================================
    // CUSTOMER TOTAL
    // ==========================================

    // Customer pays product subtotal + delivery.
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
      ownerAmount,
      totalPrice,

      paymentMethod,
    });

    const order = await Order.create({
      orderId: `RMA${Date.now()}`,

      customerId,

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
      rmaFee,
      ownerAmount,
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

    // ==========================================
    // REJECT ORDER + REFUND PAID ONLINE ORDER
    // ==========================================

    if (status === 'Rejected' && order.status !== 'Rejected') {
      // Prevent rejection of an order that has already
      // moved beyond the Pending stage.
      if (order.status !== 'Pending') {
        return res.status(400).json({
          message: `Order cannot be rejected because it is already ${order.status}`,
        });
      }

      order.rejectedAt = new Date();

      // ==========================================
      // ONLINE PAYMENT REFUND
      // ==========================================

      if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
        try {
          // Mark refund as processing before calling PayU.
          order.refundStatus = 'Processing';
          order.refundAmount = Number(order.totalPrice.toFixed(2));
          order.refundInitiatedAt = new Date();

          await order.save();

          // Initiate FULL customer refund through PayU.
          const refundResult = await initiatePayURefund(order);

          // Store PayU refund information.
          order.refundStatus = 'Processing';
          order.refundAmount = refundResult.refundAmount;
          order.refundId = refundResult.requestId || refundResult.refundToken;

          // No settlement should happen because
          // the order was rejected.
          order.settlementStatus = 'NotRequired';

          order.status = 'Rejected';

          await order.save();

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
          order.refundAmount = Number(order.totalPrice.toFixed(2));

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
