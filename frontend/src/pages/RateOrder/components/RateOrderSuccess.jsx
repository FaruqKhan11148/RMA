function RateOrderSuccess({ onBackHome }) {
  return (
    <main className="rate_order">
      <section className="rate_success">
        <div className="rate_success_icon">✓</div>

        <h1>Thank You!</h1>

        <p>Your review has been submitted successfully.</p>

        <button type="button" onClick={onBackHome}>
          Back to Home
        </button>
      </section>
    </main>
  );
}

export default RateOrderSuccess;
