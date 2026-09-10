import './Orders.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

function Orders() {
  const navigate = useNavigate();
  const { getGuestOrders } = useOrder();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const meResponse = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (meResponse.ok) {
          const ordersResponse = await fetch(
            'https://rma-backend-bo4a.onrender.com/api/customers/orders',
            {
              credentials: 'include',
            },
          );

          const data = await ordersResponse.json();

          if (!ordersResponse.ok) {
            throw new Error(data.message || 'Failed to load customer orders');
          }

          setOrders(data.orders || []);
        } else {
          const guestOrders = await getGuestOrders();

          setOrders(guestOrders);
        }
      } catch (error) {
        console.error('Load orders failed:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [getGuestOrders]);

  if (loading) {
    return (
      <div className="orders_empty">
        <h1>Orders</h1>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders_empty">
        <h1>No Orders Yet</h1>
        <p>Your orders will appear here once you place an order from a shop.</p>

        <button type="button" onClick={() => navigate('/')}>
          Start Ordering
        </button>
      </div>
    );
  }

  return (
    <main className="orders">
      <div className="orders_header">
        <h1>My Orders</h1>
        <p>Track and manage your recent orders.</p>
      </div>

      <div className="orders_list">
        {orders.map((order) => (
          <article className="order_card" key={order.orderId}>
            <div className="order_card_header">
              <div>
                <span>Order ID</span>
                <strong>{order.orderId}</strong>
              </div>

              <span className="order_status">{order.status}</span>
            </div>

            <div className="order_shop">
              <span>Shop</span>
              <strong>
                {order.ownerId?.shopName || order.ownerId?.ownerName || 'Shop'}
              </strong>
            </div>

            <div className="order_info">
              <span>
                {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
              </span>

              <span>
                {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>

              <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="track_order_button"
              onClick={() => navigate(`/delivery-status/${order.orderId}`)}
            >
              View Order
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Orders;
