import './DeliveryPartnerRegister.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function DeliveryPartnerRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}api/delivery/rma/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to register.');
      }

      navigate('/delivery/rma-login', {
        replace: true,
        state: {
          phone: trimmedPhone,
          message:
            'Registration successful! Log in with your mobile number and password to continue your application.',
        },
      });
    } catch (submitError) {
      console.error('RMA delivery partner registration failed:', submitError);

      setError(submitError.message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="delivery_partner_register">
      <section className="delivery_partner_register_card">
        <button
          type="button"
          className="delivery_partner_back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="delivery_partner_header">
          <div className="delivery_partner_icon">R</div>

          <h1>Become a Delivery Partner</h1>

          <p>
            Deliver orders from RMA shops and earn by completing deliveries.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="delivery_partner_field">
            <label htmlFor="delivery-partner-name">Full Name</label>

            <input
              id="delivery-partner-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>

          <div className="delivery_partner_field">
            <label htmlFor="delivery-partner-phone">Mobile Number</label>

            <input
              id="delivery-partner-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, '').slice(0, 10));
              }}
              disabled={loading}
              autoComplete="tel"
              required
            />
          </div>

          <div className="delivery_partner_field">
            <label htmlFor="delivery-partner-password">Create Password</label>

            <input
              id="delivery-partner-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="delivery_partner_field">
            <label htmlFor="delivery-partner-confirm-password">
              Confirm Password
            </label>

            <input
              id="delivery-partner-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <div className="delivery_partner_error">{error}</div>}

          <button
            type="submit"
            className="delivery_partner_primary_button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="delivery_partner_info">
          <strong>How it works</strong>

          <p>
            1. Create your account using your name, mobile number and password.
          </p>
          <p>2. Log in to complete your delivery partner application.</p>
          <p>3. RMA reviews your application.</p>
          <p>4. Once approved, you can receive delivery assignments.</p>
        </div>
      </section>
    </main>
  );
}

export default DeliveryPartnerRegister;
