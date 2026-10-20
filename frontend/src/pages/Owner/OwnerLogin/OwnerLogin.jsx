import './OwnerLogin.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function OwnerLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setTimeout(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lockoutSeconds > 0) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}api/owners/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.code === 'LOGIN_TEMPORARILY_LOCKED' &&
          Number(data.retryAfterSeconds) > 0
        ) {
          setLockoutSeconds(Number(data.retryAfterSeconds));
        }

        setError(data.message || 'Login failed');
        return;
      }

      console.log('Owner Login:', data);

      localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      localStorage.setItem('rma_owner_token', data.token);

      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="owner_login">
      <section className="owner_login_card">
        <div className="owner_login_header">
          <div className="owner_logo">RMA</div>

          <h1>Owner Login</h1>

          <p>Login to manage your shop and orders.</p>
        </div>

        <form className="owner_login_form" onSubmit={handleSubmit}>
          <label>
            Mobile Number
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {/* <div className="owner_forgot_password">
            <button
              type="button"
              onClick={() => navigate('/owner/forgot-password')}
              className="owner_register_link"
            >
              Forgot Password?
            </button>
          </div> */}

          {error && <p className="owner_login_error">{error}</p>}

          <button
            className="owner_login_button"
            type="submit"
            disabled={loading || lockoutSeconds > 0}
          >
            {loading
              ? 'Logging in...'
              : lockoutSeconds > 0
                ? `Try again in ${lockoutSeconds}s`
                : 'Login'}
          </button>
        </form>

        <div className="owner_login_footer">
          <p>
            Don't have an owner account?{' '}
            <button
              type="button"
              onClick={() => navigate('/owner/register/step-1')}
              className="owner_register_link"
            >
              Register
            </button>
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="owner_back_home"
          >
            Back to Home
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerLogin;
