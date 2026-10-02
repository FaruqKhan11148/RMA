import './ApplicationDrivingLicence.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationDrivingLicence() {
  const navigate = useNavigate();

  const [licence, setLicence] = useState({
    number: '',
    expiryDate: '',
    frontImageUrl: '',
    backImageUrl: '',
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

        setLicence({
          number: application?.drivingLicence?.number || '',
          expiryDate: application?.drivingLicence?.expiryDate
            ? application.drivingLicence.expiryDate.slice(0, 10)
            : '',
          frontImageUrl: application?.drivingLicence?.frontImageUrl || '',
          backImageUrl: application?.drivingLicence?.backImageUrl || '',
        });
      } catch (loadError) {
        console.error('Failed to load driving licence application:', loadError);

        setError(
          loadError.message || 'Unable to load your driving licence details.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLicence((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const trimmedNumber = licence.number.trim();
    const trimmedFrontImageUrl = licence.frontImageUrl.trim();
    const trimmedBackImageUrl = licence.backImageUrl.trim();

    if (!trimmedNumber) {
      setError('Please enter your driving licence number.');
      return;
    }

    if (!licence.expiryDate) {
      setError('Please enter your driving licence expiry date.');
      return;
    }

    const expiryDate = new Date(licence.expiryDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate <= today) {
      setError('Your driving licence must not be expired.');
      return;
    }

    if (!trimmedFrontImageUrl) {
      setError('Please provide the front image of your driving licence.');
      return;
    }

    if (!trimmedBackImageUrl) {
      setError('Please provide the back image of your driving licence.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('drivingLicence', {
        number: trimmedNumber,
        expiryDate: licence.expiryDate,
        frontImageUrl: trimmedFrontImageUrl,
        backImageUrl: trimmedBackImageUrl,
      });

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save driving licence details:', saveError);

      setError(
        saveError.message || 'Unable to save your driving licence details.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="application_driving_licence_page">
        <section className="application_driving_licence_card">
          <div className="application_driving_licence_loading">
            Loading your driving licence details...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="application_driving_licence_page">
      <section className="application_driving_licence_card">
        <button
          type="button"
          className="application_driving_licence_back"
          onClick={() => navigate('/delivery-partner/application')}
          disabled={saving}
        >
          ← Back
        </button>

        <div className="application_driving_licence_header">
          <div className="application_driving_licence_icon">DL</div>

          <h1>Driving Licence</h1>

          <p>Add your driving licence details and document images.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="application_driving_licence_field">
            <label htmlFor="driving-licence-number">
              Driving Licence Number
            </label>

            <input
              id="driving-licence-number"
              name="number"
              type="text"
              placeholder="Enter your licence number"
              value={licence.number}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="application_driving_licence_field">
            <label htmlFor="driving-licence-expiry">Expiry Date</label>

            <input
              id="driving-licence-expiry"
              name="expiryDate"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={licence.expiryDate}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="application_driving_licence_field">
            <label htmlFor="driving-licence-front">Front Image URL</label>

            <input
              id="driving-licence-front"
              name="frontImageUrl"
              type="url"
              placeholder="Paste front image URL"
              value={licence.frontImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {licence.frontImageUrl && (
              <div className="application_driving_licence_preview">
                <img src={licence.frontImageUrl} alt="Driving licence front" />
              </div>
            )}
          </div>

          <div className="application_driving_licence_field">
            <label htmlFor="driving-licence-back">Back Image URL</label>

            <input
              id="driving-licence-back"
              name="backImageUrl"
              type="url"
              placeholder="Paste back image URL"
              value={licence.backImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {licence.backImageUrl && (
              <div className="application_driving_licence_preview">
                <img src={licence.backImageUrl} alt="Driving licence back" />
              </div>
            )}
          </div>

          {error && (
            <div className="application_driving_licence_error">{error}</div>
          )}

          <button
            type="submit"
            className="application_driving_licence_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Driving Licence'}
          </button>
        </form>

        <div className="application_driving_licence_info">
          <strong>Document requirements</strong>

          <p>• Enter your valid driving licence number.</p>
          <p>• Make sure the expiry date is correct.</p>
          <p>• Provide clear front and back images.</p>
          <p>• Your documents will be reviewed by RMA.</p>
        </div>
      </section>
    </main>
  );
}

export default ApplicationDrivingLicence;
