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

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);

  const [deliveryAssignmentType, setDeliveryAssignmentType] = useState('SHOP');

  const [deliveryPartners, setDeliveryPartners] = useState({
    SHOP: [],
    RMA: [],
  });

  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');

  const [loadingDeliveryPartners, setLoadingDeliveryPartners] = useState(false);

  const [assigningDelivery, setAssigningDelivery] = useState(false);

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
  }, [shopOwner]);

  // UPDATE ORDER STATUS
  const handleStatusChange = async (orderId, status) => {
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

  const openDeliveryAssignment = async (order) => {
    try {
      setSelectedDeliveryOrder(order);
      setDeliveryAssignmentType('SHOP');
      setSelectedDeliveryPersonId('');
      setDeliveryPartners({
        SHOP: [],
        RMA: [],
      });
      setShowDeliveryModal(true);
      setLoadingDeliveryPartners(true);

      const ownerToken = localStorage.getItem('rma_owner_token');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/delivery/owner/available-partners/${order.orderId}`,
        {
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to load delivery partners');
        setShowDeliveryModal(false);
        return;
      }

      setDeliveryPartners({
        SHOP: data.shopPartners || [],
        RMA: data.rmaPartners || [],
      });
    } catch (error) {
      console.error('Load delivery partners failed:', error);

      alert('Unable to load delivery partners');
      setShowDeliveryModal(false);
    } finally {
      setLoadingDeliveryPartners(false);
    }
  };

  const assignDeliveryPartner = async () => {
    if (!selectedDeliveryOrder) {
      return;
    }

    if (!selectedDeliveryPersonId) {
      alert('Please select a delivery partner');
      return;
    }

    try {
      setAssigningDelivery(true);

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${selectedDeliveryOrder.orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'OutForDelivery',
            deliveryAssignmentType,
            deliveryPersonId: selectedDeliveryPersonId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to assign delivery partner');
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === selectedDeliveryOrder.orderId
            ? {
                ...order,
                status: data.order.status,
                deliveryAssignmentType: data.order.deliveryAssignmentType,
                deliveryPersonId: data.order.deliveryPersonId,
              }
            : order,
        ),
      );

      setShowDeliveryModal(false);
      setSelectedDeliveryOrder(null);
      setSelectedDeliveryPersonId('');
      setDeliveryPartners({
        SHOP: [],
        RMA: [],
      });

      console.log('Delivery partner assigned:', data.order);
    } catch (error) {
      console.error('Assign delivery partner failed:', error);

      alert('Unable to connect to server');
    } finally {
      setAssigningDelivery(false);
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
          onClick={() => navigate('/owner/dashboard')}
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
                    <div className="owner_order_item" key={item.productId}>
                      <span>
                        {item.productName} × {item.quantity} {item.unit}
                      </span>

                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <strong className="owner_order_total">
                  ₹{order.totalPrice}
                </strong>

                {order.orderType === 'delivery' && (
                  <p className="owner_order_distance">
                    Distance: {Number(order.deliveryDistance).toFixed(4)} KM
                  </p>
                )}
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
                        onClick={() => openDeliveryAssignment(order)}
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
      {showDeliveryModal && (
        <div
          className="delivery_assignment_overlay"
          onClick={() => {
            if (!assigningDelivery) {
              setShowDeliveryModal(false);
            }
          }}
        >
          <section
            className="delivery_assignment_modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delivery_assignment_header">
              <div>
                <h2>Assign Delivery Partner</h2>

                <p>Order #{selectedDeliveryOrder?.orderId}</p>
              </div>

              <button
                type="button"
                className="delivery_assignment_close"
                onClick={() => {
                  if (!assigningDelivery) {
                    setShowDeliveryModal(false);
                  }
                }}
              >
                ×
              </button>
            </div>

            <div className="delivery_assignment_type">
              <h3>Delivery Type</h3>

              <div className="delivery_type_options">
                <button
                  type="button"
                  className={
                    deliveryAssignmentType === 'SHOP'
                      ? 'delivery_type_option active'
                      : 'delivery_type_option'
                  }
                  onClick={() => {
                    setDeliveryAssignmentType('SHOP');
                    setSelectedDeliveryPersonId('');
                  }}
                >
                  <span className="delivery_radio">
                    {deliveryAssignmentType === 'SHOP' ? '●' : '○'}
                  </span>

                  <span>
                    <strong>Shop Delivery Partner</strong>
                    <small>Your shop's delivery partner</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    deliveryAssignmentType === 'RMA'
                      ? 'delivery_type_option active'
                      : 'delivery_type_option'
                  }
                  onClick={() => {
                    setDeliveryAssignmentType('RMA');
                    setSelectedDeliveryPersonId('');
                  }}
                >
                  <span className="delivery_radio">
                    {deliveryAssignmentType === 'RMA' ? '●' : '○'}
                  </span>

                  <span>
                    <strong>RMA Delivery Partner</strong>
                    <small>Nearby RMA delivery partners</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="delivery_partner_list">
              <div className="delivery_partner_list_header">
                <h3>
                  {deliveryAssignmentType === 'RMA'
                    ? 'Nearby RMA Partners'
                    : 'Shop Delivery Partners'}
                </h3>

                {deliveryAssignmentType === 'RMA' && <span>Nearest 5</span>}
              </div>

              {loadingDeliveryPartners ? (
                <div className="delivery_partner_loading">
                  Loading delivery partners...
                </div>
              ) : deliveryPartners[deliveryAssignmentType]?.length === 0 ? (
                <div className="delivery_partner_empty">
                  <strong>
                    {deliveryAssignmentType === 'RMA'
                      ? 'No nearby RMA partners available'
                      : 'No shop delivery partner available'}
                  </strong>

                  <p>
                    {deliveryAssignmentType === 'RMA'
                      ? 'There are currently no approved RMA delivery partners nearby.'
                      : 'Your shop does not have an active delivery partner.'}
                  </p>
                </div>
              ) : (
                deliveryPartners[deliveryAssignmentType].map((partner) => (
                  <button
                    type="button"
                    key={partner.id}
                    className={
                      selectedDeliveryPersonId === partner.id
                        ? 'delivery_partner_card selected'
                        : 'delivery_partner_card'
                    }
                    onClick={() => setSelectedDeliveryPersonId(partner.id)}
                  >
                    <span className="delivery_partner_radio">
                      {selectedDeliveryPersonId === partner.id ? '●' : '○'}
                    </span>

                    <span className="delivery_partner_details">
                      <strong>{partner.name}</strong>

                      <span>{partner.phone}</span>

                      {deliveryAssignmentType === 'RMA' && (
                        <span className="delivery_partner_distance">
                          {partner.distance} km away
                        </span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="delivery_assignment_actions">
              <button
                type="button"
                className="delivery_cancel_button"
                onClick={() => {
                  if (!assigningDelivery) {
                    setShowDeliveryModal(false);
                  }
                }}
                disabled={assigningDelivery}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delivery_assign_button"
                onClick={assignDeliveryPartner}
                disabled={
                  assigningDelivery ||
                  !selectedDeliveryPersonId ||
                  loadingDeliveryPartners
                }
              >
                {assigningDelivery ? 'Assigning...' : 'Assign Delivery'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default OwnerOrders;
