function AddProductMessages({ successMessage, error }) {
  return (
    <>
      {successMessage && (
        <div className="add-product-success">{successMessage}</div>
      )}

      {error && <div className="add-product-error">{error}</div>}
    </>
  );
}

export default AddProductMessages;
