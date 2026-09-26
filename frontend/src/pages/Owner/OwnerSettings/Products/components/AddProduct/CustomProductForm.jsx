function CustomProductForm({
  customProductName,
  setCustomProductName,
  customProductCategory,
  setCustomProductCategory,
  customProductPrice,
  setCustomProductPrice,
  customProductUnit,
  setCustomProductUnit,
  customProductImage,
  setCustomProductImage,
}) {
  return (
    <>
      <div className="form-section">
        <h2>Custom Product</h2>

        <p>Create a product specific to your shop.</p>
      </div>

      {/* NAME */}

      <div className="form-group">
        <label>Product Name</label>

        <input
          type="text"
          placeholder="e.g. Special Chicken Curry Cut"
          value={customProductName}
          onChange={(event) => setCustomProductName(event.target.value)}
        />
      </div>

      {/* CATEGORY */}

      <div className="form-group">
        <label>Category</label>

        <input
          type="text"
          placeholder="e.g. Chicken"
          value={customProductCategory}
          onChange={(event) => setCustomProductCategory(event.target.value)}
        />
      </div>

      {/* PRICE + UNIT */}

      <div className="form-row">
        <div className="form-group">
          <label>Price</label>

          <div className="price-input">
            <span>₹</span>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="300"
              value={customProductPrice}
              onChange={(event) => setCustomProductPrice(event.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Unit</label>

          <input
            type="text"
            placeholder="KG"
            value={customProductUnit}
            onChange={(event) => setCustomProductUnit(event.target.value)}
          />
        </div>
      </div>

      {/* IMAGE */}

      <div className="form-group">
        <label>
          Image URL
          <span className="optional">Optional</span>
        </label>

        <input
          type="url"
          placeholder="https://..."
          value={customProductImage}
          onChange={(event) => setCustomProductImage(event.target.value)}
        />
      </div>
    </>
  );
}

export default CustomProductForm;
