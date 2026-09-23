import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RMADeliveryLogin.css';

function RMADeliveryLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginStep, setLoginStep] = useState('login');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/rma/request-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to send OTP');
        return;
      }

      setGeneratedOtp(data.otp || '');
      setSuccessMessage(
        data.otp ? 'OTP generated successfully' : 'OTP sent successfully',
      );

      setLoginStep('otp');
    } catch (error) {
      console.error('RMA delivery OTP request failed:', error);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/rma/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone.trim(),
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid OTP');
        return;
      }

      sessionStorage.setItem('delivery_token', data.token);

      sessionStorage.setItem(
        'delivery_person',
        JSON.stringify(data.deliveryPerson),
      );

      navigate('/delivery/orders-delivery');
    } catch (error) {
      console.error('RMA delivery OTP verification failed:', error);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="rma_delivery_login">
      <section className="rma_delivery_login_card">
        <button
          type="button"
          className="rma_delivery_back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {loginStep === 'login' ? (
          <>
            <div className="rma_delivery_login_header">
              <div className="rma_delivery_icon">R</div>

              <h1>RMA Delivery Partner</h1>

              <p>Login to access your RMA delivery orders.</p>
            </div>

            <label htmlFor="rma_delivery_phone">Phone Number</label>

            <input
              id="rma_delivery_phone"
              type="tel"
              inputMode="numeric"
              placeholder="Enter phone number"
              value={phone}
              maxLength={10}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, ''));
                setError('');
              }}
            />

            <button
              type="button"
              className="rma_delivery_primary_button"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="rma_delivery_register_prompt">
              <span>Not registered as an RMA delivery partner?</span>

              <button
                type="button"
                onClick={() => navigate('/delivery-partner/register')}
              >
                Register Now
              </button>
              <button
                type="button"
                onClick={() => navigate('/delivery/orders-delivery')}
              >
                Particular Shop
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rma_delivery_login_header">
              <div className="rma_delivery_icon">✓</div>

              <h1>Verify OTP</h1>

              <p>Enter the 6-digit OTP sent to your phone.</p>
            </div>

            {generatedOtp && (
              <div className="rma_delivery_otp_display">
                <span>Your OTP</span>
                <strong style={{ color: 'black' }}>{generatedOtp}</strong>
              </div>
            )}

            <label htmlFor="rma_delivery_otp">OTP</label>

            <input
              id="rma_delivery_otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, ''));
                setError('');
              }}
            />

            <button
              type="button"
              className="rma_delivery_primary_button"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              className="rma_delivery_secondary_button"
              onClick={() => {
                setOtp('');
                setError('');
                setSuccessMessage('');
                setLoginStep('login');
              }}
            >
              Change Phone Number
            </button>
          </>
        )}

        {successMessage && (
          <p className="rma_delivery_success">{successMessage}</p>
        )}

        {error && <p className="rma_delivery_error">{error}</p>}
      </section>
    </main>
  );
}

export default RMADeliveryLogin;
