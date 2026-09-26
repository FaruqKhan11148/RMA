function RateOrderError({ error, onBackHome }) {
  return (
    <main className="rate_order">
      <h1>Rate Your Order</h1>

      <p>{error}</p>

      <button type="button" onClick={onBackHome}>
        Back to Home
      </button>
    </main>
  );
}

export default RateOrderError;
