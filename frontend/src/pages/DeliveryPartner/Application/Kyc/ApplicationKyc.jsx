import './ApplicationKyc.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationKyc() {
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [selfieImageUrl, setSelfieImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const application = await fetchRmaApplication();

        setDocumentType(application?.kyc?.documentType || '');

        setDocumentNumber(application?.kyc?.documentNumber || '');

        setFrontImageUrl(application?.kyc?.frontImageUrl || '');

        setBackImageUrl(application?.kyc?.backImageUrl || '');

        setSelfieImageUrl(application?.kyc?.selfieImageUrl || '');
      } catch (loadError) {
        console.error('Failed to load KYC application:', loadError);

        setError(loadError.message || 'Unable to load your KYC details.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const trimmedDocumentNumber = documentNumber.trim();

    if (!documentType) {
      setError('Please select a KYC document.');
      return;
    }

    if (!trimmedDocumentNumber) {
      setError('Please enter your document number.');
      return;
    }

    if (!frontImageUrl.trim()) {
      setError('Please add the front side of your document.');
      return;
    }

    if (!backImageUrl.trim()) {
      setError('Please add the back side of your document.');
      return;
    }

    if (!selfieImageUrl.trim()) {
      setError('Please add your selfie.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('kyc', {
        documentType,
        documentNumber: trimmedDocumentNumber,
        frontImageUrl: frontImageUrl.trim(),
        backImageUrl: backImageUrl.trim(),
        selfieImageUrl: selfieImageUrl.trim(),
      });

      setSuccess('KYC details saved successfully.');

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save KYC details:', saveError);

      setError(saveError.message || 'Unable to save your KYC details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="delivery_application_kyc_page">
        <div className="delivery_application_kyc_loading">Loading...</div>
      </main>
    );
  }

  return (
    <main className="delivery_application_kyc_page">
      <div className="delivery_application_kyc_container">
        <button
          type="button"
          className="delivery_application_kyc_back"
          onClick={() => navigate('/delivery-partner/application')}
        >
          ← Back to Application
        </button>

        <div className="delivery_application_kyc_header">
          <span>Step 3 of 6</span>

          <h1>KYC Verification</h1>

          <p>
            Submit your identity document and verification photos for RMA
            review.
          </p>
        </div>

        <div className="delivery_application_kyc_notice">
          <strong>Important</strong>

          <p>
            Make sure the document images are clear and all details are visible.
          </p>
        </div>

        <form className="delivery_application_kyc_form" onSubmit={handleSubmit}>
          <div className="delivery_application_kyc_card">
            <div className="delivery_application_kyc_field">
              <label htmlFor="kyc-document-type">Document Type</label>

              <select
                id="kyc-document-type"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                disabled={saving}
              >
                <option value="">Select document</option>

                <option value="AADHAAR">Aadhaar</option>

                <option value="PAN">PAN Card</option>

                <option value="VOTER_ID">Voter ID</option>

                <option value="PASSPORT">Passport</option>
              </select>
            </div>

            <div className="delivery_application_kyc_field">
              <label htmlFor="kyc-document-number">Document Number</label>

              <input
                id="kyc-document-number"
                type="text"
                placeholder="Enter document number"
                value={documentNumber}
                onChange={(event) => setDocumentNumber(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_kyc_field">
              <label htmlFor="kyc-front">Document Front Image</label>

              <input
                id="kyc-front"
                type="url"
                placeholder="Paste front image URL"
                value={frontImageUrl}
                onChange={(event) => setFrontImageUrl(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_kyc_field">
              <label htmlFor="kyc-back">Document Back Image</label>

              <input
                id="kyc-back"
                type="url"
                placeholder="Paste back image URL"
                value={backImageUrl}
                onChange={(event) => setBackImageUrl(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_kyc_field">
              <label htmlFor="kyc-selfie">Selfie</label>

              <input
                id="kyc-selfie"
                type="url"
                placeholder="Paste selfie image URL"
                value={selfieImageUrl}
                onChange={(event) => setSelfieImageUrl(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_kyc_previews">
              {frontImageUrl.trim() && (
                <div>
                  <span>Front</span>

                  <img src={frontImageUrl} alt="KYC document front" />
                </div>
              )}

              {backImageUrl.trim() && (
                <div>
                  <span>Back</span>

                  <img src={backImageUrl} alt="KYC document back" />
                </div>
              )}

              {selfieImageUrl.trim() && (
                <div>
                  <span>Selfie</span>

                  <img src={selfieImageUrl} alt="KYC selfie" />
                </div>
              )}
            </div>

            {error && (
              <div className="delivery_application_kyc_error">{error}</div>
            )}

            {success && (
              <div className="delivery_application_kyc_success">{success}</div>
            )}

            <button
              type="submit"
              className="delivery_application_kyc_button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ApplicationKyc;
