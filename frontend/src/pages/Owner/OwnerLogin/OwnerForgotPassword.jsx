import './OwnerLogin.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function OwnerForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}api/owners/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to process your request.');
        return;
      }

      setMessage(
        data.message ||
          'If an owner account exists with that email, a reset link will be sent shortly.',
      );
    } catch (err) {
      console.error('Forgot password error:', err);
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
          <h1>Forgot Password?</h1>
          <p>Enter the email address registered to your owner account.</p>
        </div>

        <form className="owner_login_form" onSubmit={handleSubmit}>
          <label>
            Registered Email
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>

          {message && (
            <p className="owner_reset_success" role="status">
              {message}
            </p>
          )}

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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="owner_login_footer">
          <button
            type="button"
            onClick={() => navigate('/owner/login')}
            className="owner_register_link"
          >
            Back to Owner Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerForgotPassword;
