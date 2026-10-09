const Order = require('../../../models/Order');
const Referral = require('../../../models/Referral');
const Owner = require('../../../models/Owner');

const {
  getOwnerOfferProgress,
  finalizeOwnerOffer,
} = require('../../../services/ownerOffers/ownerOffer.service');

const OwnerEarningsArchive = require('../../../models/OwnerEarningsArchive');

const {
  getOwnerReferralProgress,
  finalizeReferralQualification,
  settleReferralReward,
} = require('../../../services/ownerOffers/referral.service');

async function testFinalizeOwnerOffer(req, res) {
  try {
    const { ownerId } = req.params;
    const { testDate } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    if (!testDate) {
      return res.status(400).json({
        message: 'testDate is required',
      });
    }

    const testNow = new Date(testDate);

    if (Number.isNaN(testNow.getTime())) {
      return res.status(400).json({
        message: 'Invalid testDate',
      });
    }

    const result = await finalizeOwnerOffer(ownerId, testNow);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Test owner offer finalization error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to finalize owner offer',
    });
  }
}

// ==========================================
// GET DAILY REWARD PROGRESS
// ==========================================

async function getDailyReward(req, res) {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    const progress = await getOwnerOfferProgress(ownerId);

    return res.status(200).json({
      offerId: progress.offerId,

      businessDate: progress.businessDate,
      businessDayStart: progress.businessDayStart,
      businessDayEnd: progress.businessDayEnd,

      openingTime: progress.openingTime,
      closingTime: progress.closingTime,

      shopClosed: progress.shopClosed,

      completedOrders: progress.completedOrders,
      targetOrders: progress.targetOrders,

      rewardRate: progress.rewardRate,
      rewardAmount: progress.rewardAmount,

      eligible: progress.eligible,

      // Keep these names for frontend compatibility.
      rewardUnlocked: progress.eligible,
      rewardTransferred: progress.rewardTransferred,
    });
  } catch (error) {
    console.error('Get daily reward error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to fetch daily reward progress',
    });
  }
}

async function getOwnerEarnings(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    // Find archived records for this owner only.
    const archivedRecords = await OwnerEarningsArchive.find({
      ownerId: owner._id,
    }).select('orderId -_id');

    const archivedOrderIds = new Set(
      archivedRecords.map((record) => record.orderId),
    );

    const orders = await Order.find({
      ownerId: owner._id,
      paymentStatus: 'Paid',
      settlementStatus: {
        $in: ['Pending', 'Processing', 'Settled'],
      },
    }).sort({ createdAt: -1 });

    let totalSettledEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    let totalProductSales = 0;
    let totalRmaFees = 0;
    let settledOrders = 0;

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const recentEarnings = [];
    let archivedOrders = 0;

    orders.forEach((order) => {
      const productSubtotal = Number(
        Number(order.productSubtotal || order.subtotal || 0).toFixed(2),
      );

      const rmaFee = Number(
        Number(order.rmaFee || order.rmaAmount || 0).toFixed(2),
      );

      const ownerAmount = Number(Number(order.ownerAmount || 0).toFixed(2));

      const deliveryCharge = Number(
        Number(order.deliveryCharge || 0).toFixed(2),
      );

      const payuFee = Number(Number(order.payuFee || 0).toFixed(2));

      const payuGst = Number(Number(order.payuGst || 0).toFixed(2));

      const payuCharges = Number(
        Number(order.payuCharges || payuFee + payuGst).toFixed(2),
      );

      const customerPayableAmount = Number(
        Number(order.customerPayableAmount || order.totalPrice || 0).toFixed(2),
      );

      // Financial totals always include archived orders.
      if (order.settlementStatus === 'Settled') {
        settledOrders++;

        totalSettledEarnings += ownerAmount;
        totalProductSales += productSubtotal;
        totalRmaFees += rmaFee;

        const settlementDate =
          order.settledAt || order.completedAt || order.createdAt;

        if (settlementDate) {
          const date = new Date(settlementDate);

          if (date >= startOfToday && date < startOfTomorrow) {
            todayEarnings += ownerAmount;
          }

          if (date >= startOfWeek && date < startOfNextWeek) {
            weekEarnings += ownerAmount;
          }

          if (date >= startOfMonth && date < startOfNextMonth) {
            monthEarnings += ownerAmount;
          }
        }
      }

      // Archive hides the order only from the recent list.
      if (archivedOrderIds.has(order.orderId)) {
        archivedOrders++;
        return;
      }

      recentEarnings.push({
        orderId: order.orderId,

        orderDate: order.createdAt,
        completedAt: order.completedAt,
        settledAt: order.settledAt,

        orderStatus: order.status,
        settlementStatus: order.settlementStatus,
        paymentStatus: order.paymentStatus,

        productSubtotal,
        rmaFee,

        rmaFeePercentage: productSubtotal
          ? Number(((rmaFee / productSubtotal) * 100).toFixed(2))
          : 0,

        ownerAmount,
        deliveryCharge,

        payuFee,
        payuGst,
        payuCharges,

        customerPayableAmount,

        paymentId: order.paymentId || null,
        paymentOrderId: order.paymentOrderId || null,

        financialBreakdown: {
          productSales: productSubtotal,
          rmaFee,
          ownerEarnings: ownerAmount,
          deliveryCharge,
          payuFee,
          payuGst,
          payuCharges,
          customerPayableAmount,
        },
      });
    });

    return res.status(200).json({
      earnings: {
        totalSettledEarnings: Number(totalSettledEarnings.toFixed(2)),
        todayEarnings: Number(todayEarnings.toFixed(2)),
        weekEarnings: Number(weekEarnings.toFixed(2)),
        monthEarnings: Number(monthEarnings.toFixed(2)),
        totalProductSales: Number(totalProductSales.toFixed(2)),
        totalRmaFees: Number(totalRmaFees.toFixed(2)),
        settledOrders,
      },

      orders: {
        // Counts all eligible paid orders, including archived ones.
        total: orders.length,
        settled: settledOrders,
        archived: archivedOrders,

        // Counts records currently visible in Recent Earnings.
        visible: recentEarnings.length,
      },

      recentEarnings,
    });
  } catch (error) {
    console.error('Get owner earnings error:', error);

    return res.status(500).json({
      message: 'Failed to fetch owner earnings',
      error: error.message,
    });
  }
}

