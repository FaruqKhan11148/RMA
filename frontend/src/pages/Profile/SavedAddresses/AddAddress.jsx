import './AddAddress.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../../../components/map/MapPicker';

function AddAddress() {
  const navigate = useNavigate();

  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSelect = (location) => {
    setAddress(location.address || '');
    setLatitude(location.latitude);
    setLongitude(location.longitude);
  };

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
        'https://rma-backend-bo4a.onrender.com/api/customers/addresses',
        {
          method: 'POST',
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
        throw new Error(data.message || 'Unable to save address');
      }

      navigate('/profile/saved-addresses');
    } catch (error) {
      console.error('Save address failed:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add_address_page">
      <div className="add_address_header">
        <button
          className="add_address_back"
          onClick={() => navigate('/profile/saved-addresses')}
        >
          ‹
        </button>

        <h1>Add New Address</h1>
      </div>

      <form className="add_address_form" onSubmit={handleSave}>
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

        <div className="add_address_field">
          <div className="add_address_location">
            <label>Delivery Location</label>

            <MapPicker onLocationSelect={handleLocationSelect} />

            {latitude !== null && longitude !== null && (
              <div className="selected_location_info">
                <span>Location selected</span>

                <small>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </small>
              </div>
            )}
          </div>
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

        {error && <div className="add_address_error">{error}</div>}

        <button type="submit" className="save_address_button" disabled={saving}>
          {saving ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}

export default AddAddress;
