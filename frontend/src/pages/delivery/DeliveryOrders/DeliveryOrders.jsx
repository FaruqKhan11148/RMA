import './DeliveryOrders.css';

import { useEffect, useState } from 'react';
import OrderLocationMap from '../../../components/map/OrderLocationMap';

function DeliveryOrders() {
  const [shopId, setShopId] = useState('');
  const [phone, setPhone] = useState('');

  const [otp, setOtp] = useState('');

  const [loginStep, setLoginStep] = useState('login');

  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

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
            'http://localhost:5000/api/delivery/location',
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
        'http://localhost:5000/api/delivery/request-otp',
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
        'http://localhost:5000/api/delivery/verify-otp',
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
          'http://localhost:5000/api/delivery/orders',
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

  // VERIFY CUSTOMER DELIVERY OTP
  const handleVerifyOtp = async (orderId, otp) => {
    try {
      const token = sessionStorage.getItem('delivery_token');

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/verify-otp`,
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

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.orderId !== orderId),
      );
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

      {error && <p className="delivery_error_message">{error}</p>}

      {/* ORDERS */}

      <section className="delivery_orders_list">
        {orders.length === 0 ? (
          <div className="delivery_no_orders">
            <h2>No delivery orders</h2>

            <p>There are currently no orders waiting for delivery.</p>
          </div>
        ) : (
          orders.map((order) => (
            <DeliveryOrderCard
              key={order.orderId}
              order={order}
              onVerifyOtp={handleVerifyOtp}
              currentLocation={currentLocation}
            />
          ))
        )}
      </section>
    </main>
  );
}

function DeliveryOrderCard({ order, onVerifyOtp, currentLocation }) {
  const [otp, setOtp] = useState('');
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError('');

        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setRouteError('Delivery login session not found');
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/delivery/route/${order.orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to calculate route');
        }

        setRoute(data.route);
        console.log('Delivery route:', data.route);
      } catch (error) {
        console.error('Fetch delivery route failed:', error);

        setRouteError('Unable to calculate delivery route');
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [order.orderId]);

  const handleSubmit = () => {
    if (otp.length !== 6) {
      alert('Please enter the 6-digit OTP');
      return;
    }

    onVerifyOtp(order.orderId, otp);
  };

  return (
    <div className="delivery_order_card">
      {/* ORDER HEADER */}

      <div className="delivery_order_top">
        <strong>#{order.orderId}</strong>

        <span className="delivery_order_status">Out for delivery</span>
      </div>

      {/* CUSTOMER */}

      <div className="delivery_order_info">
        <h2>{order.customer.name}</h2>

        <p>Mobile: {order.customer.phone}</p>

        <p>
          <strong>Address:</strong> {order.customer.address}
        </p>

        {order.deliveryLocation && (
          <div className="delivery_map_container">
            <OrderLocationMap
              latitude={order.deliveryLocation.latitude}
              longitude={order.deliveryLocation.longitude}
              route={route}
              currentLocation={currentLocation}
            />
          </div>
        )}

        {routeLoading && (
          <p className="delivery_route_loading">
            Calculating delivery route...
          </p>
        )}

        {routeError && <p className="delivery_error_message">{routeError}</p>}

        {/* ITEMS */}

        <div className="delivery_order_items">
          {order.items.map((item) => (
            <p key={item.productId}>
              {item.productName} × {item.quantity}
            </p>
          ))}
        </div>

        <strong className="delivery_order_total">₹{order.totalPrice}</strong>
      </div>

      {/* CUSTOMER OTP */}

      <div className="delivery_otp_section">
        <h3>Customer Delivery OTP</h3>

        <p>Ask the customer for their 6-digit OTP.</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength="6"
          placeholder="Enter OTP"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
        />

        <button className="delivery_complete_button" onClick={handleSubmit}>
          Delivered
        </button>
      </div>
    </div>
  );
}

export default DeliveryOrders;
