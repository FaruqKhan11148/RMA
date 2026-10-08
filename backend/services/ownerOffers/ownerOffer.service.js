const Owner = require('../../models/Owner');
const Order = require('../../models/Order');
const TestBankAccount = require('../../models/TestBankAccount');
const TestBankTransaction = require('../../models/TestBankTransaction');

const { creditOwnerOffer } = require('../testBank/testBankLedger.service');

// ============================================================
// CONSTANTS
// ============================================================

const OFFER_ID = 'OFFER_1';
const TARGET_ORDERS = 25;
const REWARD_PER_ORDER = 1.66;
const RMA_ACCOUNT_NUMBER = 'RMA-SYSTEM-000001';

// ============================================================
// HELPERS
// ============================================================

function parseTimeToMinutes(timeString) {
  const [hours, minutes] = String(timeString || '00:00')
    .split(':')
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid shop time: ${timeString}`);
  }

  return hours * 60 + minutes;
}

function getBusinessDayWindow(owner, now = new Date()) {
  const openingTime = owner.deliverySettings?.openingTime || '10:00';
  const closingTime = owner.deliverySettings?.closingTime || '22:00';

  const openingMinutes = parseTimeToMinutes(openingTime);
  const closingMinutes = parseTimeToMinutes(closingTime);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  // Normal same-day shop:
  // Example: 10:00 -> 21:00
  if (closingMinutes > openingMinutes) {
    if (currentMinutes < openingMinutes) {
      // Before today's opening.
      // The current business day has not started yet.
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    }

    start.setHours(Math.floor(openingMinutes / 60), openingMinutes % 60, 0, 0);

    end.setHours(Math.floor(closingMinutes / 60), closingMinutes % 60, 0, 0);
  } else {
    // Overnight shop:
    // Example: 18:00 -> 02:00
    if (currentMinutes >= openingMinutes) {
      end.setDate(end.getDate() + 1);
    } else {
      start.setDate(start.getDate() - 1);
    }

    start.setHours(Math.floor(openingMinutes / 60), openingMinutes % 60, 0, 0);

    end.setHours(Math.floor(closingMinutes / 60), closingMinutes % 60, 0, 0);
  }

  return {
    businessDayStart: start,
    businessDayEnd: end,
    openingTime,
    closingTime,
  };
}

function isBusinessDayClosed(businessDayEnd, now = new Date()) {
  return now >= businessDayEnd;
}

function getBusinessDate(businessDayStart) {
  const year = businessDayStart.getFullYear();
  const month = String(businessDayStart.getMonth() + 1).padStart(2, '0');
  const day = String(businessDayStart.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ============================================================
// OFFER 1 PROGRESS
// ============================================================

async function getOwnerOfferProgress(ownerId, now = new Date()) {
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const owner = await Owner.findById(ownerId);

  if (!owner) {
    throw new Error('Owner not found');
  }

  const { businessDayStart, businessDayEnd, openingTime, closingTime } =
    getBusinessDayWindow(owner, now);

  const completedOrders = await Order.countDocuments({
    ownerId,
    status: 'Completed',
    paymentStatus: 'Paid',
    settlementStatus: 'Settled',
    completedAt: {
      $gte: businessDayStart,
      $lt: businessDayEnd,
    },
  });

  const eligible = completedOrders >= TARGET_ORDERS;

  const rewardAmount = eligible
    ? Number((completedOrders * REWARD_PER_ORDER).toFixed(2))
    : 0;

  const shopClosed = isBusinessDayClosed(businessDayEnd, now);

  const businessDate = getBusinessDate(businessDayStart);

  const referenceId = `${OFFER_ID}_${ownerId}_${businessDate}`;

  const existingOfferTransaction = await TestBankTransaction.findOne({
    transactionType: 'OWNER_OFFER',
    referenceType: 'SYSTEM',
    referenceId,
    status: 'COMPLETED',
  });

  return {
    ownerId,
    offerId: OFFER_ID,

    businessDate,
    businessDayStart,
    businessDayEnd,

    openingTime,
    closingTime,

    shopClosed,

    completedOrders,
    targetOrders: TARGET_ORDERS,

    rewardRate: REWARD_PER_ORDER,
    rewardAmount,

    eligible,

    rewardTransferred: Boolean(existingOfferTransaction),

    referenceId,
  };
}

// ============================================================
// FINALIZE OFFER 1
// ============================================================

async function finalizeOwnerOffer(ownerId, now = new Date()) {
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const progress = await getOwnerOfferProgress(ownerId, now);

  if (!progress.shopClosed) {
    return {
      finalized: false,
      reason: 'BUSINESS_DAY_NOT_CLOSED',
      progress,
    };
  }

  if (!progress.eligible) {
    return {
      finalized: false,
      reason: 'TARGET_NOT_REACHED',
      progress,
    };
  }

  const rmaAccount = await TestBankAccount.findOne({
    accountType: 'RMA',
    accountNumber: RMA_ACCOUNT_NUMBER,
    status: 'ACTIVE',
  });

  if (!rmaAccount) {
    throw new Error(`Active RMA account ${RMA_ACCOUNT_NUMBER} not found`);
  }

  const ownerAccount = await TestBankAccount.findOne({
    accountType: 'OWNER',
    ownerId,
    status: 'ACTIVE',
  });

  if (!ownerAccount) {
    throw new Error(
      `Active TestBank owner account not found for owner ${ownerId}`,
    );
  }

  const transferResult = await creditOwnerOffer({
    rmaAccountId: rmaAccount._id,
    ownerAccountId: ownerAccount._id,
    amount: progress.rewardAmount,
    referenceId: progress.referenceId,
    description: 'Your offer money',
    metadata: {
      offer: OFFER_ID,
      ownerId,
      businessDate: progress.businessDate,
      completedOrders: progress.completedOrders,
      targetOrders: TARGET_ORDERS,
      rewardRate: REWARD_PER_ORDER,
      rewardAmount: progress.rewardAmount,
      businessDayStart: progress.businessDayStart,
      businessDayEnd: progress.businessDayEnd,
    },
  });

  return {
    finalized: true,
    alreadyProcessed: transferResult.alreadyProcessed,
    progress,
    transaction: transferResult.transaction,
  };
}

module.exports = {
  getOwnerOfferProgress,
  finalizeOwnerOffer,
  getBusinessDayWindow,
  getBusinessDate,
};
