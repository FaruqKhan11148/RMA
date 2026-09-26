function EditProductPrice({ product, price, setPrice }) {
  return (
    <>
      <div className="edit-product-divider" />

      <div className="edit-product-section">
        <div className="edit-product-section-title">Selling Price</div>

        {!product.isCustom && (
          <div className="edit-product-info-note">
            RMA catalogue product details are controlled by RMA. Only the
            selling price can be changed.
          </div>
        )}

        <div className="edit-product-field">
          <label htmlFor="price">Price</label>

          <div className="edit-product-price-wrapper">
            <span>₹</span>

            <input
              id="price"
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter price"
              required
            />

            <span>/ {product.unit}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProductPrice;
