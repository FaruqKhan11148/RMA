function ChangePriceActions({ navigate, saving }) {
  return (
    <div className="change-price-actions">
      <button
        type="button"
        className="change-price-cancel"
        onClick={() => navigate('/owner/settings/products')}
        disabled={saving}
      >
        Cancel
      </button>

      <button type="submit" className="change-price-submit" disabled={saving}>
        {saving ? 'Updating...' : 'Update Price'}
      </button>
    </div>
  );
}

export default ChangePriceActions;
