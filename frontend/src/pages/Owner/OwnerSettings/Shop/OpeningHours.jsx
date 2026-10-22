import './OpeningHours.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OpeningTimeField from '../Delivery/components/DeliverySettings/OpeningTimeField';
import ClosingTimeField from '../Delivery/components/DeliverySettings/ClosingTimeField';
import ShopStatusField from '../Delivery/components/DeliverySettings/ShopStatusField';
import DeliverySettingsMessages from '../Delivery/components/DeliverySettings/DeliverySettingsMessages';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function OpeningHours() {
  const navigate = useNavigate();
  const token = localStorage.getItem('rma_owner_token');

  const [settings, setSettings] = useState({
    openingTime: '10:00',
    closingTime: '22:00',
    shopStatusMode: 'auto',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          throw new Error(data.message || 'Failed to load opening hours');
        }

        const deliverySettings = data.owner.deliverySettings || {};

        setSettings({
          openingTime: deliverySettings.openingTime ?? '10:00',
          closingTime: deliverySettings.closingTime ?? '22:00',
          shopStatusMode: deliverySettings.shopStatusMode ?? 'auto',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    const { openingTime, closingTime, shopStatusMode } = settings;
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
      setError('Please enter valid opening and closing times.');
      return;
    }

    if (!['auto', 'open', 'closed'].includes(shopStatusMode)) {
      setError('Please select a valid shop status mode.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}api/owners/settings/opening-hours`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            openingTime,
            closingTime,
            shopStatusMode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save opening hours');
      }

      if (data.owner) {
        const previousOwner = JSON.parse(
          localStorage.getItem('rma_owner') || '{}',
        );

        localStorage.setItem(
          'rma_owner',
          JSON.stringify({
            ...previousOwner,
            ...data.owner,
          }),
        );
      }

      setSuccessMessage(data.message || 'Opening hours saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="owner_setting_page">
        <div className="owner_setting_card">
          <p className="owner_setting_loading">Loading opening hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner_setting_page">
      <div className="owner_setting_card">
        <div className="opening_hours_header">
          <button
            type="button"
            className="opening_hours_back"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>
          <h2>Opening Hours</h2>
        </div>

        <p>Set when your shop is available to RMA customers.</p>

        <form className="delivery_settings_form" onSubmit={handleSubmit}>
          <OpeningTimeField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <ClosingTimeField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <ShopStatusField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <DeliverySettingsMessages
            error={error}
            successMessage={successMessage}
          />

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Opening Hours'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OpeningHours;
