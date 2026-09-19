import './RateOrder.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'https://rma-backend-bo4a.onrender.com/';

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

  // ==========================================
  // GET ORDER
  // ==========================================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}api/orders/${orderId}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Unable to load order');
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error('Fetch order for review failed:', error);

        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rmaRating === 0 || shopRating === 0 || deliveryRating === 0) {
      setError('Please rate all three categories before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`${API_URL}api/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rmaRating,
          shopRating,
          deliveryRating,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to submit review');
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error('Submit review failed:', error);

      setError('Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // STAR RATING
  // ==========================================

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
      <main className="rate_order">
        <h1>Rate Your Order</h1>

        <p>Loading your order...</p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !order) {
    return (
      <main className="rate_order">
        <h1>Rate Your Order</h1>

        <p>{error}</p>

        <button type="button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </main>
    );
  }

  // ==========================================
  // SUCCESS
  // ==========================================

  if (success) {
    return (
      <main className="rate_order">
        <section className="rate_success">
          <div className="rate_success_icon">✓</div>

          <h1>Thank You!</h1>

          <p>Your review has been submitted successfully.</p>

          <button type="button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </section>
      </main>
    );
  }

  const shopName = order?.ownerId?.shopName || 'Shop';

  // ==========================================
  // RATE ORDER
  // ==========================================

  return (
    <main className="rate_order">
      <section className="rate_order_header">
        <h1>Rate Your Order</h1>

        <p>How was your experience with RMA?</p>

        <div className="rate_order_shop">
          <strong>{shopName}</strong>

          <span>Order #{order?.orderId}</span>
        </div>
      </section>

      {error && <div className="rate_error">{error}</div>}

      <form className="rate_order_form" onSubmit={handleSubmit}>
        {/* RMA */}

        <section className="rating_section">
          <h2>RMA Experience</h2>

          <p>How was your overall experience with RMA?</p>

          {renderStars(rmaRating, setRmaRating)}
        </section>

        {/* SHOP */}

        <section className="rating_section">
          <h2>Shop Experience</h2>

          <p>How was your experience with {shopName}?</p>

          {renderStars(shopRating, setShopRating)}
        </section>

        {/* DELIVERY */}

        <section className="rating_section">
          <h2>Delivery Experience</h2>

          <p>How was your delivery experience?</p>

          {renderStars(deliveryRating, setDeliveryRating)}
        </section>

        {/* FEEDBACK */}

        <section className="feedback_section">
          <label htmlFor="feedback">
            Feedback <span>(Optional)</span>
          </label>

          <textarea
            id="feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Tell us about your experience..."
            maxLength={1000}
            rows={5}
          />

          <small>{feedback.length}/1000</small>
        </section>

        {/* SUBMIT */}

        <button
          type="submit"
          className="submit_review_button"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </main>
  );
}

export default RateOrder;
