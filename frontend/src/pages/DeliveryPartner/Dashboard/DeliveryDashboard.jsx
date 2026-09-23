import './DeliveryDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Power,
  Wallet,
} from 'lucide-react';

function DeliveryDashboard() {
  const navigate = useNavigate();

  const [deliveryPartner, setDeliveryPartner] = useState(null);

  const [dashboard, setDashboard] = useState({
    today: {
      orders: 0,
      pending: 0,
      completed: 0,
    },
    allTime: {
      delivered: 0,
    },
    orders: {
      today: [],
      pending: [],
      completedToday: [],
      allDelivered: [],
    },
  });

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('delivery_token');

    if (!token) {
      navigate('/delivery-Partner/login');
      return;
    }

    const storedPartner = sessionStorage.getItem('delivery_person');

    if (storedPartner) {
      try {
        const parsedPartner = JSON.parse(storedPartner);

        setDeliveryPartner(parsedPartner);
        setIsOnline(Boolean(parsedPartner?.isActive));
      } catch (parseError) {
        console.error('Failed to parse delivery partner:', parseError);
      }
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

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
          throw new Error(data.message || 'Failed to load dashboard');
        }

        setDashboard({
          today: {
            orders: data.today?.orders || 0,
            pending: data.today?.pending || 0,
            completed: data.today?.completed || 0,
          },

          allTime: {
            delivered: data.allTime?.delivered || 0,
          },

          orders: {
            today: data.orders?.today || [],
            pending: data.orders?.pending || [],
            completedToday: data.orders?.completedToday || [],
            allDelivered: data.orders?.allDelivered || [],
          },
        });
      } catch (fetchError) {
        console.error('Fetch delivery dashboard failed:', fetchError);

        setError('Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const partnerName =
    deliveryPartner?.name ||
    deliveryPartner?.fullName ||
    deliveryPartner?.ownerName ||
    'Delivery Partner';

  const activeDelivery = dashboard.orders.pending?.[0] || null;

  const todayEarnings = dashboard.orders.completedToday.reduce(
    (total, order) => total + Number(order.deliveryRiderAmount || 0),
    0,
  );

  const handleToggleOnline = () => {
    setIsOnline((previous) => !previous);
  };

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
    <main className="delivery_dashboard">
      {/* HEADER */}

      <section className="delivery_dashboard_header">
        <div>
          <span className="delivery_dashboard_greeting">Welcome back</span>

          <h1>{partnerName}</h1>

          <p>Ready to deliver today?</p>
        </div>

        <div
          className={`delivery_online_badge ${isOnline ? 'online' : 'offline'}`}
        >
          <span />

          {isOnline ? 'Online' : 'Offline'}
        </div>
      </section>

      {/* ONLINE TOGGLE */}

      <section className="delivery_status_card">
        <div className="delivery_status_icon">
          <Power size={21} />
        </div>

        <div className="delivery_status_content">
          <strong>{isOnline ? 'You are available' : 'You are offline'}</strong>

          <span>
            {isOnline
              ? 'You can receive delivery requests.'
              : 'Go online to receive delivery requests.'}
          </span>
        </div>

        <button
          type="button"
          className={`delivery_toggle ${isOnline ? 'active' : ''}`}
          onClick={handleToggleOnline}
          aria-label={isOnline ? 'Go offline' : 'Go online'}
        >
          <span />
        </button>
      </section>

      {/* ERROR */}

      {error && (
        <section className="delivery_empty_card">
          <strong>{error}</strong>

          <p>Please refresh the page and try again.</p>
        </section>
      )}

      {/* LOADING */}

      {loading ? (
        <section className="delivery_empty_card">
          <strong>Loading dashboard...</strong>

          <p>Please wait.</p>
        </section>
      ) : (
        <>
          {/* TODAY'S SUMMARY */}

          <section className="delivery_summary_grid">
            <div className="delivery_summary_card">
              <div className="delivery_summary_icon earnings">
                <Wallet size={19} />
              </div>

              <span>Today's Earnings</span>

              <strong>{formatAmount(todayEarnings)}</strong>
            </div>

            <div className="delivery_summary_card">
              <div className="delivery_summary_icon deliveries">
                <Bike size={19} />
              </div>

              <span>Deliveries</span>

              <strong>{dashboard.today.orders}</strong>
            </div>

            <div className="delivery_summary_card">
              <div className="delivery_summary_icon completed">
                <CheckCircle2 size={19} />
              </div>

              <span>Completed</span>

              <strong>{dashboard.today.completed}</strong>
            </div>
          </section>

          {/* ACTIVE DELIVERY */}

          <section className="delivery_section">
            <div className="delivery_section_header">
              <div>
                <h2>Active Delivery</h2>

                <span>Your current delivery</span>
              </div>
            </div>

            {activeDelivery ? (
              <div className="delivery_active_card">
                <div className="delivery_active_top">
                  <div>
                    <span>Order</span>

                    <strong>{activeDelivery.orderId}</strong>
                  </div>

                  <span className="delivery_active_status">
                    Out for delivery
                  </span>
                </div>

                <div className="delivery_active_details">
                  <div>
                    <MapPin size={17} />

                    <span>
                      {activeDelivery.deliveryLocation?.address ||
                        'Customer location'}
                    </span>
                  </div>

                  <div>
                    <Package size={17} />

                    <span>
                      {activeDelivery.items?.length || 0} item
                      {activeDelivery.items?.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="delivery_active_button"
                  onClick={() =>
                    navigate(
                      `/delivery/orders-delivery?orderId=${activeDelivery.orderId}`,
                    )
                  }
                >
                  View Delivery
                </button>
              </div>
            ) : (
              <div className="delivery_empty_card">
                <div className="delivery_empty_icon">
                  <Package size={25} />
                </div>

                <strong>No active delivery</strong>

                <p>Your assigned deliveries will appear here.</p>
              </div>
            )}
          </section>

          {/* DELIVERY REQUESTS */}

          <section className="delivery_section">
            <div className="delivery_section_header">
              <div>
                <h2>Delivery Requests</h2>

                <span>New orders waiting for pickup</span>
              </div>

              <span className="delivery_request_count">
                {dashboard.today.pending}
              </span>
            </div>

            {dashboard.today.pending > 0 ? (
              <div className="delivery_request_card">
                <div className="delivery_request_icon">
                  <Clock3 size={21} />
                </div>

                <div>
                  <strong>
                    {dashboard.today.pending} active delivery
                    {dashboard.today.pending === 1 ? '' : 'ies'}
                  </strong>

                  <p>You have assigned deliveries waiting to be completed.</p>
                </div>
              </div>
            ) : (
              <div className="delivery_empty_card compact">
                <div className="delivery_empty_icon">
                  <Clock3 size={23} />
                </div>

                <strong>No active requests</strong>

                <p>New delivery assignments will appear here.</p>
              </div>
            )}
          </section>

          {/* DELIVERY AREA */}

          <section className="delivery_section">
            <div className="delivery_section_header">
              <div>
                <h2>Delivery Area</h2>

                <span>Your delivery activity</span>
              </div>
            </div>

            <div className="delivery_area_card">
              <div className="delivery_area_icon">
                <MapPin size={21} />
              </div>

              <div>
                <strong>Today's delivery activity</strong>

                <p>
                  {dashboard.today.orders === 0
                    ? 'No delivery orders have been assigned today.'
                    : `${dashboard.today.orders} delivery ${
                        dashboard.today.orders === 1 ? 'order' : 'orders'
                      } assigned today.`}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default DeliveryDashboard;
