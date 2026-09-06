import './Orders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOrder } from '../../context/OrderContext';

function Orders() {
  const navigate = useNavigate();

  const { orders: guestOrders } = useOrder();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        // Check whether customer is logged in
        const meResponse = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        // ==========================================
        // LOGGED-IN CUSTOMER
        // ==========================================

        if (meResponse.ok) {
          setLoggedIn(true);

          const ordersResponse = await fetch(
            'https://rma-backend-bo4a.onrender.com/api/customers/orders',
            {
              credentials: 'include',
            },
          );

          const data = await ordersResponse.json();

          if (!ordersResponse.ok) {
            throw new Error(data.message || 'Failed to load orders');
          }

          setOrders(data.orders || []);
        }

        // ==========================================
        // GUEST CUSTOMER
        // ==========================================
        else {
          setLoggedIn(false);
          setOrders(guestOrders || []);
        }
      } catch (error) {
        console.error('Load customer orders failed:', error);

        // If API fails, still show guest orders
        setLoggedIn(false);
        setOrders(guestOrders || []);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [guestOrders]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="orders_empty">
        <h1>Loading Orders...</h1>
        <p>Please wait while we load your orders.</p>
      </main>
    );
  }

  // ==========================================
  // NO ORDERS
  // ==========================================

  if (orders.length === 0) {
    return (
      <main className="orders_empty">
        <h1>No Orders Yet</h1>

        <p>
          {loggedIn
            ? 'Your orders will appear here.'
            : 'You can place an order without creating an account.'}
        </p>

        <button onClick={() => navigate('/')}>Start Shopping</button>
      </main>
    );
  }

  // ==========================================
  // ORDERS
  // ==========================================

  return (
    <main className="orders">
      <section className="orders_header">
        <h1>My Orders</h1>

        <p>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </section>

      <section className="orders_list">
        {orders.map((order) => (
          <div className="order_card" key={order.orderId}>
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
                {order.ownerId?.shopName || order.shopName || 'Shop'}
              </strong>
            </div>

            <div className="order_info">
              <span>
                {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
              </span>

              <span>
                {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>

              <strong>₹{order.totalPrice}</strong>
            </div>

            <button
              className="track_order_button"
              onClick={() => navigate(`/delivery-status/${order.orderId}`)}
            >
              View Order
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Orders;
