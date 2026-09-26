function ChangePriceField({ product, price, setPrice }) {
  return (
    <div className="change-price-field">
      <label htmlFor="price">New Selling Price</label>

      <div className="change-price-input-wrapper">
        <span>₹</span>

        <input
          id="price"
          type="number"
          min="1"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Enter new price"
          required
        />

        <span>/ {product.unit}</span>
      </div>
    </div>
  );
}

export default ChangePriceField;
    