function EditProductActions({ navigate, saving, isCustom }) {
  return (
    <>
      <div className="edit-product-divider" />

      <div className="edit-product-actions">
        <button
          type="button"
          className="edit-product-cancel"
          onClick={() => navigate('/owner/settings/products')}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" className="edit-product-submit" disabled={saving}>
          {saving ? 'Saving...' : isCustom ? 'Save Changes' : 'Update Price'}
        </button>
      </div>
    </>
  );
}

export default EditProductActions;
