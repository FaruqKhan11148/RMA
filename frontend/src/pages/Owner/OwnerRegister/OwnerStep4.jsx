import './OwnerStep4.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerStep4() {
  const navigate = useNavigate();

  const savedOwnerData = sessionStorage.getItem('rma_owner_registration');

  const ownerData = savedOwnerData ? JSON.parse(savedOwnerData) : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!ownerData) {
    return (
      <main className="owner_step4">
        <section className="owner_step4_card">
          <h1>Registration information not found</h1>

          <p>Please start the shop registration again.</p>

          <button onClick={() => navigate('/owner/register/step-1')}>
            Start Registration
          </button>
        </section>
      </main>
    );
  }

  const handleConnectPayment = async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * IMPORTANT:
       *
       * For now this is only the frontend flow.
       *
       * Later we will call our backend:
       *
       * POST /api/payments/onboard-owner
       *
       * The backend will create/manage the Razorpay
       * linked account/onboarding process.
       */

      console.log('Owner onboarding data:', ownerData);

      // TEMPORARY
      setTimeout(() => {
        setLoading(false);

        navigate('/owner/shop-created', {
          state: {
            owner: ownerData,
            paymentStatus: 'PENDING',
          },
        });
      }, 1000);
    } catch (error) {
      console.error('Payment onboarding failed:', error);

      setError('Unable to start payment account setup.');

      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/owner/register/step-3');
  };

  return (
    <main className="owner_step4">
      <section className="owner_step4_card">
        {/* HEADER */}

        <div className="owner_step4_header">
          <div className="owner_logo">RMA</div>

          <p className="step_number">STEP 4 OF 4</p>

          <h1>Payment & Settlement</h1>

          <p>
            Connect your payment account so you can receive money from customer
            orders.
          </p>
        </div>

        {/* PROGRESS */}

        <div className="step_progress">
          <div className="progress_item completed">
            <span>1</span>
            <p>Owner</p>
          </div>

          <div className="progress_line completed"></div>

          <div className="progress_item completed">
            <span>2</span>
            <p>Shop</p>
          </div>

          <div className="progress_line completed"></div>

          <div className="progress_item completed">
            <span>3</span>
            <p>Products</p>
          </div>

          <div className="progress_line active"></div>

          <div className="progress_item active">
            <span>4</span>
            <p>Payment</p>
          </div>
        </div>

        {/* PAYMENT CARD */}

        <section className="payment_setup">
          <div className="payment_icon">₹</div>

          <h2>Razorpay</h2>

          <p>
            RMA uses Razorpay to securely process customer payments and manage
            seller settlements.
          </p>
        </section>

        {/* SETTLEMENT FLOW */}

        <section className="settlement_section">
          <h2>Settlement Setup</h2>

          <div className="settlement_steps">
            <div className="settlement_step">
              <span className="settlement_number">1</span>

              <div>
                <strong>Payment Account</strong>

                <p>Create your Razorpay payment account.</p>
              </div>
            </div>

            <div className="settlement_step">
              <span className="settlement_number">2</span>

              <div>
                <strong>Bank Account</strong>

                <p>
                  Connect the bank account where your settlements will be
                  received.
                </p>
              </div>
            </div>

            <div className="settlement_step">
              <span className="settlement_number">3</span>

              <div>
                <strong>KYC Verification</strong>

                <p>Complete the required verification with Razorpay.</p>
              </div>
            </div>

            <div className="settlement_step">
              <span className="settlement_number">4</span>

              <div>
                <strong>Receive Settlements</strong>

                <p>
                  Receive eligible customer payments into your connected bank
                  account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}

        <section className="security_section">
          <strong>Your financial information is secure</strong>

          <p>
            RMA does not need to store your banking credentials. Payment and
            verification information will be handled through the payment
            provider.
          </p>
        </section>

        {/* ERROR */}

        {error && <p className="owner_step4_error">{error}</p>}

        {/* ACTIONS */}

        <div className="owner_step4_actions">
          <button
            type="button"
            className="step_back_button"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>

          <button
            type="button"
            className="step_continue_button"
            onClick={handleConnectPayment}
            disabled={loading}
          >
            {loading ? 'Setting Up...' : 'Connect Payment Account'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerStep4;
