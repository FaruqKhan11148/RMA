function AdminLoginForm({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="admin-form-group">
        <label htmlFor="admin-username">Username</label>

        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="Enter admin username"
          autoComplete="username"
          disabled={loading}
        />
      </div>

      <div className="admin-form-group">
        <label htmlFor="admin-password">Password</label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Enter admin password"
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      {error && <div className="admin-login-error">{error}</div>}

      <button type="submit" className="admin-login-button" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

export default AdminLoginForm;
