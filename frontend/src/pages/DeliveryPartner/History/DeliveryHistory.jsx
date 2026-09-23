import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  IndianRupee,
} from 'lucide-react';

import './DeliveryHistory.css';

function DeliveryHistory() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
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
          throw new Error(data.message || 'Failed to load delivery history');
        }

        setOrders(data.orders?.allDelivered || []);
      } catch (fetchError) {
        console.error('Fetch delivery history failed:', fetchError);

        setError('Unable to load delivery history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="delivery_history_page">
      {/* HEADER */}

      <header className="delivery_history_header">
        <div>
          <span>Delivery Partner</span>

          <h1>History</h1>

          <p>Your completed delivery orders.</p>
        </div>

        <div className="delivery_history_count">
          <strong>{orders.length}</strong>
          <span>Delivered</span>
        </div>
      </header>

      {/* LOADING */}

      {loading && (
        <section className="delivery_history_empty">
          <div className="delivery_history_empty_icon">
            <Clock3 size={24} />
          </div>

          <strong>Loading history...</strong>

          <p>Please wait while we load your completed deliveries.</p>
        </section>
      )}

      {/* ERROR */}

      {!loading && error && (
        <section className="delivery_history_empty">
          <div className="delivery_history_empty_icon">
            <Package size={24} />
          </div>

          <strong>{error}</strong>

          <p>Please refresh the page and try again.</p>
        </section>
      )}

      {/* EMPTY */}

      {!loading && !error && orders.length === 0 && (
        <section className="delivery_history_empty">
          <div className="delivery_history_empty_icon">
            <Package size={24} />
          </div>

          <strong>No delivery history</strong>

          <p>Your completed deliveries will appear here.</p>
        </section>
      )}

      {/* HISTORY */}

      {!loading && !error && orders.length > 0 && (
        <section className="delivery_history_list">
          {orders.map((order) => {
            const completedDate = order.completedAt || order.createdAt;

            const itemCount =
              order.totalItems ||
              order.items?.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              ) ||
              order.items?.length ||
              0;

            return (
              <article className="delivery_history_card" key={order.orderId}>
                {/* TOP */}

                <div className="delivery_history_top">
                  <div className="delivery_history_order">
                    <div className="delivery_history_status_icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <strong>#{order.orderId}</strong>

                      <span>
                        {formatDate(completedDate)}
                        {formatTime(completedDate)
                          ? ` • ${formatTime(completedDate)}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  <span className="delivery_history_completed">Completed</span>
                </div>

                {/* DETAILS */}

                <div className="delivery_history_details">
                  <div className="delivery_history_detail">
                    <Package size={16} />

                    <div>
                      <span>Items</span>

                      <strong>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery_history_detail">
                    <MapPin size={16} />

                    <div>
                      <span>Distance</span>

                      <strong>
                        {order.deliveryDistance != null
                          ? `${Number(order.deliveryDistance).toFixed(2)} km`
                          : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER */}

                <div className="delivery_history_customer">
                  <span>Customer</span>

                  <strong>{order.customer?.name || 'Customer'}</strong>
                </div>

                {/* EARNINGS */}

                <div className="delivery_history_bottom">
                  <div>
                    <span>Delivery Earnings</span>
                  </div>

                  <strong>
                    <IndianRupee size={15} />

                    {formatAmount(order.deliveryRiderAmount)}
                  </strong>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default DeliveryHistory;
