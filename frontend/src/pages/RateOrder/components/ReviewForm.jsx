import RatingSection from './RatingSection';
import FeedbackSection from './FeedbackSection';

function ReviewForm({
  shopName,
  rmaRating,
  setRmaRating,
  shopRating,
  setShopRating,
  deliveryRating,
  setDeliveryRating,
  feedback,
  setFeedback,
  submitting,
  onSubmit,
}) {
  return (
    <form className="rate_order_form" onSubmit={onSubmit}>
      <RatingSection
        title="RMA Experience"
        description="How was your overall experience with RMA?"
        rating={rmaRating}
        setRating={setRmaRating}
      />

      <RatingSection
        title="Shop Experience"
        description={`How was your experience with ${shopName}?`}
        rating={shopRating}
        setRating={setShopRating}
      />

      <RatingSection
        title="Delivery Experience"
        description="How was your delivery experience?"
        rating={deliveryRating}
        setRating={setDeliveryRating}
      />

      <FeedbackSection feedback={feedback} setFeedback={setFeedback} />

      <button
        type="submit"
        className="submit_review_button"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default ReviewForm;
