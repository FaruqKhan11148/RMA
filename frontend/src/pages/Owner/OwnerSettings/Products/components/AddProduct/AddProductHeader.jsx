function AddProductHeader({ navigate }) {
  return (
    <div className="add-product-header">
      <button
        className="add-product-back"
        onClick={() => navigate('/owner/settings/account')}
      >
        ← Products Settings
      </button>

      <h1>Add Product</h1>

      <p>Add a product to your shop catalogue.</p>
    </div>
  );
}

export default AddProductHeader;
