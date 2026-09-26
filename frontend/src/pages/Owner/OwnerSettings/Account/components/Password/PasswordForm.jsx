function PasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleSubmit,
  error,
  success,
  saving,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Current Password
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          autoComplete="current-password"
          required
        />
      </label>

      <label className="owner_setting_label">
        New Password
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          autoComplete="new-password"
          required
        />
      </label>

      <label className="owner_setting_label">
        Confirm New Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
        />
      </label>

      <p className="owner_password_hint">
        Password must contain at least 8 characters.
      </p>

      {error && <p className="owner_setting_error">{error}</p>}

      {success && <p className="owner_setting_success">{success}</p>}

      <button type="submit" className="owner_setting_save" disabled={saving}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default PasswordForm;
