function ReferralRewardCard({ shopId, copied, handleCopyShopId }) {
  return (
    <section className="offer_card referral_reward_card">
      <div className="offer_card_top">
        <div>
          <span className="offer_badge">2. REFER & EARN</span>

          <h2>Refer a shop owner</h2>

          <p>
            Refer another shop owner to RMA and earn
            <strong> ₹50 to ₹500</strong>.
          </p>
        </div>

        <div className="offer_reward_amount">₹50 to ₹500</div>
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
            <strong>You stay active on RMA</strong>

            <span>
              Your shop must complete at least 5 orders each day during the
              referral qualification period.
            </span>
          </div>
        </div>

        <div className="referral_line" />

        <div className="referral_step">
          <div className="referral_step_number">4</div>

          <div>
            <strong>They stay active for 25 days</strong>

            <span>
              Their shop must remain active for 25 days and complete at least 5
              orders each day.
            </span>
          </div>
        </div>

        <div className="referral_line" />

        <div className="referral_step">
          <div className="referral_step_number">5</div>

          <div>
            <strong>You receive ₹50 - ₹500</strong>

            <span>
              Once both shops meet the requirements, your referral reward
              becomes eligible.
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
