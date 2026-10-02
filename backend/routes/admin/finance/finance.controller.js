const Order = require('../../../models/Order');
const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');

// ============================================================
// GET TODAY'S ORDERS FOR ADMIN
// ============================================================

const getDailyOrders = async (req, res) => {
  try {
    const now = new Date();

    // India timezone: Asia/Kolkata
    const indiaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    // Create start/end of today's Indian business day.
    const startOfDay = new Date(`${indiaDate}T00:00:00+05:30`);
    const startOfNextDay = new Date(startOfDay);

    startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

    const orders = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lt: startOfNextDay,
      },
    })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .select(
        [
          'orderId',
          'ownerId',
          'customer',
          'orderType',
          'deliveryLocation',
          'items',
          'totalItems',
          'totalPrice',
          'status',

          // Payment
          'paymentStatus',
          'paymentMethod',
          'onlinePaymentMethod',
          'paymentId',
          'paymentOrderId',
          'paidAt',

          // Delivery
          'otpVerified',
          'deliveryOtpGeneratedAt',

          // Timeline
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',

          'rmaFee',
          'rmaAmount',
          'ownerAmount',
          'deliveryRiderAmount',
          'deliveryRmaAmount',
          'deliveryOwnerAmount',
          'payuFee',
          'payuGst',
          'payuCharges',
          'customerPayableAmount',

          // Mongo timestamps
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    let totalTransactionValue = 0;
    let completedTransactionValue = 0;
    let totalRmaFees = 0;

    const orderStatus = {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      OutForDelivery: 0,
      Completed: 0,
      Rejected: 0,
    };

    const shopStats = {};

    for (const order of orders) {
      const amount = Number(order.totalPrice || 0);

      totalTransactionValue += amount;

      if (orderStatus[order.status] !== undefined) {
        orderStatus[order.status] += 1;
      }

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        completedTransactionValue += amount;
        totalRmaFees += Number(order.rmaFee || 0);
      }

      const shopId = order.ownerId?.shopId || 'UNKNOWN';

      if (!shopStats[shopId]) {
        shopStats[shopId] = {
          shopId,
          shopName: order.ownerId?.shopName || 'Unknown Shop',
          ownerName: order.ownerId?.ownerName || 'Unknown',
          totalOrders: 0,
          completedOrders: 0,
          transactionValue: 0,
          rmaFees: 0,
        };
      }

      shopStats[shopId].totalOrders += 1;
      shopStats[shopId].transactionValue += amount;

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        shopStats[shopId].completedOrders += 1;
        shopStats[shopId].rmaFees += Number(order.rmaFee || 0);
      }
    }

    const shops = Object.values(shopStats).map((shop) => ({
      ...shop,
      transactionValue: Number(shop.transactionValue.toFixed(2)),
      rmaFees: Number(shop.rmaFees.toFixed(2)),
    }));

    return res.status(200).json({
      date: indiaDate,

      stats: {
        totalOrders: orders.length,
        completedOrders: orderStatus.Completed,
        totalTransactionValue: Number(totalTransactionValue.toFixed(2)),
        completedTransactionValue: Number(completedTransactionValue.toFixed(2)),
        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus,

      shops,

      orders,
    });
  } catch (error) {
    console.error('Admin daily orders fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch daily orders',
    });
  }
};

// ============================================================
// GET MONTHLY FINANCE FOR ADMIN
// ============================================================

