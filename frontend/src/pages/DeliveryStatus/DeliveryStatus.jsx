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
  const [notFound, setNotFound] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);

  const [rmaRating, setRmaRating] = useState(0);
  const [shopRating, setShopRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);

  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [actionReason, setActionReason] = useState('');
  const [actionDescription, setActionDescription] = useState('');

  const [processingOrderAction, setProcessingOrderAction] = useState(false);
  const [orderActionError, setOrderActionError] = useState('');

  // ==========================================
  // GET ORDER FROM BACKEND
  // ==========================================

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${orderId}`,
      );

      const data = await response.json();

      // ==========================================
      // ORDER REALLY DOES NOT EXIST
      // ==========================================

      if (response.status === 404) {
        setNotFound(true);
        setError('');
        setOrder(null);
        return;
      }

      // ==========================================
      // TEMPORARY SERVER / NETWORK ERROR
      // ==========================================

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load order');
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      setOrder(data.order);
      setError('');
      setNotFound(false);

      clearCart();
    } catch (error) {
      console.error('Fetch order failed:', error);

      // Do NOT remove an already loaded order.
      // The next polling request will try again.
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

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!actionReason.trim()) {
      setOrderActionError('Please select a cancellation reason.');
      return;
    }

    try {
      setProcessingOrderAction(true);
      setOrderActionError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${order.orderId}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: actionReason.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setOrderActionError(data.message || 'Unable to cancel order');
        return;
      }

      setShowCancelModal(false);
      setActionReason('');
      setActionDescription('');

      setOrder(data.order);
    } catch (error) {
      console.error('Cancel order failed:', error);

      setOrderActionError('Unable to connect to server. Please try again.');
    } finally {
      setProcessingOrderAction(false);
    }
  };

  const handleRejectDelivery = async () => {
    if (!order) return;

    if (!actionReason.trim()) {
      setOrderActionError('Please select a rejection reason.');
      return;
    }

    try {
      setProcessingOrderAction(true);
      setOrderActionError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${order.orderId}/reject-delivery`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: actionReason.trim(),
            description: actionDescription.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setOrderActionError(data.message || 'Unable to reject delivery');
        return;
      }

      setShowRejectModal(false);
      setActionReason('');
      setActionDescription('');

      setOrder(data.order);
    } catch (error) {
      console.error('Reject delivery failed:', error);

      setOrderActionError('Unable to connect to server. Please try again.');
    } finally {
      setProcessingOrderAction(false);
    }
  };

  // ==========================================
  // REFRESH ORDER STATUS EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (rmaRating === 0 || shopRating === 0 || deliveryRating === 0) {
      setReviewError('Please rate all three categories before submitting.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/reviews',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.orderId,
            rmaRating,
            shopRating,
            deliveryRating,
            feedback,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setReviewError(data.message || 'Unable to submit review');
        return;
      }

      setReviewSubmitted(true);
    } catch (error) {
      console.error('Submit review failed:', error);

      setReviewError('Unable to connect to server');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, setRating) => {
    return (
      <div className="rating_stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`rating_star ${star <= rating ? 'active' : ''}`}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

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

  if (!order && error) {
    return (
      <main className="delivery_status_empty">
        <h1>Connecting to your order...</h1>

        <p>
          We're reconnecting to the server. Your order is safe and we'll
          automatically try again.
        </p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (notFound) {
    return (
      <main className="delivery_status_empty">
        <h1>Order Not Found</h1>

        <p>We could not find this order.</p>

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
      description:
        'Your order is on the way. Please check your items carefully when they arrive before sharing the OTP.',
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

  const isCustomerCancellation =
    order.cancelledBy === 'CUSTOMER' && order.refundType === 'FULL';

  const isDeliveryRejection =
    order.refundType === 'DELIVERY_REJECTION' ||
    Boolean(order.customerRejectedAt);

  const isShopRejection = !isCustomerCancellation && !isDeliveryRejection;

  const refundAmount = Number(order.refundAmount || 0);
  const totalPaid = Number(
    order.customerPayableAmount || order.totalPrice || 0,
  );

  const deliveryCharge = Number(order.deliveryCharge || 0);
  const nonRefundedDeliveryCharge = Number(
    Math.max(0, totalPaid - refundAmount).toFixed(2),
  );

  if (order.status === 'Rejected') {
    return (
      <main className="delivery_status">
        <section className="delivery_status_header">
          <h1>
            {isCustomerCancellation
              ? 'Order Cancelled'
              : isDeliveryRejection
                ? 'Delivery Rejected'
                : 'Order Rejected'}
          </h1>

          <p>
            {isCustomerCancellation
              ? 'You cancelled this order.'
              : isDeliveryRejection
                ? 'You reported an issue with the delivery and rejected the order.'
                : 'The shop has rejected this order.'}
          </p>
        </section>

        <section className="order_status_card rejected_card">
          <div className="status_icon">×</div>

          <h2>
            {isCustomerCancellation
              ? 'Order Cancelled'
              : isDeliveryRejection
                ? 'Delivery Rejected'
                : 'Order Rejected'}
          </h2>

          <p>
            {isCustomerCancellation
              ? 'You cancelled this order before preparation started.'
              : isDeliveryRejection
                ? 'You rejected the delivery because of an issue with the order.'
                : 'Sorry, the shop has rejected this order.'}
          </p>
        </section>

        {/* REFUND PROCESSING */}

        {order.refundStatus === 'Processing' && (
          <section className="order_status_card refund_card">
            <div className="status_icon">₹</div>

            <h2>Refund Initiated</h2>

            <p>
              {order.refundType === 'DELIVERY_REJECTION'
                ? 'Your eligible refund has been sent to the payment provider.'
                : 'Your full payment has been sent to the payment provider for refund.'}
            </p>

            <p>
              <strong>Refund Amount:</strong> ₹
              {Number(order.refundAmount).toFixed(2)}
            </p>

            {order.refundType === 'DELIVERY_REJECTION' &&
              nonRefundedDeliveryCharge > 0 && (
                <p>
                  <strong>Delivery Charge Not Refunded:</strong> ₹
                  {nonRefundedDeliveryCharge.toFixed(2)}
                </p>
              )}

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
              {order.refundType === 'DELIVERY_REJECTION'
                ? 'Your eligible refund has been credited to your original payment method.'
                : 'Your full payment has been refunded to your original payment method.'}
            </p>

            <p>
              <strong>Refund Amount:</strong> ₹
              {Number(order.refundAmount).toFixed(2)}
            </p>

            {order.refundType === 'DELIVERY_REJECTION' &&
              nonRefundedDeliveryCharge > 0 && (
                <p>
                  <strong>Delivery Charge Not Refunded:</strong> ₹
                  {nonRefundedDeliveryCharge.toFixed(2)}
                </p>
              )}

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
            <strong>Total Paid:</strong>

            <span>
              ₹
              {Number(order.customerPayableAmount || order.totalPrice).toFixed(
                2,
              )}
            </span>
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
      {error && order && (
        <div className="delivery_status_connection">Reconnecting...</div>
      )}
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

      {order.status === 'Completed' && (
        <section className="rate_order_card">
          <h2>How was your experience?</h2>

          <p>
            Your order has been delivered successfully. We'd love to hear your
            feedback.
          </p>

          {!reviewSubmitted ? (
            <button
              type="button"
              className="rate_order_button"
              onClick={() => {
                setReviewError('');
                setShowRatingModal(true);
              }}
            >
              Rate Your Experience
            </button>
          ) : (
            <p className="review_submitted_message">
              Thank you for sharing your experience with RMA.
            </p>
          )}
        </section>
      )}

      {/* DELIVERY OTP */}

      {order.status === 'OutForDelivery' && order.deliveryOtp && (
        <section className="delivery_otp_card">
          <h2>Delivery OTP</h2>

          {order.status === 'OutForDelivery' && !order.otpVerified && (
            <div className="delivery_status_otp_warning">
              <strong>Before sharing the OTP:</strong>
              <span>
                Please check the items, quantity, and quality of your order.
                Once you share the OTP, the order will be marked as delivered
                and delivery rejection will no longer be available.
              </span>
            </div>
          )}

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
          <strong>Total Paid:</strong>

          <span>
            ₹
            {Number(order.customerPayableAmount || order.totalPrice).toFixed(2)}
          </span>
        </p>
      </section>

      {(order.status === 'Pending' || order.status === 'Accepted') && (
        <button
          type="button"
          className="delivery_status_cancel_button"
          onClick={() => {
            setActionReason('');
            setActionDescription('');
            setOrderActionError('');
            setShowCancelModal(true);
          }}
        >
          Cancel Order
        </button>
      )}

      {order.status === 'OutForDelivery' && !order.otpVerified && (
        <button
          type="button"
          className="delivery_status_reject_button"
          onClick={() => {
            setActionReason('');
            setActionDescription('');
            setOrderActionError('');
            setShowRejectModal(true);
          }}
        >
          Report an Issue / Reject Delivery
        </button>
      )}

      <button
        type="button"
        className="home_button"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>

      {showRatingModal && (
        <div className="rating_modal_overlay">
          <section className="rating_modal">
            <button
              type="button"
              className="rating_modal_close"
              onClick={() => setShowRatingModal(false)}
              aria-label="Close rating"
            >
              ×
            </button>

            {!reviewSubmitted ? (
              <>
                <div className="rating_modal_header">
                  <h2>Rate Your Experience</h2>

                  <p>Tell us how your RMA order went.</p>
                </div>

                {reviewError && (
                  <div className="rating_modal_error">{reviewError}</div>
                )}

                <form onSubmit={handleSubmitReview}>
                  <div className="rating_section">
                    <h3>RMA Experience</h3>

                    <p>How was your overall experience with RMA?</p>

                    {renderStars(rmaRating, setRmaRating)}
                  </div>

                  <div className="rating_section">
                    <h3>Shop Experience</h3>

                    <p>How was your experience with {shopName}?</p>

                    {renderStars(shopRating, setShopRating)}
                  </div>

                  <div className="rating_section">
                    <h3>Delivery Experience</h3>

                    <p>How was your delivery experience?</p>

                    {renderStars(deliveryRating, setDeliveryRating)}
                  </div>

                  <div className="feedback_section">
                    <label htmlFor="delivery-rating-feedback">
                      Feedback <span>(Optional)</span>
                    </label>

                    <textarea
                      id="delivery-rating-feedback"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      placeholder="Tell us about your experience..."
                      maxLength={1000}
                      rows={4}
                    />

                    <small>{feedback.length}/1000</small>
                  </div>

                  <button
                    type="submit"
                    className="submit_review_button"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </>
            ) : (
              <div className="review_success">
                <div className="review_success_icon">✓</div>

                <h2>Thank You!</h2>

                <p>Your review has been submitted successfully.</p>

                <button
                  type="button"
                  className="submit_review_button"
                  onClick={() => setShowRatingModal(false)}
                >
                  Done
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {showRejectModal && (
        <div className="delivery_status_modal_overlay">
          <div className="delivery_status_modal">
            <div className="delivery_status_modal_header">
              <h3>Report an Issue</h3>

              <button
                type="button"
                className="delivery_status_modal_close"
                onClick={() => {
                  if (processingOrderAction) return;

                  setShowRejectModal(false);
                  setActionReason('');
                  setActionDescription('');
                  setOrderActionError('');
                }}
              >
                ×
              </button>
            </div>

            <p className="delivery_status_modal_text">
              Please check your order before sharing the OTP. If there is a
              genuine issue, you can reject the delivery now.
            </p>

            <label
              htmlFor="reject_reason"
              className="delivery_status_modal_label"
            >
              Reason
            </label>

            <select
              id="reject_reason"
              className="delivery_status_modal_select"
              value={actionReason}
              onChange={(event) => {
                setActionReason(event.target.value);
                setOrderActionError('');
              }}
              disabled={processingOrderAction}
            >
              <option value="">Select a reason</option>

              <option value="Wrong product">Wrong product</option>

              <option value="Missing item">Missing item</option>

              <option value="Less quantity">Less quantity</option>

              <option value="Poor quality">Poor quality</option>

              <option value="Damaged product">Damaged product</option>

              <option value="Other">Other</option>
            </select>

            <label
              htmlFor="reject_description"
              className="delivery_status_modal_label"
            >
              Additional details
            </label>

            <textarea
              id="reject_description"
              className="delivery_status_modal_textarea"
              value={actionDescription}
              onChange={(event) => {
                setActionDescription(event.target.value);
                setOrderActionError('');
              }}
              placeholder="Describe the issue (optional)"
              rows={4}
              disabled={processingOrderAction}
            />

            {orderActionError && (
              <p className="delivery_status_modal_error">{orderActionError}</p>
            )}

            <div className="delivery_status_modal_actions">
              <button
                type="button"
                className="delivery_status_modal_secondary"
                onClick={() => {
                  if (processingOrderAction) return;

                  setShowRejectModal(false);
                  setActionReason('');
                  setActionDescription('');
                  setOrderActionError('');
                }}
                disabled={processingOrderAction}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="delivery_status_modal_danger"
                onClick={handleRejectDelivery}
                disabled={processingOrderAction}
              >
                {processingOrderAction ? 'Processing...' : 'Reject Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="delivery_status_modal_overlay">
          <div className="delivery_status_modal">
            <div className="delivery_status_modal_header">
              <h3>Cancel Order</h3>

              <button
                type="button"
                className="delivery_status_modal_close"
                onClick={() => {
                  if (processingOrderAction) return;

                  setShowCancelModal(false);
                  setActionReason('');
                  setActionDescription('');
                  setOrderActionError('');
                }}
              >
                ×
              </button>
            </div>

            <p className="delivery_status_modal_text">
              Are you sure you want to cancel this order?
            </p>

            <label
              htmlFor="cancel_reason"
              className="delivery_status_modal_label"
            >
              Reason
            </label>

            <select
              id="cancel_reason"
              className="delivery_status_modal_select"
              value={actionReason}
              onChange={(event) => {
                setActionReason(event.target.value);
                setOrderActionError('');
              }}
              disabled={processingOrderAction}
            >
              <option value="">Select a reason</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Taking too long">Taking too long</option>
              <option value="No longer needed">No longer needed</option>
              <option value="Other">Other</option>
            </select>

            {orderActionError && (
              <p className="delivery_status_modal_error">{orderActionError}</p>
            )}

            <div className="delivery_status_modal_actions">
              <button
                type="button"
                className="delivery_status_modal_secondary"
                onClick={() => {
                  if (processingOrderAction) return;

                  setShowCancelModal(false);
                  setActionReason('');
                  setOrderActionError('');
                }}
                disabled={processingOrderAction}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="delivery_status_modal_danger"
                onClick={handleCancelOrder}
                disabled={processingOrderAction}
              >
                {processingOrderAction
                  ? 'Cancelling...'
                  : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DeliveryStatus;
