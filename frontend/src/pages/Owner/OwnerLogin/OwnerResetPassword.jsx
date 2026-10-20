import './OwnerLogin.css';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function OwnerResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('The reset link is missing its token. Request a new link.');
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}api/owners/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to reset password.');
        return;
      }

      setSuccess(data.message || 'Password reset successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="owner_login">
      <section className="owner_login_card">
        <div className="owner_login_header">
          <div className="owner_logo">RMA</div>
          <h1>Reset Password</h1>
          <p>Choose a new password for your RMA owner account.</p>
        </div>

        {!success ? (
          <form className="owner_login_form" onSubmit={handleSubmit}>
            <label>
              New Password
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </label>

            {error && (
              <p className="owner_login_error" role="alert">
                {error}
              </p>
            )}

            <button
              className="owner_login_button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div>
            <p className="owner_reset_success" role="status">
              {success}
            </p>

            <button
              type="button"
              className="owner_login_button"
              onClick={() => navigate('/owner/login')}
            >
              Go to Owner Login
            </button>
          </div>
        )}

        {!success && (
          <div className="owner_login_footer">
            <button
              type="button"
              onClick={() => navigate('/owner/forgot-password')}
              className="owner_register_link"
            >
              Request a New Reset Link
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerResetPassword;
