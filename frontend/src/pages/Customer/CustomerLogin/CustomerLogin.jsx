import './CustomerLogin.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:5000/api/customers/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Customer login successful:', data.customer);

      navigate('/profile');
    } catch (error) {
      console.error('Customer login error:', error);

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
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="customer_login_signup">
          <span>Don't have an account?</span>

          <button type="button" onClick={() => navigate('/customer/signup')}>
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
