const mongoose = require('mongoose');
const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');
const TestBankAccount = require('../../../models/TestBankAccount');

async function getDeliveryWallet(req, res) {
  try {
    const deliveryPerson = req.deliveryPerson;

    const transactions = await DeliveryWalletTransaction.find({
      deliveryPersonId: deliveryPerson._id,
    }).sort({ createdAt: -1 });

    let pendingAmount = 0;
    let availableGross = 0;
    let processingAmount = 0;
    let withdrawnAmount = 0;
    let totalEarned = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount || 0);

      switch (transaction.type) {
        case 'ORDER_DELIVERY_EARNING':
        case 'INCENTIVE':
          totalEarned += amount;

          if (transaction.status === 'PENDING') {
            pendingAmount += amount;
          } else if (transaction.status === 'AVAILABLE') {
            availableGross += amount;
          }

          break;

        case 'ADJUSTMENT':
          totalEarned += amount;

          if (transaction.status === 'PENDING') {
            pendingAmount += amount;
          } else if (transaction.status === 'AVAILABLE') {
            availableGross += amount;
          }

          break;

        case 'WITHDRAWAL_REQUEST':
          if (transaction.status === 'PROCESSING') {
            processingAmount += amount;
          }
          break;

        case 'WITHDRAWAL_COMPLETED':
          if (transaction.status === 'COMPLETED') {
            withdrawnAmount += amount;
          }
          break;

        case 'PENALTY':
        case 'REFUND_REVERSAL':
          totalEarned -= amount;

          if (transaction.status === 'AVAILABLE') {
            availableGross -= amount;
          } else if (transaction.status === 'PENDING') {
            pendingAmount -= amount;
          }

          break;

        default:
          break;
      }
    }

    const walletBalance = Math.max(0, availableGross - processingAmount);

    return res.status(200).json({
      wallet: {
        totalEarned: Number(totalEarned.toFixed(2)),
        pendingAmount: Number(Math.max(0, pendingAmount).toFixed(2)),
        availableAmount: Number(Math.max(0, availableGross).toFixed(2)),
        processingAmount: Number(processingAmount.toFixed(2)),
        withdrawnAmount: Number(withdrawnAmount.toFixed(2)),
        walletBalance: Number(walletBalance.toFixed(2)),
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
  const deliveryPerson = req.deliveryPerson;
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: 'Enter a valid withdrawal amount',
    });
  }

  const roundedAmount = Number(amount.toFixed(2));

  if (roundedAmount <= 0) {
    return res.status(400).json({
      message: 'Withdrawal amount must be at least ₹0.01',
    });
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const dpAccount = await TestBankAccount.findOne({
        deliveryPersonId: deliveryPerson._id,
        accountType: 'DELIVERY_PARTNER',
        status: 'ACTIVE',
      }).session(session);

      if (!dpAccount) {
        throw new Error('ACTIVE_DP_ACCOUNT_NOT_FOUND');
      }

      // Reserve funds atomically. Concurrent requests cannot reserve
      // the same available balance.
      const reservedAccount = await TestBankAccount.findOneAndUpdate(
        {
          _id: dpAccount._id,
          status: 'ACTIVE',
          availableBalance: { $gte: roundedAmount },
        },
        {
          $inc: {
            availableBalance: -roundedAmount,
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        },
      );

      if (!reservedAccount) {
        throw new Error('INSUFFICIENT_AVAILABLE_BALANCE');
      }

      const withdrawal = new DeliveryWalletTransaction({
        deliveryPersonId: deliveryPerson._id,
        orderId: null,
        type: 'WITHDRAWAL_REQUEST',
        amount: roundedAmount,
        status: 'PROCESSING',
        description: `Withdrawal request of ₹${roundedAmount.toFixed(2)}`,
        metadata: {
          requestedBy: 'DELIVERY_PERSON',
          fundsReserved: true,
          reservedAt: new Date(),
          bankAccountId: reservedAccount._id.toString(),
        },
      });

      await withdrawal.save({ session });

      result = {
        withdrawal,
        availableBalance: Number(reservedAccount.availableBalance.toFixed(2)),
      };
    });

    return res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: result.withdrawal,
      availableBalance: result.availableBalance,
    });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_AVAILABLE_BALANCE') {
      return res.status(400).json({
        message: 'Insufficient available balance',
      });
    }

    if (error.message === 'ACTIVE_DP_ACCOUNT_NOT_FOUND') {
      return res.status(404).json({
        message: 'Active delivery partner Test Bank account not found',
      });
    }

    console.error('Request delivery withdrawal failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  } finally {
    await session.endSession();
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
