import './DeliveryOrders.css';

import { useEffect, useState } from 'react';
import OrderLocationMap from '../../../components/map/OrderLocationMap';

function DeliveryOrders() {
  const [shopId, setShopId] = useState('');
  const [phone, setPhone] = useState('');

  const [otp, setOtp] = useState('');

  const getStoredDeliveryPerson = () => {
    try {
      const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

      return storedDeliveryPerson ? JSON.parse(storedDeliveryPerson) : null;
    } catch (error) {
      console.error('Failed to restore delivery person:', error);

      return null;
    }
  };

  const [deliveryPerson, setDeliveryPerson] = useState(getStoredDeliveryPerson);

  const [loginStep, setLoginStep] = useState(() => {
    const token = sessionStorage.getItem('delivery_token');
    const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

    return token && storedDeliveryPerson ? 'dashboard' : 'login';
  });

  const [orders, setOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeSection, setActiveSection] = useState('today');

  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          const response = await fetch(
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

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to update location');
          }

          console.log(
            'Delivery location sent successfully:',
            data.currentLocation,
          );
        } catch (error) {
          console.error('Delivery location update failed:', error);
        }
      },
      (error) => {
        console.error('GPS error:', error);

        if (error.code === 1) {
          setError('Location permission is required for delivery tracking.');
        } else if (error.code === 2) {
          setError('Unable to determine your current location.');
        } else if (error.code === 3) {
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

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/request-otp',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            shopId: shopId.trim(),
            phone: phone.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to send OTP');
        return;
      }

      console.log('Delivery login OTP:', data.otp);
      setSuccessMessage(`Your OTP is: ${data.otp}`);
      setLoginStep('otp');
    } catch (error) {
      console.error('Request delivery OTP failed:', error);

      setError('Unable to connect to server');
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

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/verify-otp',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            shopId: shopId.trim(),
            phone: phone.trim(),
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid OTP');
        return;
      }

      console.log('Delivery login successful:', data);

      // SAVE LOGIN INFORMATION
      sessionStorage.setItem('delivery_token', data.token);

      sessionStorage.setItem(
        'delivery_person',
        JSON.stringify(data.deliveryPerson),
      );

      setDeliveryPerson(data.deliveryPerson);

      setLoginStep('dashboard');
      setOtp('');
    } catch (error) {
      console.error('Verify delivery login OTP failed:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // GET DELIVERY ORDERS FOR LOGGED-IN DELIVERY PERSON
  useEffect(() => {
    if (loginStep !== 'dashboard') {
      return;
    }

    const fetchDeliveryOrders = async () => {
      try {
        setOrdersLoading(true);
        setError('');

        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery login session not found');
          setLoginStep('login');
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/delivery/orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load delivery orders');
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error('Fetch delivery orders failed:', error);

        setError('Unable to load delivery orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchDeliveryOrders();
  }, [loginStep]);

  // GET DELIVERY DASHBOARD SUMMARY
  useEffect(() => {
    if (loginStep !== 'dashboard') {
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/delivery/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load dashboard statistics',
          );
        }

        console.log('Delivery dashboard stats:', data);

        setDashboardStats(data);
      } catch (error) {
        console.error('Fetch delivery dashboard failed:', error);
      }
    };

    fetchDashboardStats();
  }, [loginStep]);

  // VERIFY CUSTOMER DELIVERY OTP
  const handleVerifyOtp = async (orderId, otp) => {
    try {
      const token = sessionStorage.getItem('delivery_token');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${orderId}/verify-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Invalid OTP');
        return;
      }

      alert('Delivery completed successfully');

      // Remove from local delivery orders
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.orderId !== orderId),
      );

      // Refresh dashboard statistics and order lists
      try {
        const dashboardResponse = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/delivery/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dashboardData = await dashboardResponse.json();

        if (dashboardResponse.ok) {
          setDashboardStats(dashboardData);
        }
      } catch (dashboardError) {
        console.error('Failed to refresh delivery dashboard:', dashboardError);
      }

      // Close order details
      setSelectedOrder(null);
    } catch (error) {
      console.error('OTP verification failed:', error);

      alert('Unable to connect to server');
    }
  };

  // DELIVERY LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem('delivery_token');
    sessionStorage.removeItem('delivery_person');

    setCurrentLocation(null);
    setOrders([]);
    setDeliveryPerson(null);
    setError('');
    setSuccessMessage('');
    setShopId('');
    setPhone('');
    setOtp('');

    setLoginStep('login');
  };

  // DELIVERY LOGIN SCREEN
  if (loginStep === 'login') {
    return (
      <main className="delivery_orders">
        <section className="delivery_no_orders">
          <h1>RMA Deliver</h1>

          <p>Login to access your delivery orders.</p>

          <input
            type="text"
            placeholder="Enter Shop ID"
            value={shopId}
            onChange={(event) => {
              setShopId(event.target.value);
              setError('');
            }}
          />

          <input
            type="tel"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value.replace(/\D/g, ''));
              setError('');
            }}
            maxLength="10"
          />

          <button
            className="delivery_complete_button"
            onClick={handleRequestOtp}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {error && <p className="delivery_error_message">{error}</p>}
        </section>
      </main>
    );
  }

  // OTP SCREEN
  if (loginStep === 'otp') {
    return (
      <main className="delivery_orders">
        <section className="delivery_no_orders">
          <h1>Verify OTP</h1>

          <p>Enter the 6-digit OTP sent to your delivery phone.</p>

          <input
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, ''));
              setError('');
            }}
          />

          <button
            className="delivery_complete_button"
            onClick={handleVerifyLoginOtp}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            className="delivery_complete_button"
            onClick={() => {
              setOtp('');
              setError('');
              setLoginStep('login');
            }}
          >
            Back
          </button>

          {successMessage && (
            <p className="delivery_success_message">{successMessage}</p>
          )}

          {error && <p className="delivery_error_message">{error}</p>}
        </section>
      </main>
    );
  }

  // LOADING ORDERS
  if (ordersLoading) {
    return (
      <main className="delivery_orders">
        <section className="delivery_no_orders">
          <h2>Loading delivery orders...</h2>
        </section>
      </main>
    );
  }

  const activeOrders =
    activeSection === 'today'
      ? dashboardStats?.orders?.today || []
      : activeSection === 'pending'
        ? dashboardStats?.orders?.pending || []
        : activeSection === 'completedToday'
          ? dashboardStats?.orders?.completedToday || []
          : dashboardStats?.orders?.allDelivered || [];

  // DELIVERY DASHBOARD
  return (
    <main className="delivery_orders">
      {/* HEADER */}

      <section className="delivery_orders_header">
        <h1>Welcome, {deliveryPerson?.name || 'Delivery Partner'}</h1>

        <p>
          Shop ID: <strong>{deliveryPerson?.shopId || shopId}</strong>
        </p>

        <button className="delivery_complete_button" onClick={handleLogout}>
          Logout
        </button>
      </section>

      {dashboardStats && (
        <div className="delivery_dashboard_tabs">
          <button
            type="button"
            className={`delivery_dashboard_tab ${
              activeSection === 'today' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('today')}
          >
            <span>Today's Orders</span>
            <strong>{dashboardStats.today.orders}</strong>
          </button>

          <button
            type="button"
            className={`delivery_dashboard_tab ${
              activeSection === 'pending' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('pending')}
          >
            <span>Pending</span>
            <strong>{dashboardStats.today.pending}</strong>
          </button>

          <button
            type="button"
            className={`delivery_dashboard_tab ${
              activeSection === 'completedToday' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('completedToday')}
          >
            <span>Completed Today</span>
            <strong>{dashboardStats.today.completed}</strong>
          </button>

          <button
            type="button"
            className={`delivery_dashboard_tab ${
              activeSection === 'allDelivered' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('allDelivered')}
          >
            <span>Total Delivered</span>
            <strong>{dashboardStats.allTime.delivered}</strong>
          </button>
        </div>
      )}

      {error && <p className="delivery_error_message">{error}</p>}

      {/* ORDERS */}

      {selectedOrder ? (
        <DeliveryOrderDetails
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onVerifyOtp={handleVerifyOtp}
          currentLocation={currentLocation}
        />
      ) : (
        <section className="delivery_orders_list">
          <h2 className="delivery_orders_list_title">
            {activeSection === 'today'
              ? "Today's Orders"
              : activeSection === 'pending'
                ? 'Pending Deliveries'
                : activeSection === 'completedToday'
                  ? 'Completed Today'
                  : 'All Delivered Orders'}
          </h2>
          {activeOrders.length === 0 ? (
            <div className="delivery_no_orders">
              <h2>
                {activeSection === 'today'
                  ? 'No orders today'
                  : activeSection === 'pending'
                    ? 'No pending deliveries'
                    : activeSection === 'completedToday'
                      ? 'No orders completed today'
                      : 'No delivered orders yet'}
              </h2>

              <p>
                {activeSection === 'today'
                  ? 'There are no delivery orders for today.'
                  : activeSection === 'pending'
                    ? 'There are currently no orders waiting for delivery.'
                    : activeSection === 'completedToday'
                      ? 'No delivery orders have been completed today.'
                      : 'There are no completed delivery orders yet.'}
              </p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <button
                type="button"
                className="delivery_order_row"
                key={order.orderId}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="delivery_order_row_main">
                  <strong>#{order.orderId}</strong>

                  <span className="delivery_order_status">
                    {order.status === 'Completed'
                      ? 'Completed'
                      : order.status === 'OutForDelivery'
                        ? 'Out for delivery'
                        : order.status}
                  </span>
                </div>

                <div className="delivery_order_row_info">
                  <span>{order.customer?.name || 'Customer'}</span>

                  <span>
                    {order.totalItems}{' '}
                    {order.totalItems === 1 ? 'item' : 'items'}
                  </span>

                  <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
                </div>

                <div className="delivery_order_row_footer">
                  <span>
                    {order.deliveryDistance
                      ? `${Number(order.deliveryDistance).toFixed(1)} km`
                      : 'Delivery'}
                  </span>

                  <span>View Details →</span>
                </div>
              </button>
            ))
          )}
        </section>
      )}
    </main>
  );
}

