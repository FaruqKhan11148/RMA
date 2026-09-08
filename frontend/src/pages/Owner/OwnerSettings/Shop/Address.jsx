import './Address.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Address() {
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const token = localStorage.getItem('rma_owner_token');

        if (!token) {
          navigate('/owner/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/owners/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop details');
        }

        setAddress(data.owner.address || '');
      } catch (error) {
        console.error('Fetch shop address failed:', error);

        setError(error.message || 'Unable to load shop address.');
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError('Shop address is required.');
      return;
    }

    if (trimmedAddress.length < 5) {
      setError('Shop address must be at least 5 characters long.');
      return;
    }

    if (trimmedAddress.length > 500) {
      setError('Shop address cannot exceed 500 characters.');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        navigate('/owner/login');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/owners/settings/address',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: trimmedAddress,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop address');
      }

      const savedOwner = localStorage.getItem('rma_owner');

      if (savedOwner) {
        const currentOwner = JSON.parse(savedOwner);

        localStorage.setItem(
          'rma_owner',
          JSON.stringify({
            ...currentOwner,
            ...data.owner,
          }),
        );
      }

      setAddress(data.owner.address || '');

      setSuccess('Shop address updated successfully.');
    } catch (error) {
      console.error('Update shop address failed:', error);

      setError(error.message || 'Unable to update shop address.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="owner_setting_page">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="owner_setting_page">
      <section className="owner_setting_card">
        <button
          type="button"
          className="owner_setting_back"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Shop Settings
        </button>

        <div className="owner_setting_header">
          <h1>Shop Address</h1>

          <p>
            Update the physical address of your shop that customers can use to
            identify your location.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="owner_setting_label">
            Shop Address
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete shop address"
              maxLength={500}
              rows={6}
              required
            />
          </label>

          <div className="owner_address_counter">{address.length}/500</div>

          {error && <p className="owner_setting_error">{error}</p>}

          {success && <p className="owner_setting_success">{success}</p>}

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Address;
