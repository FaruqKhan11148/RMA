import './DeliveryOrders.css';
import { useCallback, useEffect, useState } from 'react';

import DeliveryLogin from './components/DeliveryLogin';
import DeliveryOtpLogin from './components/DeliveryOtpLogin';
import DeliveryOrdersHeader from './components/DeliveryOrdersHeader';
import DeliveryDashboardTabs from './components/DeliveryDashboardTabs';
import DeliveryOrdersList from './components/DeliveryOrdersList';
import DeliveryOrderDetails from './components/DeliveryOrderDetails';
import DeliveryAssignmentRequests from './components/DeliveryAssignmentRequests';

import {
  requestDeliveryOtp,
  verifyDeliveryLoginOtp,
  fetchDeliveryDashboard,
  verifyCustomerDeliveryOtp,
  fetchPendingDeliveryAssignments,
  acceptDeliveryAssignment,
  rejectDeliveryAssignment,
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

  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  const [processingAssignmentId, setProcessingAssignmentId] = useState(null);
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

    const token = localStorage.getItem('delivery_token');

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

  // GET PENDING DELIVERY ASSIGNMENTS

  const loadPendingAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      setAssignmentError('');

      const token = localStorage.getItem('delivery_token');

      if (!token) {
        return;
      }

      const data = await fetchPendingDeliveryAssignments(token);

      console.log('Pending delivery assignments:', data.assignments || []);

      setPendingAssignments(data.assignments || []);
    } catch (assignmentFetchError) {
      console.error(
        'Fetch pending delivery assignments failed:',
        assignmentFetchError,
      );

      setAssignmentError(
        assignmentFetchError.message || 'Unable to load delivery requests',
      );
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      const message = event.data;

      if (!message || message.type !== 'RMA_FCM_NOTIFICATION') {
        return;
      }

      console.log('DELIVERY SERVICE WORKER MESSAGE:', message.payload);

      const notificationType = message.payload?.data?.type;

      if (notificationType === 'DELIVERY_ASSIGNMENT_REQUEST') {
        console.log(
          'New delivery assignment received from service worker. Refreshing assignments...',
        );

        loadPendingAssignments();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerMessage,
      );
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleServiceWorkerMessage,
        );
      }
    };
  }, [loadPendingAssignments]);

  // DELIVERY NOTIFICATIONS
  useEffect(() => {
    const deliveryToken = localStorage.getItem('delivery_token');

    if (!deliveryToken) {
      return undefined;
    }

    let unsubscribe;

    const setupNotifications = async () => {
      await requestDeliveryNotificationPermission(deliveryToken);

      unsubscribe = await listenForDeliveryNotifications((payload) => {
        console.log('DELIVERY NOTIFICATION RECEIVED:', payload);

        const notificationType = payload?.data?.type;

        if (notificationType === 'DELIVERY_ASSIGNMENT_REQUEST') {
          console.log(
            'New delivery assignment received. Refreshing assignments...',
          );

          loadPendingAssignments();
        }
      });
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loginStep, loadPendingAssignments]);

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

      localStorage.setItem('delivery_token', data.token);

      localStorage.setItem(
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
        const token = localStorage.getItem('delivery_token');

        if (!token) {
          return;
        }

        const data = await fetchDeliveryDashboard(token);

        console.log('Delivery dashboard stats:', data);

        console.log(
          'DELIVERY TODAY ORDER STATUS:',
          JSON.stringify(
            data.orders?.today?.map((order) => ({
              orderId: order.orderId,
              status: order.status,
              deliveryAssignmentStatus: order.deliveryAssignmentStatus,
              deliveryAssignmentType: order.deliveryAssignmentType,
              deliveryPersonId: order.deliveryPersonId,
            })),
            null,
            2,
          ),
        );

        setDashboardStats(data);
      } catch (dashboardError) {
        console.error('Fetch delivery dashboard failed:', dashboardError);
      }
    };

    loadDashboard();
  }, [loginStep]);

  useEffect(() => {
    if (loginStep !== 'dashboard') {
      return;
    }

    loadPendingAssignments();
  }, [loginStep, loadPendingAssignments]);

  // VERIFY CUSTOMER DELIVERY OTP

  const handleVerifyOtp = async (orderId, deliveryOtp) => {
    try {
      const token = localStorage.getItem('delivery_token');

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

  // ACCEPT DELIVERY ASSIGNMENT

  const handleAcceptAssignment = async (orderId) => {
    try {
      const token = localStorage.getItem('delivery_token');

      if (!token) {
        setError('Delivery login session not found.');
        return;
      }

      setProcessingAssignmentId(orderId);
      setAssignmentError('');

      const data = await acceptDeliveryAssignment(token, orderId);

      console.log('Delivery assignment accepted:', data);

      setPendingAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => assignment.orderId !== orderId,
        ),
      );

      setSuccessMessage(data.message || 'Delivery accepted successfully');

      const dashboardData = await fetchDeliveryDashboard(token);

      setDashboardStats(dashboardData);
    } catch (acceptError) {
      console.error('Accept delivery assignment failed:', acceptError);

      setAssignmentError(acceptError.message || 'Unable to accept delivery');
    } finally {
      setProcessingAssignmentId(null);
    }
  };

  // REJECT DELIVERY ASSIGNMENT

  const handleRejectAssignment = async (orderId) => {
    try {
      const token = localStorage.getItem('delivery_token');

      if (!token) {
        setError('Delivery login session not found.');
        return;
      }

      setProcessingAssignmentId(orderId);
      setAssignmentError('');

      const data = await rejectDeliveryAssignment(token, orderId);

      console.log('Delivery assignment rejected:', data);

      setPendingAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => assignment.orderId !== orderId,
        ),
      );

      setSuccessMessage(data.message || 'Delivery assignment rejected');
    } catch (rejectError) {
      console.error('Reject delivery assignment failed:', rejectError);

      setAssignmentError(rejectError.message || 'Unable to reject delivery');
    } finally {
      setProcessingAssignmentId(null);
    }
  };

  // DELIVERY LOGOUT

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_person');

    setCurrentLocation(null);
    setDeliveryPerson(null);
    setError('');
    setSuccessMessage('');
    setShopId('');
    setPhone('');
    setOtp('');
    setDashboardStats(null);
    setPendingAssignments([]);
    setAssignmentError('');
    setLoadingAssignments(false);
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

  // ORDER DETAILS SCREEN
  //
  // When an order is selected, show the order details as its own
  // full-page experience. Do not render the dashboard header,
  // tabs, assignment requests, or order list above it.

  if (selectedOrder) {
    return (
      <main className="delivery_orders delivery_order_details_page">
        <DeliveryOrderDetails
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onVerifyOtp={handleVerifyOtp}
          onCollected={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
          }}
          currentLocation={currentLocation}
        />
      </main>
    );
  }

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

      <DeliveryAssignmentRequests
        assignments={pendingAssignments}
        loading={loadingAssignments}
        error={assignmentError}
        processingAssignmentId={processingAssignmentId}
        onAccept={handleAcceptAssignment}
        onReject={handleRejectAssignment}
      />

      <DeliveryOrdersList
        orders={activeOrders}
        activeSection={activeSection}
        onSelectOrder={setSelectedOrder}
      />
    </main>
  );
}

export default DeliveryOrders;
