function ViewProductsSummary({ products, availableCount, unavailableCount }) {
  return (
    <div className="products-summary">
      <div className="summary-card">
        <span>Total Products</span>
        <strong>{products.length}</strong>
      </div>

      <div className="summary-card">
        <span>Available</span>
        <strong>{availableCount}</strong>
      </div>

      <div className="summary-card">
        <span>Unavailable</span>
        <strong>{unavailableCount}</strong>
      </div>
    </div>
  );
}

export default ViewProductsSummary;
