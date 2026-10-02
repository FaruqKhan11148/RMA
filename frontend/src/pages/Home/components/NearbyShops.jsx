import NearbyShopImageSlider from '../../../components/NearbyShopImageSlider/NearbyShopImageSlider';

import { useLanguage } from '../../../context/LanguageContext';

function NearbyShops({
  userLocation,
  nearbyShops,
  loadingNearbyShops,
  nearbyShopsError,
  onSeeAll,
  onLocationClick,
  onChangeLocation,
  onShopClick,
}) {
  const { t } = useLanguage();

  return (
    <section className="nearby_shops">
      <div className="nearby_shops_header">
        <div>
          <span className="nearby_shops_eyebrow">{t.home.nearYou}</span>

          <h2>{t.home.nearbyShops}</h2>

          <p>{t.home.nearbyShopsDescription}</p>
        </div>

        <button className="nearby_shops_see_all" onClick={onSeeAll}>
          {t.home.seeAll}
          <span>→</span>
        </button>
      </div>

      {loadingNearbyShops && (
        <div className="nearby_shops_loading">{t.home.loadingNearbyShops}</div>
      )}

      {!loadingNearbyShops && nearbyShopsError && (
        <div className="nearby_shops_error">{nearbyShopsError}</div>
      )}

      {!loadingNearbyShops && !nearbyShopsError && nearbyShops.length === 0 && (
        <div className="nearby_shops_empty">
          {!userLocation ? (
            <>
              <h3>{t.home.selectYourLocation}</h3>

              <p>{t.home.selectLocationDescription}</p>

              <button
                style={{
                  marginRight: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  verticalAlign: 'middle',
                }}
                onClick={onLocationClick}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5.134 5 9C5 14.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {t.home.selectLocation}
              </button>

              <button
                style={{
                  marginLeft: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  verticalAlign: 'middle',
                }}
                onClick={onSeeAll}
              >
                {t.home.exploreShops}
              </button>
            </>
          ) : (
            <>
              <h3>{t.home.noNearbyShops}</h3>

              <p>{t.home.noNearbyShopsDescription}</p>

              <button
                style={{
                  marginRight: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  verticalAlign: 'middle',
                }}
                onClick={onChangeLocation}
              >
                {t.home.changeLocation}
              </button>

              <button
                style={{
                  marginLeft: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  verticalAlign: 'middle',
                }}
                onClick={onSeeAll}
              >
                {t.home.exploreShops}
              </button>
            </>
          )}
        </div>
      )}

      {!loadingNearbyShops && !nearbyShopsError && nearbyShops.length > 0 && (
        <div className="nearby_shops_list">
          {nearbyShops.map((shop) => (
            <button
              key={shop.shopId}
              className="nearby_shop_card"
              onClick={() => onShopClick(shop.shopId)}
            >
              <NearbyShopImageSlider shop={shop} />

              <div className="nearby_shop_content">
                <div className="nearby_shop_title_row">
                  <h3>{shop.shopName}</h3>

                  <span className="nearby_shop_rating">★ 4.5</span>
                </div>

                <p className="nearby_shop_description">
                  {shop.description || t.home.freshMeatSeafood}
                </p>

                <div className="nearby_shop_meta">
                  <span>{shop.distance} km</span>

                  <span>•</span>

                  <span>{shop.delivery ? t.home.delivery : t.home.pickup}</span>

                  <span>•</span>

                  <span
                    className={
                      shop.isOpen ? 'shop_status_open' : 'shop_status_closed'
                    }
                  >
                    {shop.isOpen ? t.home.open : t.home.closed}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default NearbyShops;
