function FeedbackSection({ feedback, setFeedback }) {
  return (
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
  );
}

export default FeedbackSection;
