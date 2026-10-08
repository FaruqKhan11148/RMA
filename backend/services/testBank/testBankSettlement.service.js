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

async function recordCustomerPayment({
  orderId,
  payuAccountId,
  amount,
  metadata = {},
}) {
  if (!orderId || !String(orderId).trim()) {
    throw new Error('orderId is required');
  }

  const normalizedOrderId = String(orderId).trim();
  const paymentAmount = requirePositiveAmount(amount, 'amount');

  const TestBankTransaction = require('../../models/TestBankTransaction');

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'ORDER_PAYMENT',
    referenceType: 'ORDER',
    referenceId: normalizedOrderId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      console.log(
        `TestBank customer payment already recorded for ${normalizedOrderId}: ${existingTransaction.transactionId}`,
      );

      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing customer payment transaction for ${normalizedOrderId} is not completed`,
    );
  }

  const result = await receiveCustomerPayment({
    payuAccountId,
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
  payuAccountId,
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

  const productAmount = requirePositiveAmount(
    productSubtotal,
    'productSubtotal',
  );

  const deliveryAmount = validateAmount(deliveryCharge, 'deliveryCharge');

  const feeAmount = requirePositiveAmount(payuFee, 'payuFee');

  const gstAmount = validateAmount(payuGst, 'payuGst');

  const calculatedPayuCharges = roundAmount(feeAmount + gstAmount);

  const totalPayuCharges =
    payuCharges === undefined || payuCharges === null
      ? calculatedPayuCharges
      : requirePositiveAmount(payuCharges, 'payuCharges');

  if (totalPayuCharges !== calculatedPayuCharges) {
    throw new Error(
      `PayU charges mismatch. Expected ₹${calculatedPayuCharges.toFixed(
        2,
      )}, received ₹${totalPayuCharges.toFixed(2)}`,
    );
  }

  const calculatedCustomerPayment = roundAmount(
    productAmount + deliveryAmount + totalPayuCharges,
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
    ownerAmount + rmaFee + dpAmount + totalPayuCharges,
  );

  if (splitTotal !== customerPayment) {
    throw new Error(
      `Settlement split mismatch. Customer payment: ₹${customerPayment.toFixed(
        2,
      )}, split total: ₹${splitTotal.toFixed(
        2,
      )} (Owner + RMA + DP + PayU charges)`,
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

      payuAccountId,
      ownerAccountId,
      rmaAccountId,
      dpAccountId,

      productSubtotal: productAmount,
      deliveryCharge: deliveryAmount,

      customerPayment,

      ownerAmount,
      rmaFee,
      dpAmount,

      payuFee: feeAmount,

      payuGst: gstAmount,

      payuCharges: totalPayuCharges,

      metadata: {
        ...metadata,
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
          status: 'PENDING',
          transactionId: null,
        },

        deduction: {
          status: 'PENDING',
          transactionId: null,
          processedAt: null,
        },
      },

      settlementStatus: 'PENDING',
    });
  } else {
    // ========================================================
    // EXISTING SETTLEMENT VALIDATION
    // ========================================================

    if (settlement.settlementStatus === 'COMPLETED') {
      throw new Error(
        `Test settlement for ${normalizedOrderId} is already completed`,
      );
    }

    if (
      String(settlement.payuAccountId) !== String(payuAccountId) ||
      String(settlement.ownerAccountId) !== String(ownerAccountId) ||
      String(settlement.rmaAccountId) !== String(rmaAccountId) ||
      String(settlement.dpAccountId) !== String(dpAccountId)
    ) {
      throw new Error(
        'Existing settlement account configuration does not match',
      );
    }

    const existingPayuFee = roundAmount(settlement.payuFee);

    const existingPayuGst = roundAmount(settlement.payuGst);

    const existingPayuCharges = roundAmount(settlement.payuCharges);

    const existingCustomerPayment = roundAmount(settlement.customerPayment);

    if (
      existingCustomerPayment !== customerPayment ||
      settlement.ownerAmount !== ownerAmount ||
      settlement.rmaFee !== rmaFee ||
      settlement.dpAmount !== dpAmount ||
      existingPayuFee !== feeAmount ||
      existingPayuGst !== gstAmount ||
      existingPayuCharges !== totalPayuCharges
    ) {
      throw new Error('Existing settlement amounts do not match');
    }
  }

  settlement.settlementStatus = 'PROCESSING';

  if (!settlement.startedAt) {
    settlement.startedAt = new Date();
  }

  await settlement.save();

  try {
    // ========================================================
    // STEP 1 — RECEIVE CUSTOMER PAYMENT
    // ========================================================

    if (settlement.customerPaymentSettlement.status === 'PENDING') {
      const result = await recordCustomerPayment({
        orderId: settlement.orderId,
        payuAccountId: settlement.payuAccountId,
        amount: settlement.customerPayment,
        metadata: {
          orderId: settlement.orderId,
          customerPayableAmount: customerPayment,
          ...settlement.metadata,
        },
      });

      settlement.customerPaymentSettlement.status = 'COMPLETED';

      settlement.customerPaymentSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // ========================================================
    // STEP 2 — OWNER SETTLEMENT
    // ========================================================

    if (settlement.ownerSettlement.status === 'PENDING') {
      const result = await settleOwnerAmount({
        payuAccountId: settlement.payuAccountId,
        ownerAccountId: settlement.ownerAccountId,
        amount: settlement.ownerSettlement.amount,
        referenceId: settlement.orderId,
        description: `Owner settlement for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          ...settlement.metadata,
        },
      });

      settlement.ownerSettlement.status = 'COMPLETED';

      settlement.ownerSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // ========================================================
    // STEP 3 — RMA FEE
    // ========================================================

    if (settlement.rmaFeeSettlement.status === 'PENDING') {
      const result = await creditRmaFee({
        payuAccountId: settlement.payuAccountId,
        rmaAccountId: settlement.rmaAccountId,
        amount: settlement.rmaFeeSettlement.amount,
        referenceId: settlement.orderId,
        description: `RMA platform fee for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          ...settlement.metadata,
        },
      });

      settlement.rmaFeeSettlement.status = 'COMPLETED';

      settlement.rmaFeeSettlement.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // ========================================================
    // STEP 4 — HOLD DP EARNING
    // ========================================================

    if (
      settlement.dpSettlement.hold.status === 'PENDING' &&
      settlement.dpSettlement.amount > 0
    ) {
      const result = await holdDeliveryEarning({
        payuAccountId: settlement.payuAccountId,
        dpAccountId: settlement.dpAccountId,
        amount: settlement.dpSettlement.amount,
        referenceId: settlement.orderId,
        description: `Hold delivery earning for ${settlement.orderId}`,
        metadata: {
          orderId: settlement.orderId,
          ...settlement.metadata,
        },
      });

      settlement.dpSettlement.hold.status = 'COMPLETED';

      settlement.dpSettlement.hold.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // ========================================================
    // STEP 5 — PAYU FEE LIABILITY
    // ========================================================

    if (settlement.payuSettlement.liability.status === 'PENDING') {
      const result = await recordPayUFeeLiability({
        rmaAccountId: settlement.rmaAccountId,

        // RMA owes PayU the COMPLETE gateway charge:
        // PayU fee + GST.
        amount: totalPayuCharges,

        referenceId: settlement.orderId,

        description: `PayU fee liability for ${settlement.orderId}`,

        metadata: {
          orderId: settlement.orderId,
          ...settlement.metadata,
        },
      });

      settlement.payuSettlement.liability.status = 'COMPLETED';

      settlement.payuSettlement.liability.transactionId =
        result.transaction.transactionId;

      await settlement.save();
    }

    // ========================================================
    // SETTLEMENT CORE COMPLETED
    // ========================================================

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