function DeliveryOrderDetails({ order, onBack, onVerifyOtp, currentLocation }) {
  const [otp, setOtp] = useState('');
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError('');

        const token = sessionStorage.getItem('delivery_token');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/delivery/route/${order.orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load route');
        }

        setRoute(data.route);
      } catch (error) {
        console.error('Failed to fetch delivery route:', error);
        setRouteError(error.message);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [order.orderId]);

  const handleSubmitOtp = () => {
    if (!otp.trim()) {
      alert('Please enter the delivery OTP.');
      return;
    }

    onVerifyOtp(order.orderId, otp);
  };

  return (
    <div className="delivery_order_details">
      <div className="delivery_details_header">
        <button type="button" className="delivery_back_button" onClick={onBack}>
          <span className="delivery_back_icon">←</span>
          <span>Back to Orders</span>
        </button>

        <div className="delivery_details_header_main">
          <div className="delivery_details_heading">
            <span>DELIVERY ORDER</span>
            <h2>#{order.orderId}</h2>
          </div>

          <div className="delivery_details_status">
            <span>
              {order.status === 'Completed'
                ? 'Completed'
                : order.status === 'OutForDelivery'
                  ? 'Out for Delivery'
                  : order.status}
            </span>
          </div>
        </div>
      </div>

      <section className="delivery_details_section">
        <h3>Customer</h3>

        <div className="delivery_customer_details">
          <div>
            <span>Name</span>
            <strong>{order.customer?.name || 'Customer'}</strong>
          </div>

          <div>
            <span>Phone</span>
            <a href={`tel:${order.customer?.phone}`}>
              {order.customer?.phone || 'Not available'}
            </a>
          </div>
        </div>
      </section>

      <section className="delivery_details_section">
        <h3>Delivery Address</h3>

        <p className="delivery_address">
          {order.deliveryAddress || order.address || 'Address not available'}
        </p>
      </section>

      <section className="delivery_details_section">
        <h3>Route</h3>

        {!order.deliveryLocation?.latitude ||
        !order.deliveryLocation?.longitude ? (
          <div className="delivery_route_error">
            Delivery location is not available for this order.
          </div>
        ) : routeLoading ? (
          <div className="delivery_route_message">Loading route...</div>
        ) : routeError ? (
          <div className="delivery_route_error">{routeError}</div>
        ) : (
          <>
            <div className="delivery_map_container">
              <OrderLocationMap
                latitude={order.deliveryLocation.latitude}
                longitude={order.deliveryLocation.longitude}
                route={route}
                currentLocation={currentLocation}
              />
            </div>

            {order.deliveryDistance && (
              <div className="delivery_distance">
                Distance: {Number(order.deliveryDistance).toFixed(2)} km
              </div>
            )}
          </>
        )}
      </section>

      <section className="delivery_details_section">
        <h3>Order Items</h3>

        <div className="delivery_order_items">
          {order.items?.map((item, index) => (
            <div
              className="delivery_order_item"
              key={`${item.productId || item.name}-${index}`}
            >
              <div>
                <strong>{item.name || item.productName}</strong>

                <span>Qty: {item.quantity}</span>
              </div>

              <strong>
                ₹
                {Number(
                  item.total || item.price * item.quantity || item.price || 0,
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className="delivery_details_total">
          <span>Total</span>

          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>
      </section>

      {order.status === 'OutForDelivery' && (
        <section className="delivery_details_section delivery_otp_section">
          <h3>Customer OTP</h3>
          <p>
            Ask the customer for the delivery OTP before completing the
            delivery.
          </p>

          <div className="delivery_otp_action">
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
            />

            <button type="button" onClick={handleSubmitOtp}>
              Verify & Deliver
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default DeliveryOrders;
