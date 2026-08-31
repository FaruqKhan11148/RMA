import './DeliveryStatus.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function DeliveryStatus() {
  const navigate = useNavigate();

  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // GET ORDER FROM BACKEND
  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load order');
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error('Fetch order failed:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // FETCH ORDER WHEN PAGE LOADS
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // REFRESH ORDER STATUS EVERY 5 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <main className="delivery_status_empty">
        <h1>Loading Order...</h1>

        <p>Please wait while we load your order.</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="delivery_status_empty">
        <h1>Order Not Found</h1>

        <p>{error || 'We could not find this order.'}</p>

        <button onClick={() => navigate('/')}>Back to Home</button>
      </main>
    );
  }

  const statusSteps = [
    {
      status: 'Pending',
      title: 'Order Placed',
      description: 'Your order has been received.',
    },
    {
      status: 'Accepted',
      title: 'Order Accepted',
      description: 'The shop has accepted your order.',
    },
    {
      status: 'Preparing',
      title: 'Preparing',
      description: 'The shop is preparing your order.',
    },
    {
      status: 'Ready',
      title:
        order.orderType === 'delivery'
          ? 'Ready for Delivery'
          : 'Ready for Pickup',
      description:
        order.orderType === 'delivery'
          ? 'Your order is ready and will be delivered soon.'
          : 'Your order is ready for pickup.',
    },
    {
      status: 'Completed',
      title: 'Completed',
      description: 'Your order has been completed.',
    },
  ];

  const statusOrder = [
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'Completed',
  ];

  const currentStatusIndex = statusOrder.indexOf(order.status);

  const getStatusMessage = () => {
    switch (order.status) {
      case 'Pending':
        return 'Your order has been sent to the shop and is waiting for confirmation.';

      case 'Accepted':
        return 'The shop has accepted your order and will start preparing it soon.';

      case 'Preparing':
        return 'The shop is currently preparing your order.';

      case 'Ready':
        return order.orderType === 'delivery'
          ? 'Your order is ready and will be delivered soon.'
          : 'Your order is ready for pickup.';

      case 'Completed':
        return 'Your order has been completed successfully.';

      case 'Rejected':
        return 'Sorry, the shop has rejected this order.';

      default:
        return 'Your order status has been updated.';
    }
  };

  const shopName = order.ownerId?.shopName || 'Shop';

  // REJECTED ORDER
  if (order.status === 'Rejected') {
    return (
      <main className="delivery_status">
        <section className="delivery_status_header">
          <h1>Order Rejected</h1>

          <p>Your order could not be accepted by the shop.</p>
        </section>

        <section className="order_status_card rejected_card">
          <div className="status_icon">×</div>

          <h2>Order Rejected</h2>

          <p>{getStatusMessage()}</p>
        </section>

        <section className="order_details">
          <h2>Order Details</h2>

          <p>
            <strong>Order ID:</strong> {order.orderId}
          </p>

          <p>
            <strong>Shop:</strong> {shopName}
          </p>

          <p>
            <strong>Order Type:</strong>{' '}
            {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.totalPrice}
          </p>
        </section>

        <button className="home_button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </main>
    );
  }

  // NORMAL ORDER
  return (
    <main className="delivery_status">
      <section className="delivery_status_header">
        <h1>
          {order.status === 'Completed' ? 'Order Completed!' : 'Order Status'}
        </h1>

        <p>Track your order from the shop.</p>
      </section>

      <section className="order_status_card">
        <div className="status_icon">✓</div>

        <h2>{order.status}</h2>

        <p>{getStatusMessage()}</p>

        <div className="status_steps">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStatusIndex;

            return (
              <div
                className={`status_step ${isActive ? 'active' : ''}`}
                key={step.status}
              >
                <span>{isActive ? '✓' : index + 1}</span>

                <div>
                  <strong>{step.title}</strong>

                  <p>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="order_details">
        <h2>Order Details</h2>

        <p>
          <strong>Order ID:</strong> {order.orderId}
        </p>

        <p>
          <strong>Shop:</strong> {shopName}
        </p>

        <p>
          <strong>Order Type:</strong>{' '}
          {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
        </p>

        <p>
          <strong>Total:</strong> ₹{order.totalPrice}
        </p>
      </section>

      <button className="home_button" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </main>
  );
}

export default DeliveryStatus;
