import './DeliverySettings.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliverySettingsHeader from './components/DeliverySettings/DeliverySettingsHeader';
import DeliveryRadiusField from './components/DeliverySettings/DeliveryRadiusField';
import MinimumOrderAmountField from './components/DeliverySettings/MinimumOrderAmountField';
import DeliveryChargeField from './components/DeliverySettings/DeliveryChargeField';
import FreeDeliveryField from './components/DeliverySettings/FreeDeliveryField';
import EstimatedDeliveryTimeField from './components/DeliverySettings/EstimatedDeliveryTimeField';
import DeliverySettingsMessages from './components/DeliverySettings/DeliverySettingsMessages';
import OpeningTimeField from './components/DeliverySettings/OpeningTimeField';
import ClosingTimeField from './components/DeliverySettings/ClosingTimeField';
import ShopStatusField from './components/DeliverySettings/ShopStatusField';

function DeliverySettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    deliveryRadius: '',
    minimumOrderAmount: '',
    deliveryCharge: '',
    freeDeliveryAbove: '',
    estimatedDeliveryTime: '',
    openingTime: '10:00',
    closingTime: '22:00',
    shopStatusMode: 'auto',
  });

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
          throw new Error(data.message || 'Failed to load delivery settings');
        }

        const deliverySettings = data.owner.deliverySettings || {};

        setSettings({
          deliveryRadius: deliverySettings.deliveryRadius ?? 5,
          minimumOrderAmount: deliverySettings.minimumOrderAmount ?? 0,
          deliveryCharge: deliverySettings.deliveryCharge ?? 20,
          freeDeliveryAbove: deliverySettings.freeDeliveryAbove ?? 0,
          estimatedDeliveryTime: deliverySettings.estimatedDeliveryTime ?? 45,
          openingTime: deliverySettings.openingTime ?? '10:00',
          closingTime: deliverySettings.closingTime ?? '22:00',
          shopStatusMode: deliverySettings.shopStatusMode ?? 'auto',
        });

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
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

    const deliveryRadius = Number(settings.deliveryRadius);
    const minimumOrderAmount = Number(settings.minimumOrderAmount);
    const deliveryCharge = Number(settings.deliveryCharge);
    const freeDeliveryAbove = Number(settings.freeDeliveryAbove);
    const estimatedDeliveryTime = Number(settings.estimatedDeliveryTime);

    const openingTime = settings.openingTime;
    const closingTime = settings.closingTime;
    const shopStatusMode = settings.shopStatusMode;

    if (!Number.isFinite(deliveryRadius) || deliveryRadius <= 0) {
      setError('Delivery radius must be greater than 0.');
      return;
    }

    if (!Number.isFinite(minimumOrderAmount) || minimumOrderAmount < 0) {
      setError('Minimum order amount cannot be negative.');
      return;
    }

    if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
      setError('Delivery charge cannot be negative.');
      return;
    }

    if (!Number.isFinite(freeDeliveryAbove) || freeDeliveryAbove < 0) {
      setError('Free delivery amount cannot be negative.');
      return;
    }

    if (!Number.isFinite(estimatedDeliveryTime) || estimatedDeliveryTime <= 0) {
      setError('Estimated delivery time must be greater than 0.');
      return;
    }

    try {
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openingTime)) {
        setError('Opening time must be in HH:mm format.');
        return;
      }

      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(closingTime)) {
        setError('Closing time must be in HH:mm format.');
        return;
      }

      if (!['auto', 'open', 'closed'].includes(shopStatusMode)) {
        setError('Invalid shop status mode.');
        return;
      }
      setSaving(true);

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/delivery-settings',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deliveryRadius: Number(deliveryRadius),
            minimumOrderAmount: Number(minimumOrderAmount),
            deliveryCharge: Number(deliveryCharge),
            freeDeliveryAbove: Number(freeDeliveryAbove),
            estimatedDeliveryTime: Number(estimatedDeliveryTime),
            openingTime,
            closingTime,
            shopStatusMode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update delivery settings');
      }

      const updatedSettings = data.owner.deliverySettings || {};

      setSettings({
        deliveryRadius: updatedSettings.deliveryRadius ?? 5,
        minimumOrderAmount: updatedSettings.minimumOrderAmount ?? 0,
        deliveryCharge: updatedSettings.deliveryCharge ?? 20,
        freeDeliveryAbove: updatedSettings.freeDeliveryAbove ?? 0,
        estimatedDeliveryTime: updatedSettings.estimatedDeliveryTime ?? 45,
        openingTime: updatedSettings.openingTime ?? '10:00',
        closingTime: updatedSettings.closingTime ?? '22:00',
        shopStatusMode: updatedSettings.shopStatusMode ?? 'auto',
      });

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
          <p className="owner_setting_loading">Loading delivery settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner_setting_page">
      <div className="owner_setting_card">
        <DeliverySettingsHeader navigate={navigate} />

        <form className="delivery_settings_form" onSubmit={handleSubmit}>
          <DeliveryRadiusField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <MinimumOrderAmountField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <DeliveryChargeField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <FreeDeliveryField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <EstimatedDeliveryTimeField
            settings={settings}
            handleChange={handleChange}
            saving={saving}
          />

          <DeliverySettingsMessages
            error={error}
            successMessage={successMessage}
          />

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

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Delivery Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DeliverySettings;
