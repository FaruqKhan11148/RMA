import './OwnerOrders.css';

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import OrderLocationMap from '../../../components/map/OrderLocationMap';

function OwnerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ownerData = localStorage.getItem('rma_owner');

  const shopOwner = useMemo(() => {
    return ownerData ? JSON.parse(ownerData) : null;
  }, [ownerData]);

  const filters = [
    'All',
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'OutForDelivery',
    'Completed',
    'Rejected',
  ];

  // Redirect if owner is not logged in
  useEffect(() => {
    if (!shopOwner) {
      navigate('/owner/login');
    }
  }, [shopOwner, navigate]);

  // GET OWNER ORDERS
  useEffect(() => {
    if (!shopOwner) {
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
  }, [shopOwner]);

  // UPDATE ORDER STATUS
  const handleStatusChange = async (orderId, status) => {
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

      // Update the order immediately in the UI
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

  const filteredOrders =
    activeFilter === 'All'
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const getCount = (status) => {
    if (status === 'All') {
      return orders.length;
    }

    return orders.filter((order) => order.status === status).length;
  };

  if (!shopOwner) {
    return null;
  }

  if (loading) {
    return (
      <main className="owner_orders">
        <section className="owner_no_orders">
          <h2>Loading orders...</h2>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="owner_orders">
        <section className="owner_no_orders">
          <h2>Unable to load orders</h2>

          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="owner_orders">
      {/* HEADER */}

      <section className="owner_orders_header">
        <button
          className="owner_orders_back"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Back
        </button>

        <div>
          <h1>Manage Orders</h1>

          <p>View and manage customer orders.</p>
        </div>
      </section>

      {/* FILTERS */}

      <section className="owner_order_filters">
        <h2>Orders</h2>

        <div className="owner_filter_buttons">
          {filters.map((filter) => (
            <button
              key={filter}
              className={
                activeFilter === filter
                  ? 'owner_filter_button active'
                  : 'owner_filter_button'
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}

              <span>{getCount(filter)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ORDERS */}

      <section className="owner_orders_list">
        {filteredOrders.length === 0 ? (
          <div className="owner_no_orders">
            <h2>No {activeFilter.toLowerCase()} orders</h2>

            <p>There are currently no orders in this category.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div className="owner_order_card" key={order.orderId}>
              {/* TOP */}

              <div className="owner_order_top">
                <strong>#{order.orderId}</strong>

                <span
                  className={`order_status ${order.status
                    .toLowerCase()
                    .replace(/([a-z])([A-Z])/g, '$1-$2')}`}
                >
                  {order.status}
                </span>
              </div>

              {/* CUSTOMER */}

              <div className="owner_order_info">
                <h2>{order.customer.name}</h2>

                <p>Mobile: {order.customer.phone}</p>

                {order.orderType === 'delivery' && (
                  <>
                    <p>Address: {order.customer.address}</p>

                    {order.deliveryLocation && (
                      <OrderLocationMap
                        latitude={order.deliveryLocation.latitude}
                        longitude={order.deliveryLocation.longitude}
                      />
                    )}
                  </>
                )}

                <p>
                  Order Type:{' '}
                  {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                </p>

                {/* ITEMS */}

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
              </div>

              {/* ACTIONS */}

              <div className="owner_order_actions">
                {/* PENDING */}

                {order.status === 'Pending' && (
                  <>
                    <button
                      className="reject_order_button"
                      onClick={() =>
                        handleStatusChange(order.orderId, 'Rejected')
                      }
                    >
                      Reject
                    </button>

                    <button
                      className="accept_order_button"
                      onClick={() =>
                        handleStatusChange(order.orderId, 'Accepted')
                      }
                    >
                      Accept
                    </button>
                  </>
                )}

                {/* ACCEPTED */}

                {order.status === 'Accepted' && (
                  <button
                    className="accept_order_button"
                    onClick={() =>
                      handleStatusChange(order.orderId, 'Preparing')
                    }
                  >
                    Start Preparing
                  </button>
                )}

                {/* PREPARING */}

                {order.status === 'Preparing' && (
                  <button
                    className="accept_order_button"
                    onClick={() => handleStatusChange(order.orderId, 'Ready')}
                  >
                    Mark Ready
                  </button>
                )}

                {/* READY */}

                {order.status === 'Ready' && (
                  <>
                    {order.orderType === 'delivery' ? (
                      <button
                        className="accept_order_button"
                        onClick={() =>
                          handleStatusChange(order.orderId, 'OutForDelivery')
                        }
                      >
                        Send for Delivery
                      </button>
                    ) : (
                      <button
                        className="accept_order_button"
                        onClick={() =>
                          handleStatusChange(order.orderId, 'Completed')
                        }
                      >
                        Complete Order
                      </button>
                    )}
                  </>
                )}

                {/* OUT FOR DELIVERY */}

                {order.status === 'OutForDelivery' && (
                  <div className="order_delivery_message">
                    <strong>Out for delivery</strong>

                    <p>Delivery partner has received this order.</p>

                    <p>
                      Order will be completed after delivery OTP verification.
                    </p>
                  </div>
                )}

                {/* COMPLETED */}

                {order.status === 'Completed' && (
                  <p className="order_completed_message">✓ Order completed</p>
                )}

                {/* REJECTED */}

                {order.status === 'Rejected' && (
                  <p className="order_rejected_message">Order rejected</p>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default OwnerOrders;
