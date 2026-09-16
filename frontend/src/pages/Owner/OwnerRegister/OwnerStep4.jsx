import './OwnerStep4.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

      // ========================================
      // CREATE OWNER
      // ========================================

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalOwnerData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Owner registration failed');
      }

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
        {/* HEADER */}

        <div className="owner_step4_header">
          <div className="owner_logo">RMA</div>

          <p className="step_number">STEP 4 OF 4</p>

          <h1>Payment & Settlement</h1>

          <p>Add your bank account details for receiving future settlements.</p>
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

        {/* BANK DETAILS */}

        <section className="payment_setup">
          <div className="payment_icon">₹</div>

          <h2>Bank Account Details</h2>

          <p>
            Enter the bank account where your future shop settlements will be
            received.
          </p>
        </section>

        <section className="bank_details_section">
          {/* ACCOUNT HOLDER */}

          <div className="bank_field">
            <label htmlFor="bankHolderName">Account Holder Name</label>

            <input
              id="bankHolderName"
              type="text"
              value={bankHolderName}
              onChange={(event) => setBankHolderName(event.target.value)}
              placeholder="Enter account holder name"
              autoComplete="name"
            />
          </div>

          {/* ACCOUNT NUMBER */}

          <div className="bank_field">
            <label htmlFor="bankAccountNumber">Account Number</label>

            <input
              id="bankAccountNumber"
              type="text"
              inputMode="numeric"
              value={bankAccountNumber}
              onChange={(event) =>
                setBankAccountNumber(event.target.value.replace(/\D/g, ''))
              }
              placeholder="Enter bank account number"
              autoComplete="off"
              maxLength={18}
            />
          </div>

          {/* CONFIRM ACCOUNT NUMBER */}

          <div className="bank_field">
            <label htmlFor="confirmAccountNumber">Confirm Account Number</label>

            <input
              id="confirmAccountNumber"
              type="text"
              inputMode="numeric"
              value={confirmAccountNumber}
              onChange={(event) =>
                setConfirmAccountNumber(event.target.value.replace(/\D/g, ''))
              }
              placeholder="Re-enter bank account number"
              autoComplete="off"
              maxLength={18}
            />
          </div>

          {/* IFSC */}

          <div className="bank_field">
            <label htmlFor="ifscCode">IFSC Code</label>

            <input
              id="ifscCode"
              type="text"
              value={ifscCode}
              onChange={(event) =>
                setIfscCode(
                  event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                )
              }
              placeholder="Enter IFSC code"
              autoComplete="off"
              maxLength={11}
            />
          </div>
        </section>

        {/* SECURITY */}

        <section className="security_section">
          <strong>Your bank information is secure</strong>

          <p>
            Your bank details are collected for settlement purposes. RMA does
            not require your banking password, PIN, CVV, or OTP.
          </p>
        </section>

        {/* REVIEW STATUS */}

        <section className="settlement_section">
          <h2>Settlement Verification</h2>

          <div className="settlement_steps">
            <div className="settlement_step">
              <span>1</span>

              <div>
                <strong>Submit Bank Details</strong>

                <p>
                  Your bank account details will be submitted with your shop
                  registration.
                </p>
              </div>
            </div>

            <div className="settlement_step">
              <span>2</span>

              <div>
                <strong>RMA Verification</strong>

                <p>
                  An RMA administrator will review and approve your settlement
                  account.
                </p>
              </div>
            </div>

            <div className="settlement_step">
              <span>3</span>

              <div>
                <strong>PayU Onboarding</strong>

                <p>
                  PayU child-merchant onboarding will be connected when the
                  required PayU access is enabled.
                </p>
              </div>
            </div>

            <div className="settlement_step">
              <span>4</span>

              <div>
                <strong>Receive Settlements</strong>

                <p>
                  Once the settlement account is activated, future eligible
                  settlements can be processed.
                </p>
              </div>
            </div>
          </div>
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
            onClick={handleCreateShop}
            disabled={loading}
          >
            {loading ? 'Creating Shop...' : 'Submit & Create Shop'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerStep4;
