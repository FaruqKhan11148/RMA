function ReferralTrackingCard({ handleCopyShopId }) {
  return (
    <section className="offer_card referral_tracking_card">
      <div className="tracking_header">
        <div>
          <span className="offer_badge">3. MY REFERRALS</span>

          <h2>Track your referrals</h2>
        </div>

        <span className="tracking_count">0</span>
      </div>

      <div className="no_referrals">
        <div className="no_referrals_icon">+</div>

        <h3>No referrals yet</h3>

        <p>Refer your first shop owner and start your 28-day reward journey.</p>

        <button type="button" onClick={handleCopyShopId}>
          Share My Shop ID
        </button>
      </div>
    </section>
  );
}

export default ReferralTrackingCard;
