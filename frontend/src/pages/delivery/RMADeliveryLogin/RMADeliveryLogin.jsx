import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RMADeliveryLogin.css';

import PhoneLoginForm from './components/PhoneLoginForm';
import OtpVerificationForm from './components/OtpVerificationForm';
import DeliveryLoginMessages from './components/DeliveryLoginMessages';

import { requestDeliveryOtp, verifyDeliveryOtp } from './utils/deliveryAuthApi';

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

      const data = await requestDeliveryOtp(phone.trim());

      setGeneratedOtp(data.otp || '');

      setSuccessMessage(
        data.otp ? 'OTP generated successfully' : 'OTP sent successfully',
      );

      setLoginStep('otp');
    } catch (error) {
      console.error('RMA delivery OTP request failed:', error);
      setError(error.message || 'Unable to connect to server');
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

      const data = await verifyDeliveryOtp(phone.trim(), otp);

      sessionStorage.setItem('delivery_token', data.token);

      sessionStorage.setItem(
        'delivery_person',
        JSON.stringify(data.deliveryPerson),
      );

      navigate('/delivery/orders-delivery');
    } catch (error) {
      console.error('RMA delivery OTP verification failed:', error);
      setError(error.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, ''));
    setError('');
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value.replace(/\D/g, ''));
    setError('');
  };

  const handleChangePhone = () => {
    setOtp('');
    setError('');
    setSuccessMessage('');
    setLoginStep('login');
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
          <PhoneLoginForm
            phone={phone}
            loading={loading}
            onPhoneChange={handlePhoneChange}
            onRequestOtp={handleRequestOtp}
            onRegister={() => navigate('/delivery-partner/register')}
            onParticularShop={() => navigate('/delivery/orders-delivery')}
          />
        ) : (
          <OtpVerificationForm
            otp={otp}
            generatedOtp={generatedOtp}
            loading={loading}
            onOtpChange={handleOtpChange}
            onVerifyOtp={handleVerifyOtp}
            onChangePhone={handleChangePhone}
          />
        )}

        <DeliveryLoginMessages successMessage={successMessage} error={error} />
      </section>
    </main>
  );
}

export default RMADeliveryLogin;
