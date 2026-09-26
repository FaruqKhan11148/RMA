import './AdminOrderDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import OrderDetailsHeader from './components/OrderDetails/OrderDetailsHeader';
import OrderDetailsShop from './components/OrderDetails/OrderDetailsShop';
import OrderDetailsCustomer from './components/OrderDetails/OrderDetailsCustomer';
import OrderDetailsItems from './components/OrderDetails/OrderDetailsItems';
import OrderDetailsPayment from './components/OrderDetails/OrderDetailsPayment';
import OrderDetailsFinance from './components/OrderDetails/OrderDetailsFinance';
import OrderDetailsDelivery from './components/OrderDetails/OrderDetailsDelivery';
import OrderDetailsTimeline from './components/OrderDetails/OrderDetailsTimeline';
import OrderDetailsSystem from './components/OrderDetails/OrderDetailsSystem';

import {
  fetchAdminOrders,
  findOrderById,
} from './utils/OrderDetails/orderDetailsApi';

import {
  formatDateTime,
  formatTime,
  getStatusClass,
  getTimelineSteps,
} from './utils/OrderDetails/orderDetailsHelpers';

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const orders = await fetchAdminOrders();

        const foundOrder = findOrderById(orders, orderId);

        if (!foundOrder) {
          throw new Error('Order not found');
        }

        setOrder(foundOrder);
      } catch (error) {
        console.error('Admin order details fetch error:', error);

        setError(error.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const timelineSteps = getTimelineSteps(order);

  if (loading) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-state">
          Loading order details...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-error">
          <h2>Unable to load order</h2>

          <p>{error || 'Order not found.'}</p>

          <button type="button" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-order-details-page">
      <OrderDetailsHeader
        order={order}
        formatDateTime={formatDateTime}
        getStatusClass={getStatusClass}
        onBack={() => navigate(-1)}
      />

      <OrderDetailsShop order={order} />

      <OrderDetailsCustomer order={order} />

      <OrderDetailsItems order={order} />

      <OrderDetailsPayment order={order} formatDateTime={formatDateTime} />

      <OrderDetailsFinance order={order} />

      <OrderDetailsDelivery order={order} formatDateTime={formatDateTime} />

      <OrderDetailsTimeline
        timelineSteps={timelineSteps}
        formatDateTime={formatDateTime}
        formatTime={formatTime}
      />

      <OrderDetailsSystem order={order} formatDateTime={formatDateTime} />
    </main>
  );
}

export default AdminOrderDetails;
