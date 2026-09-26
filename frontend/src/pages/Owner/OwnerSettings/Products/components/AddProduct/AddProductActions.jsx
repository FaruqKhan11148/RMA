function AddProductActions({ navigate, saving }) {
  return (
    <div className="add-product-actions">
      <button
        type="button"
        className="cancel-button"
        onClick={() => navigate('/owner/settings/products')}
      >
        Cancel
      </button>

      <button type="submit" className="save-product-button" disabled={saving}>
        {saving ? 'Adding...' : 'Add Product'}
      </button>
    </div>
  );
}

export default AddProductActions;
