import './PaymentDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <button
          type="button"
          className="owner_setting_back"
          onClick={() => navigate(-1)}
        >
          ← Payments Settings
        </button>

        <div className="owner_setting_header">
          <p className="owner_setting_tag">PAYMENT SETTINGS</p>

          <h1>Payment Details</h1>

          <p>
            View your payment account, KYC and settlement onboarding status.
          </p>
        </div>

        {error && <div className="owner_setting_error">{error}</div>}

        {/* PAYMENT PROVIDER */}

        <div className="payment_provider_card">
          <div className="payment_provider_icon">₹</div>

          <div className="payment_provider_content">
            <span>Payment Provider</span>

            <strong>{payment.provider}</strong>

            <small>
              Used for processing customer payments and shop settlements.
            </small>
          </div>
        </div>

        {/* ONBOARDING STATUS */}

        <div className="payment_section">
          <div className="payment_section_header">
            <div>
              <span className="payment_section_tag">ACCOUNT</span>

              <h2>Payment Account</h2>
            </div>

            <span
              className={`payment_status_badge ${getStatusClass(
                payment.onboardingStatus,
              )}`}
            >
              {formatStatus(payment.onboardingStatus)}
            </span>
          </div>

          <div className="payment_detail_list">
            <div className="payment_detail_row">
              <span>Account ID</span>

              <strong>{payment.accountId || 'Not connected'}</strong>
            </div>

            <div className="payment_detail_row">
              <span>Onboarding Status</span>

              <strong>{formatStatus(payment.onboardingStatus)}</strong>
            </div>

            <div className="payment_detail_row">
              <span>KYC Status</span>

              <strong className={getStatusClass(payment.kycStatus)}>
                {formatStatus(payment.kycStatus)}
              </strong>
            </div>

            <div className="payment_detail_row">
              <span>Bank Status</span>

              <strong className={getStatusClass(payment.bankStatus)}>
                {formatStatus(payment.bankStatus)}
              </strong>
            </div>
          </div>
        </div>

        {/* SETTLEMENT */}

        <div className="payment_section">
          <div className="payment_section_header">
            <div>
              <span className="payment_section_tag">SETTLEMENT</span>

              <h2>Settlement Information</h2>
            </div>
          </div>

          <div className="payment_settlement_card">
            <div className="payment_settlement_icon">
              {payment.onboardingStatus === 'VERIFIED' ? '✓' : '○'}
            </div>

            <div>
              <strong>
                {payment.onboardingStatus === 'VERIFIED'
                  ? 'Settlement account is ready'
                  : 'Settlement account not ready'}
              </strong>

              <p>
                {payment.onboardingStatus === 'VERIFIED'
                  ? 'Your shop can receive settlements through the connected payment account.'
                  : 'Complete payment onboarding and verification before settlements can be enabled.'}
              </p>
            </div>
          </div>
        </div>

        {/* ONBOARDED DATE */}

        {payment.onboardedAt && (
          <div className="payment_onboarded_info">
            <span>Onboarded On</span>

            <strong>{new Date(payment.onboardedAt).toLocaleString()}</strong>
          </div>
        )}

        {/* FUTURE ONBOARDING */}

        {payment.onboardingStatus !== 'VERIFIED' && (
          <div className="payment_next_step">
            <div className="payment_next_step_icon">!</div>

            <div>
              <strong>Payment onboarding required</strong>

              <p>
                Your payment account is not fully verified yet. Once Razorpay
                onboarding is connected, this page will allow you to complete
                the required verification steps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentDetails;
