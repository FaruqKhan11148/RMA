const mongoose = require('mongoose');

const DeliveryWalletTransaction = require('../../models/DeliveryWalletTransaction');
const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');

const {
  releaseDeliveryEarning: releaseTestBankDeliveryEarning,
  withdrawDeliveryPartnerMoney,
} = require('./testBankLedger.service');

async function releaseDpWalletEarning(transactionId) {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error('Invalid delivery wallet transaction ID');
  }

  const walletTransaction = await DeliveryWalletTransaction.findOne({
    _id: transactionId,
    type: 'ORDER_DELIVERY_EARNING',
    status: 'PENDING',
  });

  if (!walletTransaction) {
    throw new Error('Pending delivery earning not found');
  }

  const deliveryPersonId = walletTransaction.deliveryPersonId;

  const dpAccount = await TestBankAccount.findOne({
    deliveryPersonId,
    accountType: 'DELIVERY_PARTNER',
    status: 'ACTIVE',
  });

  if (!dpAccount) {
    throw new Error(
      'Active Test Bank account not found for this delivery partner',
    );
  }

  const amount = Number(Number(walletTransaction.amount).toFixed(2));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid delivery earning amount');
  }

  /*
   * Check whether this wallet earning has already
   * created a Test Bank release transaction.
   */
  const existingBankTransaction = await TestBankTransaction.findOne({
    transactionType: 'DP_WALLET_CREDIT',
    referenceType: 'SETTLEMENT',
    referenceId: walletTransaction._id.toString(),
    status: 'COMPLETED',
  });

  if (existingBankTransaction) {
    const updatedWalletTransaction =
      await DeliveryWalletTransaction.findByIdAndUpdate(
        walletTransaction._id,
        {
          $set: {
            status: 'AVAILABLE',
            availableAt: walletTransaction.availableAt || new Date(),
            'metadata.testBankRelease': {
              transactionId: existingBankTransaction.transactionId,
              bankAccountId: dpAccount._id.toString(),
              releasedAt:
                walletTransaction.metadata?.testBankRelease?.releasedAt ||
                existingBankTransaction.createdAt ||
                new Date(),
            },
          },
        },
        {
          new: true,
        },
      );

    return {
      walletTransaction: updatedWalletTransaction,
      bankTransaction: existingBankTransaction,
      dpAccount: await TestBankAccount.findById(dpAccount._id),
      alreadyProcessed: true,
    };
  }

  /*
   * Release held Test Bank money:
   *
   * DP heldBalance    -> decreases
   * DP availableBalance -> increases
   */
  const result = await releaseTestBankDeliveryEarning({
    dpAccountId: dpAccount._id,
    amount,
    referenceId: walletTransaction._id.toString(),
    description: `Release delivery earning for order ${
      walletTransaction.orderId || 'N/A'
    }`,
    metadata: {
      source: 'RMA_DP_WALLET_RELEASE',
      walletTransactionId: walletTransaction._id.toString(),
      orderId: walletTransaction.orderId,
      deliveryPersonId: deliveryPersonId.toString(),
    },
  });

  /*
   * Only after Test Bank succeeds do we make
   * the RMA wallet earning AVAILABLE.
   */
  const updatedWalletTransaction =
    await DeliveryWalletTransaction.findOneAndUpdate(
      {
        _id: walletTransaction._id,
        type: 'ORDER_DELIVERY_EARNING',
        status: 'PENDING',
      },
      {
        $set: {
          status: 'AVAILABLE',
          availableAt: new Date(),
          'metadata.testBankRelease': {
            transactionId: result.transaction.transactionId,
            bankAccountId: dpAccount._id.toString(),
            releasedAt: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );

  /*
   * If another request changed the wallet transaction
   * while the Test Bank operation was running, don't
   * overwrite that state.
   */
  if (!updatedWalletTransaction) {
    throw new Error(
      'Delivery earning was already released or changed by another request',
    );
  }

  return {
    walletTransaction: updatedWalletTransaction,
    bankTransaction: result.transaction,
    dpAccount: result.dpAccount,
    alreadyProcessed: false,
  };
}

async function completeDpWalletWithdrawal(transactionId) {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error('Invalid delivery wallet transaction ID');
  }

  const withdrawal = await DeliveryWalletTransaction.findOne({
    _id: transactionId,
    type: 'WITHDRAWAL_REQUEST',
    status: 'PROCESSING',
  });

  if (!withdrawal) {
    throw new Error('Processing withdrawal request not found');
  }

  const deliveryPersonId = withdrawal.deliveryPersonId;

  const dpAccount = await TestBankAccount.findOne({
    deliveryPersonId,
    accountType: 'DELIVERY_PARTNER',
    status: 'ACTIVE',
  });

  if (!dpAccount) {
    throw new Error(
      'Active Test Bank account not found for this delivery partner',
    );
  }

  const amount = Number(Number(withdrawal.amount).toFixed(2));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid withdrawal amount');
  }

  /*
   * Check whether this withdrawal has already
   * created a Test Bank withdrawal transaction.
   */
  const existingBankTransaction = await TestBankTransaction.findOne({
    transactionType: 'DP_WITHDRAWAL',
    referenceType: 'WITHDRAWAL',
    referenceId: withdrawal._id.toString(),
    status: 'COMPLETED',
  });

  if (existingBankTransaction) {
    const updatedWithdrawal = await DeliveryWalletTransaction.findByIdAndUpdate(
      withdrawal._id,
      {
        $set: {
          type: 'WITHDRAWAL_COMPLETED',
          status: 'COMPLETED',
          processedAt:
            withdrawal.processedAt ||
            existingBankTransaction.createdAt ||
            new Date(),
          'metadata.testBankWithdrawal': {
            transactionId: existingBankTransaction.transactionId,
            bankAccountId: dpAccount._id.toString(),
            processedAt:
              withdrawal.metadata?.testBankWithdrawal?.processedAt ||
              existingBankTransaction.createdAt ||
              new Date(),
          },
        },
      },
      {
        new: true,
      },
    );

    return {
      withdrawal: updatedWithdrawal,
      bankTransaction: existingBankTransaction,
      dpAccount: await TestBankAccount.findById(dpAccount._id),
      alreadyProcessed: true,
    };
  }

  /*
   * Actually withdraw money from Test Bank.
   *
   * DP availableBalance -> decreases
   * DP balance          -> decreases
   */
  const result = await withdrawDeliveryPartnerMoney({
    dpAccountId: dpAccount._id,
    amount,
    referenceId: withdrawal._id.toString(),
    description: `Delivery partner withdrawal of ₹${amount.toFixed(2)}`,
    metadata: {
      source: 'RMA_DP_WALLET_WITHDRAWAL',
      walletTransactionId: withdrawal._id.toString(),
      deliveryPersonId: deliveryPersonId.toString(),
    },
  });

  /*
   * Only after Test Bank succeeds do we mark
   * the RMA withdrawal as COMPLETED.
   */
  const updatedWithdrawal = await DeliveryWalletTransaction.findOneAndUpdate(
    {
      _id: withdrawal._id,
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    },
    {
      $set: {
        type: 'WITHDRAWAL_COMPLETED',
        status: 'COMPLETED',
        processedAt: new Date(),
        'metadata.testBankWithdrawal': {
          transactionId: result.transaction.transactionId,
          bankAccountId: dpAccount._id.toString(),
          processedAt: new Date(),
        },
      },
    },
    {
      new: true,
    },
  );

  /*
   * If another request changed the withdrawal
   * while Test Bank was processing, don't overwrite it.
   */
  if (!updatedWithdrawal) {
    throw new Error(
      'Withdrawal was already completed or changed by another request',
    );
  }

  return {
    withdrawal: updatedWithdrawal,
    bankTransaction: result.transaction,
    dpAccount: result.account,
    alreadyProcessed: false,
  };
}

module.exports = {
  releaseDpWalletEarning,
  completeDpWalletWithdrawal,
};
