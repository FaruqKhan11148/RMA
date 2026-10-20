import './OwnerStep4.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerStep4Header from './components/OwnerStep4/OwnerStep4Header';
import OwnerStep4Progress from './components/OwnerStep4/OwnerStep4Progress';
import PaymentSetup from './components/OwnerStep4/PaymentSetup';
import SecuritySection from './components/OwnerStep4/SecuritySection';
import SettlementVerification from './components/OwnerStep4/SettlementVerification';
import OwnerStep4Actions from './components/OwnerStep4/OwnerStep4Actions';
import FlashMessage from '../../../components/FlashMessage/FlashMessage';
import OwnerTerms from '../../Owner/OwnerTerms/OwnerTerms';

import registerOwner from './utils/ownerRegisterApi';

function OwnerStep4() {
  const navigate = useNavigate();

  const savedOwnerData = sessionStorage.getItem('rma_owner_registration');
  const ownerData = savedOwnerData ? JSON.parse(savedOwnerData) : null;

  const [upiAccountHolderName, setUpiAccountHolderName] = useState('');
  const [upiMobileNumber, setUpiMobileNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ownerTermsAccepted, setOwnerTermsAccepted] = useState(
    sessionStorage.getItem('rma_owner_terms_accepted') === 'true' &&
      sessionStorage.getItem('rma_owner_terms_version') === 'owner-terms-v1',
  );

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');

  if (!ownerData) {
    return (
      <main className="owner_step4">
        <section className="owner_step4_card">
          <h1>Registration information not found</h1>
          <p>Please start the shop registration again.</p>

          <button
            type="button"
            onClick={() => navigate('/owner/register/step-1')}
          >
            Start Registration
          </button>
        </section>
      </main>
    );
  }

  const handleCreateShop = async () => {
    try {
      if (!ownerTermsAccepted) {
        setFlashMessage(
          'Please accept the Shop Owner Agreement and Privacy Policy to continue.',
        );
        return;
      }

      setLoading(true);
      setError('');

      const normalizedUpiAccountHolderName = upiAccountHolderName
        .trim()
        .replace(/\s+/g, ' ');

      const normalizedUpiMobile = upiMobileNumber.replace(/\D/g, '');
      const normalizedUpiId = upiId.trim().toLowerCase();

      if (!normalizedUpiAccountHolderName) {
        throw new Error('UPI account holder name is required');
      }

      if (!/^\d{10}$/.test(normalizedUpiMobile)) {
        throw new Error('Enter a valid 10-digit UPI-linked mobile number');
      }

      if (!/^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/.test(normalizedUpiId)) {
        throw new Error('Please enter a valid UPI ID');
      }

      const finalOwnerData = {
        ...ownerData,

        // UPI settlement details
        upiAccountHolderName: normalizedUpiAccountHolderName,
        upiMobileNumber: normalizedUpiMobile,
        upiId: normalizedUpiId,

        // Shop owner agreement acceptance
        termsAccepted: true,
        termsVersion: 'owner-terms-v1',
      };

      const data = await registerOwner(finalOwnerData);

      console.log('Owner registered successfully:', data);

      sessionStorage.removeItem('rma_owner_registration');
      sessionStorage.removeItem('rma_owner_terms_accepted');
      sessionStorage.removeItem('rma_owner_terms_version');

      navigate('/owner/registration-pending', {
        replace: true,
        state: {
          status: 'PENDING_APPROVAL',
        },
      });
    } catch (error) {
      console.error('Owner registration failed:', error);
      setError(error.message || 'Unable to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/owner/register/step-3');
  };

  return (
    <main className="owner_step4">
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <section className="owner_step4_card">
        <OwnerStep4Header />

        <OwnerStep4Progress />

        <PaymentSetup />

        <section className="owner_upi_setup">
          <h2>UPI Settlement Details</h2>

          <p>
            Enter the UPI details for the account where you want to receive your
            shop settlements. Make sure the account holder name matches the name
            registered with your UPI account.
          </p>

          <div className="owner_upi_field">
            <label htmlFor="upiAccountHolderName">
              UPI Account Holder Name
            </label>

            <input
              id="upiAccountHolderName"
              type="text"
              autoComplete="name"
              placeholder="Enter the exact name linked to your UPI"
              value={upiAccountHolderName}
              onChange={(event) => setUpiAccountHolderName(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="owner_upi_field">
            <label htmlFor="upiMobileNumber">UPI-Linked Mobile Number</label>

            <input
              id="upiMobileNumber"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={upiMobileNumber}
              onChange={(event) =>
                setUpiMobileNumber(
                  event.target.value.replace(/\D/g, '').slice(0, 10),
                )
              }
              disabled={loading}
              required
            />
          </div>

          <div className="owner_upi_field">
            <label htmlFor="upiId">UPI ID</label>

            <input
              id="upiId"
              type="text"
              autoComplete="off"
              placeholder="example@upi"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              disabled={loading}
              required
            />
          </div>
        </section>

        <SecuritySection />

        <SettlementVerification />

        <div className="owner_terms_acceptance">
          <button
            type="button"
            className="owner_terms_open_button"
            onClick={() => setShowTermsModal(true)}
            disabled={loading}
          >
            Read Shop Owner Agreement & Privacy Policy
          </button>

          <label className="owner_terms_acceptance_label">
            <input type="checkbox" checked={ownerTermsAccepted} readOnly />

            <span>
              I have read and accepted the Shop Owner Agreement and Privacy
              Policy.
            </span>
          </label>
        </div>

        {showTermsModal && (
          <OwnerTerms
            onAccept={() => {
              sessionStorage.setItem('rma_owner_terms_accepted', 'true');
              sessionStorage.setItem(
                'rma_owner_terms_version',
                'owner-terms-v1',
              );

              setOwnerTermsAccepted(true);
              setShowTermsModal(false);
            }}
            onClose={() => setShowTermsModal(false)}
          />
        )}

        <OwnerStep4Actions
          error={error}
          loading={loading}
          handleBack={handleBack}
          handleCreateShop={handleCreateShop}
        />
      </section>
    </main>
  );
}

export default OwnerStep4;
