import './DeliveryDashboardSkeleton.css';

function DeliveryDashboardSkeleton() {
  return (
    <main
      className="delivery_dashboard delivery_dashboard_skeleton"
      aria-label="Loading delivery dashboard"
      aria-busy="true"
    >
      {/* Header */}
      <header className="delivery_dashboard_header">
        <div className="delivery_skeleton_header_text">
          <div className="delivery_skeleton_line delivery_skeleton_greeting" />
          <div className="delivery_skeleton_line delivery_skeleton_title" />
          <div className="delivery_skeleton_line delivery_skeleton_subtitle" />
        </div>

        <div className="delivery_skeleton_badge" />
      </header>

      {/* Availability status */}
      <section className="delivery_status_card">
        <div className="delivery_skeleton_block delivery_skeleton_status_icon" />

        <div className="delivery_skeleton_status_content">
          <div className="delivery_skeleton_line delivery_skeleton_status_title" />
          <div className="delivery_skeleton_line delivery_skeleton_status_text" />
        </div>

        <div className="delivery_skeleton_toggle" />
      </section>

      {/* Summary cards */}
      <section className="delivery_summary_grid" aria-label="Dashboard summary">
        {['earnings', 'deliveries', 'completed'].map((item) => (
          <div className="delivery_summary_card" key={item}>
            <div
              className={`delivery_skeleton_block delivery_skeleton_summary_icon ${item}`}
            />
            <div className="delivery_skeleton_line delivery_skeleton_label" />
            <div className="delivery_skeleton_line delivery_skeleton_value" />
          </div>
        ))}
      </section>

      {/* Active delivery */}
      <section className="delivery_section">
        <div className="delivery_section_header">
          <div className="delivery_skeleton_line delivery_skeleton_section_title" />
        </div>

        <div className="delivery_active_card">
          <div className="delivery_skeleton_active_top">
            <div className="delivery_skeleton_active_info">
              <div className="delivery_skeleton_line delivery_skeleton_active_label" />
              <div className="delivery_skeleton_line delivery_skeleton_active_title" />
            </div>

            <div className="delivery_skeleton_active_badge" />
          </div>

          <div className="delivery_active_details">
            <div className="delivery_skeleton_detail">
              <div className="delivery_skeleton_block delivery_skeleton_detail_icon" />
              <div className="delivery_skeleton_line delivery_skeleton_detail_text" />
            </div>

            <div className="delivery_skeleton_detail">
              <div className="delivery_skeleton_block delivery_skeleton_detail_icon" />
              <div className="delivery_skeleton_line delivery_skeleton_detail_text long" />
            </div>
          </div>

          <div className="delivery_skeleton_button" />
        </div>
      </section>

      {/* Delivery requests */}
      <section className="delivery_section">
        <div className="delivery_section_header">
          <div className="delivery_skeleton_line delivery_skeleton_section_title" />
          <div className="delivery_skeleton_count" />
        </div>

        <div className="delivery_request_card">
          <div className="delivery_skeleton_block delivery_skeleton_request_icon" />

          <div className="delivery_skeleton_request_content">
            <div className="delivery_skeleton_line delivery_skeleton_request_title" />
            <div className="delivery_skeleton_line delivery_skeleton_request_text" />
          </div>
        </div>
      </section>

      {/* Delivery area */}
      <section className="delivery_section">
        <div className="delivery_section_header">
          <div className="delivery_skeleton_line delivery_skeleton_section_title" />
        </div>

        <div className="delivery_area_card">
          <div className="delivery_skeleton_block delivery_skeleton_area_icon" />

          <div className="delivery_skeleton_area_content">
            <div className="delivery_skeleton_line delivery_skeleton_area_title" />
            <div className="delivery_skeleton_line delivery_skeleton_area_text" />
            <div className="delivery_skeleton_line delivery_skeleton_area_text short" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default DeliveryDashboardSkeleton;
