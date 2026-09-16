import './DeliveryStatus.css';

import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';

function DeliveryStatus() {
  const navigate = useNavigate();

  const { orderId } = useParams();

  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // GET ORDER FROM BACKEND
  // ==========================================

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${orderId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load order');
        return;
      }

      setOrder(data.order);

      // Cart is cleared only after the order-status
      // page successfully loads.
      clearCart();
    } catch (error) {
      console.error('Fetch order failed:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, [orderId, clearCart]);

  // ==========================================
  // FETCH ORDER WHEN PAGE LOADS
  // ==========================================

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ==========================================
  // REFRESH ORDER STATUS EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="delivery_status_empty">
        <h1>Loading Order...</h1>

        <p>Please wait while we load your order.</p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !order) {
    return (
      <main className="delivery_status_empty">
        <h1>Order Not Found</h1>

        <p>{error || 'We could not find this order.'}</p>

        <button type="button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </main>
    );
  }

  // ==========================================
  // STATUS STEPS
  // ==========================================

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
      title: 'Ready for Delivery',
      description: 'Your order is ready and will be delivered soon.',
    },
    {
      status: 'OutForDelivery',
      title: 'Out for Delivery',
      description: 'Your order is on the way to you.',
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
    'OutForDelivery',
    'Completed',
  ];

  const currentStatusIndex = statusOrder.indexOf(order.status);

  // ==========================================
  // STATUS MESSAGE
  // ==========================================

  const getStatusMessage = () => {
    switch (order.status) {
      case 'Pending':
        return 'Your order has been sent to the shop and is waiting for confirmation.';

      case 'Accepted':
        return 'The shop has accepted your order and will start preparing it soon.';

      case 'Preparing':
        return 'The shop is currently preparing your order.';

      case 'Ready':
        return 'Your order is ready and will be delivered soon.';

      case 'OutForDelivery':
        return 'Your order is on the way. Please provide the delivery OTP when your order arrives.';

      case 'Completed':
        return 'Your order has been completed successfully.';

      case 'Rejected':
        return 'Sorry, the shop has rejected this order.';

      default:
        return 'Your order status has been updated.';
    }
  };

  const shopName = order.ownerId?.shopName || 'Shop';

  // ==========================================
  // REJECTED ORDER
  // ==========================================

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

        {/* REFUND PROCESSING */}

        {order.refundStatus === 'Processing' && (
          <section className="order_status_card refund_card">
            <div className="status_icon">₹</div>

            <h2>Refund Initiated</h2>

            <p>Your payment has been sent for a full refund.</p>

            <p>
              <strong>Refund Amount:</strong> ₹
              {Number(order.refundAmount).toFixed(2)}
            </p>

            {order.refundId && (
              <p>
                <strong>Refund ID:</strong> {order.refundId}
              </p>
            )}

            <p>
              The refund is being processed by the payment provider and will be
              credited to your original payment method.
            </p>
          </section>
        )}

        {/* REFUND COMPLETED */}

        {order.refundStatus === 'Completed' && (
          <section className="order_status_card refund_card">
            <div className="status_icon">✓</div>

            <h2>Refund Completed</h2>

            <p>
              Your full payment has been refunded to your original payment
              method.
            </p>

            <p>
              <strong>Refund Amount:</strong> ₹
              {Number(order.refundAmount).toFixed(2)}
            </p>

            {order.refundId && (
              <p>
                <strong>Refund ID:</strong> {order.refundId}
              </p>
            )}
          </section>
        )}

        {/* REFUND FAILED */}

        {order.refundStatus === 'Failed' && (
          <section className="order_status_card refund_card">
            <div className="status_icon">!</div>

            <h2>Refund Processing</h2>

            <p>
              Your order was rejected, but we could not complete the refund
              request yet.
            </p>

            <p>Please contact RMA support for assistance.</p>
          </section>
        )}

        {/* ORDER DETAILS */}

        <section className="order_details">
          <h2>Order Details</h2>

          <p>
            <strong>Order ID:</strong>

            <span>{order.orderId}</span>
          </p>

          <p>
            <strong>Shop:</strong>

            <span>{shopName}</span>
          </p>

          <p>
            <strong>Order Type:</strong>

            <span>Delivery</span>
          </p>

          <p>
            <strong>Payment:</strong>

            <span>Online Payment</span>
          </p>

          <p>
            <strong>Total:</strong>

            <span>₹{Number(order.totalPrice).toFixed(2)}</span>
          </p>
        </section>

        <button
          type="button"
          className="home_button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </main>
    );
  }

  // ==========================================
  // NORMAL ORDER
  // ==========================================

  return (
    <main className="delivery_status">
      <section className="delivery_status_header">
        <h1>
          {order.status === 'Completed' ? 'Order Completed!' : 'Order Status'}
        </h1>

        <p>Track your order from the shop.</p>
      </section>

      {/* STATUS CARD */}

      <section className="order_status_card">
        <div className="status_icon">✓</div>

        <h2>{order.status}</h2>

        <p>{getStatusMessage()}</p>

        <div className="status_steps">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div
                className={`status_step ${
                  isCompleted ? 'completed' : ''
                } ${isCurrent ? 'current' : ''}`}
                key={step.status}
              >
                <span className="status_step_icon">
                  {isCurrent && step.status === 'OutForDelivery' ? (
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle
                        cx="18"
                        cy="46"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <circle
                        cx="47"
                        cy="46"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        d="M25 46H40L35 30H25L18 46"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M35 30H43L50 38V46H40"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M31 24L35 30"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M43 38H50"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : isCompleted ? (
                    '✓'
                  ) : isCurrent ? (
                    '✓'
                  ) : (
                    index + 1
                  )}
                </span>

                <div>
                  <strong>{step.title}</strong>

                  <p>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DELIVERY OTP */}

      {order.status === 'OutForDelivery' && order.deliveryOtp && (
        <section className="delivery_otp_card">
          <h2>Delivery OTP</h2>

          <p>Give this OTP to the delivery person when your order arrives.</p>

          <div className="delivery_otp">{order.deliveryOtp}</div>
        </section>
      )}

      {/* ORDER DETAILS */}

      <section className="order_details">
        <h2>Order Details</h2>

        <p>
          <strong>Order ID:</strong>

          <span>{order.orderId}</span>
        </p>

        <p>
          <strong>Shop:</strong>

          <span>{shopName}</span>
        </p>

        <p>
          <strong>Order Type:</strong>

          <span>Delivery</span>
        </p>

        <p>
          <strong>Payment:</strong>

          <span>Online Payment</span>
        </p>

        <p>
          <strong>Total:</strong>

          <span>₹{Number(order.totalPrice).toFixed(2)}</span>
        </p>
      </section>

      <button
        type="button"
        className="home_button"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </main>
  );
}

export default DeliveryStatus;
