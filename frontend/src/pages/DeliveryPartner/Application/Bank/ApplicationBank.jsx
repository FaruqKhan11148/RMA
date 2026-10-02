import './ApplicationBank.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationBank() {
  const navigate = useNavigate();

  const [bank, setBank] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    proofImageUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const application = await fetchRmaApplication();

        setBank({
          accountHolderName: application?.bankAccount?.accountHolderName || '',
          accountNumber: application?.bankAccount?.accountNumber || '',
          ifsc: application?.bankAccount?.ifsc || '',
          bankName: application?.bankAccount?.bankName || '',
          proofImageUrl: application?.bankAccount?.proofImageUrl || '',
        });
      } catch (loadError) {
        console.error('Failed to load bank application:', loadError);

        setError(loadError.message || 'Unable to load your bank details.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setBank((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const accountHolderName = bank.accountHolderName.trim();
    const accountNumber = bank.accountNumber.trim();
    const ifsc = bank.ifsc.trim().toUpperCase();
    const bankName = bank.bankName.trim();
    const proofImageUrl = bank.proofImageUrl.trim();

    if (!accountHolderName) {
      setError('Please enter the account holder name.');
      return;
    }

    if (!accountNumber) {
      setError('Please enter your bank account number.');
      return;
    }

    if (!/^\d{9,18}$/.test(accountNumber)) {
      setError('Please enter a valid bank account number.');
      return;
    }

    if (!ifsc) {
      setError('Please enter your IFSC code.');
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setError('Please enter a valid IFSC code.');
      return;
    }

    if (!bankName) {
      setError('Please enter your bank name.');
      return;
    }

    if (!proofImageUrl) {
      setError('Please provide your bank proof image.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('bankAccount', {
        accountHolderName,
        accountNumber,
        ifsc,
        bankName,
        proofImageUrl,
      });

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save bank details:', saveError);

      setError(saveError.message || 'Unable to save your bank details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="application_bank_page">
        <section className="application_bank_card">
          <div className="application_bank_loading">
            Loading your bank details...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="application_bank_page">
      <section className="application_bank_card">
        <button
          type="button"
          className="application_bank_back"
          onClick={() => navigate('/delivery-partner/application')}
          disabled={saving}
        >
          ← Back
        </button>

        <div className="application_bank_header">
          <div className="application_bank_icon">₹</div>

          <h1>Bank Details</h1>

          <p>
            Add the bank account where your delivery earnings will be settled.
          </p>
        </div>

        <div className="application_bank_security_notice">
          <strong>Keep your bank details secure</strong>
          <p>
            Enter your own bank account details carefully. RMA will use these
            details for delivery earnings settlements after approval.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="application_bank_field">
            <label htmlFor="bank-account-holder">Account Holder Name</label>

            <input
              id="bank-account-holder"
              name="accountHolderName"
              type="text"
              placeholder="Enter account holder name"
              value={bank.accountHolderName}
              onChange={handleChange}
              disabled={saving}
              autoComplete="name"
            />
          </div>

          <div className="application_bank_field">
            <label htmlFor="bank-account-number">Account Number</label>

            <input
              id="bank-account-number"
              name="accountNumber"
              type="password"
              inputMode="numeric"
              placeholder="Enter bank account number"
              value={bank.accountNumber}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '');

                setBank((previous) => ({
                  ...previous,
                  accountNumber: value,
                }));
              }}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="application_bank_field">
            <label htmlFor="bank-ifsc">IFSC Code</label>

            <input
              id="bank-ifsc"
              name="ifsc"
              type="text"
              placeholder="Example: SBIN0001234"
              value={bank.ifsc}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\s/g, '')
                  .toUpperCase();

                setBank((previous) => ({
                  ...previous,
                  ifsc: value,
                }));
              }}
              maxLength={11}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="application_bank_field">
            <label htmlFor="bank-name">Bank Name</label>

            <input
              id="bank-name"
              name="bankName"
              type="text"
              placeholder="Enter bank name"
              value={bank.bankName}
              onChange={handleChange}
              disabled={saving}
              autoComplete="organization"
            />
          </div>

          <div className="application_bank_field">
            <label htmlFor="bank-proof">Bank Proof Image URL</label>

            <input
              id="bank-proof"
              name="proofImageUrl"
              type="url"
              placeholder="Paste bank proof image URL"
              value={bank.proofImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {bank.proofImageUrl && (
              <div className="application_bank_preview">
                <img src={bank.proofImageUrl} alt="Bank proof" />
              </div>
            )}
          </div>

          {error && <div className="application_bank_error">{error}</div>}

          <button
            type="submit"
            className="application_bank_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </form>

        <div className="application_bank_info">
          <strong>Bank details requirements</strong>

          <p>• Use an account belonging to you.</p>
          <p>• Make sure the account number is correct.</p>
          <p>• Enter the correct IFSC code.</p>
          <p>• Provide a clear bank proof document.</p>
          <p>• Bank details will be reviewed by RMA.</p>
        </div>
      </section>
    </main>
  );
}

export default ApplicationBank;
