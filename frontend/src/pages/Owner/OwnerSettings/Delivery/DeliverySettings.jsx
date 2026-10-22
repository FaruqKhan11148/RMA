import './DeliverySettings.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliverySettingsHeader from './components/DeliverySettings/DeliverySettingsHeader';
import DeliverySettingsMessages from './components/DeliverySettings/DeliverySettingsMessages';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function DeliverySettings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('rma_owner_token');

  useEffect(() => {
    if (!token) {
      navigate('/owner/login');
      return;
    }

    const fetchOwner = async () => {
      try {
        const response = await fetch(`${API_URL}api/owners/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load delivery settings');
        }

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  if (loading) {
    return (
      <div className="owner_setting_page">
        <div className="owner_setting_card">
          <p className="owner_setting_loading">Loading delivery settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner_setting_page">
      <div className="owner_setting_card">
        <DeliverySettingsHeader navigate={navigate} />

        <DeliverySettingsMessages error={error} successMessage="" />

        <p>
          RMA calculates delivery charges based on distance, with a fixed
          delivery radius of 5 km. Delivery timing is handled through the
          delivery workflow.
        </p>
      </div>
    </div>
  );
}

export default DeliverySettings;
