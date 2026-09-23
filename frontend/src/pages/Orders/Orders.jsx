import './Orders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOrder } from '../../context/OrderContext';

function Orders() {
  const navigate = useNavigate();

  const { getGuestOrders } = useOrder();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      console.log('========== ORDERS PAGE START ==========');

      try {
        setLoading(true);

        console.log('[Orders] Checking customer login...');

        const meResponse = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        console.log('[Orders] /customers/me status:', meResponse.status);
        console.log('[Orders] /customers/me ok:', meResponse.ok);

        if (meResponse.ok) {
          console.log('[Orders] Customer is logged in');
          console.log('[Orders] Calling /api/customers/orders');

          const ordersResponse = await fetch(
            'https://rma-backend-bo4a.onrender.com/api/customers/orders',
            {
              credentials: 'include',
            },
          );

          console.log(
            '[Orders] /api/customers/orders status:',
            ordersResponse.status,
          );

          const data = await ordersResponse.json();

          console.log('[Orders] Customer orders response:', data);

          if (!ordersResponse.ok) {
            throw new Error(data.message || 'Failed to load customer orders');
          }

          console.log('[Orders] Setting customer orders:', data.orders?.length);

          setOrders(data.orders || []);
        } else {
          console.log('[Orders] Customer is NOT logged in');
          console.log('[Orders] Calling getGuestOrders()');

          const guestOrders = await getGuestOrders();

          console.log('[Orders] Guest orders received:', guestOrders);
          console.log('[Orders] Guest order count:', guestOrders?.length);

          setOrders(guestOrders);
        }
      } catch (error) {
        console.error('[Orders] LOAD FAILED:', error);

        setOrders([]);
      } finally {
        console.log('========== ORDERS PAGE END ==========');

        setLoading(false);
      }
    };

    loadOrders();
  }, [getGuestOrders]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderSheet(true);
  };

  const closeOrderSheet = () => {
    setShowOrderSheet(false);
  };

  const handleViewOrder = () => {
    if (!selectedOrder) {
      return;
    }

    setShowOrderSheet(false);

    navigate(`/delivery-status/${selectedOrder.orderId}`);
  };

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
    <>
      <main className="orders">
        <div className="orders_header">
          <h1>My Orders</h1>

          <p>Track and manage your recent orders.</p>
        </div>

        <div className="orders_list">
          {orders.map((order) => (
            <article
              className="order_card"
              key={order.orderId}
              role="button"
              tabIndex={0}
              onClick={() => handleOrderClick(order)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleOrderClick(order);
                }
              }}
            >
              <div className="order_card_top">
                <strong>{order.orderId}</strong>

                <span className="order_status">{order.status}</span>
              </div>

              <div className="order_card_middle">
                <strong>
                  {order.ownerId?.shopName ||
                    order.ownerId?.ownerName ||
                    'Shop'}
                </strong>

                <span className="order_card_arrow">›</span>
              </div>

              <div className="order_card_bottom">
                <span>
                  {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                </span>

                <span className="order_card_separator">•</span>

                <span>Delivery</span>

                <strong>
                  ₹
                  {Number(
                    order.customerPayableAmount ?? order.totalPrice ?? 0,
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="order_card_hint">Tap to view order details</div>
            </article>
          ))}
        </div>
      </main>

      {showOrderSheet && selectedOrder && (
        <div className="order_sheet_overlay" onClick={closeOrderSheet}>
          <section
            className="order_sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order_sheet_title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order_sheet_handle" />

            <div className="order_sheet_header">
              <div>
                <span>Order Details</span>

                <h2 id="order_sheet_title">{selectedOrder.orderId}</h2>
              </div>

              <button
                type="button"
                className="order_sheet_close"
                onClick={closeOrderSheet}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="order_sheet_status">
              <span>Status : </span>

              <strong>{selectedOrder.status}</strong>
            </div>

            <div className="order_sheet_details">
              <div className="order_sheet_detail">
                <span>Shop</span>

                <strong>
                  {selectedOrder.ownerId?.shopName ||
                    selectedOrder.ownerId?.ownerName ||
                    'Shop'}
                </strong>
              </div>

              <div className="order_sheet_detail">
                <span>Items</span>

                <strong>
                  {selectedOrder.totalItems}{' '}
                  {selectedOrder.totalItems === 1 ? 'item' : 'items'}
                </strong>
              </div>

              <div className="order_sheet_detail">
                <span>Order Type</span>

                <strong>Delivery</strong>
              </div>

              <div className="order_sheet_detail">
                <span>Payment</span>

                <strong>Online Payment</strong>
              </div>

              <div className="order_sheet_detail order_sheet_total">
                <span>Total</span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.customerPayableAmount ??
                      selectedOrder.totalPrice ??
                      0,
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
            <button
              type="button"
              className="order_sheet_button"
              onClick={handleViewOrder}
            >
              View Order Status
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default Orders;
