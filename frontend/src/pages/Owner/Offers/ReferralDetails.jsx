import './ReferralDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchReferralProgress } from './utils/offersApi';

function ReferralDetails() {
  const navigate = useNavigate();

  const owner = JSON.parse(localStorage.getItem('rma_owner') || 'null');

  const ownerId = owner?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReferralProgress = async () => {
      if (!ownerId) {
        setError('Owner information not found.');
        setLoading(false);
        return;
      }

      try {
        const result = await fetchReferralProgress(ownerId);
        setData(result);
      } catch (err) {
        console.error('Failed to load referral progress:', err);
        setError(err.message || 'Failed to load referral details.');
      } finally {
        setLoading(false);
      }
    };

    loadReferralProgress();
  }, [ownerId]);

  if (loading) {
    return (
      <div className="referral_details_page">
        <p>Loading referral details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referral_details_page">
        <button type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <p>{error}</p>
      </div>
    );
  }

  const referrals = data?.referrals || [];

  return (
    <div className="referral_details_page">
      {/* ========================================
          HEADER
      ======================================== */}

      <button
        type="button"
        className="referral_back_button"
        onClick={() => navigate(-1)}
      >
        ← Back to Offers
      </button>

      <div className="referral_page_header">
        <span className="referral_page_eyebrow">REFER & EARN</span>

        <h1>Referral & Earn</h1>

        <p>
          Refer shop owners to RMA and earn a share of the RMA fees they
          generate.
        </p>
      </div>

      {/* ========================================
          REFERRAL CODE
      ======================================== */}

      <section className="referral_code_card">
        <div>
          <span className="referral_card_label">Your Referral Code</span>

          <strong className="referral_code_value">
            {data?.referralCode || 'Not available'}
          </strong>
        </div>

        <button
          type="button"
          className="referral_copy_button"
          onClick={async () => {
            if (!data?.referralCode) return;

            try {
              await navigator.clipboard.writeText(data.referralCode);
            } catch (copyError) {
              console.error('Failed to copy referral code:', copyError);
            }
          }}
        >
          Copy Code
        </button>
      </section>

      {/* ========================================
          SUMMARY
      ======================================== */}

      <div className="referral_summary_grid">
        <div className="referral_summary_card">
          <span>Referral Slots</span>

          <strong>
            {data?.referralSlots?.used || 0}/{data?.referralSlots?.total || 7}
          </strong>

          <small>{data?.referralSlots?.remaining || 0} remaining</small>
        </div>

        <div className="referral_summary_card">
          <span>Current Earnings</span>

          <strong>
            ₹{Number(data?.earnings?.currentReward || 0).toFixed(2)}
          </strong>

          <small>Based on current progress</small>
        </div>

        <div className="referral_summary_card">
          <span>Paid Earnings</span>

          <strong>₹{Number(data?.earnings?.paidReward || 0).toFixed(2)}</strong>

          <small>Successfully transferred</small>
        </div>
      </div>

      {/* ========================================
          REFERRALS
      ======================================== */}

      <section className="referrals_section">
        <div className="referrals_section_header">
          <span className="referral_page_eyebrow">YOUR NETWORK</span>

          <h2>Your Referrals</h2>

          <p>
            Track every shop you have referred and watch their qualification
            progress.
          </p>
        </div>

        {referrals.length === 0 ? (
          <div className="referral_empty_state">
            <h3>No referrals yet</h3>

            <p>
              Share your referral code with another shop owner to start earning.
            </p>
          </div>
        ) : (
          referrals.map((referral) => {
            const referredOwner = referral.qualification?.referredOwner || {};

            const referrerOwner = referral.qualification?.referrerOwner || {};

            const ordersProgress = Math.min(
              Number(referredOwner.ordersProgress || 0) * 100,
              100,
            );

            const activeDaysProgress = Math.min(
              Number(referredOwner.activeDaysProgress || 0) * 100,
              100,
            );

            const reward = Number(referral.earnings?.currentReward || 0);

            const rewardCap = Number(referral.earnings?.rewardCap || 500);

            return (
              <div className="referral_progress_card" key={referral.referralId}>
                {/* SHOP HEADER */}

                <div className="referral_progress_header">
                  <div>
                    <h3 className="referral_shop_name">
                      {referral.referredShop?.shopName || 'Shop'}
                    </h3>

                    <span className="referral_shop_id">
                      Shop ID:{' '}
                      {referral.referredShop?.shopId || 'Not available'}
                    </span>
                  </div>

                  <span className="referral_status_badge">
                    {referral.status === 'REGISTERED'
                      ? 'Qualification Started'
                      : referral.status}
                  </span>
                </div>

                {/* QUALIFICATION */}

                <div className="referral_progress_item">
                  <div className="referral_progress_label">
                    <span>Orders completed</span>

                    <strong>
                      {referredOwner.orders || 0} /{' '}
                      {referredOwner.requiredOrders || 100}
                    </strong>
                  </div>

                  <div className="referral_progress_track">
                    <div
                      className="referral_progress_fill"
                      style={{
                        width: `${ordersProgress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="referral_progress_item">
                  <div className="referral_progress_label">
                    <span>Active business days</span>

                    <strong>
                      {referredOwner.activeDays || 0} /{' '}
                      {referredOwner.requiredActiveDays || 18}
                    </strong>
                  </div>

                  <div className="referral_progress_track">
                    <div
                      className="referral_progress_fill"
                      style={{
                        width: `${activeDaysProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* REFERRER REQUIREMENT */}

                <div className="referral_partner_status">
                  <div>
                    <span>Your orders</span>

                    <strong>
                      {referrerOwner.orders || 0} /{' '}
                      {referrerOwner.requiredOrders || 100}
                    </strong>
                  </div>

                  <div>
                    <span>Your active days</span>

                    <strong>
                      {referrerOwner.activeDays || 0} /{' '}
                      {referrerOwner.requiredActiveDays || 18}
                    </strong>
                  </div>
                </div>

                {/* EARNINGS */}

                <div className="referral_earnings_grid">
                  <div className="referral_earning_box">
                    <span>RMA fees generated</span>

                    <strong>
                      ₹
                      {Number(referral.earnings?.rmaFeesGenerated || 0).toFixed(
                        2,
                      )}
                    </strong>
                  </div>

                  <div className="referral_earning_box">
                    <span>Your reward</span>

                    <strong>₹{reward.toFixed(2)}</strong>
                  </div>

                  <div className="referral_earning_box">
                    <span>Maximum reward</span>

                    <strong>₹{rewardCap.toFixed(2)}</strong>
                  </div>
                </div>

                {/* QUALIFICATION PERIOD */}

                <div className="referral_period_box">
                  <span>Qualification period</span>

                  <strong>
                    {new Date(referral.joinedAt).toLocaleDateString()} —{' '}
                    {new Date(
                      referral.qualification.endDate,
                    ).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default ReferralDetails;
