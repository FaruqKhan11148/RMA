import './PickupAvailable.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PickupAvailableHeader from './components/PickupAvailable/PickupAvailableHeader';
import PickupStatusCard from './components/PickupAvailable/PickupStatusCard';
import PickupStatusOptions from './components/PickupAvailable/PickupStatusOptions';
import PickupStatusMessages from './components/PickupAvailable/PickupStatusMessages';
import PickupStatusNote from './components/PickupAvailable/PickupStatusNote';

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
        <PickupAvailableHeader navigate={navigate} />

        <PickupStatusCard pickup={pickup} />

        <PickupStatusOptions
          pickup={pickup}
          handlePickupChange={handlePickupChange}
          saving={saving}
        />

        <PickupStatusMessages
          saving={saving}
          error={error}
          successMessage={successMessage}
        />

        <PickupStatusNote />
      </div>
    </div>
  );
}

export default PickupAvailable;
