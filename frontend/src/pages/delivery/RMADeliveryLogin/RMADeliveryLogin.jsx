import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RMADeliveryLogin.css';

import PhoneLoginForm from './components/PhoneLoginForm';

import { loginRmaDeliveryPartner } from './utils/deliveryAuthApi';

function RMADeliveryLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState(location.state?.phone || '');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [successMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setTimeout(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [lockoutSeconds]);

  const handleLogin = async () => {
    if (loading || lockoutSeconds > 0) return;

    const trimmedPhone = phone.trim();

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await loginRmaDeliveryPartner(trimmedPhone, password);

      localStorage.setItem('delivery_token', data.token);
      localStorage.setItem(
        'delivery_person',
        JSON.stringify(data.deliveryPerson),
      );

      if (data.deliveryPerson.applicationStatus === 'APPROVED') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/delivery/rma/application');
      }
    } catch (error) {
      console.error('RMA delivery password login failed:', error);

      if (
        error.code === 'LOGIN_TEMPORARILY_LOCKED' &&
        Number(error.retryAfterSeconds) > 0
      ) {
        setLockoutSeconds(Number(error.retryAfterSeconds));
      }

      setError(error.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (event) => {
    if (lockoutSeconds > 0) return;
    setPhone(event.target.value.replace(/\D/g, '').slice(0, 10));
    setError('');
  };

  const handlePasswordChange = (event) => {
    if (lockoutSeconds > 0) return;
    setPassword(event.target.value);
    setError('');
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

        <PhoneLoginForm
          phone={phone}
          password={password}
          loading={loading || lockoutSeconds > 0}
          lockoutSeconds={lockoutSeconds}
          successMessage={successMessage}
          error={error}
          onPhoneChange={handlePhoneChange}
          onPasswordChange={handlePasswordChange}
          onLogin={handleLogin}
          onRegister={() => navigate('/delivery-partner/register')}
          onParticularShop={() => navigate('/delivery/orders-delivery')}
        />

        {lockoutSeconds > 0 && (
          <p className="rma_delivery_lockout" role="status">
            Too many failed attempts. Try again in {lockoutSeconds}s.
          </p>
        )}
      </section>
    </main>
  );
}

export default RMADeliveryLogin;
