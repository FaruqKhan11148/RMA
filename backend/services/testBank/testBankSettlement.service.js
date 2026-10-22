const TestBankSettlement = require('../../models/TestBankSettlement');

const {
  receiveCustomerPayment,
  settleOwnerAmount,
  creditRmaFee,
  holdDeliveryEarning,
  recordPayUFeeLiability,
} = require('./testBankLedger.service');

function roundAmount(amount) {
  return Number(Number(amount).toFixed(2));
}

function validateAmount(amount, fieldName) {
  const value = roundAmount(amount);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be zero or greater`);
  }

  return value;
}

function requirePositiveAmount(amount, fieldName) {
  const value = validateAmount(amount, fieldName);

  if (value <= 0) {
    throw new Error(`${fieldName} must be greater than zero`);
  }

  return value;
}

function normalizeProvider(provider = 'PAYU') {
  const normalized = String(provider).trim().toUpperCase();

  if (!['PAYU', 'CASHFREE'].includes(normalized)) {
    throw new Error(`Unsupported payment provider: ${normalized}`);
  }

  return normalized;
}

async function recordCustomerPayment({
  orderId,
  payuAccountId,
  gatewayAccountId,
  amount,
  metadata = {},
}) {
  if (!orderId || !String(orderId).trim()) {
    throw new Error('orderId is required');
  }

  const normalizedOrderId = String(orderId).trim();
  const paymentAmount = requirePositiveAmount(amount, 'amount');
  const accountId = gatewayAccountId || payuAccountId;

  if (!accountId) {
    throw new Error('gatewayAccountId is required');
  }

  const TestBankTransaction = require('../../models/TestBankTransaction');

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'ORDER_PAYMENT',
    referenceType: 'ORDER',
    referenceId: normalizedOrderId,
  });

  if (existingTransaction) {
    if (existingTransaction.status !== 'COMPLETED') {
      throw new Error(
        `Existing customer payment transaction for ${normalizedOrderId} is not completed`,
      );
    }

    const existingAmount = roundAmount(existingTransaction.amount);

    if (Number.isFinite(existingAmount) && existingAmount !== paymentAmount) {
      throw new Error(
        `Existing customer payment amount does not match for ${normalizedOrderId}`,
      );
    }

    return {
      alreadyProcessed: true,
      transaction: existingTransaction,
    };
  }

  const result = await receiveCustomerPayment({
    payuAccountId: accountId,
    amount: paymentAmount,
    referenceId: normalizedOrderId,
    description: `Customer payment for ${normalizedOrderId}`,
    metadata: {
      orderId: normalizedOrderId,
      ...metadata,
    },
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

// ============================================================
// RUN TEST BANK SETTLEMENT
// ============================================================

async function runTestSettlement({
  orderId,
  paymentProvider = 'PAYU',
  payuAccountId,
  gatewayAccountId,
  ownerAccountId,
  rmaAccountId,
  dpAccountId,
  productSubtotal,
  deliveryCharge,
  payuFee,
  payuGst = 0,
  payuCharges,
  customerPayableAmount,
  metadata = {},
}) {
  if (!orderId || !String(orderId).trim()) {
    throw new Error('orderId is required');
  }

  const normalizedOrderId = String(orderId).trim();
  const provider = normalizeProvider(paymentProvider);
  const accountId = gatewayAccountId || payuAccountId;

  if (!accountId || !ownerAccountId || !rmaAccountId) {
    throw new Error('Gateway, owner, and RMA account IDs are required');
  }

  const productAmount = requirePositiveAmount(
    productSubtotal,
    'productSubtotal',
  );

  const deliveryAmount = validateAmount(deliveryCharge ?? 0, 'deliveryCharge');

  const feeAmount = validateAmount(payuFee ?? 0, 'payuFee');
  const gstAmount = validateAmount(payuGst ?? 0, 'payuGst');

  let totalGatewayCharges;

  if (provider === 'PAYU') {
    requirePositiveAmount(feeAmount, 'payuFee');

    totalGatewayCharges =
      payuCharges === undefined || payuCharges === null
        ? roundAmount(feeAmount + gstAmount)
        : validateAmount(payuCharges, 'payuCharges');

    if (totalGatewayCharges <= 0) {
      throw new Error('payuCharges must be greater than zero for PayU');
    }

    if (totalGatewayCharges !== roundAmount(feeAmount + gstAmount)) {
      throw new Error('PayU charges must equal PayU fee plus GST');
    }
  } else {
    // Cashfree must not incur a simulated PayU fee liability.
    if (feeAmount !== 0 || gstAmount !== 0) {
      throw new Error('Cashfree settlement cannot include PayU fees or GST');
    }

    if (payuCharges !== undefined && roundAmount(payuCharges) !== 0) {
      throw new Error('Cashfree settlement cannot include PayU charges');
    }

    totalGatewayCharges = 0;
  }

  const calculatedCustomerPayment = roundAmount(
    productAmount + deliveryAmount + totalGatewayCharges,
  );

  const customerPayment =
    customerPayableAmount === undefined || customerPayableAmount === null
      ? calculatedCustomerPayment
      : requirePositiveAmount(customerPayableAmount, 'customerPayableAmount');

  if (customerPayment !== calculatedCustomerPayment) {
    throw new Error(
      `Customer payment mismatch. Expected ₹${calculatedCustomerPayment.toFixed(
        2,
      )}, received ₹${customerPayment.toFixed(2)}`,
    );
  }

  const ownerAmount = roundAmount(productAmount * 0.975);
  const rmaFee = roundAmount(productAmount * 0.025);
  const dpAmount = deliveryAmount;

  const splitTotal = roundAmount(
    ownerAmount + rmaFee + dpAmount + totalGatewayCharges,
  );

  if (splitTotal !== customerPayment) {
    throw new Error(
      `Settlement split mismatch. Customer payment: ₹${customerPayment.toFixed(
        2,
      )}, split total: ₹${splitTotal.toFixed(2)}`,
    );
  }

  // ==========================================================
  // FIND OR CREATE SETTLEMENT
  // ==========================================================

  let settlement = await TestBankSettlement.findOne({
    orderId: normalizedOrderId,
  });

  if (!settlement) {
    settlement = await TestBankSettlement.create({
      orderId: normalizedOrderId,

      // Legacy schema field: for Cashfree this stores the
      // Cashfree gateway account ID, not a PayU account ID.
      payuAccountId: accountId,
      ownerAccountId,
      rmaAccountId,
      dpAccountId: dpAccountId || undefined,

      productSubtotal: productAmount,
      deliveryCharge: deliveryAmount,
      customerPayment,

      ownerAmount,
      rmaFee,
      dpAmount,

      payuFee: feeAmount,
      payuGst: gstAmount,
      payuCharges: totalGatewayCharges,

      metadata: {
        ...metadata,
        paymentProvider: provider,
        customerPayableAmount: customerPayment,
      },

      customerPaymentSettlement: {
        status: 'PENDING',
        amount: customerPayment,
        transactionId: null,
      },

      ownerSettlement: {
        status: 'PENDING',
        amount: ownerAmount,
        transactionId: null,
      },

      rmaFeeSettlement: {
        status: 'PENDING',
        amount: rmaFee,
        transactionId: null,
      },

      dpSettlement: {
        amount: dpAmount,
        hold: {
          status: 'PENDING',
          transactionId: null,
        },
        release: {
          status: 'PENDING',
          transactionId: null,
        },
        withdrawal: {
          status: 'PENDING',
          transactionId: null,
        },
      },

      payuSettlement: {
        liability: {
          status: provider === 'PAYU' ? 'PENDING' : 'COMPLETED',
          transactionId: null,
        },
        deduction: {
          status: provider === 'PAYU' ? 'PENDING' : 'COMPLETED',
          transactionId: null,
          processedAt: null,
        },
      },

      settlementStatus: 'PENDING',
    });
  } else {
    if (settlement.settlementStatus === 'COMPLETED') {
      throw new Error(
        `Test settlement for ${normalizedOrderId} is already completed`,
      );
    }

    const existingProvider = normalizeProvider(
      settlement.metadata?.paymentProvider || 'PAYU',
    );

    if (
      existingProvider !== provider ||
      String(settlement.payuAccountId) !== String(accountId) ||
      String(settlement.ownerAccountId) !== String(ownerAccountId) ||
      String(settlement.rmaAccountId) !== String(rmaAccountId) ||
      String(settlement.dpAccountId || '') !== String(dpAccountId || '')
    ) {
      throw new Error(
        'Existing settlement provider or account configuration does not match',
      );
    }

    const matches = [
      [settlement.customerPayment, customerPayment],
      [settlement.ownerAmount, ownerAmount],
      [settlement.rmaFee, rmaFee],
      [settlement.dpAmount, dpAmount],
      [settlement.payuFee, feeAmount],
      [settlement.payuGst, gstAmount],
      [settlement.payuCharges, totalGatewayCharges],
    ].every(
      ([existing, expected]) =>
        roundAmount(existing ?? 0) === roundAmount(expected),
    );

    if (!matches) {
      throw new Error('Existing settlement amounts do not match');
    }
  }

  settlement.settlementStatus = 'PROCESSING';

  if (!settlement.startedAt) {
    settlement.startedAt = new Date();
  }

  await settlement.save();

  try {
    // STEP 1 — CUSTOMER PAYMENT RECEIPT
    if (settlement.customerPaymentSettlement.status === 'PENDING') {
      const result = await recordCustomerPayment({
        orderId: settlement.orderId,
        gatewayAccountId: settlement.payuAccountId,
        amount: settlement.customerPayment,
        metadata: {
          orderId: settlement.orderId,
          paymentProvider: provider,
          customerPayableAmount: customerPayment,
          ...settlement.metadata,
        },
      });

      settlement.customerPaymentSettlement.status = 'COMPLETED';
      settlement.customerPaymentSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // STEP 2 — OWNER SETTLEMENT
    if (settlement.ownerSettlement.status === 'PENDING') {
      const result = await settleOwnerAmount({
        payuAccountId: settlement.payuAccountId,
        ownerAccountId: settlement.ownerAccountId,
        amount: settlement.ownerSettlement.amount,
        referenceId: settlement.orderId,
        description: `Owner settlement for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          paymentProvider: provider,
          ...settlement.metadata,
        },
      });

      settlement.ownerSettlement.status = 'COMPLETED';
      settlement.ownerSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // STEP 3 — RMA PLATFORM FEE
    if (settlement.rmaFeeSettlement.status === 'PENDING') {
      const result = await creditRmaFee({
        payuAccountId: settlement.payuAccountId,
        rmaAccountId: settlement.rmaAccountId,
        amount: settlement.rmaFeeSettlement.amount,
        referenceId: settlement.orderId,
        description: `RMA platform fee for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          paymentProvider: provider,
          ...settlement.metadata,
        },
      });

      settlement.rmaFeeSettlement.status = 'COMPLETED';
      settlement.rmaFeeSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // STEP 4 — HOLD DELIVERY PARTNER EARNING
    if (
      settlement.dpSettlement.hold.status === 'PENDING' &&
      settlement.dpSettlement.amount > 0
    ) {
      if (!settlement.dpAccountId) {
        throw new Error(
          `Delivery partner account is required for order ${settlement.orderId}`,
        );
      }

      const result = await holdDeliveryEarning({
        payuAccountId: settlement.payuAccountId,
        dpAccountId: settlement.dpAccountId,
        amount: settlement.dpSettlement.amount,
        referenceId: settlement.orderId,
        description: `Hold delivery earning for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          paymentProvider: provider,
          ...settlement.metadata,
        },
      });

      settlement.dpSettlement.hold.status = 'COMPLETED';
      settlement.dpSettlement.hold.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    } else if (settlement.dpSettlement.hold.status === 'PENDING') {
      // No delivery earning to hold for a zero-charge order.
      settlement.dpSettlement.hold.status = 'COMPLETED';
      await settlement.save();
    }

    // STEP 5 — PAYU FEE LIABILITY (PAYU ONLY)
    if (provider === 'PAYU') {
      if (settlement.payuSettlement.liability.status === 'PENDING') {
        const result = await recordPayUFeeLiability({
          rmaAccountId: settlement.rmaAccountId,
          amount: totalGatewayCharges,
          referenceId: settlement.orderId,
          description: `PayU fee liability for ${settlement.orderId}`,
          metadata: {
            orderId: settlement.orderId,
            paymentProvider: provider,
            ...settlement.metadata,
          },
        });

        settlement.payuSettlement.liability.status = 'COMPLETED';
        settlement.payuSettlement.liability.transactionId =
          result.transaction.transactionId;

        await settlement.save();
      }
    }

    settlement.settlementStatus = 'COMPLETED';
    settlement.completedAt = new Date();

    await settlement.save();

    return settlement;
  } catch (error) {
    console.error(`Test settlement failed for ${normalizedOrderId}:`, error);

    settlement.settlementStatus = 'FAILED';
    await settlement.save();

    throw error;
  }
}

module.exports = {
  recordCustomerPayment,
  runTestSettlement,
};
