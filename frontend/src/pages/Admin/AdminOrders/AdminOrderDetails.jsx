import './AdminOrderDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/orders',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order');
        }

        const foundOrder = (data.orders || []).find(
          (item) => item.orderId === orderId,
        );

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

    fetchOrder();
  }, [orderId]);

  const formatDateTime = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    return (status || '').toLowerCase();
  };

  const timelineSteps =
    order?.status === 'Rejected'
      ? [
          {
            title: 'Order Placed',
            timestamp: order?.createdAt,
            completed: true,
          },
          {
            title: 'Rejected',
            timestamp: order?.rejectedAt,
            completed: true,
          },
        ]
      : [
          {
            title: 'Order Placed',
            timestamp: order?.createdAt,
            completed: true,
          },
          {
            title: 'Accepted',
            timestamp: order?.acceptedAt,
            completed: Boolean(order?.acceptedAt),
          },
          {
            title: 'Preparing',
            timestamp: order?.preparingAt,
            completed: Boolean(order?.preparingAt),
          },
          {
            title: 'Ready',
            timestamp: order?.readyAt,
            completed: Boolean(order?.readyAt),
          },
          {
            title: 'Out for Delivery',
            timestamp: order?.outForDeliveryAt,
            completed: Boolean(order?.outForDeliveryAt),
          },
          {
            title: 'Completed',
            timestamp: order?.completedAt,
            completed: Boolean(order?.completedAt),
          },
        ];

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
      {/* HEADER */}

      <header className="admin-order-details-header">
        <div>
          <button
            type="button"
            className="admin-order-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="admin-order-title-row">
            <div>
              <h1>{order.orderId}</h1>

              <p>Order placed {formatDateTime(order.createdAt)}</p>
            </div>

            <span
              className={`admin-order-main-status ${getStatusClass(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>
      </header>

      {/* SHOP */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Shop & Owner</h2>
            <p>Shop associated with this order.</p>
          </div>
        </div>

        <div className="admin-order-info-grid">
          <div>
            <span>Shop ID</span>
            <strong>{order.ownerId?.shopId || '—'}</strong>
          </div>

          <div>
            <span>Shop Name</span>
            <strong>{order.ownerId?.shopName || '—'}</strong>
          </div>

          <div>
            <span>Owner Name</span>
            <strong>{order.ownerId?.ownerName || '—'}</strong>
          </div>

          <div>
            <span>Owner Phone</span>
            <strong>{order.ownerId?.phone || '—'}</strong>
          </div>
        </div>
      </section>

      {/* CUSTOMER */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Customer</h2>
            <p>Customer information for this order.</p>
          </div>
        </div>

        <div className="admin-order-info-grid">
          <div>
            <span>Name</span>
            <strong>{order.customer?.name || '—'}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{order.customer?.phone || '—'}</strong>
          </div>

          <div className="admin-order-info-wide">
            <span>Address</span>
            <strong>{order.customer?.address || '—'}</strong>
          </div>
        </div>
      </section>

      {/* ITEMS */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Order Items</h2>
            <p>
              {order.totalItems} total item
              {order.totalItems === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="admin-order-items">
          {order.items?.map((item) => (
            <div
              className="admin-order-item"
              key={`${item.productId}-${item.productName}`}
            >
              <div>
                <strong>{item.productName}</strong>

                <span>
                  {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
                </span>
              </div>

              <strong>
                ₹
                {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                  2,
                )}
              </strong>
            </div>
          ))}
        </div>

        <div className="admin-order-total-row">
          <span>Product Total</span>

          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>
      </section>

      {/* PAYMENT */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Payment</h2>
            <p>Payment and transaction information.</p>
          </div>
        </div>

        <div className="admin-order-info-grid">
          <div>
            <span>Payment Status</span>

            <strong
              className={`admin-payment-badge ${(
                order.paymentStatus || ''
              ).toLowerCase()}`}
            >
              {order.paymentStatus || '—'}
            </strong>
          </div>

          <div>
            <span>Payment Method</span>
            <strong>{order.paymentMethod || '—'}</strong>
          </div>

          {order.paymentMethod === 'ONLINE' && (
            <>
              <div>
                <span>Online Method</span>
                <strong>{order.onlinePaymentMethod || '—'}</strong>
              </div>

              <div>
                <span>Payment ID</span>
                <strong>{order.paymentId || '—'}</strong>
              </div>

              <div>
                <span>Payment Order ID</span>
                <strong>{order.paymentOrderId || '—'}</strong>
              </div>

              <div>
                <span>Paid At</span>
                <strong>{formatDateTime(order.paidAt)}</strong>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FINANCE */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Finance</h2>
            <p>RMA platform fee and owner settlement.</p>
          </div>
        </div>

        <div className="admin-finance-grid">
          <div>
            <span>Order Value</span>
            <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>RMA Fee (1%)</span>
            <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Owner Amount</span>
            <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {/* DELIVERY */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Delivery</h2>
            <p>Delivery information for this order.</p>
          </div>

          <span className="admin-order-type-badge">
            {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
        </div>

        {order.orderType === 'delivery' ? (
          <>
            <div className="admin-order-info-grid">
              <div className="admin-order-info-wide">
                <span>Delivery Address</span>
                <strong>
                  {order.deliveryLocation?.address ||
                    order.customer?.address ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>Latitude</span>
                <strong>{order.deliveryLocation?.latitude ?? '—'}</strong>
              </div>

              <div>
                <span>Longitude</span>
                <strong>{order.deliveryLocation?.longitude ?? '—'}</strong>
              </div>

              <div>
                <span>OTP Generated</span>
                <strong>{formatDateTime(order.deliveryOtpGeneratedAt)}</strong>
              </div>

              <div>
                <span>OTP Verification</span>

                <strong
                  className={
                    order.otpVerified
                      ? 'admin-otp-verified'
                      : 'admin-otp-pending'
                  }
                >
                  {order.otpVerified ? 'Verified' : 'Not Verified'}
                </strong>
              </div>
            </div>
          </>
        ) : (
          <div className="admin-pickup-message">
            This order is for customer pickup.
          </div>
        )}
      </section>

      {/* TIMELINE */}

      <section className="admin-order-card">
        <div className="admin-order-card-header">
          <div>
            <h2>Order Timeline</h2>
            <p>Complete order status history.</p>
          </div>
        </div>

        <div className="admin-order-timeline">
          {timelineSteps.map((step, index) => (
            <div
              className={`admin-timeline-step ${
                step.completed ? 'completed' : ''
              }`}
              key={step.title}
            >
              <div className="admin-timeline-marker">
                {step.completed ? '✓' : ''}
              </div>

              <div className="admin-timeline-content">
                <strong>{step.title}</strong>

                <span>
                  {step.timestamp
                    ? `${formatDateTime(
                        step.timestamp,
                      )} (${formatTime(step.timestamp)})`
                    : 'Not reached yet'}
                </span>
              </div>

              {index < timelineSteps.length - 1 && (
                <div className="admin-timeline-line" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM TIMESTAMPS */}

      <section className="admin-order-card admin-system-card">
        <div className="admin-order-card-header">
          <div>
            <h2>System Information</h2>
            <p>Database timestamps for this order.</p>
          </div>
        </div>

        <div className="admin-order-info-grid">
          <div>
            <span>Created At</span>
            <strong>{formatDateTime(order.createdAt)}</strong>
          </div>

          <div>
            <span>Last Updated</span>
            <strong>{formatDateTime(order.updatedAt)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrderDetails;
