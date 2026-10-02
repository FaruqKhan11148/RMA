import { useLanguage } from '../../../context/LanguageContext';

function HomeExploreEnd({ onFindShops, onScanQr }) {
  const { t } = useLanguage();

  return (
    <section className="home_explore_end">
      <div className="home_explore_end_content">
        <span className="home_explore_end_eyebrow">
          {t.home.exploreEndEyebrow}
        </span>

        <h2>{t.home.exploreEndTitle}</h2>

        <p>{t.home.exploreEndDescription}</p>

        <div className="home_explore_end_actions">
          <button
            type="button"
            className="home_explore_end_primary"
            onClick={onFindShops}
          >
            {t.home.findMoreShops}
            <span>→</span>
          </button>

          <button
            type="button"
            className="home_explore_end_secondary"
            onClick={onScanQr}
          >
            {t.home.scanShopQr}
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
