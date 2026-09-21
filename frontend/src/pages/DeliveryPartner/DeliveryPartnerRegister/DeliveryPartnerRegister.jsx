import './DeliveryPartnerRegister.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DeliveryPartnerRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    try {
      setLoading(true);

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/rma/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
            phone: trimmedPhone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit your application.');
      }

      setSuccess(true);
    } catch (submitError) {
      console.error('RMA delivery partner registration failed:', submitError);

      setError(
        submitError.message ||
          'Unable to submit your application. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="delivery_partner_register">
        <section className="delivery_partner_success">
          <div className="delivery_partner_success_icon">✓</div>

          <h1>Application Submitted</h1>

          <p>Thanks for your interest in becoming an RMA Delivery Partner.</p>

          <p>
            Your application has been submitted successfully and is waiting for
            approval from RMA.
          </p>

          <button
            type="button"
            className="delivery_partner_primary_button"
            onClick={() => navigate('/')}
          >
            Back to RMA
          </button>
        </section>
      </main>
    );
  }

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
                const value = event.target.value.replace(/\D/g, '');
                setPhone(value);
              }}
              disabled={loading}
              autoComplete="tel"
            />
          </div>

          {error && <div className="delivery_partner_error">{error}</div>}

          <button
            type="submit"
            className="delivery_partner_primary_button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Apply as Delivery Partner'}
          </button>
        </form>

        <div className="delivery_partner_info">
          <strong>How it works</strong>

          <p>1. Submit your details.</p>
          <p>2. RMA reviews your application.</p>
          <p>3. Once approved, you can log in with your mobile number.</p>
          <p>4. Receive delivery assignments from RMA shops.</p>
        </div>
      </section>
    </main>
  );
}

export default DeliveryPartnerRegister;
