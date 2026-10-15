import './OwnerDashboardSkeleton.css';

function SkeletonLine({ className = '' }) {
  return <span className={`owner_skeleton_line ${className}`} />;
}

function OwnerDashboardSkeleton() {
  return (
    <main className="owner_dashboard owner_dashboard_skeleton">
      {/* Dashboard header */}
      <section className="owner_dashboard_header">
        <div className="owner_skeleton_header_content">
          <SkeletonLine className="owner_skeleton_welcome" />
          <SkeletonLine className="owner_skeleton_owner_name" />
          <SkeletonLine className="owner_skeleton_shop_name" />
        </div>

        <div className="owner_header_actions">
          <div className="owner_skeleton_settings" />
        </div>
      </section>

      {/* Dashboard statistics */}
      <section
        className="owner_stats"
        aria-label="Loading dashboard statistics"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div className="owner_stat_card" key={index}>
            <SkeletonLine className="owner_skeleton_stat_label" />
            <SkeletonLine className="owner_skeleton_stat_value" />
          </div>
        ))}
      </section>

      {/* Manage orders */}
      <section className="manage_orders_section">
        <div className="manage_orders_card owner_skeleton_manage_card">
          <div className="owner_skeleton_manage_icon" />

          <div className="manage_orders_content">
            <SkeletonLine className="owner_skeleton_manage_title" />
            <SkeletonLine className="owner_skeleton_manage_description" />
            <SkeletonLine className="owner_skeleton_manage_description owner_skeleton_manage_description_short" />
          </div>

          <SkeletonLine className="owner_skeleton_manage_arrow" />
        </div>
      </section>

      {/* New orders */}
      <section className="owner_orders_section">
        <div className="owner_section_header">
          <div className="owner_skeleton_section_heading">
            <SkeletonLine className="owner_skeleton_section_title" />
            <SkeletonLine className="owner_skeleton_section_subtitle" />
          </div>
        </div>

        <div className="owner_orders">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="owner_order_card" key={index}>
              <div className="owner_order_top">
                <SkeletonLine className="owner_skeleton_order_id" />
                <SkeletonLine className="owner_skeleton_status" />
              </div>

              <SkeletonLine className="owner_skeleton_customer" />

              <div className="owner_order_items owner_skeleton_items">
                <SkeletonLine className="owner_skeleton_item" />
                <SkeletonLine className="owner_skeleton_item owner_skeleton_item_short" />
              </div>

              <SkeletonLine className="owner_skeleton_total" />

              <div className="owner_order_actions owner_skeleton_actions">
                <SkeletonLine className="owner_skeleton_action_button" />
                <SkeletonLine className="owner_skeleton_action_button" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section className="owner_orders_section">
        <div className="owner_section_header">
          <div className="owner_skeleton_section_heading">
            <SkeletonLine className="owner_skeleton_section_title" />
            <SkeletonLine className="owner_skeleton_section_subtitle" />
          </div>
        </div>

        <div className="owner_orders">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="owner_order_card compact" key={index}>
              <div className="owner_order_top">
                <SkeletonLine className="owner_skeleton_order_id" />
                <SkeletonLine className="owner_skeleton_status" />
              </div>

              <SkeletonLine className="owner_skeleton_recent_customer" />

              <div className="compact_order_bottom">
                <SkeletonLine className="owner_skeleton_recent_items" />
                <SkeletonLine className="owner_skeleton_recent_total" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OwnerDashboardSkeleton;
