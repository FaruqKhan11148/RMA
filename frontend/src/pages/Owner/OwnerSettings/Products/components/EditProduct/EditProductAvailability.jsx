function EditProductAvailability({ available, handleAvailabilityChange }) {
  return (
    <>
      <div className="edit-product-divider" />

      <div className="edit-product-availability">
        <div>
          <strong>Product Availability</strong>

          <p>
            {available
              ? 'Customers can currently order this product.'
              : 'Customers cannot currently order this product.'}
          </p>
        </div>

        <button
          type="button"
          className={`edit-product-toggle ${available ? 'active' : ''}`}
          onClick={() => handleAvailabilityChange(!available)}
          aria-label="Toggle product availability"
        >
          <span />
        </button>
      </div>
    </>
  );
}

export default EditProductAvailability;