const getMonthlyFinance = async (req, res) => {
  try {
    const { month } = req.query;

    /*
      Expected format:

      ?month=2026-09

      If no month is provided, use the current month
      in India.
    */

    let selectedMonth = month;

    if (!selectedMonth) {
      const now = new Date();

      selectedMonth = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
      }).format(now);
    }

    // Validate YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return res.status(400).json({
        message: 'Invalid month format. Use YYYY-MM.',
      });
    }

    const [yearString, monthString] = selectedMonth.split('-');

    const year = Number(yearString);
    const monthNumber = Number(monthString);

    if (monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        message: 'Invalid month.',
      });
    }

    /*
      Build the month boundaries in IST.

      Example:

      2026-09

      start:
      2026-09-01T00:00:00+05:30

      end:
      2026-10-01T00:00:00+05:30
    */

    const startOfMonth = new Date(
      `${yearString}-${monthString}-01T00:00:00+05:30`,
    );

    const nextMonthDate =
      monthNumber === 12
        ? `${year + 1}-01`
        : `${year}-${String(monthNumber + 1).padStart(2, '0')}`;

    const startOfNextMonth = new Date(`${nextMonthDate}-01T00:00:00+05:30`);

    const orders = await Order.find({
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    })
      .populate('ownerId', 'ownerName shopName phone shopId')
      .select(
        [
          'orderId',
          'ownerId',
          'customer',
          'orderType',
          'deliveryLocation',
          'items',
          'totalItems',
          'totalPrice',
          'status',

          // Payment
          'paymentStatus',
          'paymentMethod',
          'onlinePaymentMethod',
          'paymentId',
          'paymentOrderId',
          'paidAt',

          // Delivery
          'otpVerified',
          'deliveryOtpGeneratedAt',

          // Timeline
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',

          'rmaFee',
          'rmaAmount',
          'ownerAmount',
          'deliveryRiderAmount',
          'deliveryRmaAmount',
          'deliveryOwnerAmount',
          'payuFee',
          'payuGst',
          'payuCharges',
          'customerPayableAmount',

          // Mongo timestamps
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    let totalTransactionValue = 0;
    let completedTransactionValue = 0;
    let totalRmaFees = 0;

    let completedOrders = 0;
    let paidOrders = 0;
    let pendingOrders = 0;
    let rejectedOrders = 0;

    const orderStatus = {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      OutForDelivery: 0,
      Completed: 0,
      Rejected: 0,
    };

    const shopStats = {};

    for (const order of orders) {
      const amount = Number(order.totalPrice || 0);

      totalTransactionValue += amount;

      if (orderStatus[order.status] !== undefined) {
        orderStatus[order.status] += 1;
      }

      if (order.paymentStatus === 'Paid') {
        paidOrders += 1;
      }

      if (order.status === 'Pending') {
        pendingOrders += 1;
      }

      if (order.status === 'Rejected') {
        rejectedOrders += 1;
      }

      /*
        Successful transaction:

        Completed + Paid
      */

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        completedOrders += 1;

        completedTransactionValue += amount;

        totalRmaFees += Number(order.rmaFee || 0);
      }

      const shopId = order.ownerId?.shopId || 'UNKNOWN';

      if (!shopStats[shopId]) {
        shopStats[shopId] = {
          shopId,
          shopName: order.ownerId?.shopName || 'Unknown Shop',
          ownerName: order.ownerId?.ownerName || 'Unknown',
          totalOrders: 0,
          completedOrders: 0,
          transactionValue: 0,
          completedTransactionValue: 0,
          rmaFees: 0,
        };
      }

      shopStats[shopId].totalOrders += 1;
      shopStats[shopId].transactionValue += amount;

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        shopStats[shopId].completedOrders += 1;
        shopStats[shopId].completedTransactionValue += amount;
        shopStats[shopId].rmaFees += Number(order.rmaFee || 0);
      }
    }

    const shops = Object.values(shopStats).map((shop) => ({
      ...shop,

      transactionValue: Number(shop.transactionValue.toFixed(2)),

      completedTransactionValue: Number(
        shop.completedTransactionValue.toFixed(2),
      ),

      rmaFees: Number(shop.rmaFees.toFixed(2)),
    }));

    return res.status(200).json({
      month: selectedMonth,

      period: {
        start: startOfMonth,
        end: startOfNextMonth,
      },

      stats: {
        totalOrders: orders.length,

        completedOrders,

        paidOrders,

        pendingOrders,

        rejectedOrders,

        totalTransactionValue: Number(totalTransactionValue.toFixed(2)),

        completedTransactionValue: Number(completedTransactionValue.toFixed(2)),

        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus,

      shops,

      orders,
    });
  } catch (error) {
    console.error('Admin monthly finance fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch monthly finance',
    });
  }
};

