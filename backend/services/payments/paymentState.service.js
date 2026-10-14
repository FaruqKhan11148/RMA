const Order = require('../../models/Order');
const PaymentAuditLog = require('../../models/PaymentAuditLog');

const PaymentRefund = require('../../models/PaymentRefund');

async function recordPaymentAudit({
  order,
  actorType,
  actorId = null,
  action,
  previousStatus = null,
  newStatus = null,
  reason = null,
  reference = null,
  metadata = {},
  session = null,
}) {
  const auditEntry = {
    order: order._id,
    orderId: order.orderId,
    actorType,
    actorId,
    action,
    previousStatus,
    newStatus,
    reason,
    reference,
    metadata,
  };

  const options = session ? { session } : {};

  const [entry] = await PaymentAuditLog.create([auditEntry], options);

  return entry;
}

async function getDirectUpiOrder(orderId, session = null) {
  const query = Order.findOne({
    orderId,
    paymentProvider: 'DIRECT_UPI',
    paymentMethod: 'DIRECT_UPI',
  });

  if (session) {
    query.session(session);
  }

  return query;
}

async function validateDirectUpiRefund(
  order,
  amount,
  { session = null, excludeRefundId = null } = {},
) {
  if (!order || order.paymentProvider !== 'DIRECT_UPI') {
    throw new Error('This is not a Direct UPI order');
  }

  if (order.paymentStatus !== 'Paid') {
    throw new Error('Only paid orders can be refunded');
  }

  if (order.ownerPaymentConfirmation?.status !== 'CONFIRMED') {
    throw new Error('Direct UPI payment has not been confirmed');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Refund amount must be greater than zero');
  }

  const payableAmount =
    Math.round(Number(order.customerPayableAmount || order.totalPrice) * 100) /
    100;

  if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
    throw new Error('Invalid original payment amount');
  }

  const refundQuery = {
    order: order._id,
    $or: [{ activeRefund: true }, { status: 'VERIFIED' }],
  };

  if (excludeRefundId) {
    refundQuery._id = { $ne: excludeRefundId };
  }

  let existingRefundsQuery = PaymentRefund.find(refundQuery).select(
    'amount status activeRefund',
  );

  if (session) {
    existingRefundsQuery = existingRefundsQuery.session(session);
  }

  const existingRefunds = await existingRefundsQuery;

  const alreadyRefunded = existingRefunds
    .filter((refund) => refund.status === 'VERIFIED')
    .reduce((total, refund) => total + Number(refund.amount || 0), 0);

  const reservedAmount = existingRefunds
    .filter((refund) => refund.activeRefund && refund.status !== 'VERIFIED')
    .reduce((total, refund) => total + Number(refund.amount || 0), 0);

  const remainingAmount =
    Math.round((payableAmount - alreadyRefunded - reservedAmount) * 100) / 100;

  if (amount > remainingAmount + 0.001) {
    throw new Error(
      `Refund exceeds the remaining refundable amount of ₹${Math.max(0, remainingAmount).toFixed(2)}`,
    );
  }

  return {
    orderId: order.orderId,
    amount: Math.round(amount * 100) / 100,
    remainingAmount,
  };
}

module.exports = {
  recordPaymentAudit,
  getDirectUpiOrder,
  validateDirectUpiRefund,
};
