const Order = require('../../models/Order');
const TestBankAccount = require('../../models/TestBankAccount');

const { runTestSettlement } = require('../testBank/testBankSettlement.service');

async function getTestBankAccounts(order) {
  const payuAccount = await TestBankAccount.findOne({
    accountType: 'PAYU',
    status: 'ACTIVE',
  });

  const rmaAccount = await TestBankAccount.findOne({
    accountType: 'RMA',
    accountNumber: 'RMA-SYSTEM-000001',
    status: 'ACTIVE',
  });

  const ownerAccount = await TestBankAccount.findOne({
    accountType: 'OWNER',
    ownerId: order.ownerId,
    status: 'ACTIVE',
  });

  if (!payuAccount) {
    throw new Error('Active PayU TestBank account not found');
  }

  if (!rmaAccount) {
    throw new Error('Active RMA TestBank account not found');
  }

  if (!ownerAccount) {
    throw new Error(
      `Active TestBank owner account not found for owner ${order.ownerId}`,
    );
  }

  let dpAccount = null;

  if (order.orderType === 'delivery') {
    if (!order.deliveryPersonId) {
      throw new Error(
        'Delivery person is required before delivery order settlement',
      );
    }

    dpAccount = await TestBankAccount.findOne({
      accountType: 'DELIVERY_PARTNER',
      deliveryPersonId: order.deliveryPersonId,
      status: 'ACTIVE',
    });

    if (!dpAccount) {
      throw new Error(
        `Active TestBank delivery partner account not found for delivery person ${order.deliveryPersonId}`,
      );
    }
  }

  return {
    payuAccount,
    rmaAccount,
    ownerAccount,
    dpAccount,
  };
}

async function settleCompletedOrder(orderId) {
  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus !== 'Paid') {
    throw new Error('Order payment is not completed');
  }

  if (order.status !== 'Completed') {
    throw new Error('Order must be completed before settlement');
  }

  if (order.settlementStatus === 'Settled') {
    return {
      alreadySettled: true,
      order,
    };
  }

  if (!['Pending', 'Processing', 'Failed'].includes(order.settlementStatus)) {
    throw new Error(
      `Order cannot be settled from ${order.settlementStatus} status`,
    );
  }

  const { payuAccount, rmaAccount, ownerAccount, dpAccount } =
    await getTestBankAccounts(order);

  // ==========================================================
  // ORDER AMOUNTS
  // ==========================================================

  const productSubtotal = Number(order.subtotal);
  const deliveryCharge = Number(order.deliveryCharge || 0);

  // Actual PayU fee before GST
  const payuFee = Number(order.payuFee);

  // GST charged on PayU fee
  const payuGst = Number(order.payuGst);

  // Total PayU gateway charges = fee + GST
  const payuCharges = Number(order.payuCharges);

  // Exact amount customer paid to PayU
  const customerPayableAmount = Number(order.customerPayableAmount);

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!Number.isFinite(productSubtotal) || productSubtotal <= 0) {
    throw new Error('Invalid order product subtotal');
  }

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    throw new Error('Invalid order delivery charge');
  }

  if (!Number.isFinite(payuFee) || payuFee <= 0) {
    throw new Error('Invalid PayU fee on order');
  }

  if (!Number.isFinite(payuGst) || payuGst < 0) {
    throw new Error('Invalid PayU GST on order');
  }

  if (!Number.isFinite(payuCharges) || payuCharges <= 0) {
    throw new Error('Invalid PayU charges on order');
  }

  if (!Number.isFinite(customerPayableAmount) || customerPayableAmount <= 0) {
    throw new Error('Invalid customer payable amount on order');
  }

  // ==========================================================
  // VERIFY PAYU CHARGE MATH
  // ==========================================================

  const calculatedPayuCharges = Number((payuFee + payuGst).toFixed(2));

  if (calculatedPayuCharges !== Number(payuCharges.toFixed(2))) {
    throw new Error(
      `PayU charge mismatch. Fee ₹${payuFee.toFixed(
        2,
      )} + GST ₹${payuGst.toFixed(2)} = ₹${calculatedPayuCharges.toFixed(
        2,
      )}, but order has ₹${payuCharges.toFixed(2)}`,
    );
  }

  // ==========================================================
  // VERIFY CUSTOMER PAYMENT
  // ==========================================================

  const calculatedCustomerPayableAmount = Number(
    (productSubtotal + deliveryCharge + payuCharges).toFixed(2),
  );

  if (
    calculatedCustomerPayableAmount !== Number(customerPayableAmount.toFixed(2))
  ) {
    throw new Error(
      `Customer payable amount mismatch. Expected ₹${calculatedCustomerPayableAmount.toFixed(
        2,
      )}, but order has ₹${customerPayableAmount.toFixed(2)}`,
    );
  }

  // ==========================================================
  // RUN TESTBANK SETTLEMENT
  // ==========================================================

  const settlement = await runTestSettlement({
    orderId: order.orderId,

    payuAccountId: payuAccount._id,
    ownerAccountId: ownerAccount._id,
    rmaAccountId: rmaAccount._id,
    dpAccountId: dpAccount?._id || null,

    productSubtotal,
    deliveryCharge,

    payuFee,
    payuGst,
    payuCharges,

    customerPayableAmount,

    metadata: {
      source: 'RMA_ORDER_SETTLEMENT',

      ownerId: String(order.ownerId),

      deliveryPersonId: order.deliveryPersonId
        ? String(order.deliveryPersonId)
        : null,

      paymentId: order.paymentId || null,

      paymentOrderId: order.paymentOrderId || null,

      baseAmount: Number(order.totalPrice),
    },
  });

  // ==========================================================
  // MARK ORDER SETTLED
  // ==========================================================

  order.settlementStatus = 'Settled';
  order.settledAt = new Date();

  await order.save();

  return {
    alreadySettled: false,
    order,
    settlement,
  };
}

module.exports = {
  settleCompletedOrder,
};
