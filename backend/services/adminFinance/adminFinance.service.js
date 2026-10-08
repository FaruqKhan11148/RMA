const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');
const TestBankSettlement = require('../../models/TestBankSettlement');
const DeliveryWalletTransaction = require('../../models/DeliveryWalletTransaction');

const RMA_TEST_BANK_ACCOUNT_NUMBER = 'RMA-SYSTEM-000001';

async function getOrCreateRmaAccount() {
  let account = await TestBankAccount.findOne({
    accountType: 'RMA',
    accountNumber: RMA_TEST_BANK_ACCOUNT_NUMBER,
  });

  if (account) {
    return account;
  }

  try {
    account = await TestBankAccount.create({
      accountNumber: RMA_TEST_BANK_ACCOUNT_NUMBER,
      accountName: 'RMA',
      accountType: 'RMA',
      balance: 0,
      availableBalance: 0,
      heldBalance: 0,
      currency: 'INR',
      status: 'ACTIVE',
    });

    return account;
  } catch (error) {
    /*
     * Another request may have created the
     * RMA account at the same time.
     *
     * Because accountNumber is unique, MongoDB
     * will reject the duplicate. In that case,
     * simply fetch the already-created account.
     */
    if (error?.code === 11000) {
      const existingAccount = await TestBankAccount.findOne({
        accountNumber: RMA_TEST_BANK_ACCOUNT_NUMBER,
        accountType: 'RMA',
      });

      if (existingAccount) {
        return existingAccount;
      }
    }

    throw error;
  }
}

