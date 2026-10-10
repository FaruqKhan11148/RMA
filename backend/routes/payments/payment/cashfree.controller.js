const crypto = require('crypto');
const Order = require('../../../models/Order');
const { cashfree } = require('../helpers/cashfree.helper');

const FRONTEND_URL = (
  process.env.FRONTEND_URL || 'http://localhost:3000'
).replace(/\/$/, '');

async function createCashfreePayment(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        message: 'A valid RMA orderId is required',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'RMA order not found',
      });
    }

    if (order.paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        message: 'This order is not an online payment order',
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(409).json({
        message: 'This order has already been paid',
      });
    }

    if (['Rejected'].includes(order.status) || order.cancelledAt) {
      return res.status(409).json({
        message: 'Payment is unavailable for this cancelled or rejected order',
      });
    }

    const customerName = order.customer?.name?.trim();
    const customerPhone = order.customer?.phone?.trim();

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        message: 'Customer name and phone are required',
      });
    }

    const baseAmount = Number(order.totalPrice);

    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({
        message: 'Invalid order amount',
      });
    }

    const amount = Number(baseAmount.toFixed(2));

    // Reuse the saved session only after Cashfree confirms
    // that the associated gateway order is still active.
    if (order.cashfreeOrderId && Number(order.cashfreeOrderAmount) === amount) {
      try {
        const existingResponse = await cashfree.PGFetchOrder(
          CASHFREE_API_VERSION,
          order.cashfreeOrderId,
        );

        const existingOrder = existingResponse.data;

        if (
          existingOrder?.order_status === 'ACTIVE' &&
          existingOrder?.payment_session_id
        ) {
          return res.status(200).json({
            message: 'Existing Cashfree payment session reused',
            payment: {
              provider: 'CASHFREE',
              orderId: order.orderId,
              cashfreeOrderId: existingOrder.order_id,
              paymentSessionId: existingOrder.payment_session_id,
              environment:
                process.env.CASHFREE_ENV === 'production'
                  ? 'production'
                  : 'sandbox',
            },
          });
        }

        if (existingOrder?.order_status === 'PAID') {
          return res.status(409).json({
            message:
              'Cashfree reports a payment for this order. Verify payment status before retrying.',
          });
        }
      } catch (error) {
        // Do not silently create a second gateway order when the
        // existing order could not be checked.
        console.error(
          'Unable to verify existing Cashfree order:',
          error.response?.data || error.message,
        );

        return res.status(502).json({
          message:
            'Unable to verify the existing payment session. Please retry shortly.',
        });
      }
    }

    const cfOrderId =
      `rma_${String(order.orderId).replace(/[^a-zA-Z0-9_-]/g, '_')}_` +
      crypto.randomUUID().replace(/-/g, '').slice(0, 12);

    const customerId = `rma_${crypto
      .createHash('sha256')
      .update(String(order.customer.phone || order.orderId))
      .digest('hex')
      .slice(0, 20)}`;

    const request = {
      order_id: cfOrderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName.slice(0, 100),
        customer_email: 'customer@rma.app',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url:
          `${FRONTEND_URL}/delivery-status/${encodeURIComponent(order.orderId)}` +
          '?cashfree_return=1',
      },
      order_note: `RMA Order ${order.orderId}`.slice(0, 200),
    };

    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${order.orderId}:${amount}:${cfOrderId}`)
      .digest('hex');

    const response = await cashfree.PGCreateOrder(
      request,
      undefined,
      idempotencyKey,
    );

    const cfOrder = response.data;

    if (!cfOrder?.payment_session_id || !cfOrder?.order_id) {
      console.error('Cashfree response missing order/session identifiers', {
        orderId: order.orderId,
        cfOrderId,
      });

      return res.status(502).json({
        message: 'Cashfree did not return a valid payment session',
      });
    }

    order.cashfreeOrderId = cfOrder.order_id;
    order.cashfreePaymentSessionId = cfOrder.payment_session_id;
    order.cashfreeOrderAmount = amount;

    await order.save();

    return res.status(201).json({
      message: 'Cashfree payment session created',
      payment: {
        provider: 'CASHFREE',
        orderId: order.orderId,
        cashfreeOrderId: cfOrder.order_id,
        paymentSessionId: cfOrder.payment_session_id,
        environment:
          process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
      },
    });
  } catch (error) {
    console.error('Create Cashfree payment failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });

    return res.status(500).json({
      message: 'Unable to create Cashfree payment',
    });
  }
}

module.exports = {
  createCashfreePayment,
};
