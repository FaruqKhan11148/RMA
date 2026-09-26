import './RateOrder.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RateOrderLoading from './components/RateOrderLoading';
import RateOrderError from './components/RateOrderError';
import RateOrderSuccess from './components/RateOrderSuccess';
import RateOrderHeader from './components/RateOrderHeader';
import ReviewForm from './components/ReviewForm';

import { fetchOrderForReview, submitOrderReview } from './utils/rateOrderApi';

function RateOrder() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);

  const [rmaRating, setRmaRating] = useState(0);
  const [shopRating, setShopRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);

  const [feedback, setFeedback] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const orderData = await fetchOrderForReview(orderId);

        setOrder(orderData);
      } catch (error) {
        console.error('Fetch order for review failed:', error);

        setError(error.message || 'Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rmaRating === 0 || shopRating === 0 || deliveryRating === 0) {
      setError('Please rate all three categories before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await submitOrderReview({
        orderId,
        rmaRating,
        shopRating,
        deliveryRating,
        feedback,
      });

      setSuccess(true);
    } catch (error) {
      console.error('Submit review failed:', error);

      setError(error.message || 'Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <RateOrderLoading />;
  }

  if (error && !order) {
    return <RateOrderError error={error} onBackHome={() => navigate('/')} />;
  }

  if (success) {
    return <RateOrderSuccess onBackHome={() => navigate('/')} />;
  }

  const shopName = order?.ownerId?.shopName || 'Shop';

  // ==========================================
  // RATE ORDER
  // ==========================================

  return (
    <main className="rate_order">
      <RateOrderHeader shopName={shopName} orderId={order?.orderId} />

      {error && <div className="rate_error">{error}</div>}

      <ReviewForm
        shopName={shopName}
        rmaRating={rmaRating}
        setRmaRating={setRmaRating}
        shopRating={shopRating}
        setShopRating={setShopRating}
        deliveryRating={deliveryRating}
        setDeliveryRating={setDeliveryRating}
        feedback={feedback}
        setFeedback={setFeedback}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

export default RateOrder;
