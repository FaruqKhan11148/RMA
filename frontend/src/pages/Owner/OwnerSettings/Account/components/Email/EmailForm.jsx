function EmailForm({ email, setEmail, handleSubmit, error, success, saving }) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Email Address
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          autoComplete="email"
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

export default EmailForm;
