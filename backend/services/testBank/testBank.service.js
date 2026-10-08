const mongoose = require('mongoose');

const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');

function generateTransactionId() {
  return `TBT${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

async function transferBetweenAccounts({
  debitAccountId,
  creditAccountId,
  amount,
  transactionType = 'ACCOUNT_TRANSFER',
  referenceType = 'SYSTEM',
  referenceId = null,
  description = '',
  metadata = {},
}) {
  const transferAmount = Number(Number(amount).toFixed(2));

  if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
    throw new Error('Transfer amount must be greater than zero');
  }

  if (
    !mongoose.Types.ObjectId.isValid(debitAccountId) ||
    !mongoose.Types.ObjectId.isValid(creditAccountId)
  ) {
    throw new Error('Invalid bank account ID');
  }

  if (String(debitAccountId) === String(creditAccountId)) {
    throw new Error('Debit and credit accounts cannot be the same');
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const debitAccount =
        await TestBankAccount.findById(debitAccountId).session(session);

      const creditAccount =
        await TestBankAccount.findById(creditAccountId).session(session);

      if (!debitAccount) {
        throw new Error('Debit account not found');
      }

      if (!creditAccount) {
        throw new Error('Credit account not found');
      }

      if (debitAccount.status !== 'ACTIVE') {
        throw new Error('Debit account is not active');
      }

      if (creditAccount.status !== 'ACTIVE') {
        throw new Error('Credit account is not active');
      }

      if (debitAccount.availableBalance < transferAmount) {
        throw new Error(
          `Insufficient available balance. Available: ₹${Number(
            debitAccount.availableBalance,
          ).toFixed(2)}`,
        );
      }

      /*
       * Debit source account.
       */
      debitAccount.balance = Number(
        (debitAccount.balance - transferAmount).toFixed(2),
      );

      debitAccount.availableBalance = Number(
        (debitAccount.availableBalance - transferAmount).toFixed(2),
      );

      /*
       * Credit destination account.
       */
      creditAccount.balance = Number(
        (creditAccount.balance + transferAmount).toFixed(2),
      );

      creditAccount.availableBalance = Number(
        (creditAccount.availableBalance + transferAmount).toFixed(2),
      );

      await debitAccount.save({ session });
      await creditAccount.save({ session });

      /*
       * Immutable ledger entry.
       */
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

async function depositToAccount({
  accountId,
  amount,
  transactionType = 'ACCOUNT_DEPOSIT',
  referenceType = 'SYSTEM',
  referenceId = null,
  description = '',
  metadata = {},
}) {
  const depositAmount = Number(Number(amount).toFixed(2));

  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid bank account ID');
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const account =
        await TestBankAccount.findById(accountId).session(session);

      if (!account) {
        throw new Error('Bank account not found');
      }

      if (account.status !== 'ACTIVE') {
        throw new Error('Bank account is not active');
      }

      account.balance = Number((account.balance + depositAmount).toFixed(2));

      account.availableBalance = Number(
        (account.availableBalance + depositAmount).toFixed(2),
      );

      await account.save({ session });

      const transaction = await TestBankTransaction.create(
        [
          {
            transactionId: generateTransactionId(),

            debitAccountId: null,

            creditAccountId: account._id,

            amount: depositAmount,

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

async function getAccountById(accountId) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid bank account ID');
  }

  const account = await TestBankAccount.findById(accountId)
    .populate('ownerId', 'ownerName shopName phone')
    .populate('deliveryPersonId', 'name phone deliveryPersonId')
    .populate('customerId', 'name phone');

  if (!account) {
    throw new Error('Bank account not found');
  }

  return account;
}

async function getAccountTransactions(accountId) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid bank account ID');
  }

  const transactions = await TestBankTransaction.find({
    $or: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
  })
    .populate('debitAccountId', 'accountNumber accountName accountType')
    .populate('creditAccountId', 'accountNumber accountName accountType')
    .sort({ createdAt: -1 });

  return transactions;
}

module.exports = {
  transferBetweenAccounts,
  depositToAccount,
  getAccountById,
  getAccountTransactions,
};
