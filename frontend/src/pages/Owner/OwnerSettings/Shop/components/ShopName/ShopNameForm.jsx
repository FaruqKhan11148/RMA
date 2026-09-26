function ShopNameForm({
  shopName,
  setShopName,
  error,
  success,
  saving,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Shop Name
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Enter shop name"
          maxLength={100}
          required
        />
      </label>

      {error && <p className="owner_setting_error">{error}</p>}

      {success && <p className="owner_setting_success">{success}</p>}

      <button type="submit" className="owner_setting_save" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

export default ShopNameForm;
