function OrderRewardCard({
  loadingOrders,
  completedOrders,
  targetOrders,
  progress,
  remainingOrders,
  rewardUnlocked,
  rewardTransferred,
  rewardAmount,
  rewardRate,
  shopClosed,
  businessDate,
  openingTime,
  closingTime,
  ordersError,
  getProgressMessage,
  navigate,
}) {
  const displayReward = Number(rewardAmount || 0).toFixed(2);

  return (
    <section className="offer_card order_reward_card">
      <div className="offer_card_top">
        <div>
          <span className="offer_badge">1. ORDER REWARD</span>

          <h2>Complete {targetOrders} orders</h2>

          <p>
            Complete at least <strong>{targetOrders} orders</strong> in your
            business day and earn <strong>₹{rewardRate.toFixed(2)}</strong> for
            every completed order.
          </p>
        </div>

        <div className="offer_reward_amount">₹{displayReward}</div>
      </div>

      <div className="order_progress_section">
        <div
          className="circular_progress"
          style={{
            '--progress': `${Math.min(progress, 100) * 3.6}deg`,
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
              : rewardTransferred
                ? `₹${displayReward} reward transferred`
                : rewardUnlocked
                  ? `₹${displayReward} reward unlocked`
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
                width: `${Math.min(progress, 100)}%`,
              }}
            />
          </div>

          <span className="progress_hint">
            Earn ₹{rewardRate.toFixed(2)} for every completed order once you
            reach {targetOrders} orders.
          </span>

          {ordersError && <span className="progress_error">{ordersError}</span>}
        </div>
      </div>

      <div className="offer_status">
        <div className="offer_status_icon">
          {rewardTransferred ? '✓' : rewardUnlocked ? '✓' : '↗'}
        </div>

        <div>
          <strong>
            {rewardTransferred
              ? `₹${displayReward} Reward Transferred`
              : rewardUnlocked
                ? `₹${displayReward} Reward Unlocked`
                : 'Reward in Progress'}
          </strong>

          <span>
            {rewardTransferred
              ? `Congratulations! ₹${displayReward} has been transferred to your account.`
              : rewardUnlocked
                ? shopClosed
                  ? `The business day is closed and ₹${displayReward} is ready to be transferred to your account.`
                  : `Complete orders until ${closingTime} to finish today’s business day.`
                : `Only completed, paid and settled orders count towards this reward.`}
          </span>
        </div>
      </div>

      <div className="offer_business_day">
        <div>
          <span>Business day</span>
          <strong>{businessDate || 'Today'}</strong>
        </div>

        <div>
          <span>Shop hours</span>
          <strong>
            {openingTime || '--:--'} – {closingTime || '--:--'}
          </strong>
        </div>
      </div>

      <button
        type="button"
        className="offer_primary_button"
        onClick={() => navigate('/owner/orders')}
      >
        <span>
          {rewardTransferred
            ? 'View Completed Orders'
            : rewardUnlocked
              ? 'View Completed Orders'
              : 'Keep Completing Orders'}
        </span>

        <span>→</span>
      </button>
    </section>
  );
}

export default OrderRewardCard;
