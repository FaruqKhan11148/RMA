const Order = require('../../../models/Order');
const {
  recordCustomerPayment,
} = require('../../../services/testBank/testBankSettlement.service');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const {
  FRONTEND_URL,
  generatePayUResponseHash,
  hashesMatch,
} = require('../helpers/payu.helper');

// ---------------------------------------------------------
// PAYU SUCCESS CALLBACK
// ---------------------------------------------------------

async function handlePayUSuccess(req, res) {
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
    const expectedAmount = Number(
      order.customerPayableAmount || order.totalPrice,
    ).toFixed(2);

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

    const wasAlreadyPaid = order.paymentStatus === 'Paid';

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

    // ---------------------------------------------------------
    // RECORD CUSTOMER PAYMENT IN TESTBANK
    // ---------------------------------------------------------
    //
    // PayU payment is now verified and actually successful.
    // Record the full amount paid by the customer in the
    // PayU TestBank account.
    //
    // IMPORTANT:
    // This does NOT settle Owner / RMA / DP yet.
    // That happens later when the order is completed.
    // ---------------------------------------------------------

    try {
      const TestBankAccount = require('../../../models/TestBankAccount');

      const payuAccount = await TestBankAccount.findOne({
        accountType: 'PAYU',
        status: 'ACTIVE',
      });

      if (!payuAccount) {
        throw new Error('Active PayU TestBank account not found');
      }

      const customerPaymentAmount = Number(order.customerPayableAmount);

      if (
        !Number.isFinite(customerPaymentAmount) ||
        customerPaymentAmount <= 0
      ) {
        throw new Error(`Invalid customer payable amount for ${order.orderId}`);
      }

      await recordCustomerPayment({
        orderId: order.orderId,
        payuAccountId: payuAccount._id,
        amount: customerPaymentAmount,
        metadata: {
          paymentId: data.mihpayid,
          paymentOrderId: data.txnid,
          baseAmount: order.totalPrice,
          payuFee: order.payuFee,
          payuGst: order.payuGst,
          payuCharges: order.payuCharges,
          customerPayableAmount: order.customerPayableAmount,
        },
      });

      console.log('TestBank customer payment recorded:', {
        orderId: order.orderId,
        amount: customerPaymentAmount,
        payuAccount: payuAccount.accountNumber,
      });
    } catch (testBankError) {
      console.error(
        `TestBank customer payment recording failed for ${order.orderId}:`,
        testBankError,
      );
    }

    if (!wasAlreadyPaid) {
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
          'Owner new order notification failed:',
          notificationError,
        );
      }
    }

    console.log('PayU payment verified successfully:', order.orderId);

    return res.redirect(`${FRONTEND_URL}/delivery-status/${order.orderId}`);
  } catch (error) {
    console.error('PayU success callback failed:', error);

    return res.status(500).send('Unable to process PayU payment response');
  }
}

// ---------------------------------------------------------
// PAYU FAILURE CALLBACK
// ---------------------------------------------------------

async function handlePayUFailure(req, res) {
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
}

// ---------------------------------------------------------
// PAYU REFUND STATUS CALLBACK
// ---------------------------------------------------------

async function handlePayURefundCallback(req, res) {
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
}

module.exports = {
  handlePayUSuccess,
  handlePayUFailure,
  handlePayURefundCallback,
};
