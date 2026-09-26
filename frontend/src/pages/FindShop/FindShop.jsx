import './FindShop.css';

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FindShopHeader from './components/FindShopHeader';
import FindShopLocation from './components/FindShopLocation';
import NearbyShops from './components/NearbyShops';
import ShopSearch from './components/ShopSearch';
import ShopQrSection from './components/ShopQrSection';
import SavedShop from './components/SavedShop';
import LocationSheet from './components/LocationSheet';

import {
  fetchSavedShop,
  fetchNearbyShops as fetchNearbyShopsApi,
  fetchSavedAddresses,
  checkCustomerLogin,
} from './utils/findShopApi';

import {
  getSavedLocation,
  saveLocation,
  getLocationErrorMessage,
} from './utils/findShopHelpers';

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
    const loadSavedShop = async () => {
      const savedShopId = localStorage.getItem('rma_trusted_shop_id');

      if (!savedShopId) {
        setShop(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        setShopError('');

        const data = await fetchSavedShop(savedShopId);

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch saved shop error:', error);

        setShopError('Unable to load your saved shop.');
        setShop(null);
      } finally {
        setLoadingShop(false);
      }
    };

    loadSavedShop();
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

  const fetchNearbyShops = useCallback(async (latitude, longitude) => {
    try {
      setLoadingNearbyShops(true);
      setNearbyShopsError('');

      const data = await fetchNearbyShopsApi(latitude, longitude);

      setNearbyShops(data.shops || []);
    } catch (error) {
      console.error('Fetch nearby shops error:', error);

      setNearbyShops([]);
      setNearbyShopsError('Unable to find nearby shops. Please try again.');
    } finally {
      setLoadingNearbyShops(false);
    }
  }, []);

  useEffect(() => {
    const savedLocation = getSavedLocation();

    if (!savedLocation) {
      return;
    }

    if (
      Number.isFinite(Number(savedLocation.latitude)) &&
      Number.isFinite(Number(savedLocation.longitude))
    ) {
      fetchNearbyShops(
        Number(savedLocation.latitude),
        Number(savedLocation.longitude),
      );
    }

    if (savedLocation.locationName) {
      setLocationName(savedLocation.locationName);
    }
  }, [fetchNearbyShops]);

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

      saveLocation({
        latitude,
        longitude,
      });

      await fetchNearbyShops(latitude, longitude);
    };

    const handleError = (error) => {
      console.error('Location error:', {
        code: error.code,
        message: error.message,
      });

      setLoadingNearbyShops(false);
      setNearbyShopsError(getLocationErrorMessage(error.code));
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 300000,
    });
  };

  const loadSavedAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);

      const data = await fetchSavedAddresses();

      setSavedAddresses(data.addresses || []);
    } catch (error) {
      console.error('Fetch saved addresses error:', error);

      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

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
        saveLocation({
          latitude,
          longitude,
          locationName: newlySavedAddress.address,
        });

        setNearbyShops([]);
        setNearbyShopsError('');

        fetchNearbyShops(latitude, longitude);
      }
    }

    setShowLocationSheet(true);
    loadSavedAddresses();

    navigate('/find-shop', {
      replace: true,
      state: {},
    });
  }, [location.state, navigate, fetchNearbyShops, loadSavedAddresses]);

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

    saveLocation({
      latitude,
      longitude,
      locationName: savedAddress.address,
    });

    setShowLocationSheet(false);
    setNearbyShops([]);
    setNearbyShopsError('');

    await fetchNearbyShops(latitude, longitude);
  };

  useEffect(() => {
    const loadCustomerLogin = async () => {
      try {
        const loggedIn = await checkCustomerLogin();

        setCustomerLoggedIn(loggedIn);
      } catch (error) {
        console.error('Customer login check failed:', error);

        setCustomerLoggedIn(false);
      }
    };

    loadCustomerLogin();
  }, []);

  return (
    <main className="find_shop">
      <div className="find_shop_content">
        <FindShopHeader />

        <FindShopLocation
          locationName={locationName}
          onChangeLocation={() => {
            setShowLocationSheet(true);
            loadSavedAddresses();
          }}
        />

        <NearbyShops
          nearbyShops={nearbyShops}
          loadingNearbyShops={loadingNearbyShops}
          nearbyShopsError={nearbyShopsError}
          onUseLocation={handleLocationClick}
          onShopClick={(shopId) => navigate(`/shop/${shopId}`)}
        />

        <ShopSearch
          shopId={shopId}
          onShopIdChange={setShopId}
          onSubmit={handleSubmit}
        />

        <ShopQrSection onScan={() => navigate('/scan-qr')} />

        <SavedShop
          loadingShop={loadingShop}
          shopError={shopError}
          shop={shop}
          onOrder={handleSavedShop}
        />
      </div>

      {showLocationSheet && (
        <LocationSheet
          savedAddresses={savedAddresses}
          loadingAddresses={loadingAddresses}
          onClose={() => setShowLocationSheet(false)}
          onUseCurrentLocation={() => {
            setShowLocationSheet(false);
            handleLocationClick();
          }}
          onAddAddress={() => {
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

            navigate('/customer/login?redirect=/profile/saved-addresses/add');
          }}
          onSelectAddress={handleSavedAddressSelect}
        />
      )}
    </main>
  );
}

export default FindShop;
