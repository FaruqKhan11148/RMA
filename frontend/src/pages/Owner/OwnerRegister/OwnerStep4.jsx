import './OwnerStep4.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerStep4Header from './components/OwnerStep4/OwnerStep4Header';
import OwnerStep4Progress from './components/OwnerStep4/OwnerStep4Progress';
import PaymentSetup from './components/OwnerStep4/PaymentSetup';
import BankDetails from './components/OwnerStep4/BankDetails';
import SecuritySection from './components/OwnerStep4/SecuritySection';
import SettlementVerification from './components/OwnerStep4/SettlementVerification';
import OwnerStep4Actions from './components/OwnerStep4/OwnerStep4Actions';

import registerOwner from './utils/ownerRegisterApi';

function OwnerStep4() {
  const navigate = useNavigate();

  const savedOwnerData = sessionStorage.getItem('rma_owner_registration');

  const ownerData = savedOwnerData ? JSON.parse(savedOwnerData) : null;

  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setLoading(true);
      setError('');

      const trimmedHolderName = bankHolderName.trim();
      const trimmedAccountNumber = bankAccountNumber.trim();
      const trimmedConfirmAccountNumber = confirmAccountNumber.trim();
      const normalizedIfsc = ifscCode.trim().toUpperCase();

      // ========================================
      // VALIDATION
      // ========================================

      if (!trimmedHolderName) {
        throw new Error('Account holder name is required');
      }

      if (!/^\d{9,18}$/.test(trimmedAccountNumber)) {
        throw new Error('Enter a valid bank account number');
      }

      if (trimmedAccountNumber !== trimmedConfirmAccountNumber) {
        throw new Error('Bank account numbers do not match');
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizedIfsc)) {
        throw new Error('Enter a valid IFSC code');
      }

      // ========================================
      // FINAL OWNER DATA
      // ========================================

      const finalOwnerData = {
        ...ownerData,

        bankHolderName: trimmedHolderName,

        bankAccountNumber: trimmedAccountNumber,

        ifscCode: normalizedIfsc,
      };

      console.log('FINAL OWNER DATA:', finalOwnerData);

      const data = await registerOwner(finalOwnerData);

      console.log('Owner registered successfully:', data);

      // Registration is complete
      sessionStorage.removeItem('rma_owner_registration');

      navigate('/owner/shop-created', {
        state: {
          owner: data.owner,
          paymentStatus: 'PENDING',
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
      <section className="owner_step4_card">
        <OwnerStep4Header />

        <OwnerStep4Progress />

        <PaymentSetup />

        <BankDetails
          bankHolderName={bankHolderName}
          setBankHolderName={setBankHolderName}
          bankAccountNumber={bankAccountNumber}
          setBankAccountNumber={setBankAccountNumber}
          confirmAccountNumber={confirmAccountNumber}
          setConfirmAccountNumber={setConfirmAccountNumber}
          ifscCode={ifscCode}
          setIfscCode={setIfscCode}
        />

        <SecuritySection />

        <SettlementVerification />

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
