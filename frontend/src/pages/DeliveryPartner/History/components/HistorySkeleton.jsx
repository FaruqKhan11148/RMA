import './HistorySkeleton.css';

function SkeletonBlock({ className = '' }) {
  return <div className={`history_skeleton_block ${className}`} />;
}

function HistorySkeleton() {
  return (
    <div
      className="delivery_history_skeleton"
      role="status"
      aria-label="Loading delivery history"
    >
      {[1, 2, 3].map((item) => (
        <article className="history_skeleton_card" key={item}>
          {/* Order ID and completed status */}
          <div className="history_skeleton_top">
            <div className="history_skeleton_order">
              <SkeletonBlock className="history_skeleton_icon" />

              <div className="history_skeleton_order_info">
                <SkeletonBlock className="history_skeleton_order_id" />
                <SkeletonBlock className="history_skeleton_date" />
              </div>
            </div>

            <SkeletonBlock className="history_skeleton_status" />
          </div>

          {/* Delivery details */}
          <div className="history_skeleton_details">
            {[1, 2, 3, 4].map((detail) => (
              <div className="history_skeleton_detail" key={detail}>
                <SkeletonBlock className="history_skeleton_detail_icon" />

                <div className="history_skeleton_detail_info">
                  <SkeletonBlock className="history_skeleton_detail_label" />
                  <SkeletonBlock className="history_skeleton_detail_value" />
                </div>
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="history_skeleton_customer">
            <SkeletonBlock className="history_skeleton_customer_label" />
            <SkeletonBlock className="history_skeleton_customer_name" />
          </div>

          {/* Delivery earnings */}
          <div className="history_skeleton_bottom">
            <SkeletonBlock className="history_skeleton_earning_label" />
            <SkeletonBlock className="history_skeleton_earning_amount" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default HistorySkeleton;
