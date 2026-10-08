const Order = require('../../../models/Order');
const Referral = require('../../../models/Referral');
const Owner = require('../../../models/Owner');

const {
  getOwnerOfferProgress,
  finalizeOwnerOffer,
} = require('../../../services/ownerOffers/ownerOffer.service');

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

// ==========================================
// GET OWNER EARNINGS
// ==========================================

async function getOwnerEarnings(req, res) {
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

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentEarnings = [];

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

      /*
       * Pending / Processing are settlement states,
       * not actual owner earnings.
       *
       * We therefore only count Settled orders
       * in the owner's earnings totals.
       */
      if (order.settlementStatus === 'Settled') {
        settledOrders++;

        totalSettledEarnings += ownerAmount;
        totalProductSales += productSubtotal;
        totalRmaFees += rmaFee;

        const settlementDate =
          order.settledAt || order.completedAt || order.createdAt;

        if (settlementDate) {
          const date = new Date(settlementDate);

          if (date >= startOfToday) {
            todayEarnings += ownerAmount;
          }

          if (date >= startOfWeek) {
            weekEarnings += ownerAmount;
          }

          if (date >= startOfMonth) {
            monthEarnings += ownerAmount;
          }
        }
      }

      /*
       * Every order remains available in the recent
       * earnings list so the owner can inspect its
       * financial breakdown.
       */
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

        /*
         * These IDs allow the frontend to show
         * transaction/payment information later.
         */
        paymentId: order.paymentId || null,
        paymentOrderId: order.paymentOrderId || null,

        /*
         * Useful for displaying exactly what happened
         * financially for this order.
         */
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
        total: orders.length,
        settled: settledOrders,
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

module.exports = {
  getDailyReward,
  getOwnerEarnings,
  getOwnerOrders,
  testFinalizeOwnerOffer,
  getReferralProgress,
  testFinalizeReferralQualification,
};
