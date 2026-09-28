const Order = require('../../../models/Order');

const {
  PAYU_PAYMENT_URL,
  BACKEND_URL,
  generatePayUHash,
} = require('../helpers/payu.helper');

// CREATE PAYU PAYMENT
async function createPayUPayment(req, res) {
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

    const customerEmail = 'customer@rma.app';

    const customerPhone = order.customer?.phone?.trim() || '';

    if (!customerName) {
      return res.status(400).json({
        message: 'Customer name is required for PayU payment',
      });
    }

    if (!customerPhone) {
      return res.status(400).json({
        message: 'Customer phone is required for PayU payment',
      });
    }

    // FINAL CUSTOMER PAYABLE AMOUNT
    // totalPrice = product subtotal + delivery charge
    // PayU fee = 2% of totalPrice
    // GST = 18% of PayU fee

    const baseAmount = Number(order.totalPrice);

    const payuFee = Number((baseAmount * 0.02).toFixed(2));

    const payuGst = Number((payuFee * 0.18).toFixed(2));

    const payuCharges = Number((payuFee + payuGst).toFixed(2));

    const customerPayableAmount = Number((baseAmount + payuCharges).toFixed(2));

    // Save PayU accounting values to the order.
    order.payuFee = payuFee;
    order.payuGst = payuGst;
    order.payuCharges = payuCharges;
    order.customerPayableAmount = customerPayableAmount;

    // PayU must receive the FINAL amount charged to customer.
    const amount = customerPayableAmount.toFixed(2);

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

    console.log('PayU Payment Created:', {
      orderId: order.orderId,
      txnid,

      baseAmount,
      payuFee,
      payuGst,
      payuCharges,
      customerPayableAmount,

      amount,
      paymentUrl: PAYU_PAYMENT_URL,
    });

    return res.status(201).json({
      message: 'PayU payment created successfully',

      paymentUrl: PAYU_PAYMENT_URL,

      pricing: {
        baseAmount,
        payuFee,
        payuGst,
        payuCharges,
        customerPayableAmount,
      },

      payment: {
        key: process.env.PAYU_MERCHANT_KEY,
        txnid,
        amount,
        productinfo,
        firstname: customerName,
        email: customerEmail,
        phone: customerPhone,

        surl: `${BACKEND_URL}/api/payments/payu/success`,

        furl: `${BACKEND_URL}/api/payments/payu/failure`,

        hash,
      },
    });
  } catch (error) {
    console.error('Create PayU payment failed:', error);

    return res.status(500).json({
      message: error.message || 'Unable to create PayU payment',
    });
  }
}

module.exports = {
  createPayUPayment,
};
