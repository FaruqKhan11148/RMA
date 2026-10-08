const Referral = require('../../models/Referral');
const Owner = require('../../models/Owner');
const Order = require('../../models/Order');
const TestBankAccount = require('../../models/TestBankAccount');

const { creditReferralReward } = require('../testBank/testBankLedger.service');

const {
  getBusinessDayWindow,
  getBusinessDate,
} = require('./ownerOffer.service');

const QUALIFYING_ORDER_STATUSES = {
  status: 'Completed',
  paymentStatus: 'Paid',
  settlementStatus: 'Settled',
  refundStatus: 'NotRequired',
};

const REFERRAL_REQUIRED_ORDERS = 100;
const REFERRAL_REQUIRED_ACTIVE_DAYS = 18;
const REFERRAL_QUALIFICATION_DAYS = 20;
const REFERRAL_REWARD_PERCENTAGE = 20;
const REFERRAL_REWARD_CAP = 500;

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function getBusinessDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function getOwnerQualifyingOrders(ownerId, startDate, endDate) {
  return Order.find({
    ownerId,
    ...QUALIFYING_ORDER_STATUSES,
    completedAt: {
      $gte: startDate,
      $lt: endDate,
    },
  })
    .select(
      'ownerId completedAt subtotal rmaFee rmaAmount deliveryCharge status paymentStatus settlementStatus',
    )
    .sort({ completedAt: 1 })
    .lean();
}

function countActiveBusinessDays(orders, owner) {
  const uniqueBusinessDays = new Set();

  orders.forEach((order) => {
    if (!order.completedAt) return;

    const completedAt = new Date(order.completedAt);

    const { businessDayStart, businessDayEnd } = getBusinessDayWindow(
      owner,
      completedAt,
    );

    if (completedAt >= businessDayStart && completedAt < businessDayEnd) {
      uniqueBusinessDays.add(getBusinessDate(businessDayStart));
    }
  });

  return uniqueBusinessDays.size;
}

function isReferralFullyQualified({
  referredOrderCount,
  referredActiveDays,
  referrerOrderCount,
  referrerActiveDays,
}) {
  return (
    referredOrderCount >= REFERRAL_REQUIRED_ORDERS &&
    referredActiveDays >= REFERRAL_REQUIRED_ACTIVE_DAYS &&
    referrerOrderCount >= REFERRAL_REQUIRED_ORDERS &&
    referrerActiveDays >= REFERRAL_REQUIRED_ACTIVE_DAYS
  );
}

function calculateReferralReward(rmaFeesGenerated) {
  const calculatedReward = roundMoney(
    Number(rmaFeesGenerated) * (REFERRAL_REWARD_PERCENTAGE / 100),
  );

  return {
    calculatedReward,
    finalReward: Math.min(calculatedReward, REFERRAL_REWARD_CAP),
  };
}

async function settleReferralReward(referral) {
  if (!referral) {
    throw new Error('Referral is required');
  }

  if (referral.settlement?.status === 'COMPLETED') {
    return {
      alreadyProcessed: true,
      referral,
    };
  }

  if (referral.status !== 'QUALIFIED') {
    throw new Error(
      `Referral is not qualified. Current status: ${referral.status}`,
    );
  }

  const finalReward = Number(referral.earnings?.finalReward || 0);

  if (finalReward <= 0) {
    throw new Error('Referral reward amount must be greater than zero');
  }

  const rmaAccount = await TestBankAccount.findOne({
    accountNumber: 'RMA-SYSTEM-000001',
    accountType: 'RMA',
    status: 'ACTIVE',
  });

  if (!rmaAccount) {
    throw new Error('RMA TestBank account not found');
  }

  const ownerAccount = await TestBankAccount.findOne({
    accountType: 'OWNER',
    ownerId: referral.referrerOwnerId,
    status: 'ACTIVE',
  });

  if (!ownerAccount) {
    throw new Error('Referrer TestBank account not found');
  }

  const referenceId = `REFERRAL_${referral._id}`;

  const rewardTransfer = await creditReferralReward({
    rmaAccountId: rmaAccount._id,
    ownerAccountId: ownerAccount._id,
    amount: finalReward,
    referenceId,
    description: 'Your offer money',
    metadata: {
      referralId: referral._id.toString(),
      cycleNumber: referral.cycleNumber,
      slotNumber: referral.slotNumber,
      referredOwnerId: referral.referredOwnerId.toString(),
      referrerOwnerId: referral.referrerOwnerId.toString(),
      rewardPercentage: referral.earnings.rewardPercentage,
      rmaFeesGenerated: referral.earnings.rmaFeesGenerated,
    },
  });

  referral.settlement.status = 'COMPLETED';
  referral.settlement.transactionId =
    rewardTransfer.transaction?.transactionId || null;
  referral.settlement.transferredAt =
    referral.settlement.transferredAt || new Date();

  referral.status = 'REWARDED';

  await referral.save();

  return {
    alreadyProcessed: rewardTransfer.alreadyProcessed,
    transaction: rewardTransfer.transaction,
    referral,
  };
}

