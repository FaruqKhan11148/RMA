import { useNavigate } from 'react-router-dom';

function ReferralRewardCard({ referralCode, copied, handleCopyReferralCode }) {
  const navigate = useNavigate();

  return (
    <section className="offer_card referral_reward_card">
      <div className="offer_card_top">
        <div>
          <span className="offer_badge">2. REFER & EARN</span>

          <h2>Refer shop owners. Earn rewards.</h2>

          <p>
            Invite shop owners to RMA and earn
            <strong> up to ₹500 per qualified referral.</strong>
            Track your referrals and earnings from your dashboard.
          </p>
        </div>

        <div className="offer_reward_amount">₹500</div>
      </div>

      <div className="referral_id_box">
        <div>
          <span>Your Permanent Referral Code</span>

          <strong>{referralCode || 'Loading...'}</strong>
        </div>

        <button
          type="button"
          onClick={handleCopyReferralCode}
          disabled={!referralCode}
        >
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>

      <button
        type="button"
        className="offer_primary_button"
        onClick={() => navigate('/owner/offers/referrals')}
      >
        <span>View Referral Dashboard</span>
        <span>→</span>
      </button>
    </section>
  );
}

export default ReferralRewardCard;
