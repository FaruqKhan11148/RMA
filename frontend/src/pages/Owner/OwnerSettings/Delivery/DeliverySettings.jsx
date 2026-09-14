import './DeliverySettings.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <button
          type="button"
          className="owner_setting_back"
          onClick={() => navigate(-1)}
        >
          ← Delivery Settings
        </button>

        <div className="owner_setting_header">
          <p className="owner_setting_tag">DELIVERY SETTINGS</p>

          <h1>Delivery Settings</h1>

          <p>
            Configure the delivery rules and estimated delivery information for
            your shop.
          </p>
        </div>

        <form className="delivery_settings_form" onSubmit={handleSubmit}>
          {/* DELIVERY RADIUS */}

          <div className="delivery_setting_group">
            <label htmlFor="deliveryRadius">Delivery Radius</label>

            <div className="delivery_input_wrapper">
              <input
                id="deliveryRadius"
                type="number"
                name="deliveryRadius"
                value={settings.deliveryRadius}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                placeholder="5"
                disabled={saving}
              />

              <span>km</span>
            </div>

            <small>
              Maximum distance from your shop where delivery orders can be
              accepted.
            </small>
          </div>

          {/* MINIMUM ORDER */}

          <div className="delivery_setting_group">
            <label htmlFor="minimumOrderAmount">Minimum Order Amount</label>

            <div className="delivery_input_wrapper">
              <span>₹</span>

              <input
                id="minimumOrderAmount"
                type="number"
                name="minimumOrderAmount"
                value={settings.minimumOrderAmount}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="200"
                disabled={saving}
              />
            </div>

            <small>
              Minimum product amount required before a customer can place a
              delivery order.
            </small>
          </div>

          {/* DELIVERY CHARGE */}

          <div className="delivery_setting_group">
            <label htmlFor="deliveryCharge">Delivery Charge</label>

            <div className="delivery_input_wrapper">
              <span>₹</span>

              <input
                id="deliveryCharge"
                type="number"
                name="deliveryCharge"
                value={settings.deliveryCharge}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="20"
                disabled={saving}
              />
            </div>

            <small>
              Default delivery charge applied to eligible delivery orders.
            </small>
          </div>

          {/* FREE DELIVERY */}

          <div className="delivery_setting_group">
            <label htmlFor="freeDeliveryAbove">Free Delivery Above</label>

            <div className="delivery_input_wrapper">
              <span>₹</span>

              <input
                id="freeDeliveryAbove"
                type="number"
                name="freeDeliveryAbove"
                value={settings.freeDeliveryAbove}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="500"
                disabled={saving}
              />
            </div>

            <small>
              Orders above this amount can receive free delivery. Enter 0 to
              disable free delivery.
            </small>
          </div>

          {/* ESTIMATED TIME */}

          <div className="delivery_setting_group">
            <label htmlFor="estimatedDeliveryTime">
              Estimated Delivery Time
            </label>

            <div className="delivery_input_wrapper">
              <input
                id="estimatedDeliveryTime"
                type="number"
                name="estimatedDeliveryTime"
                value={settings.estimatedDeliveryTime}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="45"
                disabled={saving}
              />

              <span>min</span>
            </div>

            <small>
              Approximate time required to prepare and deliver an order.
            </small>
          </div>

          {/* MESSAGES */}

          {error && <div className="owner_setting_error">{error}</div>}

          {successMessage && (
            <div className="owner_setting_success">{successMessage}</div>
          )}

          <div className="delivery_setting_group">
            <label htmlFor="openingTime">Opening Time</label>

            <input
              type="time"
              id="openingTime"
              name="openingTime"
              value={settings.openingTime}
              onChange={handleChange}
              disabled={saving}
            />

            <small>
              Time when your shop automatically opens for customers.
            </small>
          </div>

          <div className="delivery_setting_group">
            <label htmlFor="closingTime">Closing Time</label>

            <input
              type="time"
              id="closingTime"
              name="closingTime"
              value={settings.closingTime}
              onChange={handleChange}
              disabled={saving}
            />

            <small>
              Time when your shop automatically closes for customers.
            </small>
          </div>

          <div className="delivery_setting_group">
            <label htmlFor="shopStatusMode">Shop Status</label>

            <select
              id="shopStatusMode"
              name="shopStatusMode"
              value={settings.shopStatusMode}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="auto">Automatic</option>
              <option value="open">Always Open</option>
              <option value="closed">Always Closed</option>
            </select>

            <small>
              Automatic follows the opening and closing time. Always Open or
              Always Closed manually overrides the schedule.
            </small>
          </div>

          {/* SAVE */}

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
