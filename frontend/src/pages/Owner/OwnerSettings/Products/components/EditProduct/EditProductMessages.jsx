function EditProductMessages({ error, successMessage }) {
  return (
    <>
      {error && <div className="edit-product-message error">{error}</div>}

      {successMessage && (
        <div className="edit-product-message success">✓ {successMessage}</div>
      )}
    </>
  );
}

export default EditProductMessages;
