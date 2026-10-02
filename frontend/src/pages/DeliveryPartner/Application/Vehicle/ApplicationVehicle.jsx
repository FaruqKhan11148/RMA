import './ApplicationVehicle.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationVehicle() {
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    type: '',
    registrationNumber: '',
    rcImageUrl: '',
    insuranceImageUrl: '',
    insuranceExpiry: '',
    pucImageUrl: '',
    pucExpiry: '',
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

        setVehicle({
          type: application?.vehicle?.type || '',
          registrationNumber: application?.vehicle?.registrationNumber || '',
          rcImageUrl: application?.vehicle?.rcImageUrl || '',
          insuranceImageUrl: application?.vehicle?.insuranceImageUrl || '',
          insuranceExpiry: application?.vehicle?.insuranceExpiry
            ? application.vehicle.insuranceExpiry.slice(0, 10)
            : '',
          pucImageUrl: application?.vehicle?.pucImageUrl || '',
          pucExpiry: application?.vehicle?.pucExpiry
            ? application.vehicle.pucExpiry.slice(0, 10)
            : '',
        });
      } catch (loadError) {
        console.error('Failed to load vehicle application:', loadError);

        setError(loadError.message || 'Unable to load your vehicle details.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setVehicle((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const registrationNumber = vehicle.registrationNumber.trim().toUpperCase();

    const rcImageUrl = vehicle.rcImageUrl.trim();
    const insuranceImageUrl = vehicle.insuranceImageUrl.trim();
    const pucImageUrl = vehicle.pucImageUrl.trim();

    if (!vehicle.type) {
      setError('Please select your vehicle type.');
      return;
    }

    if (!registrationNumber) {
      setError('Please enter your vehicle registration number.');
      return;
    }

    if (!rcImageUrl) {
      setError('Please provide your RC image.');
      return;
    }

    if (!insuranceImageUrl) {
      setError('Please provide your insurance image.');
      return;
    }

    if (!vehicle.insuranceExpiry) {
      setError('Please enter your insurance expiry date.');
      return;
    }

    if (!vehicle.pucImageUrl.trim()) {
      setError('Please provide your PUC image.');
      return;
    }

    if (!vehicle.pucExpiry) {
      setError('Please enter your PUC expiry date.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const insuranceExpiry = new Date(vehicle.insuranceExpiry);
    insuranceExpiry.setHours(0, 0, 0, 0);

    if (insuranceExpiry <= today) {
      setError('Your vehicle insurance must not be expired.');
      return;
    }

    const pucExpiry = new Date(vehicle.pucExpiry);
    pucExpiry.setHours(0, 0, 0, 0);

    if (pucExpiry <= today) {
      setError('Your PUC must not be expired.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('vehicle', {
        type: vehicle.type,
        registrationNumber,
        rcImageUrl,
        insuranceImageUrl,
        insuranceExpiry: vehicle.insuranceExpiry,
        pucImageUrl,
        pucExpiry: vehicle.pucExpiry,
      });

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save vehicle details:', saveError);

      setError(saveError.message || 'Unable to save your vehicle details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="application_vehicle_page">
        <section className="application_vehicle_card">
          <div className="application_vehicle_loading">
            Loading your vehicle details...
          </div>
        </section>
      </main>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="application_vehicle_page">
      <section className="application_vehicle_card">
        <button
          type="button"
          className="application_vehicle_back"
          onClick={() => navigate('/delivery-partner/application')}
          disabled={saving}
        >
          ← Back
        </button>

        <div className="application_vehicle_header">
          <div className="application_vehicle_icon">V</div>

          <h1>Vehicle Details</h1>

          <p>Add the vehicle you will use for RMA deliveries.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="application_vehicle_field">
            <label htmlFor="vehicle-type">Vehicle Type</label>

            <select
              id="vehicle-type"
              name="type"
              value={vehicle.type}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="">Select vehicle type</option>
              <option value="BIKE">Bike</option>
              <option value="SCOOTER">Scooter</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-registration-number">
              Registration Number
            </label>

            <input
              id="vehicle-registration-number"
              name="registrationNumber"
              type="text"
              placeholder="Example: KA01AB1234"
              value={vehicle.registrationNumber}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-rc">RC Image URL</label>

            <input
              id="vehicle-rc"
              name="rcImageUrl"
              type="url"
              placeholder="Paste RC image URL"
              value={vehicle.rcImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {vehicle.rcImageUrl && (
              <div className="application_vehicle_preview">
                <img src={vehicle.rcImageUrl} alt="Vehicle RC" />
              </div>
            )}
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-insurance">Insurance Image URL</label>

            <input
              id="vehicle-insurance"
              name="insuranceImageUrl"
              type="url"
              placeholder="Paste insurance image URL"
              value={vehicle.insuranceImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {vehicle.insuranceImageUrl && (
              <div className="application_vehicle_preview">
                <img src={vehicle.insuranceImageUrl} alt="Vehicle insurance" />
              </div>
            )}
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-insurance-expiry">
              Insurance Expiry Date
            </label>

            <input
              id="vehicle-insurance-expiry"
              name="insuranceExpiry"
              type="date"
              min={today}
              value={vehicle.insuranceExpiry}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-puc">PUC Image URL</label>

            <input
              id="vehicle-puc"
              name="pucImageUrl"
              type="url"
              placeholder="Paste PUC image URL"
              value={vehicle.pucImageUrl}
              onChange={handleChange}
              disabled={saving}
              autoComplete="off"
            />

            {vehicle.pucImageUrl && (
              <div className="application_vehicle_preview">
                <img src={vehicle.pucImageUrl} alt="Vehicle PUC" />
              </div>
            )}
          </div>

          <div className="application_vehicle_field">
            <label htmlFor="vehicle-puc-expiry">PUC Expiry Date</label>

            <input
              id="vehicle-puc-expiry"
              name="pucExpiry"
              type="date"
              min={today}
              value={vehicle.pucExpiry}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          {error && <div className="application_vehicle_error">{error}</div>}

          <button
            type="submit"
            className="application_vehicle_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Vehicle Details'}
          </button>
        </form>

        <div className="application_vehicle_info">
          <strong>Vehicle requirements</strong>

          <p>• Select the vehicle you will use for deliveries.</p>
          <p>• Enter the correct registration number.</p>
          <p>• Provide clear RC, insurance and PUC documents.</p>
          <p>• Insurance and PUC must be valid.</p>
          <p>• Documents will be reviewed by RMA.</p>
        </div>
      </section>
    </main>
  );
}

export default ApplicationVehicle;
