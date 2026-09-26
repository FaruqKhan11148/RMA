function DeliveryLoginMessages({ successMessage, error }) {
  return (
    <>
      {successMessage && (
        <p className="rma_delivery_success">{successMessage}</p>
      )}

      {error && <p className="rma_delivery_error">{error}</p>}
    </>
  );
}

export default DeliveryLoginMessages;
