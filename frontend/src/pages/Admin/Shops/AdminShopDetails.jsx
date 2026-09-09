import './AdminShopDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function AdminShopDetails() {
  const navigate = useNavigate();
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShopStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/admin/owners/stats/${shopId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch shop statistics');
        }

        setShop(data.shop);
        setStats(data.stats);
        setOrderStatus(data.orderStatus);
        setRecentOrders(data.recentOrders || []);
      } catch (error) {
        console.error('Shop statistics fetch failed:', error);
        setError(error.message || 'Unable to load shop statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchShopStats();
  }, [shopId]);

  if (loading) {
    return (
      <main className="admin-shop-details-page">
        <div className="admin-shop-details-state">
          Loading shop statistics...
        </div>
      </main>
    );
  }

  if (error || !shop || !stats) {
    return (
      <main className="admin-shop-details-page">
        <div className="admin-shop-details-state admin-shop-details-error">
          <h2>Unable to load shop</h2>
          <p>{error || 'Shop information is unavailable.'}</p>

          <button type="button" onClick={() => navigate('/admin/shops')}>
            ← Back to Shops
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shop-details-page">
      {/* Header */}

      <header className="admin-shop-details-header">
        <div>
          <button
            type="button"
            className="admin-shop-details-back"
            onClick={() => navigate('/admin/shops')}
          >
            ← Shops
          </button>

          <span className="admin-shop-details-id">{shop.shopId}</span>

          <h1>{shop.shopName || 'Unnamed Shop'}</h1>

          <p>
            Owner: {shop.ownerName || 'Unknown'} · {shop.phone || 'No phone'}
          </p>
        </div>
      </header>

      {/* Main statistics */}

      <section className="admin-shop-stat-grid">
        <div className="admin-shop-stat-card">
          <span>Total Orders</span>
          <strong>{stats.totalOrders}</strong>
          <small>All orders received</small>
        </div>

        <div className="admin-shop-stat-card">
          <span>Completed Orders</span>
          <strong>{stats.completedOrders}</strong>
          <small>Successfully completed</small>
        </div>

        <div className="admin-shop-stat-card">
          <span>Total Transactions</span>
          <strong>₹{stats.totalTransactionValue.toFixed(2)}</strong>
          <small>Total order value</small>
        </div>

        <div className="admin-shop-stat-card">
          <span>Completed Value</span>
          <strong>₹{stats.completedTransactionValue.toFixed(2)}</strong>
          <small>Completed paid orders</small>
        </div>

        <div className="admin-shop-stat-card">
          <span>RMA Fees</span>
          <strong>₹{stats.totalRmaFees.toFixed(2)}</strong>
          <small>1% platform fee</small>
        </div>
      </section>

      {/* Order status */}

      <section className="admin-shop-panel">
        <div className="admin-shop-panel-header">
          <div>
            <h2>Order Status</h2>
            <p>Current order distribution for this shop</p>
          </div>
        </div>

        <div className="admin-shop-status-grid">
          <div>
            <span>Pending</span>
            <strong>{orderStatus.Pending}</strong>
          </div>

          <div>
            <span>Accepted</span>
            <strong>{orderStatus.Accepted}</strong>
          </div>

          <div>
            <span>Preparing</span>
            <strong>{orderStatus.Preparing}</strong>
          </div>

          <div>
            <span>Ready</span>
            <strong>{orderStatus.Ready}</strong>
          </div>

          <div>
            <span>Out for Delivery</span>
            <strong>{orderStatus.OutForDelivery}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{orderStatus.Completed}</strong>
          </div>

          <div>
            <span>Rejected</span>
            <strong>{orderStatus.Rejected}</strong>
          </div>
        </div>
      </section>
      <section className="admin-recent-orders">
        <div className="admin-section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest orders received by this shop.</p>
          </div>

          <span className="admin-section-count">
            {recentOrders.length} Orders
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-recent-orders-empty">
            No orders found for this shop.
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th>Completed</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <td>
                        <button
                          type="button"
                          className="admin-order-id-button"
                          onClick={() =>
                            navigate(`/admin/orders/${order.orderId}`)
                          }
                        >
                          {order.orderId}
                        </button>
                      </td>
                    </td>

                    <td>₹{Number(order.totalPrice || 0).toFixed(2)}</td>

                    <td>
                      <span
                        className={`admin-payment-status ${
                          order.paymentStatus?.toLowerCase() || ''
                        }`}
                      >
                        {order.paymentStatus || 'Unknown'}
                      </span>

                      <small>{order.paymentMethod || '—'}</small>
                    </td>

                    <td>
                      <span
                        className={`admin-order-status ${(
                          order.status || ''
                        ).toLowerCase()}`}
                      >
                        {order.status || 'Unknown'}
                      </span>
                    </td>

                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : '—'}
                    </td>

                    <td>
                      {order.completedAt
                        ? new Date(order.completedAt).toLocaleString()
                        : '—'}
                    </td>
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

export default AdminShopDetails;
