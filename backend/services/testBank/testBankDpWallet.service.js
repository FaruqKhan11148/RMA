const mongoose = require('mongoose');

const DeliveryWalletTransaction = require('../../models/DeliveryWalletTransaction');
const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');

function roundAmount(value) {
  return Number(Number(value).toFixed(2));
}

function validateAmount(value, label) {
  const amount = roundAmount(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid ${label} amount`);
  }

  return amount;
}

function generateTransactionId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

async function getActiveDpAccount(deliveryPersonId, session) {
  const account = await TestBankAccount.findOne({
    deliveryPersonId,
    accountType: 'DELIVERY_PARTNER',
    status: 'ACTIVE',
  }).session(session);

  if (!account) {
    throw new Error(
      'Active Test Bank account not found for this delivery partner',
    );
  }

  return account;
}

async function releaseDpWalletEarning(transactionId) {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error('Invalid delivery wallet transaction ID');
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const walletTransaction = await DeliveryWalletTransaction.findOne({
        _id: transactionId,
        type: 'ORDER_DELIVERY_EARNING',
      }).session(session);

      if (!walletTransaction) {
        throw new Error('Delivery earning not found');
      }

      const referenceId = walletTransaction._id.toString();

      const existingBankTransaction = await TestBankTransaction.findOne({
        transactionType: 'DP_WALLET_CREDIT',
        referenceType: 'SETTLEMENT',
        referenceId,
      }).session(session);

      // Recovery path for a release already recorded in the ledger.
      // Do not move the account balance a second time.
      if (existingBankTransaction) {
        if (existingBankTransaction.status !== 'COMPLETED') {
          throw new Error(
            `Existing DP release is in ${existingBankTransaction.status} status`,
          );
        }

        if (!['PENDING', 'AVAILABLE'].includes(walletTransaction.status)) {
          throw new Error(
            'The earning has changed state and cannot be released',
          );
        }

        const dpAccount = await getActiveDpAccount(
          walletTransaction.deliveryPersonId,
          session,
        );

        if (walletTransaction.status === 'PENDING') {
          walletTransaction.status = 'AVAILABLE';
          walletTransaction.availableAt =
            existingBankTransaction.createdAt || new Date();

          walletTransaction.set('metadata.testBankRelease', {
            transactionId: existingBankTransaction.transactionId,
            bankAccountId: dpAccount._id.toString(),
            releasedAt: existingBankTransaction.createdAt || new Date(),
          });

          await walletTransaction.save({ session });
        }

        result = {
          walletTransaction,
          bankTransaction: existingBankTransaction,
          dpAccount,
          alreadyProcessed: true,
        };

        return;
      }

      if (walletTransaction.status !== 'PENDING') {
        throw new Error('Only pending delivery earnings can be released');
      }

      const amount = validateAmount(
        walletTransaction.amount,
        'delivery earning',
      );

      const dpAccount = await getActiveDpAccount(
        walletTransaction.deliveryPersonId,
        session,
      );

      if (Number(dpAccount.heldBalance) < amount) {
        throw new Error(
          `Insufficient held balance. Held: ₹${Number(
            dpAccount.heldBalance,
          ).toFixed(2)}`,
        );
      }

      // Update all three records in the same transaction.
      dpAccount.heldBalance = roundAmount(
        Number(dpAccount.heldBalance) - amount,
      );

      dpAccount.availableBalance = roundAmount(
        Number(dpAccount.availableBalance) + amount,
      );

      await dpAccount.save({ session });

      const now = new Date();

      walletTransaction.status = 'AVAILABLE';
      walletTransaction.availableAt = now;

      walletTransaction.set('metadata.testBankRelease', {
        bankAccountId: dpAccount._id.toString(),
        releasedAt: now,
      });

      await walletTransaction.save({ session });

      const [bankTransaction] = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId('TBTDPR'),
            debitAccountId: null,
            creditAccountId: dpAccount._id,
            amount,
            transactionType: 'DP_WALLET_CREDIT',
            status: 'COMPLETED',
            referenceType: 'SETTLEMENT',
            referenceId,
            description: `Release delivery earning for order ${
              walletTransaction.orderId || 'N/A'
            }`,
            metadata: {
              source: 'RMA_DP_WALLET_RELEASE',
              walletTransactionId: referenceId,
              orderId: walletTransaction.orderId,
              deliveryPersonId: walletTransaction.deliveryPersonId.toString(),
            },
          },
        ],
        { session },
      );

      walletTransaction.set('metadata.testBankRelease', {
        transactionId: bankTransaction.transactionId,
        bankAccountId: dpAccount._id.toString(),
        releasedAt: now,
      });

      await walletTransaction.save({ session });

      result = {
        walletTransaction,
        bankTransaction,
        dpAccount,
        alreadyProcessed: false,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

async function completeDpWalletWithdrawal(transactionId) {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error('Invalid delivery wallet transaction ID');
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const withdrawal = await DeliveryWalletTransaction.findOne({
        _id: transactionId,
        type: {
          $in: ['WITHDRAWAL_REQUEST', 'WITHDRAWAL_COMPLETED'],
        },
      }).session(session);

      if (!withdrawal) {
        throw new Error('Withdrawal request not found');
      }

      const referenceId = withdrawal._id.toString();

      const existingBankTransaction = await TestBankTransaction.findOne({
        transactionType: 'DP_WITHDRAWAL',
        referenceType: 'WITHDRAWAL',
        referenceId,
      }).session(session);

      // Recovery path for a previously completed bank debit.
      if (existingBankTransaction) {
        if (existingBankTransaction.status !== 'COMPLETED') {
          throw new Error(
            `Existing DP withdrawal is in ${existingBankTransaction.status} status`,
          );
        }

        if (withdrawal.type === 'WITHDRAWAL_FAILED') {
          throw new Error('A rejected withdrawal cannot be marked completed');
        }

        if (withdrawal.type === 'WITHDRAWAL_REQUEST') {
          if (withdrawal.status !== 'PROCESSING') {
            throw new Error('Withdrawal is no longer processing');
          }

          withdrawal.type = 'WITHDRAWAL_COMPLETED';
          withdrawal.status = 'COMPLETED';
          withdrawal.processedAt =
            existingBankTransaction.createdAt || new Date();

          withdrawal.set('metadata.testBankWithdrawal', {
            transactionId: existingBankTransaction.transactionId,
            processedAt: existingBankTransaction.createdAt || new Date(),
          });

          await withdrawal.save({ session });
        }

        const dpAccount = await getActiveDpAccount(
          withdrawal.deliveryPersonId,
          session,
        );

        result = {
          withdrawal,
          bankTransaction: existingBankTransaction,
          dpAccount,
          account: dpAccount,
          alreadyProcessed: true,
        };

        return;
      }

      if (
        withdrawal.type !== 'WITHDRAWAL_REQUEST' ||
        withdrawal.status !== 'PROCESSING'
      ) {
        throw new Error('Only processing withdrawal requests can be completed');
      }

      const amount = validateAmount(withdrawal.amount, 'withdrawal');

      const dpAccount = await getActiveDpAccount(
        withdrawal.deliveryPersonId,
        session,
      );

      // The withdrawal amount was already reserved when the DP
      // submitted the request. At completion, deduct only total balance.
      // Do not deduct availableBalance a second time.
      if (Number(dpAccount.balance) < amount) {
        throw new Error(
          'Insufficient Test Bank balance to complete withdrawal',
        );
      }

      dpAccount.balance = roundAmount(Number(dpAccount.balance) - amount);

      await dpAccount.save({ session });
      const now = new Date();

      withdrawal.type = 'WITHDRAWAL_COMPLETED';
      withdrawal.status = 'COMPLETED';
      withdrawal.processedAt = now;

      await withdrawal.save({ session });

      const [bankTransaction] = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId('TBTDPW'),
            debitAccountId: dpAccount._id,
            creditAccountId: null,
            amount,
            transactionType: 'DP_WITHDRAWAL',
            status: 'COMPLETED',
            referenceType: 'WITHDRAWAL',
            referenceId,
            description: `Delivery partner withdrawal of ₹${amount.toFixed(2)}`,
            metadata: {
              source: 'RMA_DP_WALLET_WITHDRAWAL',
              walletTransactionId: referenceId,
              deliveryPersonId: withdrawal.deliveryPersonId.toString(),
            },
          },
        ],
        { session },
      );

      withdrawal.set('metadata.testBankWithdrawal', {
        transactionId: bankTransaction.transactionId,
        bankAccountId: dpAccount._id.toString(),
        processedAt: now,
      });

      await withdrawal.save({ session });

      result = {
        withdrawal,
        bankTransaction,
        dpAccount,
        account: dpAccount,
        alreadyProcessed: false,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  releaseDpWalletEarning,
  completeDpWalletWithdrawal,
};
