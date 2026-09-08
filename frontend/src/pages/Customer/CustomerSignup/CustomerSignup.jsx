import './CustomerSignup.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setSuccess('');

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await fetch(
        'http://localhost:5000/api/customers/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed');
      }

      console.log('Customer registered:', data.customer);

      setSuccess('Account created successfully!');

      setTimeout(() => {
        navigate('/customer/login');
      }, 1000);
    } catch (error) {
      console.error('Customer signup error:', error);

      setError(error.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer_signup">
      <section className="customer_signup_card">
        <div className="customer_signup_brand">
          <div className="customer_signup_logo">RMA</div>

          <h1>Create your account</h1>

          <p>Save your details and make your next order faster.</p>
        </div>

        <form className="customer_signup_form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              name="phone"
              placeholder="Enter your mobile number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </label>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p className="customer_signup_error">{error}</p>}

          {success && <p className="customer_signup_success">{success}</p>}

          <button
            type="submit"
            className="customer_signup_button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="customer_signup_login">
          <span>Already have an account?</span>

          <button type="button" onClick={() => navigate('/customer/login')}>
            Login
          </button>
        </div>

        <button
          type="button"
          className="customer_signup_guest"
          onClick={() => navigate('/')}
        >
          Continue as Guest
        </button>
      </section>
    </main>
  );
}

export default CustomerSignup;
