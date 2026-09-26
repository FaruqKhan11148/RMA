function ViewProductsMessages({ successMessage, error }) {
  return (
    <>
      {successMessage && (
        <div className="products-success">{successMessage}</div>
      )}

      {error && <div className="products-error">{error}</div>}
    </>
  );
}

export default ViewProductsMessages;
