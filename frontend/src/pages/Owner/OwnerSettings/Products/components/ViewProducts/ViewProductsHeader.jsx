function ViewProductsHeader({ navigate, shopName }) {
  return (
    <div className="products-header">
      <div>
        <button
          className="products-back-button"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Products Settings
        </button>

        <h1>Products</h1>

        <p>
          Manage the products available at <strong>{shopName}</strong>
        </p>
      </div>

      <button
        className="add-product-button"
        onClick={() => navigate('/owner/settings/products/add')}
      >
        + Add Product
      </button>
    </div>
  );
}

export default ViewProductsHeader;
