const Order = require('../../models/Order');
const TestBankAccount = require('../../models/TestBankAccount');

const { runTestSettlement } = require('../testBank/testBankSettlement.service');

function roundAmount(amount) {
  return Number(Number(amount).toFixed(2));
}

async function getTestBankAccounts(order, paymentProvider) {
  const gatewayAccount = await TestBankAccount.findOne({
    accountType: paymentProvider,
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

  if (!gatewayAccount) {
    throw new Error(`Active ${paymentProvider} TestBank account not found`);
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
    gatewayAccount,
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

  // Cashfree orders have a Cashfree order ID; legacy orders use PayU.
  // Keep PayU as the default for existing orders without a Cashfree ID.
  const paymentProvider = order.cashfreeOrderId ? 'CASHFREE' : 'PAYU';

  const { gatewayAccount, rmaAccount, ownerAccount, dpAccount } =
    await getTestBankAccounts(order, paymentProvider);

  // ==========================================================
  // ORDER AMOUNTS
  // ==========================================================

  const productSubtotal = roundAmount(order.subtotal);
  const deliveryCharge = roundAmount(order.deliveryCharge ?? 0);

  const payuFee = roundAmount(order.payuFee ?? 0);
  const payuGst = roundAmount(order.payuGst ?? 0);
  const payuCharges = roundAmount(order.payuCharges ?? 0);

  let customerPayableAmount;

  if (paymentProvider === 'CASHFREE') {
    // Cashfree amount is stored when its payment order is created.
    customerPayableAmount = roundAmount(
      order.cashfreeOrderAmount ?? order.totalPrice,
    );

    if (payuFee !== 0 || payuGst !== 0 || payuCharges !== 0) {
      throw new Error('Cashfree order unexpectedly contains PayU fees or GST');
    }

    const expectedCashfreeAmount = roundAmount(
      productSubtotal + deliveryCharge,
    );

    if (customerPayableAmount !== expectedCashfreeAmount) {
      throw new Error(
        `Cashfree amount mismatch. Expected ₹${expectedCashfreeAmount.toFixed(
          2,
        )}, but order has ₹${customerPayableAmount.toFixed(2)}`,
      );
    }
  } else {
    customerPayableAmount = roundAmount(order.customerPayableAmount);

    if (!Number.isFinite(payuFee) || payuFee <= 0) {
      throw new Error('Invalid PayU fee on order');
    }

    if (!Number.isFinite(payuGst) || payuGst < 0) {
      throw new Error('Invalid PayU GST on order');
    }

    if (!Number.isFinite(payuCharges) || payuCharges <= 0) {
      throw new Error('Invalid PayU charges on order');
    }

    const calculatedPayuCharges = roundAmount(payuFee + payuGst);

    if (calculatedPayuCharges !== payuCharges) {
      throw new Error(
        `PayU charge mismatch. Fee ₹${payuFee.toFixed(
          2,
        )} + GST ₹${payuGst.toFixed(2)} = ₹${calculatedPayuCharges.toFixed(
          2,
        )}, but order has ₹${payuCharges.toFixed(2)}`,
      );
    }

    const calculatedCustomerPayableAmount = roundAmount(
      productSubtotal + deliveryCharge + payuCharges,
    );

    if (calculatedCustomerPayableAmount !== customerPayableAmount) {
      throw new Error(
        `Customer payable amount mismatch. Expected ₹${calculatedCustomerPayableAmount.toFixed(
          2,
        )}, but order has ₹${customerPayableAmount.toFixed(2)}`,
      );
    }
  }

  if (!Number.isFinite(productSubtotal) || productSubtotal <= 0) {
    throw new Error('Invalid order product subtotal');
  }

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    throw new Error('Invalid order delivery charge');
  }

  if (!Number.isFinite(customerPayableAmount) || customerPayableAmount <= 0) {
    throw new Error('Invalid customer payable amount on order');
  }

  // ==========================================================
  // RUN TESTBANK SETTLEMENT
  // ==========================================================

  const settlement = await runTestSettlement({
    orderId: order.orderId,

    paymentProvider,
    gatewayAccountId: gatewayAccount._id,

    // Keep the legacy field populated for schema compatibility.
    payuAccountId: gatewayAccount._id,

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
      paymentProvider,

      ownerId: String(order.ownerId),

      deliveryPersonId: order.deliveryPersonId
        ? String(order.deliveryPersonId)
        : null,

      paymentId: order.paymentId || null,
      paymentOrderId: order.paymentOrderId || null,
      cashfreeOrderId: order.cashfreeOrderId || null,

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
