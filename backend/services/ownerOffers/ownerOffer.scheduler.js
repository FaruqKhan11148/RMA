const cron = require('node-cron');

const Owner = require('../../models/Owner');
const Referral = require('../../models/Referral');

const { finalizeOwnerOffer } = require('./ownerOffer.service');
const { finalizeReferralQualification } = require('./referral.service');

// ============================================================
// OFFER 1 FINALIZATION SCHEDULER
// ============================================================

async function finalizeClosedOwnerOffers() {
  try {
    const owners = await Owner.find({
      status: { $ne: 'inactive' },
    }).select('_id');

    if (!owners.length) {
      return;
    }

    for (const owner of owners) {
      try {
        const result = await finalizeOwnerOffer(owner._id);

        if (result.finalized) {
          console.log('[OWNER OFFER] Transaction:', {
            transactionType: result.transaction?.transactionType,
            description: result.transaction?.description,
            transactionId: result.transaction?.transactionId,
            referenceId: result.transaction?.referenceId,
            amount: result.transaction?.amount,
            status: result.transaction?.status,
          });
          if (result.alreadyProcessed) {
            console.log(
              `[OWNER OFFER] Already processed for owner ${owner._id}`,
            );
          } else {
            console.log(
              `[OWNER OFFER] Finalized ₹${result.progress.rewardAmount} for owner ${owner._id}`,
            );
          }
        }
      } catch (error) {
        console.error(
          `[OWNER OFFER] Failed for owner ${owner._id}:`,
          error.message,
        );
      }
    }
  } catch (error) {
    console.error('[OWNER OFFER] Scheduler failed:', error.message);
  }
}

async function finalizeExpiredReferralQualifications() {
  try {
    const now = new Date();

    console.log('[REFERRAL] Scheduler now:', now.toISOString());

    const expiredReferrals = await Referral.find({
      'qualification.endDate': { $lte: now },
      'qualification.finalizedAt': null,
      status: { $in: ['REGISTERED', 'QUALIFYING'] },
    });

    if (!expiredReferrals.length) {
      console.log('[REFERRAL] No expired referrals found');
      return;
    }

    console.log(
      `[REFERRAL] Found ${expiredReferrals.length} expired referral(s)`,
    );

    for (const referral of expiredReferrals) {
      try {
        const result = await finalizeReferralQualification(referral._id, now);

        if (result.finalized) {
          console.log('[REFERRAL] Qualification finalized:', {
            referralId: referral._id,
            status: result.referral?.status,
            finalReward: result.finalReward,
          });
        }
      } catch (error) {
        console.error(`[REFERRAL] Failed for ${referral._id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[REFERRAL] Scheduler failed:', error.message);
  }
}

// ============================================================
// START SCHEDULER
// ============================================================

function startOwnerOfferScheduler() {
  // Run every 5 minutes.
  cron.schedule('*/5 * * * *', async () => {
    console.log('[OWNER OFFER] Checking closed business days...');

    await finalizeClosedOwnerOffers();
    await finalizeExpiredReferralQualifications();
  });

  console.log('[OWNER OFFER] Scheduler started — checking every 5 minutes');
}

module.exports = {
  startOwnerOfferScheduler,
  finalizeClosedOwnerOffers,
};
