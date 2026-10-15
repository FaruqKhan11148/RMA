import './OwnerRecentEarningsSkeleton.css';

function OwnerRecentEarningsSkeleton() {
  return (
    <main
      className="owner_earnings_page owner_recent_earnings_skeleton"
      aria-busy="true"
      aria-label="Loading recent earnings"
    >
      {/* Back button and header */}
      <div className="owner_recent_earnings_header">
        <div className="recent_skeleton-line recent_skeleton-back" />
        <div className="recent_skeleton-line recent_skeleton-title" />
        <div className="recent_skeleton-line recent_skeleton-subtitle" />
      </div>

      {/* Date filter */}
      <section className="recent_skeleton-filter">
        <div className="recent_skeleton-line recent_skeleton-filter-label" />
        <div className="recent_skeleton-line recent_skeleton-select" />
      </section>

      {/* Summary statistics */}
      <section className="owner-earnings-filter-summary">
        {[1, 2, 3].map((item) => (
          <div className="recent_skeleton-summary-item" key={item}>
            <div className="recent_skeleton-line recent_skeleton-summary-label" />
            <div className="recent_skeleton-line recent_skeleton-summary-value" />
          </div>
        ))}
      </section>

      {/* Selection and archive toolbar */}
      <div className="recent_skeleton-toolbar">
        <div className="recent_skeleton-line recent_skeleton-toolbar-label" />
        <div className="recent_skeleton-line recent_skeleton-toolbar-button" />
      </div>

      {/* Order cards */}
      <section className="owner_earnings_orders">
        <div className="owner_earnings_section_header">
          <div className="recent_skeleton-line recent_skeleton-section-title" />
        </div>

        <div className="owner_earnings_order_list">
          {[1, 2, 3].map((item) => (
            <article className="recent_skeleton-order-card" key={item}>
              <div className="recent_skeleton-order-top">
                <div className="recent_skeleton-order-id">
                  <div className="recent_skeleton-line recent_skeleton-order-label" />
                  <div className="recent_skeleton-line recent_skeleton-order-value" />
                </div>
                <div className="recent_skeleton-line recent_skeleton-status" />
              </div>

              <div className="recent_skeleton-order-details">
                {[1, 2, 3].map((detail) => (
                  <div className="recent_skeleton-detail" key={detail}>
                    <div className="recent_skeleton-line recent_skeleton-detail-label" />
                    <div className="recent_skeleton-line recent_skeleton-detail-value" />
                  </div>
                ))}
              </div>

              <div className="recent_skeleton-order-bottom">
                <div className="recent_skeleton-line recent_skeleton-date" />
                <div className="recent_skeleton-line recent_skeleton-view" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OwnerRecentEarningsSkeleton;
