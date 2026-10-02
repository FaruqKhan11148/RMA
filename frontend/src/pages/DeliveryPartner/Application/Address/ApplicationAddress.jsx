import './ApplicationAddress.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationAddress() {
  const navigate = useNavigate();

  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

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

        setAddressLine(application?.address?.addressLine || '');
        setCity(application?.address?.city || '');
        setState(application?.address?.state || '');
        setPincode(application?.address?.pincode || '');
      } catch (loadError) {
        console.error('Failed to load delivery partner address:', loadError);

        setError(loadError.message || 'Unable to load your address.');
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

    const trimmedAddress = addressLine.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedAddress) {
      setError('Please enter your address.');
      return;
    }

    if (!trimmedCity) {
      setError('Please enter your city.');
      return;
    }

    if (!trimmedState) {
      setError('Please enter your state.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedPincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('address', {
        addressLine: trimmedAddress,
        city: trimmedCity,
        state: trimmedState,
        pincode: trimmedPincode,
      });

      setSuccess('Address saved successfully.');

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save delivery partner address:', saveError);

      setError(saveError.message || 'Unable to save your address.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="delivery_application_address_page">
        <div className="delivery_application_address_loading">Loading...</div>
      </main>
    );
  }

  return (
    <main className="delivery_application_address_page">
      <div className="delivery_application_address_container">
        <button
          type="button"
          className="delivery_application_address_back"
          onClick={() => navigate('/delivery-partner/application')}
        >
          ← Back to Application
        </button>

        <div className="delivery_application_address_header">
          <span>Step 2 of 6</span>

          <h1>Address</h1>

          <p>
            Enter your current residential address. This helps RMA verify your
            application and delivery service area.
          </p>
        </div>

        <form
          className="delivery_application_address_form"
          onSubmit={handleSubmit}
        >
          <div className="delivery_application_address_card">
            <div className="delivery_application_address_field">
              <label htmlFor="delivery-address">Address</label>

              <textarea
                id="delivery-address"
                rows="4"
                placeholder="House number, street, area"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_address_field">
              <label htmlFor="delivery-city">City</label>

              <input
                id="delivery-city"
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_address_field">
              <label htmlFor="delivery-state">State</label>

              <input
                id="delivery-state"
                type="text"
                placeholder="Enter your state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_address_field">
              <label htmlFor="delivery-pincode">Pincode</label>

              <input
                id="delivery-pincode"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, '');

                  setPincode(value);
                }}
                disabled={saving}
              />
            </div>

            {error && (
              <div className="delivery_application_address_error">{error}</div>
            )}

            {success && (
              <div className="delivery_application_address_success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="delivery_application_address_button"
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

export default ApplicationAddress;
