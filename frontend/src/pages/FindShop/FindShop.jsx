import './FindShop.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RMA_LOCATION_KEY = 'rma_user_location';

function FindShop() {
  const navigate = useNavigate();
  const location = useLocation();

  const [shopId, setShopId] = useState('');
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState('');

  const [nearbyShops, setNearbyShops] = useState([]);
  const [loadingNearbyShops, setLoadingNearbyShops] = useState(false);
  const [nearbyShopsError, setNearbyShopsError] = useState('');

  const [locationName, setLocationName] = useState('');

  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);

  useEffect(() => {
    const fetchSavedShop = async () => {
      const savedShopId = localStorage.getItem('rma_trusted_shop_id');

      if (!savedShopId) {
        setShop(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        setShopError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/shop/${savedShopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch saved shop error:', error);

        setShopError('Unable to load your saved shop.');
        setShop(null);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchSavedShop();
  }, []);

  const handleSavedShop = () => {
    const savedShopId = localStorage.getItem('rma_trusted_shop_id');

    if (!savedShopId) {
      return;
    }

    navigate(`/shop/${savedShopId}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const enteredShopId = shopId.trim().toUpperCase();

    if (!enteredShopId) {
      return;
    }

    navigate(`/shop/${enteredShopId}`);
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
        throw new Error(data.message || 'Failed to fetch nearby shops');
      }

      setNearbyShops(data.shops || []);
    } catch (error) {
      console.error('Fetch nearby shops error:', error);

      setNearbyShops([]);
      setNearbyShopsError('Unable to find nearby shops. Please try again.');
    } finally {
      setLoadingNearbyShops(false);
    }
  };

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

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setNearbyShopsError('Location is not supported on this device.');
      return;
    }

    setLoadingNearbyShops(true);
    setNearbyShops([]);
    setNearbyShopsError('');

    const handleSuccess = async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      localStorage.setItem(
        RMA_LOCATION_KEY,
        JSON.stringify({
          latitude,
          longitude,
        }),
      );

      await fetchNearbyShops(latitude, longitude);
    };

    const handleError = (error) => {
      console.error('Location error:', {
        code: error.code,
        message: error.message,
      });

      setLoadingNearbyShops(false);

      if (error.code === 1) {
        setNearbyShopsError(
          'Location permission is blocked. Please allow location access in your browser settings.',
        );
        return;
      }

      if (error.code === 2) {
        setNearbyShopsError(
          'Unable to detect your location. Please try again.',
        );
        return;
      }

      if (error.code === 3) {
        setNearbyShopsError('Location is taking too long. Please try again.');
        return;
      }

      setNearbyShopsError('Unable to get your location. Please try again.');
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 300000,
    });
  };

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
    if (!location.state?.openLocationSheet) {
      return;
    }

    const newlySavedAddress = location.state?.newlySavedAddress;

    if (newlySavedAddress) {
      const latitude = Number(newlySavedAddress.latitude);
      const longitude = Number(newlySavedAddress.longitude);

      setLocationName(newlySavedAddress.address);

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        localStorage.setItem(
          RMA_LOCATION_KEY,
          JSON.stringify({
            latitude,
            longitude,
            locationName: newlySavedAddress.address,
          }),
        );

        setNearbyShops([]);
        setNearbyShopsError('');

        fetchNearbyShops(latitude, longitude);
      }
    }

    setShowLocationSheet(true);
    fetchSavedAddresses();

    navigate('/find-shop', {
      replace: true,
      state: {},
    });
  }, [location.state, navigate]);

  const handleSavedAddressSelect = async (savedAddress) => {
    if (
      !Number.isFinite(Number(savedAddress.latitude)) ||
      !Number.isFinite(Number(savedAddress.longitude))
    ) {
      setNearbyShopsError('This saved address does not have a valid location.');
      return;
    }

    const latitude = Number(savedAddress.latitude);
    const longitude = Number(savedAddress.longitude);

    setLocationName(savedAddress.address);

    localStorage.setItem(
      RMA_LOCATION_KEY,
      JSON.stringify({
        latitude,
        longitude,
        locationName: savedAddress.address,
      }),
    );

    setShowLocationSheet(false);

    setNearbyShops([]);
    setNearbyShopsError('');

    await fetchNearbyShops(latitude, longitude);
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
          setCustomerLoggedIn(true);
        } else {
          setCustomerLoggedIn(false);
        }
      } catch (error) {
        console.error('Customer login check failed:', error);

        setCustomerLoggedIn(false);
      }
    };

    checkCustomerLogin();
  }, []);

  return (
    <main className="find_shop">
      <div className="find_shop_content">
        {/* ======================================
            PAGE HEADER
        ======================================= */}

        <section className="find_shop_header">
          <span className="find_shop_eyebrow">RMA SHOPS</span>

          <h1>Find a Shop</h1>

          <p>Discover fresh meat and seafood from local shops near you.</p>
        </section>

        {/* ======================================
            LOCATION
        ======================================= */}

        <section className="find_shop_location">
          <div className="find_shop_location_icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5 5 9C5 14.5 12 21 12 21Z"
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
          </div>

          <div className="find_shop_location_content">
            <span>DELIVERING TO</span>
            <strong>{locationName || 'Your current location'}</strong>
          </div>

          <button
            type="button"
            className="find_shop_change_location"
            onClick={() => {
              setShowLocationSheet(true);
              fetchSavedAddresses();
            }}
          >
            Change
          </button>
        </section>

        {/* ======================================
            NEARBY SHOPS
        ======================================= */}

        <section className="find_shop_nearby">
          <div className="find_shop_section_header">
            <div>
              <span className="find_shop_section_eyebrow">NEAR YOU</span>

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

          {!loadingNearbyShops &&
            !nearbyShopsError &&
            nearbyShops.length === 0 && (
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

                <p>
                  Allow location access to see meat and seafood shops around
                  you.
                </p>

                <button type="button" onClick={handleLocationClick}>
                  Use My Location
                </button>
              </div>
            )}

          {!loadingNearbyShops &&
            !nearbyShopsError &&
            nearbyShops.length > 0 && (
              <div className="find_shop_nearby_list">
                {nearbyShops.map((shop) => (
                  <button
                    key={shop.shopId}
                    type="button"
                    className="find_shop_nearby_card"
                    onClick={() => navigate(`/shop/${shop.shopId}`)}
                  >
                    <div className="find_shop_nearby_card_top">
                      <div className="find_shop_nearby_icon">
                        <span>RMA</span>
                      </div>

                      <span
                        className={
                          shop.isOpen
                            ? 'find_shop_nearby_status find_shop_nearby_status_open'
                            : 'find_shop_nearby_status find_shop_nearby_status_closed'
                        }
                      >
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    <div className="find_shop_nearby_card_content">
                      <h3>{shop.shopName}</h3>

                      <p>{shop.description || 'Fresh meat and seafood'}</p>

                      <div className="find_shop_nearby_meta">
                        <span>{shop.distance} km</span>

                        <span>•</span>

                        <span>{shop.delivery ? 'Delivery' : 'Pickup'}</span>
                      </div>
                    </div>

                    <div className="find_shop_nearby_card_footer">
                      <span>{shop.shopId}</span>

                      <span>View Shop →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>

        {/* ======================================
            SEARCH BY SHOP ID
        ======================================= */}

        <section className="find_shop_search">
          <div className="find_shop_section_header">
            <div>
              <span className="find_shop_section_eyebrow">KNOW YOUR SHOP?</span>

              <h2>Search by Shop ID</h2>

              <p>Enter the unique RMA Shop ID shared by your local shop.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="shopId">RMA Shop ID</label>

            <input
              id="shopId"
              type="text"
              placeholder="Example: RMA-000001"
              value={shopId}
              onChange={(event) => setShopId(event.target.value)}
              autoComplete="off"
            />

            <button type="submit">
              Find Shop
              <span>→</span>
            </button>
          </form>
        </section>

        {/* ======================================
            QR SCAN
        ======================================= */}

        <section className="find_shop_qr">
          <div className="find_shop_qr_icon">
            <span>QR</span>
          </div>

          <div className="find_shop_qr_content">
            <span className="find_shop_section_eyebrow">FASTEST WAY</span>

            <h2>Scan Shop QR</h2>

            <p>Scan the QR code provided by your local meat shop.</p>
          </div>

          <button
            type="button"
            className="find_shop_qr_button"
            onClick={() => navigate('/scan-qr')}
          >
            Scan
            <span>→</span>
          </button>
        </section>

        {/* ======================================
            SAVED SHOP
        ======================================= */}

        {(loadingShop || shopError || shop) && (
          <section className="find_shop_saved">
            <div className="find_shop_section_header">
              <div>
                <span className="find_shop_section_eyebrow">YOUR SHOP</span>

                <h2>Saved Shop</h2>
              </div>
            </div>

            {loadingShop && (
              <div className="find_shop_message">
                Loading your saved shop...
              </div>
            )}

            {!loadingShop && shopError && (
              <div className="find_shop_message find_shop_error">
                {shopError}
              </div>
            )}

            {!loadingShop && shop && (
              <div className="find_shop_saved_card">
                <div className="find_shop_saved_info">
                  <h3>{shop.shopName}</h3>

                  <p>{shop.description || 'Fresh meat and seafood'}</p>

                  <span>{shop.shopId}</span>
                </div>

                <button type="button" onClick={handleSavedShop}>
                  Order
                  <span>→</span>
                </button>
              </div>
            )}
          </section>
        )}
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
                        returnPath: '/find-shop',
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

export default FindShop;
