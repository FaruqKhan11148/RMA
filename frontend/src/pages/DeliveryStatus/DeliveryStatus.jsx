import './DeliveryStatus.css';

import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';

import DeliveryStatusLoading from './components/DeliveryStatusLoading';
import DeliveryStatusConnection from './components/DeliveryStatusConnection';
import DeliveryStatusNotFound from './components/DeliveryStatusNotFound';
import StatusHeader from './components/StatusHeader';
import OrderStatusCard from './components/OrderStatusCard';
import RatingCard from './components/RatingCard';
import DeliveryOtpCard from './components/DeliveryOtpCard';
import OrderDetails from './components/OrderDetails';
import RejectedOrder from './components/RejectedOrder';
import RatingModal from './components/RatingModal';
import OrderActionModal from './components/OrderActionModal';

import {
  fetchOrderById,
  cancelOrder,
  rejectDelivery,
  submitReview,
} from './utils/deliveryStatusApi';

import {
  getShopName,
  getStatusMessage,
  getOrderRefundInfo,
} from './utils/deliveryStatusHelpers';

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
  // GET ORDER
  // ==========================================

  const fetchOrder = useCallback(async () => {
    try {
      const data = await fetchOrderById(orderId);

      setOrder(data.order);
      setError('');
      setNotFound(false);

      clearCart();
    } catch (fetchError) {
      console.error('Fetch order failed:', fetchError);

      if (fetchError.status === 404) {
        setNotFound(true);
        setError('');
        setOrder(null);
        return;
      }

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, [orderId, clearCart]);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ==========================================
  // POLLING
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }

    if (!actionReason.trim()) {
      setOrderActionError('Please select a cancellation reason.');
      return;
    }

    try {
      setProcessingOrderAction(true);
      setOrderActionError('');

      const data = await cancelOrder(order.orderId, actionReason.trim());

      setShowCancelModal(false);
      setActionReason('');
      setActionDescription('');

      setOrder(data.order);
    } catch (cancelError) {
      console.error('Cancel order failed:', cancelError);

      setOrderActionError(
        cancelError.message || 'Unable to connect to server. Please try again.',
      );
    } finally {
      setProcessingOrderAction(false);
    }
  };

  // ==========================================
  // REJECT DELIVERY
  // ==========================================

  const handleRejectDelivery = async () => {
    if (!order) {
      return;
    }

    if (!actionReason.trim()) {
      setOrderActionError('Please select a rejection reason.');
      return;
    }

    try {
      setProcessingOrderAction(true);
      setOrderActionError('');

      const data = await rejectDelivery(
        order.orderId,
        actionReason.trim(),
        actionDescription.trim(),
      );

      setShowRejectModal(false);
      setActionReason('');
      setActionDescription('');

      setOrder(data.order);
    } catch (rejectError) {
      console.error('Reject delivery failed:', rejectError);

      setOrderActionError(
        rejectError.message || 'Unable to connect to server. Please try again.',
      );
    } finally {
      setProcessingOrderAction(false);
    }
  };

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (rmaRating === 0 || shopRating === 0 || deliveryRating === 0) {
      setReviewError('Please rate all three categories before submitting.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');

      await submitReview({
        orderId: order.orderId,
        rmaRating,
        shopRating,
        deliveryRating,
        feedback,
      });

      setReviewSubmitted(true);
    } catch (reviewSubmitError) {
      console.error('Submit review failed:', reviewSubmitError);

      setReviewError(
        reviewSubmitError.message || 'Unable to connect to server',
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <DeliveryStatusLoading />;
  }

  // ==========================================
  // CONNECTION ERROR
  // ==========================================

  if (!order && error) {
    return <DeliveryStatusConnection />;
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (notFound) {
    return <DeliveryStatusNotFound onBack={() => navigate('/')} />;
  }

  if (!order) {
    return null;
  }

  const shopName = getShopName(order);

  const refundInfo = getOrderRefundInfo(order);

  // ==========================================
  // REJECTED / CANCELLED ORDER
  // ==========================================

  if (order.status === 'Rejected') {
    return (
      <RejectedOrder
        order={order}
        shopName={shopName}
        refundInfo={refundInfo}
        onBackHome={() => navigate('/')}
      />
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

      <StatusHeader order={order} />

      <OrderStatusCard order={order} getStatusMessage={getStatusMessage} />

      {order.status === 'Completed' && (
        <RatingCard
          reviewSubmitted={reviewSubmitted}
          onRate={() => {
            setReviewError('');
            setShowRatingModal(true);
          }}
        />
      )}

      {order.status === 'OutForDelivery' && order.deliveryOtp && (
        <DeliveryOtpCard order={order} />
      )}

      <OrderDetails order={order} shopName={shopName} />

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
        <RatingModal
          shopName={shopName}
          rmaRating={rmaRating}
          shopRating={shopRating}
          deliveryRating={deliveryRating}
          feedback={feedback}
          reviewError={reviewError}
          submittingReview={submittingReview}
          reviewSubmitted={reviewSubmitted}
          onClose={() => setShowRatingModal(false)}
          onRmaRatingChange={setRmaRating}
          onShopRatingChange={setShopRating}
          onDeliveryRatingChange={setDeliveryRating}
          onFeedbackChange={setFeedback}
          onSubmit={handleSubmitReview}
        />
      )}

      {showRejectModal && (
        <OrderActionModal
          type="reject"
          reason={actionReason}
          description={actionDescription}
          error={orderActionError}
          processing={processingOrderAction}
          onReasonChange={(value) => {
            setActionReason(value);
            setOrderActionError('');
          }}
          onDescriptionChange={(value) => {
            setActionDescription(value);
            setOrderActionError('');
          }}
          onClose={() => {
            if (processingOrderAction) {
              return;
            }

            setShowRejectModal(false);
            setActionReason('');
            setActionDescription('');
            setOrderActionError('');
          }}
          onConfirm={handleRejectDelivery}
        />
      )}

      {showCancelModal && (
        <OrderActionModal
          type="cancel"
          reason={actionReason}
          error={orderActionError}
          processing={processingOrderAction}
          onReasonChange={(value) => {
            setActionReason(value);
            setOrderActionError('');
          }}
          onClose={() => {
            if (processingOrderAction) {
              return;
            }

            setShowCancelModal(false);
            setActionReason('');
            setOrderActionError('');
          }}
          onConfirm={handleCancelOrder}
        />
      )}
    </main>
  );
}

export default DeliveryStatus;
