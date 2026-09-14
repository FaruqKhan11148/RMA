import './Home.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import productCatalogue from '../../data/productCatalogue';

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loadingNearbyShops, setLoadingNearbyShops] = useState(false);
  const [nearbyShopsError, setNearbyShopsError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const popularProducts = nearbyShops
    .flatMap((shop) =>
      (shop.products || [])
        .filter((product) => product.available)
        .map((product) => ({
          ...product,
          shopId: shop.shopId,
          shopName: shop.shopName,
          shopDistance: shop.distance,
        })),
    )
    .slice(0, 8);

  // ==========================================
  // RMA MEAT IMAGES
  // Replace these with your Cloudinary URLs
  // ==========================================

  const meatImages = [
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/HuNbApWSmQc9TvMcm31ZogyfUsbl1wA6KBdndBiI3vh39M_m0yUZ_1LGjXTrwgWIhIfew2gPb-PxXaVaTItYVcU6AUIulUU3xxDiVx0l7eYM8vlhvqM2tF91-JCYsZu8UgFgUhWezrFzcq94RvzhS9qW3mRmv40PHwwBH0puu9cuGlvFrSOSVkYJHL8pN_bl.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/rYKkTplP1CFqmXNxxpnxvf_Da5-LkcRD6slxlBH3-HBpeo4Fro5mFCDNo2aYtNYwgiqm3PWXyPeb9L2ZbpmpeCDTv6oWbTmQHL6HUMbPzjcZeJ946-zJyqc0zRhVk6DioJTJYGsDTiHbRCP0qxHiyB68uTO9_HBdzGXNfK9EjMS1xqsJVuas22DpDLVbkTsL.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692758/YXAoTCSnLmtzr1cckX1A5eVY1Jjq2McuzwVKDQEu9iZYeo3pUhak7P-ZI6LLTe82ZMh0j-7FwKo1Kx90mRJEdHyFKeh6cDEbpHII6zXFtWiH-m5Lon8EUPbVSaK9nCh7LuLOmtNMiNiqDfuJbp6NTI4JDs_yZiRtf0QVGZKrjwVN6xTVl2fepBv4FgMclLLx.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692746/6zXPm-qeheg-DOSWSfukVpbtMS7NiICY8PecMbFXQl8Bhlg4IQQc_w4UqTpFPSSI0GAuIyJVFB0eLEtavNeKLtfLNbfRWbhfLJFVzXRJgEZncrjGJPHd8qr7WH4_s8ZBvxbbosN4pQ7_OiFXFrnR5B9EedXDp2w1rsanRh2CPM_tZ37HIWlMdVGgWF8b-Qsa.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692737/HvH-wvV2Ns1JsiDwYYwiIYWBD_hqSX8kp1axRoAClbVhzgoWkE5TkikoHxnr2C0bQAw4aBUFLWycd27_90ebE8wSxKxrFrBI3SjSlEWRKqAxOQhgmSY4UWNMwVBfvq3JG4XYJmNwD3yDHiWKdGAJD3UzuZ2vrUT_oxr4PYw6Qc5cxr602P66rA5dFNzXo5SQ.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692757/7W8FjPyWPZUer7tM7Vf1Ntr-yvriGGEZoIxfsb6GHEhWFboo2qh240DsoFOT6lZaT8sTSjQzIrUApTLiMrLG1Qs4HIRh1KZIL183xoSxb8VAWP7P_MJCjRWEa-bWvByIcPOgdtuoNUk3WtA5Fr0FONPBkkyp1ER2nJT-MRk6KSOU4Jur_0KCl5dejm-Nptwz.jpg',
  ];

  // ==========================================
  // FETCH TRUSTED SHOP
  // ==========================================

  useEffect(() => {
    const fetchShop = async () => {
      const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

      // No trusted shop yet.
      if (!trustedShopId) {
        setShop(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        setShopError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/shop/${trustedShopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch shop error:', error);

        setShopError('Unable to load trusted shop.');

        setShop(null);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShop();
  }, []);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setLocationName('Location not supported');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation({
          latitude,
          longitude,
        });

        await fetchNearbyShops(latitude, longitude);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          const data = await response.json();

          const address = data.address || {};

          const locality =
            address.neighbourhood ||
            address.suburb ||
            address.quarter ||
            address.residential ||
            address.village ||
            address.hamlet ||
            '';

          const area =
            address.city_district || address.town || address.municipality || '';

          const city = address.city || address.county || '';

          const locationParts = [locality, area, city].filter(Boolean);

          const uniqueParts = [...new Set(locationParts)];

          setLocationName(
            uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Location found',
          );

          if (area && city && area !== city) {
            setLocationName(`${area}, ${city}`);
          } else {
            setLocationName(city || area || 'Location found');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setLocationName('Location found');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Location error:', error);

        setLocationName('Unable to get location');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  // ==========================================
  // ORDER FROM TRUSTED SHOP
  // ==========================================

  const handleOrder = () => {
    if (!shop) return;

    const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

    if (!trustedShopId) return;

    navigate(`/shop/${trustedShopId}`);
  };

  const fetchNearbyShops = async (latitude, longitude) => {
    try {
      setLoadingNearbyShops(true);
      setNearbyShopsError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/owners/nearby?latitude=${latitude}&longitude=${longitude}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load nearby shops');
      }

      setNearbyShops(data.shops || []);
    } catch (error) {
      console.error('Fetch nearby shops error:', error);

      setNearbyShops([]);
      setNearbyShopsError('Unable to load nearby shops.');
    } finally {
      setLoadingNearbyShops(false);
    }
  };

  return (
    <main className="home">
      {/* ======================================
          HERO
          Sliding meat images + text
      ======================================= */}

      <section className="home_hero">
        <header className="rma_home_header">
          <div className="rma_header_top">
            <div className="rma_brand">
              <span className="rma_brand_name">RMA</span>
              <span className="rma_brand_tagline">RAW MEAT APPLICATION</span>
            </div>

            <button
              className="rma_profile_button"
              onClick={() => navigate('/profile')}
              aria-label="Profile"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M4 21C4.8 16.8 7.4 14 12 14C16.6 14 19.2 16.8 20 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <button className="rma_location_button" onClick={handleLocationClick}>
            <span className="rma_location_arrow">
              <svg
                width="22"
                height="22"
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
            </span>

            <span className="rma_location_content">
              <span className="rma_location_label">DELIVERING TO</span>

              <span className="rma_location_value">
                {locationLoading
                  ? 'Finding your location...'
                  : 'Your current location'}
              </span>

              {locationName && (
                <span className="rma_location_name">{locationName}</span>
              )}
            </span>
          </button>
        </header>
        {/* Sliding image track */}

        <div className="hero_image_track">
          {meatImages.map((image, index) => (
            <div className="hero_image" key={image}>
              <img src={image} alt={`Fresh meat ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Image overlay */}

        <div className="hero_overlay"></div>

        {/* Text placed ABOVE the images */}

        <div className="home_header">
          <div className="hero_badge">FRESH • LOCAL • CONVENIENT</div>

          <p className="home_greeting">{t.home.greeting}</p>

          <h1>{t.home.title}</h1>

          <p>{t.home.description}</p>
        </div>

        <div className="hero_dots" aria-hidden="true">
          {meatImages.map((image, index) => (
            <span className="hero_dot" key={image}></span>
          ))}
        </div>
      </section>

      {/* ======================================
          CONTENT BELOW HERO
      ======================================= */}

      <div className="home_content">
        {/* ====================================
            ACTIONS
        ===================================== */}

        <section className="home_actions">
          {/* SCAN QR */}

          <button className="qr_action" onClick={() => navigate('/scan-qr')}>
            <div className="action_icon">
              <span className="qr_icon_pattern">QR</span>
            </div>

            <div className="action_content">
              <span className="action_badge">FASTEST WAY</span>

              <h2>{t.home.scanQr}</h2>

              <p>{t.home.scanQrDescription}</p>
            </div>

            <span className="action_arrow">→</span>
          </button>

          {/* FIND SHOP */}

          <button
            className="find_action"
            onClick={() => navigate('/find-shop')}
          >
            <div className="find_icon">
              <span>⌕</span>
            </div>

            <div className="find_content">
              <span className="find_badge">EXPLORE SHOPS</span>

              <span className="find_title">{t.home.findShop}</span>

              <span className="find_description">
                Discover nearby meat and seafood shops
              </span>
            </div>

            <span className="find_arrow">→</span>
          </button>
        </section>

        <section className="nearby_shops">
          <div className="nearby_shops_header">
            <div>
              <span className="nearby_shops_eyebrow">NEAR YOU</span>

              <h2>Nearby Shops</h2>

              <p>Fresh meat and seafood from shops around you</p>
            </div>

            <button
              className="nearby_shops_see_all"
              onClick={() => navigate('/find-shop')}
            >
              See all
              <span>→</span>
            </button>
          </div>

          {loadingNearbyShops && (
            <div className="nearby_shops_loading">Loading nearby shops...</div>
          )}

          {!loadingNearbyShops && nearbyShopsError && (
            <div className="nearby_shops_error">{nearbyShopsError}</div>
          )}

          {!loadingNearbyShops &&
            !nearbyShopsError &&
            nearbyShops.length === 0 && (
              <div className="nearby_shops_empty">
                {!userLocation ? (
                  <>
                    <h3>Select your location</h3>

                    <p>
                      Choose your location to discover nearby meat and seafood
                      shops.
                    </p>

                    <button
                      style={{
                        marginRight: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        verticalAlign: 'middle',
                      }}
                      onClick={handleLocationClick}
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
                      Select Your Location
                    </button>

                    <button
                      style={{
                        marginLeft: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        verticalAlign: 'middle',
                      }}
                      onClick={() => navigate('/find-shop')}
                    >
                      Explore Shops
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No nearby shops found</h3>

                    <p>
                      We couldn't find any shops within 5 km of your location.
                    </p>

                    <button onClick={handleLocationClick}>
                      Change Location
                    </button>

                    <button onClick={() => navigate('/find-shop')}>
                      Explore Shops
                    </button>
                  </>
                )}
              </div>
            )}

          {!loadingNearbyShops &&
            !nearbyShopsError &&
            nearbyShops.length > 0 && (
              <div className="nearby_shops_list">
                {nearbyShops.map((shop) => (
                  <button
                    key={shop.shopId}
                    className="nearby_shop_card"
                    onClick={() => navigate(`/shop/${shop.shopId}`)}
                  >
                    <div className="nearby_shop_image">
                      {shop.image ? (
                        <img src={shop.image} alt={shop.shopName} />
                      ) : (
                        <span>{shop.delivery ? 'MEAT' : 'SHOP'}</span>
                      )}
                    </div>

                    <div className="nearby_shop_content">
                      <div className="nearby_shop_title_row">
                        <h3>{shop.shopName}</h3>

                        <span className="nearby_shop_rating">★ 4.5</span>
                      </div>

                      <p className="nearby_shop_description">
                        {shop.description || 'Fresh meat and seafood'}
                      </p>

                      <div className="nearby_shop_meta">
                        <span>{shop.distance} km</span>

                        <span>•</span>

                        <span>{shop.delivery ? 'Delivery' : 'Pickup'}</span>

                        <span>•</span>

                        <span
                          className={
                            shop.isOpen
                              ? 'shop_status_open'
                              : 'shop_status_closed'
                          }
                        >
                          {shop.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>
        {userLocation && nearbyShops.length > 0 && (
          <section className="popular_products">
            <div className="popular_products_header">
              <div>
                <span className="popular_products_eyebrow">
                  CUSTOMER FAVOURITES
                </span>

                <h2>Popular Near You</h2>

                <p>Fresh picks from nearby shops</p>
              </div>

              <button
                className="popular_products_see_all"
                onClick={() => navigate('/find-shop')}
              >
                Explore
                <span>→</span>
              </button>
            </div>

            {!loadingNearbyShops &&
              !nearbyShopsError &&
              popularProducts.length > 0 && (
                <div className="popular_products_list">
                  {popularProducts.map((product, index) => (
                    <button
                      key={`${product.shopId}-${product._id || product.productId || index}`}
                      className="popular_product_card"
                      onClick={() => navigate(`/shop/${product.shopId}`)}
                    >
                      <div className="popular_product_image">
                        <img src={product.imageUrl} alt={product.name} />

                        <span className="popular_product_tag">POPULAR</span>
                      </div>

                      <div className="popular_product_content">
                        <h3>{product.name}</h3>

                        <p className="popular_product_shop">
                          {product.shopName}
                        </p>

                        <div className="popular_product_bottom">
                          <span className="popular_product_price">
                            ₹{product.price}
                            {product.unit && ` / ${product.unit}`}
                          </span>

                          <span className="popular_product_arrow">→</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            {!loadingNearbyShops &&
              !nearbyShopsError &&
              popularProducts.length === 0 && (
                <div className="popular_products_empty">
                  Popular products will appear here as shops add their products.
                </div>
              )}
          </section>
        )}
      </div>
    </main>
  );
}

export default Home;
