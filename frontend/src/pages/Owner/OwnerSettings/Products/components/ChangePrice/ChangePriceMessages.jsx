function ChangePriceMessages({ error, successMessage }) {
  return (
    <>
      {error && <div className="change-price-message error">{error}</div>}

      {successMessage && (
        <div className="change-price-message success">✓ {successMessage}</div>
      )}
    </>
  );
}

export default ChangePriceMessages;
