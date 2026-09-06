import './DeliveryAvailable.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DeliveryAvailable() {
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(false);
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
          throw new Error(data.message || 'Failed to load delivery status');
        }

        setDelivery(Boolean(data.owner.delivery));

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  const handleDeliveryChange = async (newStatus) => {
    if (newStatus === delivery) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/delivery-available',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            delivery: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update delivery availability',
        );
      }

      setDelivery(Boolean(data.owner.delivery));

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
          <p className="owner_setting_loading">Loading delivery status...</p>
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

          <h1>Delivery Available</h1>

          <p>
            Control whether customers can choose delivery when ordering from
            your shop.
          </p>
        </div>

        <div className="delivery_status_card">
          <div
            className={
              delivery
                ? 'delivery_status_icon available'
                : 'delivery_status_icon unavailable'
            }
          >
            {delivery ? '✓' : '×'}
          </div>

          <div className="delivery_status_content">
            <span className="delivery_status_label">
              Current Delivery Status
            </span>

            <strong
              className={
                delivery
                  ? 'delivery_status_value available'
                  : 'delivery_status_value unavailable'
              }
            >
              {delivery ? 'AVAILABLE' : 'UNAVAILABLE'}
            </strong>

            <p>
              {delivery
                ? 'Customers can choose delivery for their orders.'
                : 'Customers will not be able to choose delivery for new orders.'}
            </p>
          </div>
        </div>

        <div className="delivery_status_options">
          <button
            type="button"
            className={
              delivery
                ? 'delivery_status_option active available_option'
                : 'delivery_status_option available_option'
            }
            onClick={() => handleDeliveryChange(true)}
            disabled={saving}
          >
            <span className="delivery_status_option_icon">✓</span>

            <span>
              <strong>Enable Delivery</strong>
              <small>Allow customers to order delivery</small>
            </span>
          </button>

          <button
            type="button"
            className={
              !delivery
                ? 'delivery_status_option active unavailable_option'
                : 'delivery_status_option unavailable_option'
            }
            onClick={() => handleDeliveryChange(false)}
            disabled={saving}
          >
            <span className="delivery_status_option_icon">×</span>

            <span>
              <strong>Disable Delivery</strong>
              <small>Stop accepting delivery orders</small>
            </span>
          </button>
        </div>

        {saving && (
          <div className="delivery_status_saving">
            Updating delivery availability...
          </div>
        )}

        {error && <div className="owner_setting_error">{error}</div>}

        {successMessage && (
          <div className="owner_setting_success">{successMessage}</div>
        )}

        <div className="delivery_status_note">
          <strong>Important</strong>

          <span>
            Disabling delivery should only remove the delivery option for new
            orders. Existing orders should continue normally.
          </span>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAvailable;
