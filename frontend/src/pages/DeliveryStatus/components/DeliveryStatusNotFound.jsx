function DeliveryStatusNotFound({ onBack }) {
  return (
    <main className="delivery_status_empty">
      <h1>Order Not Found</h1>

      <p>We could not find this order.</p>

      <button type="button" onClick={onBack}>
        Back to Home
      </button>
    </main>
  );
}

export default DeliveryStatusNotFound;