async function getReferralProgress(referral) {
  const referredOwner = await Owner.findById(referral.referredOwnerId)
    .select(
      'shopId shopName ownerName referralCode deliverySettings.openingTime deliverySettings.closingTime',
    )
    .lean();

  const referrerOwner = await Owner.findById(referral.referrerOwnerId)
    .select(
      'shopId shopName ownerName deliverySettings.openingTime deliverySettings.closingTime',
    )
    .lean();

  const startDate = referral.qualification.startDate;
  const endDate = referral.qualification.endDate;

  const [referredOrders, referrerOrders] = await Promise.all([
    getOwnerQualifyingOrders(referral.referredOwnerId, startDate, endDate),
    getOwnerQualifyingOrders(referral.referrerOwnerId, startDate, endDate),
  ]);

  const referredOrderCount = referredOrders.length;
  const referrerOrderCount = referrerOrders.length;

  if (
    referral.status === 'REGISTERED' &&
    !referral.qualification.finalizedAt &&
    new Date() < new Date(referral.qualification.endDate) &&
    (referredOrderCount > 0 || referrerOrderCount > 0)
  ) {
    referral.status = 'QUALIFYING';
    await referral.save();
  }

  const referredActiveDays = countActiveBusinessDays(
    referredOrders,
    referredOwner,
  );

  const referrerActiveDays = countActiveBusinessDays(
    referrerOrders,
    referrerOwner,
  );

  const rmaFeesGenerated = roundMoney(
    referredOrders.reduce(
      (total, order) => total + Number(order.rmaFee ?? order.rmaAmount ?? 0),
      0,
    ),
  );

  const rewardCalculation = calculateReferralReward(rmaFeesGenerated);

  const calculatedReward = rewardCalculation.calculatedReward;

  const currentReward = rewardCalculation.finalReward;

  const requiredOrders = Number(referral.qualification.requiredOrders);

  const requiredActiveDays = Number(referral.qualification.requiredActiveDays);

  const ordersProgress = Math.min(referredOrderCount / requiredOrders, 1);

  const activeDaysProgress = Math.min(
    referredActiveDays / requiredActiveDays,
    1,
  );

  const ordersQualified = referredOrderCount >= requiredOrders;

  const referredActiveDaysQualified = referredActiveDays >= requiredActiveDays;

  const referrerActiveDaysQualified = referrerActiveDays >= requiredActiveDays;

  const referrerOrdersQualified = referrerOrderCount >= requiredOrders;

  const fullyQualified = isReferralFullyQualified({
    referredOrderCount,
    referredActiveDays,
    referrerOrderCount,
    referrerActiveDays,
  });

  return {
    referralId: referral._id,
    cycleNumber: referral.cycleNumber,
    slotNumber: referral.slotNumber,
    status: referral.status,
    referralCode: referral.referralCode,

    joinedAt: referral.joinedAt,

    qualification: {
      startDate,
      endDate,
      qualificationDays: referral.qualification.qualificationDays,

      referredOwner: {
        orders: referredOrderCount,
        requiredOrders,
        activeDays: referredActiveDays,
        requiredActiveDays,
        ordersQualified,
        activeDaysQualified: referredActiveDaysQualified,
        ordersProgress,
        activeDaysProgress,
      },

      referrerOwner: {
        orders: referrerOrderCount,
        requiredOrders,
        activeDays: referrerActiveDays,
        requiredActiveDays,
        ordersQualified: referrerOrdersQualified,
        activeDaysQualified: referrerActiveDaysQualified,
      },

      fullyQualified,
    },

    earnings: {
      rmaFeesGenerated,
      rewardPercentage: referral.earnings.rewardPercentage,
      calculatedReward,
      rewardCap: referral.earnings.rewardCap,
      currentReward: roundMoney(currentReward),
      finalReward: referral.earnings.finalReward,
    },

    settlement: {
      status: referral.settlement.status,
      transactionId: referral.settlement.transactionId,
      transferredAt: referral.settlement.transferredAt,
    },

    referredShop: referredOwner
      ? {
          ownerId: referredOwner._id,
          shopId: referredOwner.shopId,
          shopName: referredOwner.shopName,
          ownerName: referredOwner.ownerName,
        }
      : null,

    referrerShop: referrerOwner
      ? {
          ownerId: referrerOwner._id,
          shopId: referrerOwner.shopId,
          shopName: referrerOwner.shopName,
          ownerName: referrerOwner.ownerName,
        }
      : null,
  };
}

