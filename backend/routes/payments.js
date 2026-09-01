const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const Order = require('../models/Order');
const Owner = require('../models/Owner');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// OWNER RAZORPAY ONBOARDING
router.post('/onboard-owner', async (req, res) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
        message: 'shopId is required',
      });
    }

    // Find owner
    const owner = await Owner.findOne({ shopId });

    if (!owner) {
      return res.status(404).json({
        message: 'Owner/shop not found',
      });
    }

    // Prevent creating multiple Razorpay accounts
    if (owner.payment?.accountId) {
      return res.status(200).json({
        message: 'Razorpay account already exists',
        accountId: owner.payment.accountId,
        onboardingStatus: owner.payment.onboardingStatus,
      });
    }

    // Create Razorpay Route Linked Account
    const linkedAccountResponse = await fetch(
      'https://api.razorpay.com/v2/accounts',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
            ).toString('base64'),
        },

        body: JSON.stringify({
          email: `${owner.phone}@rma.local`,
          phone: owner.phone,

          type: 'route',

          reference_id: owner.shopId,

          legal_business_name: owner.shopName,

          customer_facing_business_name: owner.shopName,

          business_type: 'individual',

          contact_name: owner.ownerName,

          profile: {
            category: 'food',
            subcategory: 'food_and_beverages',
          },
        }),
      },
    );

    const razorpayAccount = await linkedAccountResponse.json();

    console.log('Razorpay Linked Account:', razorpayAccount);

    if (!linkedAccountResponse.ok) {
      console.error('Razorpay owner onboarding failed:', razorpayAccount);

      return res.status(400).json({
        message:
          razorpayAccount.error?.description ||
          'Unable to create Razorpay owner account',
      });
    }

    // Save Razorpay account information
    owner.payment = {
      ...owner.payment?.toObject?.(),
      provider: 'RAZORPAY',
      accountId: razorpayAccount.id,
      onboardingStatus: 'PENDING',
      kycStatus: 'PENDING',
      bankStatus: 'NOT_STARTED',
      onboardingUrl: null,
      onboardedAt: null,
    };

    await owner.save();

    res.status(201).json({
      message: 'Razorpay owner account created',

      account: {
        id: razorpayAccount.id,
        status: razorpayAccount.status,
        referenceId: razorpayAccount.reference_id,
      },

      payment: owner.payment,
    });
  } catch (error) {
    console.error('Owner Razorpay onboarding failed:', error);

    res.status(500).json({
      message: error.message || 'Unable to start owner payment onboarding',
    });
  }
});

// CREATE RAZORPAY PAYMENT ORDER
router.post('/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: 'RMA orderId is required',
      });
    }

    // Find the actual RMA order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'RMA order not found',
      });
    }

    // Only ONLINE orders can use Razorpay
    if (order.paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        message: 'This order is not an online payment order',
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      receipt: order.orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    console.log('Razorpay Order Created:', razorpayOrder);

    // Save Razorpay order ID in our RMA order
    order.paymentOrderId = razorpayOrder.id;

    await order.save();

    res.status(201).json({
      message: 'Payment order created successfully',
      order: razorpayOrder,
    });
  } catch (error) {
    console.error('Create Razorpay order failed:', error);

    res.status(500).json({
      message: error.message || 'Unable to create payment order',
    });
  }
});

// VERIFY RAZORPAY PAYMENT
router.post('/verify', async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      onlinePaymentMethod,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'Payment verification data is missing',
      });
    }

    // Find our RMA order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'RMA order not found',
      });
    }

    // Make sure this Razorpay order belongs to this RMA order
    if (order.paymentOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: 'Payment order does not match RMA order',
      });
    }

    // Create Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = 'Failed';

      await order.save();

      return res.status(400).json({
        message: 'Payment verification failed',
      });
    }

    // Payment is verified
    order.paymentStatus = 'Paid';
    order.paymentMethod = 'ONLINE';
    order.onlinePaymentMethod = onlinePaymentMethod || null;
    order.paymentId = razorpay_payment_id;
    order.paymentOrderId = razorpay_order_id;
    order.paidAt = new Date();

    await order.save();

    console.log('Payment verified successfully:', order.orderId);

    res.status(200).json({
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);

    res.status(500).json({
      message: error.message || 'Unable to verify payment',
    });
  }
});

module.exports = router;
