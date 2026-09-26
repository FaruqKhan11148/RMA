function ReferralRewardCard({ shopId, copied, handleCopyShopId }) {
  return (
    <section className="offer_card referral_reward_card">
      <div className="offer_card_top">
        <div>
          <span className="offer_badge">2. REFER & EARN</span>

          <h2>Refer a shop owner</h2>

          <p>
            Refer another shop owner to RMA and earn
            <strong> ₹300</strong>.
          </p>
        </div>

        <div className="offer_reward_amount">₹300</div>
      </div>

      <div className="referral_steps">
        <div className="referral_step">
          <div className="referral_step_number">1</div>

          <div>
            <strong>Share your shop ID</strong>

            <span>
              Give your RMA shop ID to a shop owner you want to refer.
            </span>
          </div>
        </div>

        <div className="referral_line" />

        <div className="referral_step">
          <div className="referral_step_number">2</div>

          <div>
            <strong>They register with RMA</strong>

            <span>
              Your referred shop owner must register using your referral.
            </span>
          </div>
        </div>

        <div className="referral_line" />

        <div className="referral_step">
          <div className="referral_step_number">3</div>

          <div>
            <strong>They stay active for 28 days</strong>

            <span>
              Their account remains under the 28-day qualification period.
            </span>
          </div>
        </div>

        <div className="referral_line" />

        <div className="referral_step">
          <div className="referral_step_number">4</div>

          <div>
            <strong>You receive ₹300</strong>

            <span>
              Once the referral qualifies, your ₹300 reward becomes eligible.
            </span>
          </div>
        </div>
      </div>

      <div className="referral_id_box">
        <div>
          <span>Your Shop ID</span>

          <strong>{shopId}</strong>
        </div>

        <button type="button" onClick={handleCopyShopId}>
          {copied ? 'Copied' : 'Copy ID'}
        </button>
      </div>

      <button
        type="button"
        className="offer_primary_button"
        onClick={handleCopyShopId}
      >
        <span>{copied ? 'Shop ID Copied' : 'Share My Referral ID'}</span>

        <span>→</span>
      </button>
    </section>
  );
}

export default ReferralRewardCard;
