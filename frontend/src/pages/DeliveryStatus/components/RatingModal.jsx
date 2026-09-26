function RatingModal({
  shopName,
  rmaRating,
  shopRating,
  deliveryRating,
  feedback,
  reviewError,
  submittingReview,
  reviewSubmitted,
  onClose,
  onRmaRatingChange,
  onShopRatingChange,
  onDeliveryRatingChange,
  onFeedbackChange,
  onSubmit,
}) {
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

  return (
    <div className="rating_modal_overlay">
      <section className="rating_modal">
        <button
          type="button"
          className="rating_modal_close"
          onClick={onClose}
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

            <form onSubmit={onSubmit}>
              <div className="rating_section">
                <h3>RMA Experience</h3>

                <p>How was your overall experience with RMA?</p>

                {renderStars(rmaRating, onRmaRatingChange)}
              </div>

              <div className="rating_section">
                <h3>Shop Experience</h3>

                <p>How was your experience with {shopName}?</p>

                {renderStars(shopRating, onShopRatingChange)}
              </div>

              <div className="rating_section">
                <h3>Delivery Experience</h3>

                <p>How was your delivery experience?</p>

                {renderStars(deliveryRating, onDeliveryRatingChange)}
              </div>

              <div className="feedback_section">
                <label htmlFor="delivery-rating-feedback">
                  Feedback <span>(Optional)</span>
                </label>

                <textarea
                  id="delivery-rating-feedback"
                  value={feedback}
                  onChange={(event) => onFeedbackChange(event.target.value)}
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
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default RatingModal;
