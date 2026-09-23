import './OwnerEarnings.css';

import { useEffect, useState } from 'react';
import { IndianRupee, Clock3, CheckCircle2, Package } from 'lucide-react';

function OwnerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError('');

        const storedOwner = localStorage.getItem('rma_owner');

        if (!storedOwner) {
          throw new Error('Owner session not found');
        }

        const owner = JSON.parse(storedOwner);

        if (!owner?.id) {
          throw new Error('Invalid owner session');
        }

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/orders/owner/${owner.id}/earnings`,
          {
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch earnings');
        }

        setEarnings(data.earnings);
        setRecentOrders(data.recentOrders || []);
      } catch (error) {
        console.error('Fetch owner earnings failed:', error);
        setError(error.message || 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <main className="owner_earnings_page">
        <div className="owner_earnings_loading">
          <div className="owner_earnings_spinner" />
          <p>Loading earnings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="owner_earnings_page">
        <div className="owner_earnings_error">
          <h2>Unable to load earnings</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="owner_earnings_page">
      <section className="owner_earnings_header">
        <h1>Earnings</h1>
        <p>Track your shop earnings and settlements.</p>
      </section>

      <section className="owner_earnings_total">
        <div className="owner_earnings_total_icon">
          <IndianRupee size={22} />
        </div>

        <div>
          <span>Total Earnings</span>
          <strong>₹{Number(earnings?.totalEarnings || 0).toFixed(2)}</strong>
        </div>
      </section>

      <section className="owner_earnings_cards">
        <div className="owner_earning_card">
          <div className="owner_earning_card_icon pending">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>
              ₹{Number(earnings?.pendingEarnings || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="owner_earning_card">
          <div className="owner_earning_card_icon processing">
            <Package size={20} />
          </div>

          <div>
            <span>Processing</span>
            <strong>
              ₹{Number(earnings?.processingEarnings || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="owner_earning_card">
          <div className="owner_earning_card_icon settled">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Settled</span>
            <strong>
              ₹{Number(earnings?.settledEarnings || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      <section className="owner_earnings_orders">
        <div className="owner_earnings_section_header">
          <h2>Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="owner_earnings_empty">
            <Package size={30} />
            <p>No earnings yet.</p>
          </div>
        ) : (
          <div className="owner_earnings_order_list">
            {recentOrders.map((order) => (
              <article
                className="owner_earnings_order_card"
                key={order.orderId}
              >
                <div className="owner_earnings_order_top">
                  <div>
                    <span>Order ID</span>
                    <strong>{order.orderId}</strong>
                  </div>

                  <span
                    className={`owner_settlement_badge ${String(
                      order.settlementStatus || '',
                    ).toLowerCase()}`}
                  >
                    {order.settlementStatus}
                  </span>
                </div>

                <div className="owner_earnings_order_details">
                  <div>
                    <span>Order Total</span>
                    <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Your Earnings</span>
                    <strong>
                      ₹{Number(order.ownerAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="owner_earnings_order_bottom">
                  <span>{order.orderStatus}</span>

                  {order.settledAt ? (
                    <span>
                      Settled {new Date(order.settledAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerEarnings;
