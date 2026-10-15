function SkeletonLine({ className = '', width }) {
  return (
    <span
      className={`rma_skeleton_line ${className}`}
      style={width ? { width } : undefined}
      aria-hidden="true"
    />
  );
}

function OrderRewardSkeleton() {
  return (
    <section
      className="offer_card order_reward_card order_reward_skeleton"
      aria-label="Loading order rewards"
      aria-busy="true"
    >
      <div className="offer_card_top">
        <div className="order_reward_skeleton_heading">
          <SkeletonLine width="145px" />
          <SkeletonLine className="rma_skeleton_title" width="250px" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="82%" />
        </div>

        <SkeletonLine className="rma_skeleton_amount" width="100px" />
      </div>

      <div className="order_progress_section">
        <div className="rma_skeleton_circle">
          <div>
            <SkeletonLine width="54px" />
            <SkeletonLine width="75px" />
          </div>
        </div>

        <div className="order_progress_info order_reward_skeleton_info">
          <SkeletonLine width="115px" />
          <SkeletonLine className="rma_skeleton_title" width="230px" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="70%" />
          <SkeletonLine className="rma_skeleton_bar" width="100%" />
          <SkeletonLine width="90%" />
        </div>
      </div>

      <div className="offer_status order_reward_skeleton_status">
        <SkeletonLine className="rma_skeleton_icon" width="42px" />

        <div>
          <SkeletonLine width="190px" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="75%" />
        </div>
      </div>

      <div className="offer_business_day">
        <div>
          <SkeletonLine width="85px" />
          <SkeletonLine width="120px" />
        </div>

        <div>
          <SkeletonLine width="75px" />
          <SkeletonLine width="130px" />
        </div>
      </div>

      <SkeletonLine className="rma_skeleton_button" width="100%" />
    </section>
  );
}

export default OrderRewardSkeleton;