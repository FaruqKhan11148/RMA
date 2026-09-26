function PhoneNumberForm({
  phone,
  setPhone,
  handleSubmit,
  error,
  success,
  saving,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Mobile Number
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter mobile number"
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

export default PhoneNumberForm;
