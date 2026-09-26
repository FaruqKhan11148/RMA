function OwnerNameForm({
  ownerName,
  setOwnerName,
  handleSubmit,
  error,
  success,
  saving,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Owner Name
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Enter owner name"
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

export default OwnerNameForm;
