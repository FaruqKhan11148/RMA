import './AddAddress.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditAddress() {
  const navigate = useNavigate();
  const { addressId } = useParams();

  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing address
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/addresses',
          {
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch addresses');
        }

        const existingAddress = (data.addresses || []).find(
          (item) => item._id === addressId,
        );

        if (!existingAddress) {
          throw new Error('Address not found');
        }

        setLabel(existingAddress.label || 'Home');
        setAddress(existingAddress.address || '');

        setLatitude(existingAddress.latitude ?? null);
        setLongitude(existingAddress.longitude ?? null);
      } catch (error) {
        console.error('Load address failed:', error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAddress();
  }, [addressId]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setError('Please enter your address');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/customers/addresses/${addressId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            label,
            address: address.trim(),
            latitude,
            longitude,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update address');
      }

      navigate('/profile/saved-addresses');
    } catch (error) {
      console.error('Update address failed:', error);

      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="add_address_page">
        <div className="add_address_loading">Loading address...</div>
      </div>
    );
  }

  return (
    <div className="add_address_page">
      <div className="add_address_header">
        <button
          className="add_address_back"
          onClick={() => navigate('/profile/saved-addresses')}
        >
          ‹
        </button>

        <h1>Edit Address</h1>
      </div>

      <form className="add_address_form" onSubmit={handleSave}>
        {/* ADDRESS TYPE */}

        <div className="add_address_field">
          <label>Address Type</label>

          <div className="address_label_options">
            {['Home', 'Work', 'Other'].map((item) => (
              <button
                type="button"
                key={item}
                className={
                  label === item
                    ? 'address_label_option active'
                    : 'address_label_option'
                }
                onClick={() => setLabel(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ADDRESS */}

        <div className="add_address_field">
          <label htmlFor="address">Full Address</label>

          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete delivery address"
            rows="5"
            maxLength="300"
          />

          <span className="address_character_count">{address.length}/300</span>
        </div>

        {/* ERROR */}

        {error && <div className="add_address_error">{error}</div>}

        {/* SAVE */}

        <button type="submit" className="save_address_button" disabled={saving}>
          {saving ? 'Updating...' : 'Update Address'}
        </button>
      </form>
    </div>
  );
}

export default EditAddress;
