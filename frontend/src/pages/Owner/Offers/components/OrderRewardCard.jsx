function OrderRewardCard({
  loadingOrders,
  completedOrders,
  targetOrders,
  progress,
  remainingOrders,
  rewardUnlocked,
  ordersError,
  getProgressMessage,
  navigate,
}) {
  return (
    <section className="offer_card order_reward_card">
      <div className="offer_card_top">
        <div>
          <span className="offer_badge">1. ORDER REWARD</span>

          <h2>Complete 60 orders</h2>

          <p>
            Complete 60 orders and earn
            <strong> ₹199</strong>.
          </p>
        </div>

        <div className="offer_reward_amount">₹199</div>
      </div>

      <div className="order_progress_section">
        <div
          className="circular_progress"
          style={{
            '--progress': `${progress * 3.6}deg`,
          }}
        >
          <div className="circular_progress_inner">
            {loadingOrders ? (
              <>
                <strong>...</strong>
                <small>loading</small>
              </>
            ) : (
              <>
                <strong>{completedOrders}</strong>

                <span>of {targetOrders}</span>

                <small>completed today</small>
              </>
            )}
          </div>
        </div>

        <div className="order_progress_info">
          <span className="progress_percentage">
            {Math.round(progress)}% complete
          </span>

          <h3>
            {loadingOrders
              ? 'Checking today’s progress...'
              : rewardUnlocked
                ? 'Reward unlocked!'
                : `${remainingOrders} more to go`}
          </h3>

          <p>
            {loadingOrders
              ? 'Loading your completed orders...'
              : getProgressMessage()}
          </p>

          <div className="order_progress_bar">
            <div
              className="order_progress_bar_fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span className="progress_hint">
            Keep completing orders to reach ₹199.
          </span>

          {ordersError && <span className="progress_error">{ordersError}</span>}
        </div>
      </div>

      <div className="offer_status">
        <div className="offer_status_icon">
          {completedOrders >= targetOrders ? '✓' : '↗'}
        </div>

        <div>
          <strong>
            {completedOrders >= targetOrders
              ? '₹199 Reward Unlocked'
              : '₹199 Reward in Progress'}
          </strong>

          <span>
            {completedOrders >= targetOrders
              ? 'Your order target has been completed.'
              : 'Only completed orders count towards this reward.'}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="offer_primary_button"
        onClick={() => navigate('/owner/orders')}
      >
        <span>
          {completedOrders >= targetOrders
            ? 'View Completed Orders'
            : 'Keep Completing Orders'}
        </span>

        <span>→</span>
      </button>
    </section>
  );
}

export default OrderRewardCard;
