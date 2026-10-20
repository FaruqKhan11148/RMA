import './CustomerLogin.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setTimeout(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [lockoutSeconds]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || lockoutSeconds > 0) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}api/customers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const loginError = new Error(data.message || 'Login failed');
        loginError.code = data.code;
        loginError.retryAfterSeconds = Number(data.retryAfterSeconds) || 0;
        throw loginError;
      }

      console.log('Customer login successful:', data.customer);

      navigate(redirect || '/customer/profile');
    } catch (error) {
      console.error('Customer login error:', error);

      if (
        error.code === 'LOGIN_TEMPORARILY_LOCKED' &&
        error.retryAfterSeconds > 0
      ) {
        setLockoutSeconds(error.retryAfterSeconds);
      }

      setError(error.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer_login">
      <section className="customer_login_card">
        <div className="customer_login_brand">
          <div className="customer_login_logo">RMA</div>

          <h1>Welcome back</h1>

          <p>Login to access your orders and make shopping faster.</p>
        </div>

        <form className="customer_login_form" onSubmit={handleSubmit}>
          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="customer_login_error">{error}</p>}

          <button
            type="submit"
            className="customer_login_button"
            disabled={loading || lockoutSeconds > 0}
          >
            {lockoutSeconds > 0
              ? `Try again in ${lockoutSeconds}s`
              : loading
                ? 'Logging in...'
                : 'Login'}
          </button>
        </form>

        <div className="customer_login_signup">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={() =>
              navigate(
                redirect
                  ? `/customer/signup?redirect=${encodeURIComponent(redirect)}`
                  : '/customer/signup',
              )
            }
          >
            Create Account
          </button>
        </div>

        <button
          type="button"
          className="customer_login_guest"
          onClick={() => navigate('/')}
        >
          Continue as Guest
        </button>
      </section>
    </main>
  );
}

export default CustomerLogin;