async function finalizeReferralQualification(referralId, now = new Date()) {
  if (!referralId) {
    throw new Error('Referral ID is required');
  }

  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new Error('Referral not found');
  }

  // Already finalized — do not recalculate or overwrite it.
  if (referral.qualification.finalizedAt) {
    return {
      finalized: true,
      alreadyFinalized: true,
      referral,
    };
  }

  // Qualification period must be fully completed first.
  const qualificationEndDate = new Date(referral.qualification.endDate);

  if (now.getTime() < qualificationEndDate.getTime()) {
    return {
      finalized: false,
      reason: 'QUALIFICATION_PERIOD_NOT_ENDED',
      qualificationEndDate,
    };
  }

  const progress = await getReferralProgress(referral);

  const fullyQualified = isReferralFullyQualified({
    referredOrderCount: progress.qualification.referredOwner.orders,

    referredActiveDays: progress.qualification.referredOwner.activeDays,

    referrerOrderCount: progress.qualification.referrerOwner.orders,

    referrerActiveDays: progress.qualification.referrerOwner.activeDays,
  });

  const finalReward = fullyQualified ? progress.earnings.currentReward : 0;

  referral.status = fullyQualified ? 'QUALIFIED' : 'NOT_QUALIFIED';

  referral.qualification.referredOwnerOrders =
    progress.qualification.referredOwner.orders;

  referral.qualification.referrerOwnerOrders =
    progress.qualification.referrerOwner.orders;

  referral.qualification.referredOwnerActiveDays =
    progress.qualification.referredOwner.activeDays;

  referral.qualification.referrerOwnerActiveDays =
    progress.qualification.referrerOwner.activeDays;

  referral.earnings.rmaFeesGenerated = progress.earnings.rmaFeesGenerated;

  referral.earnings.calculatedReward = progress.earnings.calculatedReward;

  referral.earnings.finalReward = finalReward;

  referral.qualification.finalizedAt = now;

  if (fullyQualified && finalReward > 0) {
    await settleReferralReward(referral);
  } else {
    referral.settlement.status = 'NOT_READY';
  }

  await referral.save();

  return {
    finalized: true,
    alreadyFinalized: false,
    fullyQualified,
    finalReward,
    referral,
    progress,
  };
}

async function getOwnerReferralProgress(ownerId) {
  const referrals = await Referral.find({
    referrerOwnerId: ownerId,
  }).sort({ createdAt: -1 });

  const referralProgress = await Promise.all(
    referrals.map((referral) => getReferralProgress(referral)),
  );

  const latestReferral = await Referral.findOne({
    referrerOwnerId: ownerId,
  })
    .sort({
      cycleNumber: -1,
      slotNumber: -1,
    })
    .lean();

  const currentCycleNumber = latestReferral?.cycleNumber || 1;

  const currentCycleReferrals = referralProgress.filter(
    (referral) => referral.cycleNumber === currentCycleNumber,
  );

  const currentCycleUsedSlots = currentCycleReferrals.length;

  const qualifiedReferrals = referralProgress.filter(
    (referral) => referral.qualification.fullyQualified,
  ).length;

  const pendingReferrals = referralProgress.filter((referral) =>
    ['REGISTERED', 'QUALIFYING'].includes(referral.status),
  ).length;

  const currentReward = roundMoney(
    referralProgress.reduce(
      (total, referral) => total + referral.earnings.currentReward,
      0,
    ),
  );

  const paidReward = roundMoney(
    referralProgress.reduce(
      (total, referral) => total + Number(referral.earnings.finalReward || 0),
      0,
    ),
  );

  const ownerData = await Owner.findById(ownerId).select('referralCode').lean();

  return {
    referralCode: ownerData?.referralCode || null,

    currentCycle: currentCycleNumber,

    referralSlots: {
      used: currentCycleUsedSlots,
      total: 7,
      remaining: Math.max(7 - currentCycleUsedSlots, 0),
    },

    qualifiedReferrals,

    pendingReferrals,

    earnings: {
      currentReward,
      paidReward,
    },

    referrals: referralProgress,
  };
}

module.exports = {
  getOwnerReferralProgress,
  getReferralProgress,
  finalizeReferralQualification,
  settleReferralReward,
};