// ==========================================
// GET ORDERS FOR ONE OWNER
// ==========================================

async function getOwnerOrders(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const orders = await Order.find({
      ownerId,
      paymentStatus: 'Paid',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get owner orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getReferralProgress(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId).select('_id');

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const progress = await getOwnerReferralProgress(ownerId);

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Get referral progress failed:', error);

    return res.status(500).json({
      message: 'Failed to get referral progress',
    });
  }
}

async function testFinalizeReferralQualification(req, res) {
  try {
    const { referralId } = req.params;
    const { testDate } = req.body;

    let testNow = new Date();

    if (testDate) {
      testNow = new Date(testDate);

      if (Number.isNaN(testNow.getTime())) {
        return res.status(400).json({
          message: 'Invalid testDate',
        });
      }
    }

    const result = await finalizeReferralQualification(referralId, testNow);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Test finalize referral qualification failed:', error);

    return res.status(500).json({
      message: error.message || 'Failed to finalize referral qualification',
    });
  }
}

// ==========================================
// ARCHIVE OWNER EARNINGS
// Hides records from the owner's earnings view.
// Does not modify or delete original orders.
// ==========================================

async function archiveOwnerEarnings(req, res) {
  try {
    const authenticatedOwnerId = req.owner._id.toString();
    const { ownerId } = req.params;
    const { orderIds } = req.body;

    if (ownerId !== authenticatedOwnerId) {
      return res.status(403).json({
        message: 'You cannot archive another owner’s earnings',
      });
    }

    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      orderIds.some((id) => typeof id !== 'string' || !id.trim())
    ) {
      return res.status(400).json({
        message: 'Please provide valid order IDs to archive',
      });
    }

    const uniqueOrderIds = [...new Set(orderIds.map((id) => id.trim()))];

    // Confirm every requested order belongs to this owner
    // and is eligible for the earnings view.
    const matchingOrders = await Order.find({
      ownerId: authenticatedOwnerId,
      orderId: { $in: uniqueOrderIds },
      paymentStatus: 'Paid',
      settlementStatus: {
        $in: ['Pending', 'Processing', 'Settled'],
      },
    }).select('orderId');

    if (matchingOrders.length !== uniqueOrderIds.length) {
      return res.status(400).json({
        message:
          'Some selected orders are invalid or do not belong to your earnings history',
      });
    }

    await OwnerEarningsArchive.bulkWrite(
      uniqueOrderIds.map((orderId) => ({
        updateOne: {
          filter: {
            ownerId: req.owner._id,
            orderId,
          },
          update: {
            $setOnInsert: {
              ownerId: req.owner._id,
              orderId,
              archivedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );

    return res.status(200).json({
      message: 'Selected earnings records archived successfully',
      archivedCount: uniqueOrderIds.length,
    });
  } catch (error) {
    console.error('Archive owner earnings error:', error);

    return res.status(500).json({
      message: 'Failed to archive earnings records',
    });
  }
}

module.exports = {
  getDailyReward,
  getOwnerEarnings,
  getOwnerOrders,
  testFinalizeOwnerOffer,
  getReferralProgress,
  testFinalizeReferralQualification,
  archiveOwnerEarnings,
};
