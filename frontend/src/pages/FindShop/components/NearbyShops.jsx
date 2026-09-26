import NearbyShopImageSlider from '../../../components/NearbyShopImageSlider/NearbyShopImageSlider';

function NearbyShops({
  nearbyShops,
  loadingNearbyShops,
  nearbyShopsError,
  onUseLocation,
  onShopClick,
}) {
  return (
    <section className="find_shop_nearby">
      <div className="find_shop_section_header">
        <div>
          <span className="find_shop_section_eyebrow">1. NEAR YOU</span>

          <h2>Nearby Shops</h2>

          <p>Fresh shops around your location</p>
        </div>

        <span className="find_shop_distance">Within 5 km</span>
      </div>

      {loadingNearbyShops && (
        <div className="find_shop_message">Finding nearby shops...</div>
      )}

      {!loadingNearbyShops && nearbyShopsError && (
        <div className="find_shop_message find_shop_error">
          {nearbyShopsError}
        </div>
      )}

      {!loadingNearbyShops && !nearbyShopsError && nearbyShops.length === 0 && (
        <div className="find_shop_nearby_placeholder">
          <div className="find_shop_placeholder_icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5 5 9C5 14.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="9"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <h3>Find shops near you</h3>

          <p>Allow location access to see meat and seafood shops around you.</p>

          <button type="button" onClick={onUseLocation}>
            Use My Location
          </button>
        </div>
      )}

      {!loadingNearbyShops && !nearbyShopsError && nearbyShops.length > 0 && (
        <div className="find_shop_nearby_list">
          {nearbyShops.map((shop) => (
            <button
              key={shop.shopId}
              type="button"
              className="find_shop_nearby_card"
              onClick={() => onShopClick(shop.shopId)}
            >
              <NearbyShopImageSlider shop={shop} />

              <div className="find_shop_nearby_card_content">
                <div className="find_shop_nearby_title_row">
                  <h3>{shop.shopName}</h3>

                  <span className="find_shop_nearby_rating">
                    <span className="find_shop_nearby_rating_star">★</span>

                    <span>4.5</span>
                  </span>
                </div>

                <p className="find_shop_nearby_description">
                  {shop.description || 'Fresh meat and seafood'}
                </p>

                <div className="find_shop_nearby_meta">
                  <span>{shop.distance} km</span>

                  <span>•</span>

                  <span>{shop.delivery ? 'Delivery' : 'Pickup'}</span>

                  <span>•</span>

                  <span
                    className={
                      shop.isOpen
                        ? 'find_shop_nearby_status_open'
                        : 'find_shop_nearby_status_closed'
                    }
                  >
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <div className="find_shop_nearby_card_footer">
                <span>{shop.shopId}</span>

                <span>
                  View Shop
                  <span className="find_shop_nearby_arrow">→</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default NearbyShops;
