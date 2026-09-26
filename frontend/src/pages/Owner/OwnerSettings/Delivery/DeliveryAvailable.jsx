import './DeliveryAvailable.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliveryAvailableHeader from './components/DeliveryAvailable/DeliveryAvailableHeader';
import DeliveryStatusCard from './components/DeliveryAvailable/DeliveryStatusCard';
import DeliveryStatusOptions from './components/DeliveryAvailable/DeliveryStatusOptions';
import DeliveryAvailableMessages from './components/DeliveryAvailable/DeliveryAvailableMessages';
import DeliveryAvailableNote from './components/DeliveryAvailable/DeliveryAvailableNote';

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
          ← Delivery Settings
        </button>

        <DeliveryAvailableHeader />

        <DeliveryStatusCard delivery={delivery} />

        <DeliveryStatusOptions
          delivery={delivery}
          handleDeliveryChange={handleDeliveryChange}
          saving={saving}
        />

        <DeliveryAvailableMessages
          saving={saving}
          error={error}
          successMessage={successMessage}
        />

        <DeliveryAvailableNote />
      </div>
    </div>
  );
}

export default DeliveryAvailable;
