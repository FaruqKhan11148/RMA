import './OwnerDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  requestOwnerNotificationPermission,
  listenForOwnerNotifications,
} from '../../../firebase/ownerNotifications';

function OwnerDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectOrder, setSelectedRejectOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDescription, setRejectionDescription] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState(false);

  const [shopOwner, setShopOwner] = useState(() => {
    const ownerData = localStorage.getItem('rma_owner');

    return ownerData ? JSON.parse(ownerData) : null;
  });

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
          `https://rma-backend-bo4a.onrender.com/api/orders/owner/${shopOwner.id}`,
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

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    const token = localStorage.getItem('rma_owner_token');

    if (!token) {
      navigate('/owner/login');
      return;
    }

    const fetchOwner = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setShopOwner(data.owner);
        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        console.error('Fetch owner status failed:', error);
      }
    };

    fetchOwner();

    const intervalId = setInterval(fetchOwner, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, shopOwner?.id]);

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    const token = localStorage.getItem('rma_owner_token');

    if (!token) {
      return;
    }

    let isActive = true;

    const setupOwnerNotifications = async () => {
      const ownerFcmToken = await requestOwnerNotificationPermission(token);

      if (!isActive) {
        return;
      }

      if (ownerFcmToken) {
        console.log('OWNER NOTIFICATION SETUP COMPLETED.');
      }
    };

    setupOwnerNotifications();

    return () => {
      isActive = false;
    };
  }, [shopOwner?.id]);

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    let unsubscribe;
    let isActive = true;

    const setupNotificationListener = async () => {
      const cleanup = await listenForOwnerNotifications((payload) => {
        if (!isActive) {
          return;
        }

        const title = payload.notification?.title || 'RMA Notification';

        const message =
          payload.notification?.body || 'You have a new notification.';

        alert(`${title}\n\n${message}`);
      });

      if (!isActive) {
        if (cleanup) {
          cleanup();
        }

        return;
      }

      unsubscribe = cleanup;
    };

    setupNotificationListener();

    return () => {
      isActive = false;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [shopOwner?.id]);

  if (!shopOwner) {
    return null;
  }

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

  const openRejectModal = (order) => {
    setSelectedRejectOrder(order);
    setRejectionReason('');
    setRejectionDescription('');
    setShowRejectModal(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedRejectOrder) {
      return;
    }

    if (!rejectionReason) {
      alert('Please select a rejection reason.');
      return;
    }

    try {
      setRejectingOrder(true);

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${selectedRejectOrder.orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Rejected',
            rejectionReason,
            rejectionDescription: rejectionDescription.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to reject order');
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === selectedRejectOrder.orderId ? data.order : order,
        ),
      );

      setShowRejectModal(false);
      setSelectedRejectOrder(null);
      setRejectionReason('');
      setRejectionDescription('');
    } catch (error) {
      console.error('Reject order failed:', error);

      alert('Unable to connect to server');
    } finally {
      setRejectingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${orderId}/status`,
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

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  const pendingOrders = todayOrders.filter(
    (order) => order.status === 'Pending',
  );

  const completedOrders = todayOrders.filter(
    (order) => order.status === 'Completed',
  );

  const totalRevenue = completedOrders.reduce(
    (total, order) => total + order.totalPrice,
    0,
  );

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
          <strong>{todayOrders.length}</strong>
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
                    onClick={() => openRejectModal(order)}
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
      {showRejectModal && selectedRejectOrder && (
        <div className="owner_reject_modal_overlay">
          <div className="owner_reject_modal">
            <div className="owner_reject_modal_header">
              <div>
                <h2>Reject Order</h2>

                <p>Order #{selectedRejectOrder.orderId}</p>
              </div>

              <button
                type="button"
                className="owner_reject_modal_close"
                onClick={() => {
                  if (rejectingOrder) return;

                  setShowRejectModal(false);
                  setSelectedRejectOrder(null);
                  setRejectionReason('');
                  setRejectionDescription('');
                }}
              >
                ×
              </button>
            </div>

            <p className="owner_reject_modal_text">
              Please select a reason for rejecting this order.
            </p>

            <label
              htmlFor="owner_rejection_reason"
              className="owner_reject_modal_label"
            >
              Rejection Reason
            </label>

            <select
              id="owner_rejection_reason"
              className="owner_reject_modal_select"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              disabled={rejectingOrder}
            >
              <option value="">Select a reason</option>
              <option value="Item unavailable">Item unavailable</option>
              <option value="Insufficient stock">Insufficient stock</option>
              <option value="Shop too busy">Shop too busy</option>
              <option value="Unable to prepare order">
                Unable to prepare order
              </option>
              <option value="Delivery unavailable">Delivery unavailable</option>
              <option value="Shop closing soon">Shop closing soon</option>
              <option value="Other">Other</option>
            </select>

            <label
              htmlFor="owner_rejection_description"
              className="owner_reject_modal_label"
            >
              Additional Details
            </label>

            <textarea
              id="owner_rejection_description"
              className="owner_reject_modal_textarea"
              value={rejectionDescription}
              onChange={(event) => setRejectionDescription(event.target.value)}
              placeholder="Add more details if needed..."
              rows={4}
              disabled={rejectingOrder}
            />

            <div className="owner_reject_modal_actions">
              <button
                type="button"
                className="owner_reject_modal_cancel"
                onClick={() => {
                  if (rejectingOrder) return;

                  setShowRejectModal(false);
                  setSelectedRejectOrder(null);
                  setRejectionReason('');
                  setRejectionDescription('');
                }}
                disabled={rejectingOrder}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="owner_reject_modal_confirm"
                onClick={handleRejectOrder}
                disabled={rejectingOrder}
              >
                {rejectingOrder ? 'Rejecting...' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OwnerDashboard;
