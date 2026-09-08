import './OpenClosed.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OpenClosed() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
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
        const response = await fetch('http://localhost:5000/api/owners/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop status');
        }

        setIsOpen(Boolean(data.owner.isOpen));

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate, token]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === isOpen) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/owners/settings/open-closed',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isOpen: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop status');
      }

      setIsOpen(Boolean(data.owner.isOpen));

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
          <p className="owner_setting_loading">Loading shop status...</p>
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
          ← Shop Settings
        </button>

        <div className="owner_setting_header">
          <p className="owner_setting_tag">SHOP SETTINGS</p>

          <h1>Open / Closed</h1>

          <p>Control whether customers can currently order from your shop.</p>
        </div>

        <div className="shop_status_card">
          <div
            className={
              isOpen ? 'shop_status_icon open' : 'shop_status_icon closed'
            }
          >
            {isOpen ? '✓' : '×'}
          </div>

          <div className="shop_status_content">
            <span className="shop_status_label">Current Shop Status</span>

            <strong
              className={
                isOpen ? 'shop_status_value open' : 'shop_status_value closed'
              }
            >
              {isOpen ? 'OPEN' : 'CLOSED'}
            </strong>

            <p>
              {isOpen
                ? 'Customers can currently place orders from your shop.'
                : 'Your shop is currently closed and customers should not place new orders.'}
            </p>
          </div>
        </div>

        <div className="shop_status_options">
          <button
            type="button"
            className={
              isOpen
                ? 'shop_status_option active open_option'
                : 'shop_status_option open_option'
            }
            onClick={() => handleStatusChange(true)}
            disabled={saving}
          >
            <span className="shop_status_option_icon">✓</span>

            <span>
              <strong>Open Shop</strong>
              <small>Allow customers to order</small>
            </span>
          </button>

          <button
            type="button"
            className={
              !isOpen
                ? 'shop_status_option active closed_option'
                : 'shop_status_option closed_option'
            }
            onClick={() => handleStatusChange(false)}
            disabled={saving}
          >
            <span className="shop_status_option_icon">×</span>

            <span>
              <strong>Close Shop</strong>
              <small>Stop accepting new orders</small>
            </span>
          </button>
        </div>

        {saving && (
          <div className="shop_status_saving">Updating shop status...</div>
        )}

        {error && <div className="owner_setting_error">{error}</div>}

        {successMessage && (
          <div className="owner_setting_success">{successMessage}</div>
        )}

        <div className="shop_status_note">
          <strong>Important</strong>

          <span>
            Closing your shop should only affect new orders. Existing orders
            should continue through their normal delivery process.
          </span>
        </div>
      </div>
    </div>
  );
}

export default OpenClosed;
