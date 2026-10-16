import './DeliveryEarningsSkeleton.css';

function EarningsSkeletonBlock({ className = '' }) {
  return <div className={`earnings_skeleton_block ${className}`} />;
}

function DeliveryEarningsSkeleton() {
  return (
    <div
      className="delivery_earnings_skeleton"
      aria-label="Loading delivery earnings"
      role="status"
    >
      {/* Total earnings */}
      <section className="earnings_skeleton_total">
        <EarningsSkeletonBlock className="earnings_skeleton_icon" />
        <EarningsSkeletonBlock className="earnings_skeleton_label" />
        <EarningsSkeletonBlock className="earnings_skeleton_amount" />
        <EarningsSkeletonBlock className="earnings_skeleton_caption" />
      </section>

      {/* Today's and this week's earnings */}
      <section className="earnings_skeleton_summary">
        {[1, 2].map((item) => (
          <div className="earnings_skeleton_card" key={item}>
            <EarningsSkeletonBlock className="earnings_skeleton_small_icon" />
            <EarningsSkeletonBlock className="earnings_skeleton_card_label" />
            <EarningsSkeletonBlock className="earnings_skeleton_card_amount" />
          </div>
        ))}
      </section>

      {/* Earnings options */}
      <section className="earnings_skeleton_options">
        <EarningsSkeletonBlock className="earnings_skeleton_heading" />

        <div className="earnings_skeleton_option_group">
          {[1, 2, 3].map((item) => (
            <div className="earnings_skeleton_option" key={item}>
              <EarningsSkeletonBlock className="earnings_skeleton_option_icon" />
              <div className="earnings_skeleton_option_text">
                <EarningsSkeletonBlock className="earnings_skeleton_option_title" />
                <EarningsSkeletonBlock className="earnings_skeleton_option_caption" />
              </div>
              <EarningsSkeletonBlock className="earnings_skeleton_arrow" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent earnings */}
      <section className="earnings_skeleton_recent">
        <EarningsSkeletonBlock className="earnings_skeleton_heading" />

        <div className="earnings_skeleton_recent_group">
          {[1, 2, 3].map((item) => (
            <div className="earnings_skeleton_recent_row" key={item}>
              <div className="earnings_skeleton_recent_details">
                <EarningsSkeletonBlock className="earnings_skeleton_recent_title" />
                <EarningsSkeletonBlock className="earnings_skeleton_recent_caption" />
              </div>
              <EarningsSkeletonBlock className="earnings_skeleton_recent_amount" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DeliveryEarningsSkeleton;
