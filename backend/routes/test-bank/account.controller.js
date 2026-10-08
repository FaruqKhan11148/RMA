const TestBankAccount = require('../../models/TestBankAccount');

const {
  depositToAccount,
  getAccountById,
  getAccountTransactions,
  transferBetweenAccounts,
} = require('../../services/testBank/testBank.service');

async function createAccount(req, res) {
  try {
    const {
      accountNumber,
      accountName,
      accountType,
      ownerId,
      deliveryPersonId,
      customerId,
      initialDeposit = 0,
    } = req.body;

    if (!accountNumber || !accountName || !accountType) {
      return res.status(400).json({
        message: 'accountNumber, accountName and accountType are required',
      });
    }

    const existingAccount = await TestBankAccount.findOne({
      accountNumber: accountNumber.trim(),
    });

    if (existingAccount) {
      return res.status(409).json({
        message: 'Bank account already exists',
      });
    }

    const account = await TestBankAccount.create({
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      accountType,
      ownerId: ownerId || null,
      deliveryPersonId: deliveryPersonId || null,
      customerId: customerId || null,
      balance: 0,
      availableBalance: 0,
      heldBalance: 0,
    });

    let depositResult = null;

    if (Number(initialDeposit) > 0) {
      depositResult = await depositToAccount({
        accountId: account._id,
        amount: initialDeposit,
        transactionType: 'ACCOUNT_DEPOSIT',
        referenceType: 'SYSTEM',
        description: 'Initial test bank account deposit',
      });
    }

    const finalAccount = await getAccountById(account._id);

    return res.status(201).json({
      message: 'Test bank account created successfully',
      account: finalAccount,
      initialDepositTransaction: depositResult?.transaction || null,
    });
  } catch (error) {
    console.error('Create test bank account failed:', error);

    return res.status(500).json({
      message: error.message || 'Server error',
    });
  }
}

async function getAccount(req, res) {
  try {
    const { accountId } = req.params;

    const account = await getAccountById(accountId);

    return res.status(200).json({
      account,
    });
  } catch (error) {
    console.error('Get test bank account failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to get bank account',
    });
  }
}

async function deposit(req, res) {
  try {
    const { accountId } = req.params;

    const {
      amount,
      transactionType = 'ACCOUNT_DEPOSIT',
      referenceType = 'SYSTEM',
      referenceId = null,
      description = '',
      metadata = {},
    } = req.body;

    const result = await depositToAccount({
      accountId,
      amount,
      transactionType,
      referenceType,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Amount deposited successfully',
      transaction: result.transaction,
      account: result.account,
    });
  } catch (error) {
    console.error('Test bank deposit failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to deposit amount',
    });
  }
}

async function getTransactions(req, res) {
  try {
    const { accountId } = req.params;

    const transactions = await getAccountTransactions(accountId);

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error('Get test bank transactions failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to get transactions',
    });
  }
}

async function transfer(req, res) {
  try {
    const {
      debitAccountId,
      creditAccountId,
      amount,
      transactionType = 'ACCOUNT_TRANSFER',
      referenceType = 'SYSTEM',
      referenceId = null,
      description = '',
      metadata = {},
    } = req.body;

    const result = await transferBetweenAccounts({
      debitAccountId,
      creditAccountId,
      amount,
      transactionType,
      referenceType,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Amount transferred successfully',
      transaction: result.transaction,
      debitAccount: result.debitAccount,
      creditAccount: result.creditAccount,
    });
  } catch (error) {
    console.error('Test bank transfer failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to transfer amount',
    });
  }
}

module.exports = {
  createAccount,
  getAccount,
  deposit,
  getTransactions,
  transfer,
};