async function getRmaAccountDetails() {
  const account = await getOrCreateRmaAccount();

  const transactions = await TestBankTransaction.find({
    $or: [{ debitAccountId: account._id }, { creditAccountId: account._id }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('debitAccountId', 'accountNumber accountName accountType')
    .populate('creditAccountId', 'accountNumber accountName accountType');

  return {
    account,
    transactions,
  };
}

async function getOwnerAccounts() {
  const accounts = await TestBankAccount.find({
    accountType: 'OWNER',
  })
    .populate(
      'ownerId',
      'ownerName shopName shopId phone email settlementStatus bankAccount',
    )
    .sort({ createdAt: -1 });

  return accounts;
}

async function getDeliveryPartnerAccounts() {
  const accounts = await TestBankAccount.find({
    accountType: 'DELIVERY_PARTNER',
  })
    .populate(
      'deliveryPersonId',
      'name phone email deliveryType isActive applicationStatus',
    )
    .sort({ createdAt: -1 });

  return accounts;
}

async function getFinanceOverview() {
  const rmaAccount = await getOrCreateRmaAccount();

  const [
    ownerAccounts,
    deliveryPartnerAccounts,
    pendingDeliveryEarnings,
    pendingWithdrawals,
    settlements,
  ] = await Promise.all([
    TestBankAccount.countDocuments({
      accountType: 'OWNER',
    }),

    TestBankAccount.countDocuments({
      accountType: 'DELIVERY_PARTNER',
    }),

    DeliveryWalletTransaction.countDocuments({
      type: 'ORDER_DELIVERY_EARNING',
      status: 'PENDING',
    }),

    DeliveryWalletTransaction.countDocuments({
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    }),

    TestBankSettlement.find({})
      .select(
        'settlementStatus productSubtotal deliveryCharge customerPayment ownerAmount rmaFee dpAmount payuFee createdAt',
      )
      .lean(),
  ]);

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await TestBankTransaction.find({
    transactionType: 'RMA_FEE',
    status: 'COMPLETED',
    creditAccountId: rmaAccount._id,
  })
    .select('amount createdAt')
    .lean();

  const todayRmaEarnings = transactions
    .filter((transaction) => new Date(transaction.createdAt) >= startOfToday)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const monthlyRmaEarnings = transactions
    .filter((transaction) => new Date(transaction.createdAt) >= startOfMonth)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const pendingPayuFees = await TestBankTransaction.aggregate([
    {
      $match: {
        transactionType: 'PAYU_FEE_LIABILITY',
        status: 'PENDING',
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: '$amount',
        },
      },
    },
  ]);

  const dpAccounts = await TestBankAccount.find({
    accountType: 'DELIVERY_PARTNER',
    status: 'ACTIVE',
  })
    .select('availableBalance heldBalance')
    .lean();

  const dpMoneyAvailable = dpAccounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0,
  );

  const dpMoneyHeld = dpAccounts.reduce(
    (sum, account) => sum + account.heldBalance,
    0,
  );

  const settlementStats = {
    total: settlements.length,
    completed: settlements.filter(
      (item) => item.settlementStatus === 'COMPLETED',
    ).length,
    processing: settlements.filter(
      (item) => item.settlementStatus === 'PROCESSING',
    ).length,
    failed: settlements.filter((item) => item.settlementStatus === 'FAILED')
      .length,
  };

  const grossRmaEarnings = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const totalPayuFees = settlements.reduce(
    (sum, settlement) => sum + (settlement.payuFee || 0),
    0,
  );

  return {
    rma: {
      accountId: rmaAccount._id,
      accountNumber: rmaAccount.accountNumber,
      balance: rmaAccount.balance,
      availableBalance: rmaAccount.availableBalance,
      heldBalance: rmaAccount.heldBalance,
    },

    earnings: {
      today: Number(todayRmaEarnings.toFixed(2)),
      thisMonth: Number(monthlyRmaEarnings.toFixed(2)),
      gross: Number(grossRmaEarnings.toFixed(2)),
      payuFees: Number(totalPayuFees.toFixed(2)),
      net: Number((grossRmaEarnings - totalPayuFees).toFixed(2)),
    },

    deliveryPartners: {
      accounts: deliveryPartnerAccounts,
      moneyHeld: Number(dpMoneyHeld.toFixed(2)),
      moneyAvailable: Number(dpMoneyAvailable.toFixed(2)),
      pendingEarnings: pendingDeliveryEarnings,
      pendingWithdrawals,
    },

    owners: {
      accounts: ownerAccounts,
    },

    pendingPayuFees: Number((pendingPayuFees[0]?.total || 0).toFixed(2)),

    settlements: settlementStats,
  };
}

async function getFinanceSettlements() {
  const settlements = await TestBankSettlement.find({})
    .populate(
      'orderId',
      'orderId customerName customerPhone status paymentStatus paymentMethod createdAt completedAt',
    )
    .populate('payuAccountId', 'accountNumber accountName accountType')
    .populate('ownerAccountId', 'accountNumber accountName accountType ownerId')
    .populate('rmaAccountId', 'accountNumber accountName accountType')
    .populate(
      'dpAccountId',
      'accountNumber accountName accountType deliveryPersonId',
    )
    .sort({ createdAt: -1 })
    .lean();

  return settlements;
}

async function getFinanceTransactions({
  page = 1,
  limit = 20,
  transactionType,
  status,
  referenceType,
  referenceId,
  accountId,
} = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filter = {};

  if (transactionType) {
    filter.transactionType = transactionType;
  }

  if (status) {
    filter.status = status;
  }

  if (referenceType) {
    filter.referenceType = referenceType;
  }

  if (referenceId) {
    filter.referenceId = referenceId;
  }

  if (accountId) {
    filter.$or = [
      { debitAccountId: accountId },
      { creditAccountId: accountId },
    ];
  }

  const skip = (currentPage - 1) * perPage;

  const [transactions, total] = await Promise.all([
    TestBankTransaction.find(filter)
      .populate('debitAccountId', 'accountNumber accountName accountType')
      .populate('creditAccountId', 'accountNumber accountName accountType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),

    TestBankTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: currentPage < Math.ceil(total / perPage),
      hasPreviousPage: currentPage > 1,
    },
  };
}

async function getFinanceWithdrawals({ status, page = 1, limit = 20 } = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);

  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filter = {
    type: 'WITHDRAWAL_REQUEST',
  };

  if (status) {
    filter.status = status;
  }

  const skip = (currentPage - 1) * perPage;

  const [withdrawals, total] = await Promise.all([
    DeliveryWalletTransaction.find(filter)
      .populate('deliveryPersonId', 'name phone email deliveryType isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),

    DeliveryWalletTransaction.countDocuments(filter),
  ]);

  return {
    withdrawals,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: currentPage < Math.ceil(total / perPage),
      hasPreviousPage: currentPage > 1,
    },
  };
}

module.exports = {
  getOrCreateRmaAccount,
  getRmaAccountDetails,
  getOwnerAccounts,
  getDeliveryPartnerAccounts,
  getFinanceOverview,
  getFinanceSettlements,
  getFinanceTransactions,
  getFinanceWithdrawals,
  RMA_TEST_BANK_ACCOUNT_NUMBER,
};
