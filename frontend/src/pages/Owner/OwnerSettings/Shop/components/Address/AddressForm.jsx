function AddressForm({
  address,
  setAddress,
  error,
  success,
  saving,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Shop Address
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete shop address"
          maxLength={500}
          rows={6}
          required
        />
      </label>

      <div className="owner_address_counter">{address.length}/500</div>

      {error && <p className="owner_setting_error">{error}</p>}

      {success && <p className="owner_setting_success">{success}</p>}

      <button type="submit" className="owner_setting_save" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

export default AddressForm;
