const Order = require('../../../models/Order');
const { cashfree } = require('../helpers/cashfree.helper');
const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const CASHFREE_API_VERSION = '2023-08-01';

async function handleCashfreeWebhook(req, res) {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody;

    if (!signature || !timestamp || !rawBody) {
      return res.status(400).json({
        message: 'Missing Cashfree webhook signature, timestamp, or raw body',
      });
    }

    // Verify that Cashfree signed the exact raw request body.
    let isValidSignature;

    try {
      isValidSignature = cashfree.PGVerifyWebhookSignature(
        signature,
        rawBody,
        timestamp,
      );
    } catch (error) {
      console.error(
        'Cashfree webhook signature verification failed:',
        error.message,
      );

      return res.status(401).json({
        message: 'Invalid Cashfree webhook signature',
      });
    }

    if (!isValidSignature) {
      return res.status(401).json({
        message: 'Invalid Cashfree webhook signature',
      });
    }

    const event = JSON.parse(rawBody);

    const cashfreeOrderId = event?.data?.order?.order_id;

    if (!cashfreeOrderId) {
      return res.status(400).json({
        message: 'Cashfree order ID is missing from webhook',
      });
    }

    // Find only the RMA order associated with this Cashfree order.
    const order = await Order.findOne({
      cashfreeOrderId,
    });

    if (!order) {
      console.error('RMA order not found for Cashfree order:', cashfreeOrderId);

      // Acknowledge a verified but unmatched event to avoid endless retries.
      return res.status(200).json({
        received: true,
        processed: false,
        message: 'No matching RMA order found',
      });
    }

    // Never mark an order paid based only on webhook payload data.
    // Confirm the order's status directly with Cashfree.
    const orderResponse = await cashfree.PGFetchOrder(
      CASHFREE_API_VERSION,
      cashfreeOrderId,
    );

    const cashfreeOrder = orderResponse?.data;

    if (cashfreeOrder?.order_status !== 'PAID') {
      return res.status(200).json({
        received: true,
        processed: false,
        message: 'Cashfree order is not paid',
      });
    }

    const expectedAmount = Number(order.cashfreeOrderAmount);
    const providerAmount = Number(cashfreeOrder.order_amount);

    if (
      !Number.isFinite(expectedAmount) ||
      !Number.isFinite(providerAmount) ||
      expectedAmount <= 0 ||
      Math.abs(expectedAmount - providerAmount) > 0.001 ||
      cashfreeOrder.order_currency !== 'INR'
    ) {
      console.error('Cashfree order amount/currency mismatch:', {
        orderId: order.orderId,
        expectedAmount,
        providerAmount,
        currency: cashfreeOrder.order_currency,
      });

      return res.status(400).json({
        message: 'Cashfree order amount or currency mismatch',
      });
    }

    // Confirm a successful payment record with Cashfree too.
    const paymentsResponse = await cashfree.PGOrderFetchPayments(
      CASHFREE_API_VERSION,
      cashfreeOrderId,
    );

    const payments = Array.isArray(paymentsResponse?.data)
      ? paymentsResponse.data
      : [];

    const successfulPayment = payments.find(
      (payment) =>
        payment.payment_status === 'SUCCESS' &&
        Number(payment.payment_amount) === expectedAmount,
    );

    if (!successfulPayment) {
      return res.status(200).json({
        received: true,
        processed: false,
        message: 'No matching successful Cashfree payment found',
      });
    }

    // Idempotency: do not repeat payment side effects for an already-paid order.
    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        received: true,
        processed: true,
        alreadyPaid: true,
      });
    }

    if (order.paymentMethod !== 'ONLINE') {
      console.error(
        'Cashfree payment received for a non-online RMA order:',
        order.orderId,
      );

      return res.status(409).json({
        message: 'RMA order is not configured for online payment',
      });
    }

    if (order.status === 'Rejected' || order.cancelledAt) {
      console.error(
        'Cashfree payment received for a rejected/cancelled order:',
        order.orderId,
      );

      // Do not silently mark a cancelled order as paid.
      // Handle refund/reconciliation separately.
      return res.status(409).json({
        message:
          'Order is cancelled or rejected; manual reconciliation is required',
      });
    }

    order.paymentStatus = 'Paid';
    order.paymentMethod = 'ONLINE';
    order.paymentId = String(successfulPayment.cf_payment_id);
    order.paidAt = new Date();

    // Cashfree settlement accounting must be implemented separately.
    // Do not send this order through the existing PayU-specific settlement flow.
    order.settlementStatus = 'NotRequired';

    await order.save();

    console.log('Cashfree payment verified for RMA order:', order.orderId);

    // Notify the shop owner after the payment is verified and saved.
    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: order.ownerId,
        type: 'NEW_ORDER',
        title: 'New Order',
        message: `You have received a new order ${order.orderId}.`,
        orderId: order.orderId,
        data: {
          screen: 'owner-dashboard',
          orderId: order.orderId,
        },
      });
    } catch (notificationError) {
      console.error(
        'Cashfree owner new order notification failed:',
        notificationError,
      );
    }

    return res.status(200).json({
      received: true,
      processed: true,
      orderId: order.orderId,
      paymentStatus: 'Paid',
    });
  } catch (error) {
    console.error(
      'Cashfree webhook processing failed:',
      error.response?.data || error.message,
    );

    // A 5xx response allows Cashfree to retry transient processing failures.
    return res.status(500).json({
      message: 'Cashfree webhook processing failed',
    });
  }
}

module.exports = { handleCashfreeWebhook };
