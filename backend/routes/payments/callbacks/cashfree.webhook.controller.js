const Order = require('../../../models/Order');
const TestBankAccount = require('../../../models/TestBankAccount');

const { cashfree } = require('../helpers/cashfree.helper');

const {
  recordCustomerPayment,
} = require('../../../services/testBank/testBankSettlement.service');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const CASHFREE_API_VERSION = '2023-08-01';

const DEBUG = '[CF WEBHOOK]';

const toPaise = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
};

async function handleCashfreeWebhook(req, res) {
  const startedAt = Date.now();

  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const rawBody = req.rawBody;

  console.log(`${DEBUG} [1] Request received`, {
    method: req.method,
    path: req.originalUrl,
    contentType: req.headers['content-type'],
    hasSignature: Boolean(signature),
    hasTimestamp: Boolean(timestamp),
    hasRawBody: Boolean(rawBody),
    rawBodyType: rawBody?.constructor?.name,
    rawBodyLength: rawBody?.length,
  });

  console.log('[CF WEBHOOK] Header/body check:', {
    hasSignature: Boolean(signature),
    hasTimestamp: Boolean(timestamp),
    hasRawBody: Boolean(rawBody),
    rawBodyType: typeof rawBody,
    rawBodyLength: rawBody?.length ?? 0,
  });

  if (!signature || !timestamp || !rawBody) {
    console.error(`${DEBUG} [ERROR 1] Missing webhook verification data`, {
      hasSignature: Boolean(signature),
      hasTimestamp: Boolean(timestamp),
      hasRawBody: Boolean(rawBody),
    });

    return res.status(400).json({
      message: 'Missing Cashfree webhook signature, timestamp, or raw body',
    });
  }

  let event;

  // STEP 2: Verify webhook signature and parse event.
  try {
    console.log(`${DEBUG} [2] Verifying webhook signature`);

    const isValidSignature = cashfree.PGVerifyWebhookSignature(
      signature,
      rawBody,
      timestamp,
    );

    console.log(`${DEBUG} [2] Signature verification result`, {
      isValidSignature: Boolean(isValidSignature),
    });

    if (!isValidSignature) {
      console.error(`${DEBUG} [ERROR 2] Invalid webhook signature`);

      return res.status(401).json({
        message: 'Invalid Cashfree webhook signature',
      });
    }

    event = JSON.parse(rawBody.toString('utf8'));

    console.log(`${DEBUG} [3] Event parsed`, {
      eventType: event?.type,
      eventTime: event?.event_time,
      cashfreeOrderId: event?.data?.order?.order_id,
      paymentStatus: event?.data?.payment?.payment_status,
    });
  } catch (error) {
    console.error(
      `${DEBUG} [ERROR 2] Signature verification or JSON parsing failed`,
      {
        message: error.message,
        stack: error.stack,
      },
    );

    return res.status(401).json({
      message: 'Invalid Cashfree webhook signature or payload',
    });
  }

  const cashfreeOrderId = event?.data?.order?.order_id;

  if (!cashfreeOrderId) {
    console.error(`${DEBUG} [ERROR 3] Missing Cashfree order ID`, {
      eventType: event?.type,
      hasData: Boolean(event?.data),
    });

    return res.status(400).json({
      message: 'Cashfree order ID is missing from webhook',
    });
  }

  try {
    // STEP 4: Find RMA order.
    console.log(`${DEBUG} [4] Searching for RMA order`, {
      cashfreeOrderId,
    });

    const order = await Order.findOne({ cashfreeOrderId });

    console.log(`${DEBUG} [4] RMA order lookup result`, {
      found: Boolean(order),
      orderId: order?.orderId,
      paymentStatus: order?.paymentStatus,
      paymentMethod: order?.paymentMethod,
      orderStatus: order?.status,
      cashfreeOrderAmount: order?.cashfreeOrderAmount,
      totalPrice: order?.totalPrice,
    });

    if (!order) {
      console.error(`${DEBUG} [ERROR 4] RMA order not found`, {
        cashfreeOrderId,
      });

      return res.status(200).json({
        received: true,
        processed: false,
        message: 'No matching RMA order found',
      });
    }

    if (order.paymentMethod !== 'ONLINE') {
      console.error(
        `${DEBUG} [STOP 4] Order is not configured for online payment`,
        {
          orderId: order.orderId,
          paymentMethod: order.paymentMethod,
        },
      );

      return res.status(200).json({
        received: true,
        processed: false,
        message: 'Order is not configured for online payment',
      });
    }

    if (order.status === 'Rejected' || order.cancelledAt) {
      console.error(
        `${DEBUG} [STOP 4] Cancelled/rejected order needs reconciliation`,
        {
          orderId: order.orderId,
          status: order.status,
          cancelledAt: order.cancelledAt,
        },
      );

      return res.status(200).json({
        received: true,
        processed: false,
        message: 'Cancelled order requires payment reconciliation',
      });
    }

    // STEP 5: Verify actual provider order status.
    console.log(`${DEBUG} [5] Fetching order status from Cashfree`, {
      orderId: order.orderId,
      cashfreeOrderId,
      apiVersion: CASHFREE_API_VERSION,
    });

    console.log('[CF WEBHOOK] Fetching Cashfree order with:', {
      environment: (process.env.CASHFREE_ENV || 'sandbox').toLowerCase(),
      cashfreeOrderId,
      apiVersion: CASHFREE_API_VERSION,
    });

    let orderResponse;

    try {
      orderResponse = await cashfree.PGFetchOrder(
        CASHFREE_API_VERSION,
        cashfreeOrderId,
      );
    } catch (error) {
      console.error('[CF WEBHOOK] Cashfree order fetch failed:', {
        environment: (process.env.CASHFREE_ENV || 'sandbox').toLowerCase(),
        appIdPrefix: process.env.CASHFREE_APP_ID?.slice(0, 8),
        cashfreeOrderId,
        apiVersion: CASHFREE_API_VERSION,
        providerStatus: error.response?.status,
        providerError: error.response?.data,
      });

      throw error;
    }

    const cashfreeOrder = orderResponse?.data;

    const cashfreeOrder = orderResponse?.data;

    console.log(`${DEBUG} [5] Cashfree order response`, {
      hasResponse: Boolean(orderResponse),
      hasData: Boolean(cashfreeOrder),
      orderStatus: cashfreeOrder?.order_status,
      orderAmount: cashfreeOrder?.order_amount,
      currency: cashfreeOrder?.order_currency,
    });

    if (cashfreeOrder?.order_status !== 'PAID') {
      console.warn(`${DEBUG} [STOP 5] Cashfree order is not PAID`, {
        orderId: order.orderId,
        providerStatus: cashfreeOrder?.order_status,
      });

      return res.status(200).json({
        received: true,
        processed: false,
        message: 'Cashfree order is not paid',
      });
    }

    // STEP 6: Validate amount and currency.
    const expectedPaise = toPaise(order.cashfreeOrderAmount);
    const providerPaise = toPaise(cashfreeOrder.order_amount);

    console.log(`${DEBUG} [6] Validating amount and currency`, {
      expectedPaise,
      providerPaise,
      expectedAmount: expectedPaise / 100,
      providerAmount: providerPaise / 100,
      currency: cashfreeOrder.order_currency,
    });

    if (
      !Number.isFinite(expectedPaise) ||
      !Number.isFinite(providerPaise) ||
      expectedPaise <= 0 ||
      expectedPaise !== providerPaise ||
      cashfreeOrder.order_currency !== 'INR'
    ) {
      console.error(`${DEBUG} [ERROR 6] Amount/currency mismatch`, {
        orderId: order.orderId,
        expectedPaise,
        providerPaise,
        currency: cashfreeOrder.order_currency,
      });

      return res.status(200).json({
        received: true,
        processed: false,
        message:
          'Cashfree order amount or currency mismatch; reconciliation required',
      });
    }

    // STEP 7: Fetch successful payment details.
    console.log(`${DEBUG} [7] Fetching payments from Cashfree`, {
      cashfreeOrderId,
    });

    const paymentsResponse = await cashfree.PGOrderFetchPayments(
      CASHFREE_API_VERSION,
      cashfreeOrderId,
    );

    const payments = Array.isArray(paymentsResponse?.data)
      ? paymentsResponse.data
      : [];

    console.log(`${DEBUG} [7] Cashfree payment list`, {
      count: payments.length,
      payments: payments.map((payment) => ({
        paymentId: payment.cf_payment_id,
        status: payment.payment_status,
        amount: payment.payment_amount,
        currency: payment.payment_currency,
      })),
    });

    const successfulPayment = payments.find(
      (payment) =>
        payment.payment_status === 'SUCCESS' &&
        toPaise(payment.payment_amount) === expectedPaise &&
        payment.payment_currency === 'INR',
    );

    if (!successfulPayment) {
      console.error(`${DEBUG} [STOP 7] No matching successful payment`, {
        orderId: order.orderId,
        cashfreeOrderId,
        expectedPaise,
        paymentStatuses: payments.map((payment) => ({
          status: payment.payment_status,
          amount: payment.payment_amount,
          currency: payment.payment_currency,
        })),
      });

      return res.status(200).json({
        received: true,
        processed: false,
        message: 'No matching successful Cashfree payment found',
      });
    }

    const paymentAmount = expectedPaise / 100;
    const paymentId = String(successfulPayment.cf_payment_id);

    console.log(`${DEBUG} [8] Successful payment verified`, {
      orderId: order.orderId,
      paymentId,
      paymentAmount,
      currency: successfulPayment.payment_currency,
    });

    // STEP 9: Find active Cashfree TestBank account.
    console.log(`${DEBUG} [9] Searching for active CASHFREE TestBank account`);

    const cashfreeAccount = await TestBankAccount.findOne({
      accountType: 'CASHFREE',
      status: 'ACTIVE',
    });

    console.log(`${DEBUG} [9] TestBank account lookup result`, {
      found: Boolean(cashfreeAccount),
      accountNumber: cashfreeAccount?.accountNumber,
      accountType: cashfreeAccount?.accountType,
      status: cashfreeAccount?.status,
      accountId: cashfreeAccount?._id?.toString(),
    });

    if (!cashfreeAccount) {
      throw new Error('Active CASHFREE TestBank account not found');
    }

    // STEP 10: Record customer payment in TestBank.
    console.log(`${DEBUG} [10] Recording customer payment`, {
      orderId: order.orderId,
      accountNumber: cashfreeAccount.accountNumber,
      paymentAmount,
      paymentId,
      cashfreeOrderId,
    });

    const receiptResult = await recordCustomerPayment({
      orderId: order.orderId,
      payuAccountId: cashfreeAccount._id,
      amount: paymentAmount,
      metadata: {
        provider: 'CASHFREE',
        paymentId,
        cashfreeOrderId,
        baseAmount: order.totalPrice,
        customerPayableAmount: paymentAmount,
      },
    });

    console.log(`${DEBUG} [10] Customer payment recorded`, {
      orderId: order.orderId,
      receiptResult:
        receiptResult && typeof receiptResult === 'object'
          ? {
              success: receiptResult.success,
              alreadyRecorded: receiptResult.alreadyRecorded,
              transactionId: receiptResult.transactionId?.toString?.(),
            }
          : receiptResult,
    });

    // STEP 11: Update order payment fields.
    const wasAlreadyPaid = order.paymentStatus === 'Paid';

    console.log(`${DEBUG} [11] Preparing order update`, {
      orderId: order.orderId,
      wasAlreadyPaid,
      previousPaymentStatus: order.paymentStatus,
      previousPaymentId: order.paymentId,
      previousSettlementStatus: order.settlementStatus,
    });

    order.paymentStatus = 'Paid';
    order.paymentMethod = 'ONLINE';
    order.onlinePaymentMethod = 'CASHFREE';
    order.paymentId = paymentId;

    if (!order.paidAt) {
      order.paidAt = new Date();
    }

    if (order.settlementStatus !== 'Settled') {
      order.settlementStatus = 'Pending';
    }

    if (!order.refundStatus) {
      order.refundStatus = 'NotRequired';
    }

    console.log(`${DEBUG} [11] Saving order to MongoDB`, {
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      settlementStatus: order.settlementStatus,
    });

    await order.save();

    console.log(`${DEBUG} [11] Order saved successfully`, {
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      paidAt: order.paidAt,
      settlementStatus: order.settlementStatus,
    });

    // STEP 12: Send owner notification.
    if (!wasAlreadyPaid) {
      console.log(`${DEBUG} [12] Sending owner notification`, {
        orderId: order.orderId,
        ownerId: order.ownerId?.toString?.() || order.ownerId,
      });

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

        console.log(`${DEBUG} [12] Owner notification completed`, {
          orderId: order.orderId,
        });
      } catch (notificationError) {
        console.error(`${DEBUG} [ERROR 12] Owner notification failed`, {
          orderId: order.orderId,
          message: notificationError.message,
          stack: notificationError.stack,
        });
      }
    } else {
      console.log(
        `${DEBUG} [12] Notification skipped; order was already paid`,
        {
          orderId: order.orderId,
        },
      );
    }

    console.log(`${DEBUG} [SUCCESS] Webhook processing completed`, {
      orderId: order.orderId,
      cashfreeOrderId,
      paymentId,
      amount: paymentAmount,
      durationMs: Date.now() - startedAt,
    });

    return res.status(200).json({
      received: true,
      processed: true,
      orderId: order.orderId,
      paymentStatus: 'Paid',
    });
  } catch (error) {
    console.error(`${DEBUG} [FATAL ERROR] Webhook processing failed`, {
      cashfreeOrderId,
      message: error.message,
      providerStatus: error.response?.status,
      providerError: error.response?.data,
      stack: error.stack,
      durationMs: Date.now() - startedAt,
    });

    return res.status(500).json({
      message: 'Cashfree webhook processing failed',
    });
  }
}

module.exports = { handleCashfreeWebhook };
