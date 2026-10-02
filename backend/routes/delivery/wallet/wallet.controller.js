const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');

async function getDeliveryWallet(req, res) {
  try {
    const deliveryPerson = req.deliveryPerson;

    console.log(
      'WALLET CONTROLLER - req.deliveryPerson:',
      req.deliveryPerson?._id,
    );

    const transactions = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
    }).sort({ createdAt: -1 });

    let pendingAmount = 0;
    let availableAmount = 0;
    let processingAmount = 0;
    let withdrawnAmount = 0;
    let totalEarned = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);

      switch (transaction.type) {
        case 'ORDER_DELIVERY_EARNING':
        case 'INCENTIVE':
          totalEarned += amount;

          if (transaction.status === 'PENDING') {
            pendingAmount += amount;
          }

          if (transaction.status === 'AVAILABLE') {
            availableAmount += amount;
          }

          break;

        case 'WITHDRAWAL_REQUEST':
          if (transaction.status === 'PROCESSING') {
            processingAmount += amount;
          }
          break;

        case 'WITHDRAWAL_COMPLETED':
          withdrawnAmount += amount;
          break;

        case 'PENALTY':
        case 'REFUND_REVERSAL':
          totalEarned -= amount;

          if (transaction.status === 'AVAILABLE') {
            availableAmount -= amount;
          }

          break;

        case 'ADJUSTMENT':
          totalEarned += amount;

          if (transaction.status === 'AVAILABLE') {
            availableAmount += amount;
          }

          if (transaction.status === 'PENDING') {
            pendingAmount += amount;
          }

          break;

        default:
          break;
      }
    });

    return res.status(200).json({
      wallet: {
        totalEarned: Number(totalEarned.toFixed(2)),
        pendingAmount: Number(pendingAmount.toFixed(2)),
        availableAmount: Number(availableAmount.toFixed(2)),
        processingAmount: Number(processingAmount.toFixed(2)),
        withdrawnAmount: Number(withdrawnAmount.toFixed(2)),
        walletBalance: Number(
          Math.max(
            0,
            availableAmount - processingAmount - withdrawnAmount,
          ).toFixed(2),
        ),
      },
    });
  } catch (error) {
    console.error('Get delivery wallet failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function requestWithdrawal(req, res) {
  try {
    const deliveryPerson = req.deliveryPerson;
    const { amount } = req.body;

    const withdrawalAmount = Number(amount);

    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({
        message: 'Enter a valid withdrawal amount',
      });
    }

    const roundedAmount = Number(withdrawalAmount.toFixed(2));

    // Get all released earnings that are currently AVAILABLE.
    const availableTransactions = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
      status: 'AVAILABLE',
      $or: [
        { type: 'ORDER_DELIVERY_EARNING' },
        { type: 'INCENTIVE' },
        { type: 'ADJUSTMENT' },
      ],
    });

    const availableGross = availableTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    // Get all withdrawals that have already been completed.
    const completedWithdrawals = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
      type: 'WITHDRAWAL_COMPLETED',
      status: 'COMPLETED',
    });

    const withdrawnAmount = completedWithdrawals.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    // Get withdrawals that are currently waiting for admin completion.
    const processingTransactions = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    });

    const processingAmount = processingTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    // Spendable balance = released earnings
    // - completed withdrawals
    // - withdrawals already being processed.
    const actualAvailableBalance = Number(
      Math.max(0, availableGross - withdrawnAmount - processingAmount).toFixed(
        2,
      ),
    );

    if (roundedAmount > actualAvailableBalance) {
      return res.status(400).json({
        message: 'Insufficient available balance',
        availableBalance: actualAvailableBalance,
      });
    }

    const withdrawal = await DeliveryWalletTransaction.create({
      deliveryPersonId: deliveryPerson._id,
      orderId: null,
      type: 'WITHDRAWAL_REQUEST',
      amount: roundedAmount,
      status: 'PROCESSING',
      description: `Withdrawal request of ₹${roundedAmount.toFixed(2)}`,
      metadata: {
        requestedBy: 'DELIVERY_PERSON',
      },
    });

    return res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal,
      availableBalance: Number(
        (actualAvailableBalance - roundedAmount).toFixed(2),
      ),
    });
  } catch (error) {
    console.error('Request delivery withdrawal failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getDeliveryWithdrawalHistory(req, res) {
  try {
    const deliveryPerson = req.deliveryPerson;

    const withdrawals = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
      type: {
        $in: ['WITHDRAWAL_COMPLETED', 'WITHDRAWAL_FAILED'],
      },
      status: {
        $in: ['COMPLETED', 'FAILED'],
      },
    }).sort({
      processedAt: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      withdrawals,
    });
  } catch (error) {
    console.error('Get delivery withdrawal history failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getDeliveryEarningHistory(req, res) {
  try {
    const deliveryPerson = req.deliveryPerson;

    const transactions = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
      type: {
        $in: [
          'ORDER_DELIVERY_EARNING',
          'INCENTIVE',
          'ADJUSTMENT',
          'PENALTY',
          'REFUND_REVERSAL',
        ],
      },
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error('Get delivery earning history failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  getDeliveryWallet,
  requestWithdrawal,
  getDeliveryWithdrawalHistory,
  getDeliveryEarningHistory,
};
