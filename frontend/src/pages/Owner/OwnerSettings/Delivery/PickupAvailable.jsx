import './PickupAvailable.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PickupAvailable() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          throw new Error(data.message || 'Failed to load pickup status');
        }

        setPickup(Boolean(data.owner.pickup));

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  const handlePickupChange = async (newStatus) => {
    if (newStatus === pickup) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/pickup-available',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pickup: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update pickup availability');
      }

      setPickup(Boolean(data.owner.pickup));

      localStorage.setItem('rma_owner', JSON.stringify(data.owner));

      setSuccessMessage(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="owner_setting_page">
        <div className="owner_setting_card">
          <p className="owner_setting_loading">Loading pickup status...</p>
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
          ← Back
        </button>

        <div className="owner_setting_header">
          <p className="owner_setting_tag">DELIVERY SETTINGS</p>

          <h1>Pickup Available</h1>

          <p>
            Control whether customers can collect their orders directly from
            your shop.
          </p>
        </div>

        <div className="pickup_status_card">
          <div
            className={
              pickup
                ? 'pickup_status_icon available'
                : 'pickup_status_icon unavailable'
            }
          >
            {pickup ? '✓' : '×'}
          </div>

          <div className="pickup_status_content">
            <span className="pickup_status_label">Current Pickup Status</span>

            <strong
              className={
                pickup
                  ? 'pickup_status_value available'
                  : 'pickup_status_value unavailable'
              }
            >
              {pickup ? 'AVAILABLE' : 'UNAVAILABLE'}
            </strong>

            <p>
              {pickup
                ? 'Customers can choose to pick up their orders from your shop.'
                : 'Customers cannot currently choose shop pickup.'}
            </p>
          </div>
        </div>

        <div className="pickup_status_options">
          <button
            type="button"
            className={
              pickup
                ? 'pickup_status_option active available_option'
                : 'pickup_status_option available_option'
            }
            onClick={() => handlePickupChange(true)}
            disabled={saving}
          >
            <span className="pickup_status_option_icon">✓</span>

            <span>
              <strong>Enable Pickup</strong>
              <small>Allow customers to collect orders</small>
            </span>
          </button>

          <button
            type="button"
            className={
              !pickup
                ? 'pickup_status_option active unavailable_option'
                : 'pickup_status_option unavailable_option'
            }
            onClick={() => handlePickupChange(false)}
            disabled={saving}
          >
            <span className="pickup_status_option_icon">×</span>

            <span>
              <strong>Disable Pickup</strong>
              <small>Stop accepting pickup orders</small>
            </span>
          </button>
        </div>

        {saving && (
          <div className="pickup_status_saving">
            Updating pickup availability...
          </div>
        )}

        {error && <div className="owner_setting_error">{error}</div>}

        {successMessage && (
          <div className="owner_setting_success">{successMessage}</div>
        )}

        <div className="pickup_status_note">
          <strong>Important</strong>

          <span>
            Disabling pickup should only remove the pickup option for new
            orders. Existing orders should continue normally.
          </span>
        </div>
      </div>
    </div>
  );
}

export default PickupAvailable;
