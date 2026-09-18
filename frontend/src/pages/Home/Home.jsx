import './Home.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { QrCode } from 'lucide-react';
import {
  requestCustomerNotificationPermission,
  listenForCustomerNotifications,
} from '../../firebase/notifications';

const RMA_LOCATION_KEY = 'rma_user_location';
const COMMON_SHOP_IMAGE =
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1789550262/Gemini_Generated_Image_2u7tlf2u7tlf2u7t.png';

function NearbyShopImageSlider({ shop }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const availableProducts = (shop.products || []).filter(
    (product) => product.available && product.imageUrl,
  );

  useEffect(() => {
    if (availableProducts.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (previousIndex) => (previousIndex + 1) % availableProducts.length,
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [availableProducts.length]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [shop.shopId]);

  if (availableProducts.length === 0) {
    return (
      <div className="nearby_shop_image">
        <img src={COMMON_SHOP_IMAGE} alt={shop.shopName} />
      </div>
    );
  }

  return (
    <div className="nearby_shop_image">
      <div
        className="nearby_shop_image_track"
        style={{
          width: `${availableProducts.length * 100}%`,
          transform: `translateX(-${
            currentImageIndex * (100 / availableProducts.length)
          }%)`,
        }}
      >
        {availableProducts.map((product) => (
          <div
            className="nearby_shop_image_slide"
            key={product.productId}
            style={{
              width: `${100 / availableProducts.length}%`,
            }}
          >
            <img src={product.imageUrl} alt={product.name} />
          </div>
        ))}
      </div>

      <span className="nearby_shop_product_name">
        {availableProducts[currentImageIndex].name}
      </span>

      {availableProducts.length > 1 && (
        <div className="nearby_shop_image_dots">
          {availableProducts.map((product, index) => (
            <span
              key={product.productId}
              className={
                index === currentImageIndex
                  ? 'nearby_shop_image_dot active'
                  : 'nearby_shop_image_dot'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loadingNearbyShops, setLoadingNearbyShops] = useState(false);
  const [nearbyShopsError, setNearbyShopsError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const savedLocation = localStorage.getItem(RMA_LOCATION_KEY);

    if (!savedLocation) {
      return;
    }

    try {
      const parsedLocation = JSON.parse(savedLocation);

      if (
        Number.isFinite(parsedLocation.latitude) &&
        Number.isFinite(parsedLocation.longitude)
      ) {
        setUserLocation({
          latitude: parsedLocation.latitude,
          longitude: parsedLocation.longitude,
        });

        fetchNearbyShops(parsedLocation.latitude, parsedLocation.longitude);
      }

      if (parsedLocation.locationName) {
        setLocationName(parsedLocation.locationName);
      }
    } catch (error) {
      console.error('Saved location parse error:', error);

      localStorage.removeItem(RMA_LOCATION_KEY);
    }
  }, []);

  useEffect(() => {
    if (
      location.state?.returnToLocationSheet &&
      location.state?.returnPath === '/'
    ) {
      setShowLocationSheet(true);

      navigate('/', {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/customers/addresses',
        {
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        setSavedAddresses([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch saved addresses');
      }

      setSavedAddresses(data.addresses || []);
    } catch (error) {
      console.error('Fetch saved addresses error:', error);

      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    const checkCustomerLogin = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();

          setCustomerLoggedIn(true);

          const fullName =
            data.customer?.name ||
            data.customer?.fullName ||
            data.customer?.customerName ||
            '';

          const firstName = fullName.trim().split(/\s+/)[0] || '';

          setCustomerName(firstName);
        } else {
          setCustomerLoggedIn(false);
          setCustomerName('');
        }
      } catch (error) {
        console.error('Customer login check failed:', error);

        setCustomerLoggedIn(false);
        setCustomerName('');
      }
    };

    checkCustomerLogin();
  }, []);

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

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setLocationName('Location is not supported on this device.');
      return;
    }

    setLocationLoading(true);
    setLocationName('Finding your location...');

    setNearbyShops([]);
    setNearbyShopsError('');

    const handleSuccess = async (position) => {
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

        const resolvedLocationName =
          uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Location found';

        setLocationName(resolvedLocationName);

        localStorage.setItem(
          RMA_LOCATION_KEY,
          JSON.stringify({
            latitude,
            longitude,
            locationName: resolvedLocationName,
          }),
        );
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setLocationName('Location found');
      } finally {
        setLocationLoading(false);
      }
    };

    const handleError = (error) => {
      console.error('Location error:', {
        code: error.code,
        message: error.message,
      });

      if (error.code === 1) {
        setLocationName(
          'Location permission is blocked. Please allow location access in your browser settings.',
        );
        setLocationLoading(false);
        return;
      }

      if (error.code === 2) {
        setLocationName('Unable to detect your location. Please try again.');
        setLocationLoading(false);
        return;
      }

      if (error.code === 3) {
        setLocationName('Location is taking too long. Please try again.');
        setLocationLoading(false);
        return;
      }

      setLocationName('Unable to get your location. Please try again.');
      setLocationLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 300000,
    });
  };

  // FETCH NEARBY SHOPS

  const fetchNearbyShops = async (latitude, longitude) => {
    try {
      setLoadingNearbyShops(true);
      setNearbyShopsError('');

      // Clear shops from the previous location
      setNearbyShops([]);

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/owners/nearby?latitude=${latitude}&longitude=${longitude}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch nearby shops');
      }

      setNearbyShops(data.shops || []);
    } catch (error) {
      console.error('Fetch nearby shops error:', error);

      // Never keep shops from the previous location
      setNearbyShops([]);

      setNearbyShopsError('Unable to find nearby shops. Please try again.');
    } finally {
      setLoadingNearbyShops(false);
    }
  };

  const handleSavedAddressSelect = (savedAddress) => {
    const selectedLocation = {
      latitude: savedAddress.latitude,
      longitude: savedAddress.longitude,
      locationName: savedAddress.label,
    };

    setUserLocation({
      latitude: savedAddress.latitude,
      longitude: savedAddress.longitude,
    });

    setLocationName(savedAddress.label);
    setShowLocationSheet(false);

    localStorage.setItem(RMA_LOCATION_KEY, JSON.stringify(selectedLocation));

    fetchNearbyShops(savedAddress.latitude, savedAddress.longitude);
  };

  useEffect(() => {
    if (!customerLoggedIn) {
      return;
    }

    let unsubscribe;
    let isActive = true;

    const setupNotifications = async () => {
      await requestCustomerNotificationPermission();

      if (!isActive) {
        return;
      }

      const cleanup = await listenForCustomerNotifications((payload) => {
        if (!isActive) {
          return;
        }

        const title =
          payload.notification?.title ||
          payload.data?.title ||
          'RMA Notification';

        const message =
          payload.notification?.body ||
          payload.data?.body ||
          'You have a new notification.';

        alert(`${title}\n\n${message}`);
      });

      if (!isActive) {
        if (cleanup) {
          cleanup();
        }

        return;
      }

      unsubscribe = cleanup;
    };

    setupNotifications();

    return () => {
      isActive = false;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [customerLoggedIn]);

  return (
    <main className="home">
      {/* ======================================
          HERO
          Sliding meat images + text
      ======================================= */}

      <section className="home_hero">
        <header className="rma_home_header">
          <button
            className="rma_location_button"
            onClick={() => {
              setShowLocationSheet(true);
              fetchSavedAddresses();
            }}
          >
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
            <span className="rma_location_chevron" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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

          <p className="home_greeting">
            {customerName ? `Hello ${customerName}` : 'Hello!'}
          </p>

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
              <QrCode className="qr_icon_pattern" />
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
                      Change Location
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
                    <NearbyShopImageSlider shop={shop} />

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
                        <img
                          src={product.imageUrl || null}
                          alt={product.name}
                        />
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

        <section className="rma_promo">
          <div className="rma_promo_overlay">
            <div className="rma_promo_content">
              <span className="rma_promo_eyebrow">
                FRESH. LOCAL. CONVENIENT.
              </span>

              <h2>Fresh meat from shops you trust.</h2>

              <p>
                Order fresh meat and seafood from local shops and get it
                delivered to your doorstep.
              </p>

              <button
                className="rma_promo_button"
                onClick={() => navigate('/find-shop')}
              >
                Explore More Shops
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
      {showLocationSheet && (
        <div
          className="location_sheet_overlay"
          onClick={() => setShowLocationSheet(false)}
        >
          <div
            className="location_sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="location_sheet_handle" />

            <div className="location_sheet_header">
              <h2>Select a location</h2>

              <button
                type="button"
                onClick={() => setShowLocationSheet(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="location_sheet_options">
              <button
                type="button"
                className="location_sheet_option"
                onClick={() => {
                  setShowLocationSheet(false);
                  handleLocationClick();
                }}
              >
                <div className="location_sheet_option_icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M12 2V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 19V22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M2 12H5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M19 12H22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="location_sheet_option_content">
                  <strong>Use current location</strong>
                  <span>Use your device's current location</span>
                </div>

                <span className="location_sheet_arrow">›</span>
              </button>

              <button
                type="button"
                className="location_sheet_option"
                onClick={() => {
                  setShowLocationSheet(false);

                  if (customerLoggedIn) {
                    navigate('/profile/saved-addresses/add', {
                      state: {
                        returnToLocationSheet: true,
                        returnPath: '/',
                      },
                    });
                    return;
                  }

                  navigate(
                    '/customer/login?redirect=/profile/saved-addresses/add',
                  );
                }}
              >
                <div className="location_sheet_option_icon">
                  <span>+</span>
                </div>

                <div className="location_sheet_option_content">
                  <strong>Add Address</strong>
                  <span>Add a new delivery address</span>
                </div>

                <span className="location_sheet_arrow">›</span>
              </button>
            </div>

            <div className="location_sheet_saved">
              <span className="location_sheet_saved_title">
                SAVED ADDRESSES
              </span>

              {loadingAddresses && (
                <div className="location_sheet_empty">
                  Loading saved addresses...
                </div>
              )}

              {!loadingAddresses && savedAddresses.length === 0 && (
                <div className="location_sheet_empty">
                  No saved addresses yet.
                </div>
              )}

              {!loadingAddresses && savedAddresses.length > 0 && (
                <div className="location_sheet_saved_list">
                  {savedAddresses.map((savedAddress) => (
                    <button
                      key={savedAddress._id}
                      type="button"
                      className="location_sheet_saved_address"
                      onClick={() => handleSavedAddressSelect(savedAddress)}
                    >
                      <div className="location_sheet_saved_address_icon">
                        {savedAddress.label === 'Home' && <span>⌂</span>}

                        {savedAddress.label === 'Work' && <span>▣</span>}

                        {savedAddress.label === 'Other' && <span>●</span>}
                      </div>

                      <div className="location_sheet_saved_address_content">
                        <div className="location_sheet_saved_address_title">
                          <strong>{savedAddress.label}</strong>

                          {savedAddress.isDefault && (
                            <span className="location_sheet_default">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <p>{savedAddress.address}</p>
                      </div>

                      <span className="location_sheet_arrow">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
