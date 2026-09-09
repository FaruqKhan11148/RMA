import './AdminDailyOrders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDailyOrders() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/orders/daily',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch daily orders');
        }

        setData(result);
      } catch (error) {
        console.error('Admin daily orders fetch error:', error);

        setError(error.message || 'Failed to load daily orders');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyOrders();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDateTime = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <main className="admin-daily-orders-page">
        <div className="admin-daily-orders-state">
          Loading today's orders...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="admin-daily-orders-page">
        <div className="admin-daily-orders-error">
          <h2>Unable to load daily orders</h2>
          <p>{error || 'Something went wrong.'}</p>

          <button type="button" onClick={() => navigate('/admin/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </main>
    );
  }

  const stats = data.stats || {};
  const orderStatus = data.orderStatus || {};
  const shops = data.shops || [];
  const orders = data.orders || [];

  return (
    <main className="admin-daily-orders-page">
      {/* HEADER */}

      <header className="admin-daily-orders-header">
        <div>
          <button
            type="button"
            className="admin-daily-back"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>

          <h1>Daily Orders</h1>

          <p>All orders placed on {data.date} in India.</p>
        </div>

        <div className="admin-daily-date">{data.date}</div>
      </header>

      {/* SUMMARY */}

      <section className="admin-daily-summary">
        <div className="admin-daily-stat-card">
          <span>Total Orders</span>
          <strong>{stats.totalOrders || 0}</strong>
        </div>

        <div className="admin-daily-stat-card">
          <span>Completed</span>
          <strong>{stats.completedOrders || 0}</strong>
        </div>

        <div className="admin-daily-stat-card">
          <span>Transaction Value</span>
          <strong>{formatCurrency(stats.totalTransactionValue)}</strong>
        </div>

        <div className="admin-daily-stat-card">
          <span>Completed Value</span>
          <strong>{formatCurrency(stats.completedTransactionValue)}</strong>
        </div>

        <div className="admin-daily-stat-card">
          <span>RMA Fees</span>
          <strong>{formatCurrency(stats.totalRmaFees)}</strong>
        </div>
      </section>

      {/* STATUS */}

      <section className="admin-daily-section">
        <div className="admin-daily-section-header">
          <div>
            <h2>Order Status</h2>
            <p>Today's order distribution.</p>
          </div>
        </div>

        <div className="admin-daily-status-grid">
          {[
            'Pending',
            'Accepted',
            'Preparing',
            'Ready',
            'OutForDelivery',
            'Completed',
            'Rejected',
          ].map((status) => (
            <div className="admin-daily-status-card" key={status}>
              <span>{status}</span>

              <strong>{orderStatus[status] || 0}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP PERFORMANCE */}

      <section className="admin-daily-section">
        <div className="admin-daily-section-header">
          <div>
            <h2>Shop Performance</h2>
            <p>Today's order and transaction performance by shop.</p>
          </div>

          <span className="admin-daily-count">{shops.length} Shops</span>
        </div>

        {shops.length === 0 ? (
          <div className="admin-daily-empty">No shop orders today.</div>
        ) : (
          <div className="admin-daily-table-wrapper">
            <table className="admin-daily-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Owner</th>
                  <th>Orders</th>
                  <th>Completed</th>
                  <th>Transactions</th>
                  <th>RMA Fee</th>
                </tr>
              </thead>

              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.shopId}>
                    <td>
                      <strong>{shop.shopName}</strong>

                      <small>{shop.shopId}</small>
                    </td>

                    <td>{shop.ownerName}</td>

                    <td>{shop.totalOrders}</td>

                    <td>{shop.completedOrders}</td>

                    <td>{formatCurrency(shop.transactionValue)}</td>

                    <td>{formatCurrency(shop.rmaFees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* TODAY'S ORDERS */}

      <section className="admin-daily-section">
        <div className="admin-daily-section-header">
          <div>
            <h2>Today's Orders</h2>
            <p>Every order placed during today's Indian business day.</p>
          </div>

          <span className="admin-daily-count">{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-daily-empty">No orders placed today.</div>
        ) : (
          <div className="admin-daily-table-wrapper">
            <table className="admin-daily-table admin-orders-daily-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Shop</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <button
                        type="button"
                        className="admin-daily-order-button"
                        onClick={() =>
                          navigate(`/admin/orders/${order.orderId}`)
                        }
                      >
                        {order.orderId}
                      </button>
                    </td>

                    <td>
                      <strong>
                        {order.ownerId?.shopName || 'Unknown Shop'}
                      </strong>

                      <small>{order.ownerId?.shopId || '—'}</small>
                    </td>

                    <td>
                      <strong>{order.customer?.name || '—'}</strong>

                      <small>{order.customer?.phone || '—'}</small>
                    </td>

                    <td>{formatCurrency(order.totalPrice)}</td>

                    <td>
                      <span
                        className={`admin-daily-payment ${(
                          order.paymentStatus || ''
                        ).toLowerCase()}`}
                      >
                        {order.paymentStatus || '—'}
                      </span>

                      <small>{order.paymentMethod || '—'}</small>
                    </td>

                    <td>
                      <span
                        className={`admin-daily-order-status ${(
                          order.status || ''
                        ).toLowerCase()}`}
                      >
                        {order.status || '—'}
                      </span>
                    </td>

                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDailyOrders;
