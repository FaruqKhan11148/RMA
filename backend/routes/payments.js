const express = require('express');
const crypto = require('crypto');

const Order = require('../models/Order');

const router = express.Router();

// PayU sends success/failure callbacks as
// application/x-www-form-urlencoded.
router.use(express.urlencoded({ extended: false }));

const PAYU_PAYMENT_URL =
  process.env.PAYU_ENV === 'live'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ---------------------------------------------------------
// PAYU HASH HELPER
// ---------------------------------------------------------

function generatePayUHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
}) {
  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|` +
    `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||` +
    `${process.env.PAYU_SALT}`;

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// ---------------------------------------------------------
// PAYU RESPONSE HASH VERIFICATION
// ---------------------------------------------------------

function generatePayUResponseHash(data) {
  const {
    additionalCharges,
    additional_charges,
    status,
    udf5 = '',
    udf4 = '',
    udf3 = '',
    udf2 = '',
    udf1 = '',
    email = '',
    firstname = '',
    productinfo = '',
    amount = '',
    txnid = '',
    key = '',
  } = data;

  const extraCharges = additionalCharges || additional_charges || '';

  let hashString;

  if (extraCharges) {
    hashString =
      `${extraCharges}|${process.env.PAYU_SALT}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|` +
      `${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString =
      `${process.env.PAYU_SALT}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|` +
      `${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// ---------------------------------------------------------
// CONSTANT-TIME HASH COMPARISON
// ---------------------------------------------------------

function hashesMatch(hash1, hash2) {
  if (!hash1 || !hash2) {
    return false;
  }

  const first = Buffer.from(hash1, 'utf8');
  const second = Buffer.from(hash2, 'utf8');

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

// ---------------------------------------------------------
// OWNER PAYU ONBOARDING
// ---------------------------------------------------------
//
// We are intentionally NOT implementing marketplace/owner
// onboarding yet.
//
// That requires the PayU aggregator/marketplace setup to be
// activated for RMA first.
//
// ---------------------------------------------------------

router.post('/onboard-owner', async (req, res) => {
  return res.status(501).json({
    message:
      'PayU owner marketplace onboarding will be implemented after PayU aggregator/split settlement activation.',
  });
});

// ---------------------------------------------------------
// CREATE PAYU PAYMENT
// ---------------------------------------------------------

router.post('/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: 'RMA orderId is required',
      });
    }

    if (!process.env.PAYU_MERCHANT_KEY) {
      return res.status(500).json({
        message: 'PAYU_MERCHANT_KEY is not configured',
      });
    }

    if (!process.env.PAYU_SALT) {
      return res.status(500).json({
        message: 'PAYU_SALT is not configured',
      });
    }

    // Find our RMA order.
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'RMA order not found',
      });
    }

    // Only ONLINE orders can use PayU.
    if (order.paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        message: 'This order is not an online payment order',
      });
    }

    // Customer information.
    const customerName = order.customer?.name?.trim();

    const customerEmail = order.customer?.email?.trim() || '';

    const customerPhone = order.customer?.phone?.trim() || '';

    if (!customerName) {
      return res.status(400).json({
        message: 'Customer name is required for PayU payment',
      });
    }

    // if (!customerEmail) {
    //   return res.status(400).json({
    //     message: 'Customer email is required for PayU payment',
    //   });
    // }

    if (!customerPhone) {
      return res.status(400).json({
        message: 'Customer phone is required for PayU payment',
      });
    }

    // Backend-calculated final customer payable amount.
    const amount = Number(order.totalPrice).toFixed(2);

    // Generate a unique PayU transaction ID.
    const txnid = `RMA-PAY-${order.orderId}-${Date.now()}`;

    const productinfo = `RMA Order ${order.orderId}`;

    // Generate PayU request hash.
    const hash = generatePayUHash({
      key: process.env.PAYU_MERCHANT_KEY,
      txnid,
      amount,
      productinfo,
      firstname: customerName,
      email: customerEmail,
    });

    // Save PayU transaction ID in our RMA order.
    order.paymentOrderId = txnid;

    await order.save();

    console.log('PayU Test Payment Created:', {
      orderId: order.orderId,
      txnid,
      amount,
      paymentUrl: PAYU_PAYMENT_URL,
    });

    // Return everything required by the frontend to create
    // an HTML form and POST it to PayU.
    return res.status(201).json({
      message: 'PayU payment created successfully',

      paymentUrl: PAYU_PAYMENT_URL,

      payment: {
        key: process.env.PAYU_MERCHANT_KEY,
        txnid,
        amount,
        productinfo,
        firstname: customerName,
        email: customerEmail,
        phone: customerPhone,

        surl: `${FRONTEND_URL}/api/payments/payu/success`,

        furl: `${FRONTEND_URL}/api/payments/payu/failure`,

        hash,
      },
    });
  } catch (error) {
    console.error('Create PayU payment failed:', error);

    return res.status(500).json({
      message: error.message || 'Unable to create PayU payment',
    });
  }
});

// ---------------------------------------------------------
// PAYU SUCCESS CALLBACK
// ---------------------------------------------------------

router.post('/payu/success', async (req, res) => {
  try {
    console.log('PayU SUCCESS CALLBACK:', req.body);

    const data = req.body;

    const { txnid, mihpayid, status, hash, amount, key } = data;

    if (!txnid || !hash || !key) {
      return res.status(400).send('Invalid PayU success response');
    }

    // Make sure the callback belongs to our PayU merchant.
    if (key !== process.env.PAYU_MERCHANT_KEY) {
      return res.status(400).send('Invalid PayU merchant key');
    }

    // Find our RMA order using the PayU transaction ID.
    const order = await Order.findOne({
      paymentOrderId: txnid,
    });

    if (!order) {
      return res.status(404).send('RMA order not found');
    }

    // Verify PayU's response hash BEFORE trusting the response.
    const generatedHash = generatePayUResponseHash(data);

    if (!hashesMatch(generatedHash, hash)) {
      console.error('PayU response hash verification failed:', {
        orderId: order.orderId,
        txnid,
      });

      order.paymentStatus = 'Failed';

      await order.save();

      return res.status(400).send('PayU payment verification failed');
    }

    // PayU says success.
    if (status !== 'success') {
      order.paymentStatus = 'Failed';

      await order.save();

      return res.redirect(`${FRONTEND_URL}/payment-failed/${order.orderId}`);
    }

    // Extra protection:
    // make sure PayU returned the same amount that our
    // backend originally calculated.
    const expectedAmount = Number(order.totalPrice).toFixed(2);

    const returnedAmount = Number(amount).toFixed(2);

    if (expectedAmount !== returnedAmount) {
      console.error('PayU amount mismatch:', {
        orderId: order.orderId,
        expectedAmount,
        returnedAmount,
      });

      order.paymentStatus = 'Failed';

      await order.save();

      return res.status(400).send('Payment amount mismatch');
    }

    order.paymentStatus = 'Paid';
    order.paymentMethod = 'ONLINE';

    let onlinePaymentMethod = null;

    switch (data.mode) {
      case 'CC':
      case 'DC':
        onlinePaymentMethod = 'CARD';
        break;

      case 'NB':
        onlinePaymentMethod = 'NETBANKING';
        break;

      case 'UPI':
        onlinePaymentMethod = 'UPI';
        break;

      default:
        onlinePaymentMethod = data.mode || null;
    }

    order.onlinePaymentMethod = onlinePaymentMethod;

    order.paymentId = data.mihpayid;
    order.paymentOrderId = data.txnid;
    order.paidAt = new Date();

    // Payment is successful, but owner has not accepted yet.
    // Therefore the settlement is still pending.
    order.settlementStatus = 'Pending';

    // A successful payment does not need a refund yet.
    order.refundStatus = 'NotRequired';
    order.refundAmount = 0;
    order.refundId = null;
    order.refundInitiatedAt = null;
    order.refundCompletedAt = null;

    await order.save();

    console.log('PayU payment verified successfully:', order.orderId);

    return res.redirect(`${FRONTEND_URL}/delivery-status/${order.orderId}`);
  } catch (error) {
    console.error('PayU success callback failed:', error);

    return res.status(500).send('Unable to process PayU payment response');
  }
});

// ---------------------------------------------------------
// PAYU FAILURE CALLBACK
// ---------------------------------------------------------

router.post('/payu/failure', async (req, res) => {
  try {
    console.log('PayU FAILURE CALLBACK:', req.body);

    const data = req.body;

    const { txnid, hash, key } = data;

    if (!txnid || !hash || !key) {
      return res.status(400).send('Invalid PayU failure response');
    }

    if (key !== process.env.PAYU_MERCHANT_KEY) {
      return res.status(400).send('Invalid PayU merchant key');
    }

    const order = await Order.findOne({
      paymentOrderId: txnid,
    });

    if (!order) {
      return res.status(404).send('RMA order not found');
    }

    // Verify the response even for failed transactions.
    const generatedHash = generatePayUResponseHash(data);

    if (!hashesMatch(generatedHash, hash)) {
      console.error('PayU failure response hash verification failed:', {
        orderId: order.orderId,
        txnid,
      });

      return res.status(400).send('PayU response verification failed');
    }

    order.paymentStatus = 'Failed';

    order.settlementStatus = 'NotRequired';

    order.refundStatus = 'NotRequired';
    order.refundAmount = 0;
    order.refundId = null;
    order.refundInitiatedAt = null;
    order.refundCompletedAt = null;

    await order.save();

    console.log('PayU payment failed:', order.orderId);

    return res.redirect(`${FRONTEND_URL}/payment-failed/${order.orderId}`);
  } catch (error) {
    console.error('PayU failure callback failed:', error);

    return res.status(500).send('Unable to process PayU failure response');
  }
});

// ---------------------------------------------------------
// PAYU REFUND STATUS CALLBACK
// ---------------------------------------------------------

router.post('/payu/refund-callback', async (req, res) => {
  try {
    console.log('========== PAYU REFUND CALLBACK ==========');
    console.log(req.body);
    console.log('===========================================');

    const data = req.body;

    const {
      status,
      key,
      mihpayid,
      request_id,
      merchantTxnId,
      amt,
      bank_ref_num,
      bank_arn,
    } = data;

    if (!key || key !== process.env.PAYU_MERCHANT_KEY) {
      return res.status(400).send('Invalid PayU merchant key');
    }

    if (!request_id && !mihpayid && !merchantTxnId) {
      return res.status(400).send('Refund transaction information missing');
    }

    let order = null;

    // First try our RMA orderId from merchantTxnId.
    if (merchantTxnId) {
      order = await Order.findOne({
        orderId: merchantTxnId,
      });
    }

    // If not found, try PayU transaction ID.
    if (!order && mihpayid) {
      order = await Order.findOne({
        paymentId: String(mihpayid).trim(),
      });
    }

    if (!order) {
      console.error('Refund callback: RMA order not found', {
        merchantTxnId,
        mihpayid,
        request_id,
      });

      return res.status(404).send('RMA order not found');
    }

    if (status === 'success') {
      order.refundStatus = 'Completed';
      order.paymentStatus = 'Refunded';

      order.refundCompletedAt = new Date();

      if (request_id) {
        order.refundId = String(request_id);
      }

      if (amt) {
        order.refundAmount = Number(amt);
      }

      order.settlementStatus = 'NotRequired';

      await order.save();

      console.log('PayU refund completed:', {
        orderId: order.orderId,
        refundId: order.refundId,
        refundAmount: order.refundAmount,
        bankRefNum: bank_ref_num,
        bankArn: bank_arn,
      });

      return res.status(200).send('Refund callback processed');
    }

    if (status === 'failure') {
      order.refundStatus = 'Failed';

      if (request_id) {
        order.refundId = String(request_id);
      }

      await order.save();

      console.error('PayU refund failed:', {
        orderId: order.orderId,
        refundId: order.refundId,
      });

      return res.status(200).send('Refund failure processed');
    }

    console.log('PayU refund callback has unknown status:', status);

    return res.status(200).send('Refund callback received');
  } catch (error) {
    console.error('PayU refund callback failed:', error);

    return res.status(500).send('Unable to process refund callback');
  }
});

module.exports = router;
