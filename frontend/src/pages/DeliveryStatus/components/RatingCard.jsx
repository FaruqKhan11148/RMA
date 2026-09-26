function RatingCard({ reviewSubmitted, onRate }) {
  return (
    <section className="rate_order_card">
      <h2>How was your experience?</h2>

      <p>
        Your order has been delivered successfully. We'd love to hear your
        feedback.
      </p>

      {!reviewSubmitted ? (
        <button type="button" className="rate_order_button" onClick={onRate}>
          Rate Your Experience
        </button>
      ) : (
        <p className="review_submitted_message">
          Thank you for sharing your experience with RMA.
        </p>
      )}
    </section>
  );
}

export default RatingCard;
