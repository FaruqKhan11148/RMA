function HomeExploreEnd({ onFindShops, onScanQr }) {
  return (
    <section className="home_explore_end">
      <div className="home_explore_end_content">
        <span className="home_explore_end_eyebrow">KEEP EXPLORING</span>

        <h2>Looking for something fresh?</h2>

        <p>Discover more meat and seafood shops near you.</p>

        <div className="home_explore_end_actions">
          <button
            type="button"
            className="home_explore_end_primary"
            onClick={onFindShops}
          >
            Find More Shops
            <span>→</span>
          </button>

          <button
            type="button"
            className="home_explore_end_secondary"
            onClick={onScanQr}
          >
            Scan Shop QR
          </button>
        </div>
      </div>

      <div className="home_explore_end_visual" aria-hidden="true">
        <div className="home_explore_end_circle home_explore_end_circle_one" />
        <div className="home_explore_end_circle home_explore_end_circle_two" />
        <span>🥩</span>
        <span>🍗</span>
        <span>🐟</span>
      </div>
    </section>
  );
}

export default HomeExploreEnd;
