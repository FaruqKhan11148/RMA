import './ShopName.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ShopName() {
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
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

        const response = await fetch('http://localhost:5000api/owners/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop details');
        }

        setShopName(data.owner.shopName);
      } catch (error) {
        console.error('Fetch shop details failed:', error);

        setError(error.message || 'Unable to load shop details.');
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

    const trimmedShopName = shopName.trim();

    if (!trimmedShopName) {
      setError('Shop name is required.');
      return;
    }

    if (trimmedShopName.length < 2) {
      setError('Shop name must be at least 2 characters long.');
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
        'http://localhost:5000api/owners/settings/shop-name',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopName: trimmedShopName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop name');
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

      setShopName(data.owner.shopName);

      setSuccess('Shop name updated successfully.');
    } catch (error) {
      console.error('Update shop name failed:', error);

      setError(error.message || 'Unable to update shop name.');
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
          <h1>Shop Name</h1>

          <p>Update the name customers see when they visit your RMA shop.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="owner_setting_label">
            Shop Name
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter shop name"
              maxLength={100}
              required
            />
          </label>

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

export default ShopName;
