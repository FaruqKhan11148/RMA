import './PaymentDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PaymentDetailsHeader from './components/PaymentDetailsHeader';
import PaymentError from './components/PaymentError';
import PaymentProviderCard from './components/PaymentProviderCard';
import PaymentAccountSection from './components/PaymentAccountSection';
import PaymentSettlementSection from './components/PaymentSettlementSection';
import PaymentOnboardedInfo from './components/PaymentOnboardedInfo';
import PaymentNextStep from './components/PaymentNextStep';

function PaymentDetails() {
  const navigate = useNavigate();

  const [payment, setPayment] = useState({
    provider: '',
    accountId: null,
    onboardingStatus: 'NOT_STARTED',
    kycStatus: 'NOT_STARTED',
    bankStatus: 'NOT_STARTED',
    onboardingUrl: null,
    onboardedAt: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('rma_owner_token');

  useEffect(() => {
    if (!token) {
      navigate('/owner/login');
      return;
    }

    const fetchOwner = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load payment details');
        }

        const ownerPayment = data.owner.payment || {};

        setPayment({
          provider: ownerPayment.provider || 'RAZORPAY',
          accountId: ownerPayment.accountId || null,
          onboardingStatus: ownerPayment.onboardingStatus || 'NOT_STARTED',
          kycStatus: ownerPayment.kycStatus || 'NOT_STARTED',
          bankStatus: ownerPayment.bankStatus || 'NOT_STARTED',
          onboardingUrl: ownerPayment.onboardingUrl || null,
          onboardedAt: ownerPayment.onboardedAt || null,
        });

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  const formatStatus = (status) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'VERIFIED':
      case 'ACTIVATED':
        return 'payment_status_verified';

      case 'PENDING':
      case 'KYC_PENDING':
      case 'UNDER_REVIEW':
        return 'payment_status_pending';

      case 'REJECTED':
      case 'SUSPENDED':
        return 'payment_status_rejected';

      default:
        return 'payment_status_default';
    }
  };

  if (loading) {
    return (
      <div className="owner_setting_page">
        <div className="owner_setting_card">
          <p className="owner_setting_loading">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner_setting_page">
      <div className="owner_setting_card">
        <PaymentDetailsHeader navigate={navigate} />

        <PaymentError error={error} />

        <PaymentProviderCard provider={payment.provider} />

        <PaymentAccountSection
          payment={payment}
          formatStatus={formatStatus}
          getStatusClass={getStatusClass}
        />

        <PaymentSettlementSection onboardingStatus={payment.onboardingStatus} />

        <PaymentOnboardedInfo onboardedAt={payment.onboardedAt} />

        <PaymentNextStep onboardingStatus={payment.onboardingStatus} />
      </div>
    </div>
  );
}

export default PaymentDetails;