async function getPendingDeliveryEarnings(req, res) {
  try {
    const transactions = await DeliveryWalletTransaction.find({
      type: 'ORDER_DELIVERY_EARNING',
      status: 'PENDING',
    })
      .populate(
        'deliveryPersonId',
        'name phone email deliveryType isActive applicationStatus',
      )
      .sort({ createdAt: -1 });

    const pendingAmount = transactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    return res.status(200).json({
      transactions,
      stats: {
        pendingCount: transactions.length,
        pendingAmount: Number(pendingAmount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Get pending delivery earnings failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function releaseDeliveryEarning(req, res) {
  try {
    const { transactionId } = req.params;

    const transaction = await DeliveryWalletTransaction.findOne({
      _id: transactionId,
      type: 'ORDER_DELIVERY_EARNING',
      status: 'PENDING',
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Pending delivery earning not found',
      });
    }

    transaction.status = 'AVAILABLE';
    transaction.availableAt = new Date();

    await transaction.save();

    return res.status(200).json({
      message: 'Delivery earning released successfully',
      transaction,
    });
  } catch (error) {
    console.error('Release delivery earning failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getDeliveryWithdrawalRequests(req, res) {
  try {
    const withdrawals = await DeliveryWalletTransaction.find({
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    })
      .populate(
        'deliveryPersonId',
        'name phone email deliveryType isActive applicationStatus bankAccount',
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      withdrawals,
    });
  } catch (error) {
    console.error('Get delivery withdrawal requests failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getDeliveryWithdrawalHistory(req, res) {
  try {
    const withdrawals = await DeliveryWalletTransaction.find({
      type: {
        $in: ['WITHDRAWAL_COMPLETED', 'WITHDRAWAL_FAILED'],
      },
      status: {
        $in: ['COMPLETED', 'FAILED'],
      },
    })
      .populate(
        'deliveryPersonId',
        'name phone email deliveryType isActive applicationStatus',
      )
      .sort({ processedAt: -1, createdAt: -1 });

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

async function completeDeliveryWithdrawal(req, res) {
  try {
    const { transactionId } = req.params;

    const withdrawal = await DeliveryWalletTransaction.findOne({
      _id: transactionId,
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    });

    if (!withdrawal) {
      return res.status(404).json({
        message: 'Processing withdrawal request not found',
      });
    }

    withdrawal.type = 'WITHDRAWAL_COMPLETED';
    withdrawal.status = 'COMPLETED';
    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.status(200).json({
      message: 'Delivery withdrawal completed successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Complete delivery withdrawal failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function rejectDeliveryWithdrawal(req, res) {
  try {
    const { transactionId } = req.params;

    const withdrawal = await DeliveryWalletTransaction.findOne({
      _id: transactionId,
      type: 'WITHDRAWAL_REQUEST',
      status: 'PROCESSING',
    });

    if (!withdrawal) {
      return res.status(404).json({
        message: 'Processing withdrawal request not found',
      });
    }

    withdrawal.type = 'WITHDRAWAL_FAILED';
    withdrawal.status = 'FAILED';
    withdrawal.processedAt = new Date();

    withdrawal.metadata = {
      ...withdrawal.metadata,
      rejectedBy: 'ADMIN',
    };

    await withdrawal.save();

    return res.status(200).json({
      message: 'Delivery withdrawal rejected successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Reject delivery withdrawal failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  getDailyOrders,
  getMonthlyFinance,
  releaseDeliveryEarning,
  getDeliveryWithdrawalRequests,
  getDeliveryWithdrawalHistory,
  completeDeliveryWithdrawal,
  rejectDeliveryWithdrawal,
  getPendingDeliveryEarnings,
};
