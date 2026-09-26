import './DeliveryOrders.css';

import { useEffect, useState } from 'react';

import DeliveryLogin from './components/DeliveryLogin';
import DeliveryOtpLogin from './components/DeliveryOtpLogin';
import DeliveryOrdersHeader from './components/DeliveryOrdersHeader';
import DeliveryDashboardTabs from './components/DeliveryDashboardTabs';
import DeliveryOrdersList from './components/DeliveryOrdersList';
import DeliveryOrderDetails from './components/DeliveryOrderDetails';

import {
  requestDeliveryOtp,
  verifyDeliveryLoginOtp,
  fetchDeliveryDashboard,
  verifyCustomerDeliveryOtp,
} from './utils/deliveryOrdersApi';

import {
  getStoredDeliveryPerson,
  getInitialLoginStep,
  getActiveOrders,
} from './utils/deliveryOrdersHelpers';

import {
  requestDeliveryNotificationPermission,
  listenForDeliveryNotifications,
} from '../../../firebase/deliveryNotifications';

function DeliveryOrders() {
  const [shopId, setShopId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [deliveryPerson, setDeliveryPerson] = useState(getStoredDeliveryPerson);

  const [loginStep, setLoginStep] = useState(getInitialLoginStep);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeSection, setActiveSection] = useState('today');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // DELIVERY PARTNER LOCATION TRACKING

  useEffect(() => {
    if (loginStep !== 'dashboard') {
      return;
    }

    if (!navigator.geolocation) {
      setError('Location tracking is not supported on this device.');
      return;
    }

    const token = sessionStorage.getItem('delivery_token');

    if (!token) {
      setError('Delivery login session not found.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCurrentLocation({
          latitude,
          longitude,
        });

        console.log('Delivery boy GPS:', {
          latitude,
          longitude,
        });

        try {
          await fetch(
            'https://rma-backend-bo4a.onrender.com/api/delivery/location',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude,
                longitude,
              }),
            },
          );
        } catch (locationError) {
          console.error('Delivery location update failed:', locationError);
        }
      },
      (locationError) => {
        console.error('GPS error:', locationError);

        if (locationError.code === 1) {
          setError('Location permission is required for delivery tracking.');
        } else if (locationError.code === 2) {
          setError('Unable to determine your current location.');
        } else if (locationError.code === 3) {
          setError('Location request timed out.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [loginStep]);

  // DELIVERY NOTIFICATIONS

  useEffect(() => {
    const deliveryToken = sessionStorage.getItem('delivery_token');

    if (!deliveryToken) {
      return undefined;
    }

    let unsubscribe;

    const setupNotifications = async () => {
      await requestDeliveryNotificationPermission(deliveryToken);

      unsubscribe = await listenForDeliveryNotifications();
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // REQUEST DELIVERY LOGIN OTP

  const handleRequestOtp = async () => {
    if (!shopId.trim()) {
      setError('Please enter your Shop ID');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const data = await requestDeliveryOtp(shopId.trim(), phone.trim());

      console.log('Delivery login OTP:', data.otp);

      setSuccessMessage(`Your OTP is: ${data.otp}`);
      setLoginStep('otp');
    } catch (requestError) {
      console.error('Request delivery OTP failed:', requestError);

      setError(requestError.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // VERIFY DELIVERY LOGIN OTP

  const handleVerifyLoginOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await verifyDeliveryLoginOtp(
        shopId.trim(),
        phone.trim(),
        otp,
      );

      console.log('Delivery login successful:', data);

      sessionStorage.setItem('delivery_token', data.token);

      sessionStorage.setItem(
        'delivery_person',
        JSON.stringify(data.deliveryPerson),
      );

      setDeliveryPerson(data.deliveryPerson);

      setLoginStep('dashboard');
      setOtp('');
    } catch (verifyError) {
      console.error('Verify delivery login OTP failed:', verifyError);

      setError(verifyError.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // GET DELIVERY DASHBOARD

  useEffect(() => {
    if (loginStep !== 'dashboard') {
      return;
    }

    const loadDashboard = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          return;
        }

        const data = await fetchDeliveryDashboard(token);

        console.log('Delivery dashboard stats:', data);

        setDashboardStats(data);
      } catch (dashboardError) {
        console.error('Fetch delivery dashboard failed:', dashboardError);
      }
    };

    loadDashboard();
  }, [loginStep]);

  // VERIFY CUSTOMER DELIVERY OTP

  const handleVerifyOtp = async (orderId, deliveryOtp) => {
    try {
      const token = sessionStorage.getItem('delivery_token');

      const data = await verifyCustomerDeliveryOtp(token, orderId, deliveryOtp);

      alert(data.message || 'Delivery completed successfully');

      try {
        const dashboardData = await fetchDeliveryDashboard(token);

        setDashboardStats(dashboardData);
      } catch (dashboardError) {
        console.error('Failed to refresh delivery dashboard:', dashboardError);
      }

      setSelectedOrder(null);
    } catch (verifyError) {
      console.error('OTP verification failed:', verifyError);

      alert(verifyError.message || 'Unable to connect to server');
    }
  };

  // DELIVERY LOGOUT

  const handleLogout = () => {
    sessionStorage.removeItem('delivery_token');
    sessionStorage.removeItem('delivery_person');

    setCurrentLocation(null);
    setDeliveryPerson(null);
    setError('');
    setSuccessMessage('');
    setShopId('');
    setPhone('');
    setOtp('');
    setDashboardStats(null);
    setSelectedOrder(null);
    setActiveSection('today');

    setLoginStep('login');
  };

  // LOGIN SCREEN

  if (loginStep === 'login') {
    return (
      <DeliveryLogin
        shopId={shopId}
        phone={phone}
        loading={loading}
        error={error}
        onShopIdChange={(value) => {
          setShopId(value);
          setError('');
        }}
        onPhoneChange={(value) => {
          setPhone(value.replace(/\D/g, ''));
          setError('');
        }}
        onRequestOtp={handleRequestOtp}
      />
    );
  }

  // OTP SCREEN

  if (loginStep === 'otp') {
    return (
      <DeliveryOtpLogin
        otp={otp}
        loading={loading}
        error={error}
        successMessage={successMessage}
        onOtpChange={(value) => {
          setOtp(value.replace(/\D/g, ''));
          setError('');
        }}
        onVerify={handleVerifyLoginOtp}
        onBack={() => {
          setOtp('');
          setError('');
          setLoginStep('login');
        }}
      />
    );
  }

  const activeOrders = getActiveOrders(dashboardStats, activeSection);

  // DELIVERY DASHBOARD

  return (
    <main className="delivery_orders">
      <DeliveryOrdersHeader
        deliveryPerson={deliveryPerson}
        shopId={shopId}
        onLogout={handleLogout}
      />

      {dashboardStats && (
        <DeliveryDashboardTabs
          dashboardStats={dashboardStats}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {error && <p className="delivery_error_message">{error}</p>}

      {selectedOrder ? (
        <DeliveryOrderDetails
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onVerifyOtp={handleVerifyOtp}
          currentLocation={currentLocation}
        />
      ) : (
        <DeliveryOrdersList
          orders={activeOrders}
          activeSection={activeSection}
          onSelectOrder={setSelectedOrder}
        />
      )}
    </main>
  );
}

export default DeliveryOrders;
