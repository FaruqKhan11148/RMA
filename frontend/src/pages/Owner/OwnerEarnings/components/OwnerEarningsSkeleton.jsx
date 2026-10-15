import './OwnerEarningsSkeleton.css';

function OwnerEarningsSkeleton() {
  return (
    <main
      className="owner_earnings_page owner_earnings_skeleton"
      aria-busy="true"
      aria-label="Loading earnings"
    >
      {/* Header */}
      <section className="owner_earnings_header">
        <div className="earnings_skeleton-line earnings_skeleton-title" />
        <div className="earnings_skeleton-line earnings_skeleton-subtitle" />
      </section>

      {/* Today's earnings hero */}
      <section className="owner_earnings_total earnings_skeleton-hero">
        <div className="earnings_skeleton-circle" />

        <div className="earnings_skeleton-line earnings_skeleton-label" />

        <div className="earnings_skeleton-line earnings_skeleton-amount" />

        <div className="earnings_skeleton-line earnings_skeleton-description" />

        <div className="earnings_skeleton-line earnings_skeleton-orders" />
      </section>

      {/* Weekly earnings and settled orders */}
      <section className="owner_earnings_period_cards">
        {[1, 2].map((item) => (
          <div className="owner_earnings_period_card" key={item}>
            <div className="earnings_skeleton-circle earnings_skeleton-stat-icon" />
            <div className="earnings_skeleton-line earnings_skeleton-stat-label" />
            <div className="earnings_skeleton-line earnings_skeleton-stat-value" />
          </div>
        ))}
      </section>

      {/* Money section */}
      <section className="owner_earnings_money">
        <div className="earnings_skeleton-line earnings_skeleton-section-title" />

        <div className="owner_earnings_money_list">
          {[1, 2, 3].map((item) => (
            <div className="owner_earnings_money_item" key={item}>
              <div className="earnings_skeleton-circle earnings_skeleton-money-icon" />

              <div className="earnings_skeleton-money-text">
                <div className="earnings_skeleton-line earnings_skeleton-money-heading" />
                <div className="earnings_skeleton-line earnings_skeleton-money-value" />
              </div>

              <div className="earnings_skeleton-chevron" />
            </div>
          ))}
        </div>
      </section>

      {/* Navigation cards */}
      <section className="owner_earnings_navigation">
        <div className="earnings_skeleton-line earnings_skeleton-navigation-title" />
        <div className="earnings_skeleton-line earnings_skeleton-navigation-description" />

        <div className="owner_earnings_navigation_grid">
          {[1, 2, 3].map((item) => (
            <div className="owner_earnings_navigation_card" key={item}>
              <div className="earnings_skeleton-circle earnings_skeleton-navigation-icon" />

              <div className="earnings_skeleton-navigation-text">
                <div className="earnings_skeleton-line earnings_skeleton-navigation-heading" />
                <div className="earnings_skeleton-line earnings_skeleton-navigation-subtitle" />
              </div>

              <div className="earnings_skeleton-chevron" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OwnerEarningsSkeleton;
