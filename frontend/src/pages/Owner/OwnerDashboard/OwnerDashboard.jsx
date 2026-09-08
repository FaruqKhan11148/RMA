import './OwnerDashboard.css';

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ownerData = localStorage.getItem('rma_owner');

  const shopOwner = useMemo(() => {
    return ownerData ? JSON.parse(ownerData) : null;
  }, [ownerData]);

  useEffect(() => {
    if (!shopOwner) {
      navigate('/owner/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `http://localhost:5000/api/orders/owner/${shopOwner.id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load orders');
          return;
        }

        setOrders(data.orders);
      } catch (error) {
        console.error('Fetch owner orders failed:', error);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shopOwner, navigate]);

  if (!shopOwner) {
    return null;
  }

  const pendingOrders = orders.filter((order) => order.status === 'Pending');

  const completedOrders = orders.filter(
    (order) => order.status === 'Completed',
  );

  const totalRevenue = completedOrders.reduce(
    (total, order) => total + order.totalPrice,
    0,
  );

  const handleLogout = () => {
    localStorage.removeItem('rma_owner');

    navigate('/owner/login');
  };

  if (loading) {
    return (
      <main className="owner_dashboard">
        <h1>Loading orders...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="owner_dashboard">
        <h1>Unable to load orders</h1>

        <p>{error}</p>
      </main>
    );
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to update order');
        return;
      }

      // Update dashboard immediately
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order,
        ),
      );

      console.log('Order status updated:', data.order);
    } catch (error) {
      console.error('Update order status failed:', error);

      alert('Unable to connect to server');
    }
  };

  return (
    <main className="owner_dashboard">
      {/* HEADER */}

      <section className="owner_dashboard_header">
        <div>
          <p>Welcome back,</p>
          <h1>{shopOwner.ownerName}</h1>
          <span>{shopOwner.shopName}</span>
        </div>

        <div className="owner_header_actions">
          <button
            className="owner_settings_button"
            onClick={() => navigate('/owner/settings/account')}
          >
            Settings
          </button>

          <button className="owner_logout_button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      {/* TODAY'S SUMMARY */}

      <section className="owner_stats">
        <div className="owner_stat_card">
          <span>Today's Orders</span>

          <strong>{orders.length}</strong>
        </div>

        <div className="owner_stat_card">
          <span>Pending</span>

          <strong>{pendingOrders.length}</strong>
        </div>

        <div className="owner_stat_card">
          <span>Completed</span>

          <strong>{completedOrders.length}</strong>
        </div>

        <div className="owner_stat_card">
          <span>Today's Revenue</span>

          <strong>₹{totalRevenue}</strong>
        </div>
      </section>

      {/* NEW ORDERS */}

      <section className="owner_orders_section">
        <div className="owner_section_header">
          <div>
            <h2>New Orders</h2>

            <span>
              {pendingOrders.length === 0
                ? 'No orders waiting'
                : `${pendingOrders.length} order${
                    pendingOrders.length > 1 ? 's' : ''
                  } waiting for action`}
            </span>
          </div>
        </div>

        <div className="owner_orders">
          {pendingOrders.length === 0 ? (
            <div className="no_pending_orders">
              <strong>No pending orders</strong>

              <p>New customer orders will appear here.</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <div className="owner_order_card" key={order.orderId}>
                <div className="owner_order_top">
                  <strong>#{order.orderId}</strong>

                  <span className="pending_status">{order.status}</span>
                </div>

                <p>Customer: {order.customer.name}</p>

                <div className="owner_order_items">
                  {order.items.map((item) => (
                    <p key={item.productId}>
                      {item.productName} × {item.quantity}
                    </p>
                  ))}
                </div>

                <strong className="owner_order_total">
                  ₹{order.totalPrice}
                </strong>

                <div className="owner_order_actions">
                  <button
                    className="reject_button"
                    onClick={() => updateOrderStatus(order.orderId, 'Rejected')}
                  >
                    Reject
                  </button>

                  <button
                    className="accept_button"
                    onClick={() => updateOrderStatus(order.orderId, 'Accepted')}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MANAGE ALL ORDERS */}

      <section className="manage_orders_section">
        <button
          className="manage_orders_card"
          onClick={() => navigate('/owner/orders')}
        >
          <div className="manage_orders_icon">📦</div>

          <div className="manage_orders_content">
            <strong>Manage All Orders</strong>

            <span>
              View and update pending, accepted, preparing, ready and completed
              orders.
            </span>
          </div>

          <div className="manage_orders_arrow">→</div>
        </button>
      </section>

      {/* RECENT ORDERS */}

      <section className="owner_orders_section">
        <div className="owner_section_header">
          <div>
            <h2>Recent Orders</h2>

            <span>Latest customer orders</span>
          </div>
        </div>

        <div className="owner_orders">
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div className="owner_order_card compact" key={order.orderId}>
                <div className="owner_order_top">
                  <strong>#{order.orderId}</strong>

                  <span
                    className={`order_status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>

                <p>{order.customer.name}</p>

                <div className="compact_order_bottom">
                  <span>
                    {order.totalItems} item
                    {order.totalItems > 1 ? 's' : ''}
                  </span>

                  <strong>₹{order.totalPrice}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default OwnerDashboard;
