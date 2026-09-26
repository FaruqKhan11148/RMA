import './Home.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HomeHero from './components/HomeHero';
import HomeActions from './components/HomeActions';
import NearbyShops from './components/NearbyShops';
import PopularProducts from './components/PopularProducts';
import HomeExploreEnd from './components/HomeExploreEnd';
import HomeLocationSheet from './components/HomeLocationSheet';

import {
  fetchSavedAddresses as fetchSavedAddressesApi,
  fetchNearbyShops as fetchNearbyShopsApi,
  checkCustomerLogin as checkCustomerLoginApi,
} from './utils/homeApi';

import {
  RMA_LOCATION_KEY,
  optimizeCloudinaryImage,
  getPopularProducts,
  meatImages,
} from './utils/homeHelpers';

function Home() {
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
      fetchSavedAddresses();

      navigate('/', {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const customer = await checkCustomerLoginApi();

        if (customer) {
          setCustomerLoggedIn(true);

          const fullName =
            customer.name || customer.fullName || customer.customerName || '';

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

    checkCustomer();
  }, []);

  const popularProducts = getPopularProducts(nearbyShops);

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

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const addresses = await fetchSavedAddressesApi();

      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Fetch saved addresses error:', error);

      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchNearbyShops = async (latitude, longitude) => {
    try {
      setLoadingNearbyShops(true);
      setNearbyShopsError('');

      // Clear shops from the previous location
      setNearbyShops([]);

      const shops = await fetchNearbyShopsApi(latitude, longitude);

      setNearbyShops(shops);
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

  return (
    <main className="home">
      <HomeHero
        meatImages={meatImages}
        optimizeCloudinaryImage={optimizeCloudinaryImage}
        customerName={customerName}
        locationLoading={locationLoading}
        locationName={locationName}
        onLocationClick={() => {
          setShowLocationSheet(true);
          fetchSavedAddresses();
        }}
      />

      {/* ======================================
          CONTENT BELOW HERO
      ======================================= */}

      <div className="home_content">
        {/* ====================================
            ACTIONS
        ===================================== */}

        <HomeActions
          onScanQr={() => navigate('/scan-qr')}
          onFindShop={() => navigate('/find-shop')}
        />

        <NearbyShops
          userLocation={userLocation}
          nearbyShops={nearbyShops}
          loadingNearbyShops={loadingNearbyShops}
          nearbyShopsError={nearbyShopsError}
          onSeeAll={() => navigate('/find-shop')}
          onLocationClick={handleLocationClick}
          onChangeLocation={() => {
            setShowLocationSheet(true);
            fetchSavedAddresses();
          }}
          onShopClick={(shopId) => navigate(`/shop/${shopId}`)}
        />

        <PopularProducts
          userLocation={userLocation}
          nearbyShops={nearbyShops}
          loadingNearbyShops={loadingNearbyShops}
          nearbyShopsError={nearbyShopsError}
          popularProducts={popularProducts}
          optimizeCloudinaryImage={optimizeCloudinaryImage}
          onExplore={() => navigate('/find-shop')}
          onProductClick={(shopId) => navigate(`/shop/${shopId}`)}
        />

        <HomeExploreEnd
          onFindShops={() => navigate('/find-shop')}
          onScanQr={() => navigate('/scan-qr')}
        />
      </div>
      <HomeLocationSheet
        showLocationSheet={showLocationSheet}
        setShowLocationSheet={setShowLocationSheet}
        handleLocationClick={handleLocationClick}
        customerLoggedIn={customerLoggedIn}
        navigate={navigate}
        loadingAddresses={loadingAddresses}
        savedAddresses={savedAddresses}
        handleSavedAddressSelect={handleSavedAddressSelect}
      />
    </main>
  );
}

export default Home;
