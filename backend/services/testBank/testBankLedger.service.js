const mongoose = require('mongoose');

const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');

function generateTransactionId(prefix = 'TBT') {
  return `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

function roundAmount(amount) {
  return Number(Number(amount).toFixed(2));
}

function validateAmount(amount) {
  const value = roundAmount(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  return value;
}

async function getActiveAccount(accountId, session) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid bank account ID');
  }

  const query = TestBankAccount.findById(accountId);

  if (session) {
    query.session(session);
  }

  const account = await query;

  if (!account) {
    throw new Error('Bank account not found');
  }

  if (account.status !== 'ACTIVE') {
    throw new Error('Bank account is not active');
  }

  return account;
}

// ============================================================
// RECEIVE CUSTOMER PAYMENT INTO PAYU TEST ACCOUNT
// ============================================================

async function receiveCustomerPayment({
  payuAccountId,
  amount,
  referenceId = null,
  description = 'Customer payment received by PayU',
  metadata = {},
}) {
  const paymentAmount = validateAmount(amount);

  return transferIntoAccount({
    creditAccountId: payuAccountId,
    amount: paymentAmount,
    transactionType: 'ORDER_PAYMENT',
    referenceType: 'ORDER',
    referenceId,
    description,
    metadata,
  });
}

// ============================================================
// OWNER SETTLEMENT
// ============================================================

async function settleOwnerAmount({
  payuAccountId,
  ownerAccountId,
  amount,
  referenceId = null,
  description = 'Owner settlement',
  metadata = {},
}) {
  const settlementAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'OWNER_SETTLEMENT',
    referenceType: 'SETTLEMENT',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing owner settlement transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const result = await transferBetweenBankAccounts({
    debitAccountId: payuAccountId,
    creditAccountId: ownerAccountId,
    amount: settlementAmount,
    transactionType: 'OWNER_SETTLEMENT',
    referenceType: 'SETTLEMENT',
    referenceId,
    description,
    metadata,
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

// ============================================================
// RMA FEE
// ============================================================
async function creditRmaFee({
  payuAccountId,
  rmaAccountId,
  amount,
  referenceId = null,
  description = 'RMA platform fee',
  metadata = {},
}) {
  const feeAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'RMA_FEE',
    referenceType: 'ORDER',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing RMA fee transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const result = await transferBetweenBankAccounts({
    debitAccountId: payuAccountId,
    creditAccountId: rmaAccountId,
    amount: feeAmount,
    transactionType: 'RMA_FEE',
    referenceType: 'ORDER',
    referenceId,
    description,
    metadata,
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

// ============================================================
// OWNER OFFER
// ============================================================

async function creditOwnerOffer({
  rmaAccountId,
  ownerAccountId,
  amount,
  referenceId = null,
  description = 'Your offer money',
  metadata = {},
}) {
  const offerAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'OWNER_OFFER',
    referenceType: 'SYSTEM',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing owner offer transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const result = await transferBetweenBankAccounts({
    debitAccountId: rmaAccountId,
    creditAccountId: ownerAccountId,
    amount: offerAmount,
    transactionType: 'OWNER_OFFER',
    referenceType: 'SYSTEM',
    referenceId,
    description,
    metadata,
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

async function creditReferralReward({
  rmaAccountId,
  ownerAccountId,
  amount,
  referenceId = null,
  description = 'Your offer money',
  metadata = {},
}) {
  const rewardAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'REFERRAL_REWARD',
    referenceType: 'SYSTEM',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing referral reward transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const result = await transferBetweenBankAccounts({
    debitAccountId: rmaAccountId,
    creditAccountId: ownerAccountId,
    amount: rewardAmount,
    transactionType: 'REFERRAL_REWARD',
    referenceType: 'SYSTEM',
    referenceId,
    description,
    metadata,
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

// ============================================================
// HOLD DP DELIVERY EARNING
// ============================================================

async function holdDeliveryEarning({
  payuAccountId,
  dpAccountId,
  amount,
  referenceId = null,
  description = 'Delivery partner earning held',
  metadata = {},
}) {
  const earningAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'DP_EARNING_HELD',
    referenceType: 'ORDER',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing DP earning hold transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const payuAccount = await getActiveAccount(payuAccountId, session);

      const dpAccount = await getActiveAccount(dpAccountId, session);

      if (payuAccount.availableBalance < earningAmount) {
        throw new Error(
          `Insufficient PayU available balance. Available: ₹${Number(
            payuAccount.availableBalance,
          ).toFixed(2)}`,
        );
      }

      payuAccount.balance = roundAmount(payuAccount.balance - earningAmount);

      payuAccount.availableBalance = roundAmount(
        payuAccount.availableBalance - earningAmount,
      );

      dpAccount.balance = roundAmount(dpAccount.balance + earningAmount);

      dpAccount.heldBalance = roundAmount(
        dpAccount.heldBalance + earningAmount,
      );

      await payuAccount.save({ session });
      await dpAccount.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId('TBTDPH'),
            debitAccountId: payuAccount._id,
            creditAccountId: dpAccount._id,
            amount: earningAmount,
            transactionType: 'DP_EARNING_HELD',
            status: 'COMPLETED',
            referenceType: 'ORDER',
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        alreadyProcessed: false,
        transaction: transaction[0],
        payuAccount,
        dpAccount,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ============================================================
// RELEASE DP HELD MONEY INTO AVAILABLE BALANCE
// ============================================================

async function releaseDeliveryEarning({
  dpAccountId,
  amount,
  referenceId = null,
  description = 'Delivery earning released',
  metadata = {},
}) {
  const releaseAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'DP_WALLET_CREDIT',
    referenceType: 'SETTLEMENT',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing DP release transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const dpAccount = await getActiveAccount(dpAccountId, session);

      if (dpAccount.heldBalance < releaseAmount) {
        throw new Error(
          `Insufficient held balance. Held: ₹${Number(
            dpAccount.heldBalance,
          ).toFixed(2)}`,
        );
      }

      dpAccount.heldBalance = roundAmount(
        dpAccount.heldBalance - releaseAmount,
      );

      dpAccount.availableBalance = roundAmount(
        dpAccount.availableBalance + releaseAmount,
      );

      await dpAccount.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId('TBTDPR'),
            debitAccountId: null,
            creditAccountId: dpAccount._id,
            amount: releaseAmount,
            transactionType: 'DP_WALLET_CREDIT',
            status: 'COMPLETED',
            referenceType: 'SETTLEMENT',
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        alreadyProcessed: false,
        transaction: transaction[0],
        dpAccount,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ============================================================
// DP WITHDRAWAL
// ============================================================

async function withdrawDeliveryPartnerMoney({
  dpAccountId,
  amount,
  referenceId = null,
  description = 'Delivery partner withdrawal',
  metadata = {},
}) {
  const withdrawalAmount = validateAmount(amount);

  return transferOutOfAccount({
    debitAccountId: dpAccountId,
    amount: withdrawalAmount,
    transactionType: 'DP_WITHDRAWAL',
    referenceType: 'WITHDRAWAL',
    referenceId,
    description,
    metadata,
  });
}

// ============================================================
// PAYU FEE LIABILITY
// ============================================================

async function recordPayUFeeLiability({
  rmaAccountId,
  amount,
  referenceId = null,
  description = 'PayU processing fee liability',
  metadata = {},
}) {
  const feeAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'PAYU_FEE_LIABILITY',
    referenceType: 'PAYMENT',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'PENDING') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing PayU fee liability transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const rmaAccount = await getActiveAccount(rmaAccountId, session);

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId('TBTLIAB'),
            debitAccountId: null,
            creditAccountId: rmaAccount._id,
            amount: feeAmount,
            transactionType: 'PAYU_FEE_LIABILITY',
            status: 'PENDING',
            referenceType: 'PAYMENT',
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        alreadyProcessed: false,
        transaction: transaction[0],
        rmaAccount,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ============================================================
// PAYU FEE DEDUCTION AT T+2
// ============================================================

async function deductPayUFee({
  rmaAccountId,
  payuAccountId,
  amount,
  referenceId = null,
  description = 'PayU processing fee deducted',
  metadata = {},
}) {
  const feeAmount = validateAmount(amount);

  const existingTransaction = await TestBankTransaction.findOne({
    transactionType: 'PAYU_FEE_DEDUCTION',
    referenceType: 'PAYMENT',
    referenceId,
  });

  if (existingTransaction) {
    if (existingTransaction.status === 'COMPLETED') {
      return {
        alreadyProcessed: true,
        transaction: existingTransaction,
      };
    }

    throw new Error(
      `Existing PayU fee deduction transaction for ${referenceId} is in ${existingTransaction.status} status`,
    );
  }

  const result = await transferBetweenBankAccounts({
    debitAccountId: rmaAccountId,
    creditAccountId: payuAccountId,
    amount: feeAmount,
    transactionType: 'PAYU_FEE_DEDUCTION',
    referenceType: 'PAYMENT',
    referenceId,
    description,
    metadata,
  });

  return {
    alreadyProcessed: false,
    ...result,
  };
}

// ============================================================
// GENERIC INTERNAL BANK TRANSFER
// ============================================================

async function transferBetweenBankAccounts({
  debitAccountId,
  creditAccountId,
  amount,
  transactionType = 'ACCOUNT_TRANSFER',
  referenceType = 'SYSTEM',
  referenceId = null,
  description = '',
  metadata = {},
}) {
  const transferAmount = validateAmount(amount);

  if (String(debitAccountId) === String(creditAccountId)) {
    throw new Error('Debit and credit accounts cannot be the same');
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const debitAccount = await getActiveAccount(debitAccountId, session);

      const creditAccount = await getActiveAccount(creditAccountId, session);

      if (debitAccount.availableBalance < transferAmount) {
        throw new Error(
          `Insufficient available balance. Available: ₹${Number(
            debitAccount.availableBalance,
          ).toFixed(2)}`,
        );
      }

      debitAccount.balance = roundAmount(debitAccount.balance - transferAmount);

      debitAccount.availableBalance = roundAmount(
        debitAccount.availableBalance - transferAmount,
      );

      creditAccount.balance = roundAmount(
        creditAccount.balance + transferAmount,
      );

      creditAccount.availableBalance = roundAmount(
        creditAccount.availableBalance + transferAmount,
      );

      await debitAccount.save({ session });
      await creditAccount.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId(),
            debitAccountId: debitAccount._id,
            creditAccountId: creditAccount._id,
            amount: transferAmount,
            transactionType,
            status: 'COMPLETED',
            referenceType,
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        transaction: transaction[0],
        debitAccount,
        creditAccount,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ============================================================
// CREDIT AN ACCOUNT
// ============================================================

async function transferIntoAccount({
  creditAccountId,
  amount,
  transactionType = 'ACCOUNT_DEPOSIT',
  referenceType = 'SYSTEM',
  referenceId = null,
  description = '',
  metadata = {},
}) {
  const creditAmount = validateAmount(amount);

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const account = await getActiveAccount(creditAccountId, session);

      account.balance = roundAmount(account.balance + creditAmount);

      account.availableBalance = roundAmount(
        account.availableBalance + creditAmount,
      );

      await account.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId(),
            debitAccountId: null,
            creditAccountId: account._id,
            amount: creditAmount,
            transactionType,
            status: 'COMPLETED',
            referenceType,
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        transaction: transaction[0],
        account,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ============================================================
// DEBIT AN ACCOUNT
// ============================================================

async function transferOutOfAccount({
  debitAccountId,
  amount,
  transactionType = 'ACCOUNT_WITHDRAWAL',
  referenceType = 'SYSTEM',
  referenceId = null,
  description = '',
  metadata = {},
}) {
  const debitAmount = validateAmount(amount);

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const account = await getActiveAccount(debitAccountId, session);

      if (account.balance < debitAmount) {
        throw new Error(
          `Insufficient account balance. Available balance in ledger: ₹${Number(
            account.balance,
          ).toFixed(2)}`,
        );
      }

      if (account.availableBalance < debitAmount) {
        throw new Error(
          `Insufficient available balance. Available: ₹${Number(
            account.availableBalance,
          ).toFixed(2)}`,
        );
      }

      if (account.availableBalance < debitAmount) {
        throw new Error(
          `Insufficient available balance. Available: ₹${Number(
            account.availableBalance,
          ).toFixed(2)}`,
        );
      }

      account.balance = roundAmount(account.balance - debitAmount);

      account.availableBalance = roundAmount(
        account.availableBalance - debitAmount,
      );

      await account.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId(),
            debitAccountId: account._id,
            creditAccountId: null,
            amount: debitAmount,
            transactionType,
            status: 'COMPLETED',
            referenceType,
            referenceId,
            description,
            metadata,
          },
        ],
        { session },
      );

      result = {
        transaction: transaction[0],
        account,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

async function recordDirectUpiCustomerPayment({
  ownerAccountId,
  amount,
  ownerAmount,
  rmaFee,
  dpAmount,
  referenceId,
  metadata = {},
  session: externalSession = null,
}) {
  const total = validateAmount(amount);
  const ownerNet = roundAmount(ownerAmount);
  const fee = roundAmount(rmaFee);
  const delivery = roundAmount(dpAmount);

  if (!referenceId) {
    throw new Error('Order referenceId is required');
  }

  if (roundAmount(ownerNet + fee + delivery) !== total) {
    throw new Error('Direct UPI payment split does not match total');
  }

  const processPayment = async (session) => {
    const existing = await TestBankTransaction.findOne({
      transactionType: 'DIRECT_UPI_CUSTOMER_PAYMENT',
      referenceType: 'ORDER',
      referenceId: String(referenceId),
    }).session(session);

    if (existing) {
      if (
        existing.status !== 'COMPLETED' ||
        roundAmount(existing.amount) !== total ||
        String(existing.creditAccountId) !== String(ownerAccountId)
      ) {
        throw new Error('Existing Direct UPI payment does not match');
      }

      return {
        alreadyProcessed: true,
        transaction: existing,
      };
    }

    const owner = await getActiveAccount(ownerAccountId, session);

    owner.balance = roundAmount(owner.balance + total);
    owner.availableBalance = roundAmount(owner.availableBalance + ownerNet);
    owner.heldBalance = roundAmount(owner.heldBalance + fee + delivery);

    await owner.save({ session });

    const [transaction] = await TestBankTransaction.create(
      [
        {
          transactionId: generateTransactionId('TBTDUPC'),
          debitAccountId: null,
          creditAccountId: owner._id,
          amount: total,
          transactionType: 'DIRECT_UPI_CUSTOMER_PAYMENT',
          status: 'COMPLETED',
          referenceType: 'ORDER',
          referenceId: String(referenceId),
          description: `Direct UPI customer payment for order ${referenceId}`,
          metadata: {
            ...metadata,
            ownerAmount: ownerNet,
            rmaFee: fee,
            dpAmount: delivery,
          },
        },
      ],
      { session },
    );

    return {
      alreadyProcessed: false,
      transaction,
      owner,
    };
  };

  // Reuse the controller's transaction when one is supplied.
  if (externalSession) {
    return processPayment(externalSession);
  }

  // Preserve standalone use by existing callers.
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await processPayment(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
}

async function confirmDirectUpiRmaCollection({
  ownerAccountId,
  rmaAccountId,
  dpAccountId,
  amount,
  fee: feeInput,
  rmaFee,
  delivery,
  dpAmount,
  referenceId,
  metadata = {},
  session: externalSession = null,
}) {
  const collectionAmount = validateAmount(amount);
  const fee = roundAmount(feeInput ?? rmaFee);
  const deliveryAmount = roundAmount(delivery ?? dpAmount);

  if (!referenceId) {
    throw new Error('Order referenceId is required');
  }

  if (roundAmount(fee + deliveryAmount) !== collectionAmount) {
    throw new Error('RMA collection split does not match amount');
  }

  const processCollection = async (session) => {
    const existing = await TestBankTransaction.findOne({
      transactionType: 'DIRECT_UPI_RMA_COLLECTION',
      referenceType: 'ORDER',
      referenceId: String(referenceId),
    }).session(session);

    if (existing) {
      const existingMetadata = existing.metadata || {};

      if (
        existing.status !== 'COMPLETED' ||
        roundAmount(existing.amount) !== collectionAmount ||
        String(existing.debitAccountId) !== String(ownerAccountId) ||
        String(existing.creditAccountId) !== String(rmaAccountId) ||
        roundAmount(existingMetadata.rmaFee) !== fee ||
        roundAmount(existingMetadata.dpAmount) !== deliveryAmount ||
        String(existingMetadata.dpAccountId) !== String(dpAccountId)
      ) {
        const error = new Error(
          'Existing RMA collection does not match this order payment',
        );
        error.statusCode = 409;
        throw error;
      }

      return {
        alreadyProcessed: true,
        transaction: existing,
      };
    }

    const owner = await getActiveAccount(ownerAccountId, session);
    const rma = await getActiveAccount(rmaAccountId, session);
    const dp = await getActiveAccount(dpAccountId, session);

    if (owner.heldBalance < collectionAmount) {
      const error = new Error(
        'Owner held balance is insufficient for RMA collection',
      );
      error.statusCode = 409;
      throw error;
    }

    owner.balance = roundAmount(owner.balance - collectionAmount);
    owner.heldBalance = roundAmount(owner.heldBalance - collectionAmount);

    rma.balance = roundAmount(rma.balance + collectionAmount);
    rma.availableBalance = roundAmount(rma.availableBalance + fee);
    rma.heldBalance = roundAmount(rma.heldBalance + deliveryAmount);

    dp.balance = roundAmount(dp.balance + deliveryAmount);
    dp.heldBalance = roundAmount(dp.heldBalance + deliveryAmount);

    await owner.save({ session });
    await rma.save({ session });
    await dp.save({ session });

    const [transaction] = await TestBankTransaction.create(
      [
        {
          transactionId: generateTransactionId('TBTDUPR'),
          debitAccountId: owner._id,
          creditAccountId: rma._id,
          amount: collectionAmount,
          transactionType: 'DIRECT_UPI_RMA_COLLECTION',
          status: 'COMPLETED',
          referenceType: 'ORDER',
          referenceId: String(referenceId),
          description: `Admin-confirmed Direct UPI RMA collection for order ${referenceId}`,
          metadata: {
            ...metadata,
            rmaFee: fee,
            dpAmount: deliveryAmount,
            dpAccountId: String(dp._id),
            adminConfirmed: true,
          },
        },
      ],
      { session },
    );

    return {
      alreadyProcessed: false,
      transaction,
      owner,
      rma,
      dp,
    };
  };

  // Participate in the controller's transaction when supplied.
  if (externalSession) {
    return processCollection(externalSession);
  }

  // Preserve standalone use by other callers.
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await processCollection(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  receiveCustomerPayment,
  settleOwnerAmount,
  creditRmaFee,
  holdDeliveryEarning,
  releaseDeliveryEarning,
  withdrawDeliveryPartnerMoney,
  recordPayUFeeLiability,
  deductPayUFee,
  transferBetweenBankAccounts,
  transferIntoAccount,
  transferOutOfAccount,
  creditOwnerOffer,
  creditReferralReward,
  recordDirectUpiCustomerPayment,
  confirmDirectUpiRmaCollection,
};
