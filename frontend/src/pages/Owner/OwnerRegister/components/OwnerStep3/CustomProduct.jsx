function CustomProduct({
  showCustomProduct,
  setShowCustomProduct,
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
  addCustomProduct,
  setError,
}) {
  return (
    <section className="register_section">
      <h2>Custom Product</h2>

      <p className="section_description">
        Can't find your product in the RMA catalogue?
      </p>

      {!showCustomProduct ? (
        <button
          type="button"
          className="add_product_button"
          onClick={() => {
            setShowCustomProduct(true);
            setError('');
          }}
        >
          + Add Custom Product
        </button>
      ) : (
        <div className="product_form">
          <label>
            Product Name
            <input
              type="text"
              placeholder="Example: Country Chicken"
              value={customProductName}
              onChange={(event) => setCustomProductName(event.target.value)}
            />
          </label>

          <label>
            Category
            <input
              type="text"
              placeholder="Example: Chicken"
              value={customProductCategory}
              onChange={(event) => setCustomProductCategory(event.target.value)}
            />
          </label>

          <label>
            Price
            <input
              type="number"
              min="1"
              placeholder="Example: 450"
              value={customProductPrice}
              onChange={(event) => setCustomProductPrice(event.target.value)}
            />
          </label>

          <label>
            Unit
            <input
              type="text"
              placeholder="Example: KG"
              value={customProductUnit}
              onChange={(event) => setCustomProductUnit(event.target.value)}
            />
          </label>

          <label>
            Image URL
            <input
              type="text"
              placeholder="Temporary image URL"
              value={customProductImage}
              onChange={(event) => setCustomProductImage(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="add_product_button"
            onClick={addCustomProduct}
          >
            + Add Custom Product
          </button>
        </div>
      )}
    </section>
  );
}

export default CustomProduct;
