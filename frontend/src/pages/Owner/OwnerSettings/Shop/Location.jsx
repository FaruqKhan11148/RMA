import './Location.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MapPicker from '../../../../components/map/MapPicker';

function Location() {
  const navigate = useNavigate();

  const [shopLocation, setShopLocation] = useState(null);

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
          throw new Error(data.message || 'Failed to load shop location');
        }

        const savedLocation = data.owner.location;

        if (
          savedLocation?.latitude !== null &&
          savedLocation?.latitude !== undefined &&
          savedLocation?.longitude !== null &&
          savedLocation?.longitude !== undefined
        ) {
          setShopLocation({
            latitude: Number(savedLocation.latitude),
            longitude: Number(savedLocation.longitude),
          });
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

  const handleLocationSelect = (location) => {
    setError('');
    setSuccessMessage('');

    setShopLocation({
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      address: location.address || '',
    });
  };

  const handleUseCurrentLocation = () => {
    setError('');
    setSuccessMessage('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setSuccessMessage('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setShopLocation({
          latitude: Number(position.coords.latitude),
          longitude: Number(position.coords.longitude),
        });

        setSuccessMessage('Current location detected');
      },
      () => {
        setError('Unable to get your location. Please allow location access.');

        setSuccessMessage('');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!shopLocation) {
      setError('Please select your shop location on the map');
      return;
    }

    const latitude = Number(shopLocation.latitude);
    const longitude = Number(shopLocation.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError('Please select a valid location');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        'http://localhost:5000/api/owners/settings/location',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop location');
      }

      localStorage.setItem('rma_owner', JSON.stringify(data.owner));

      setShopLocation({
        latitude: Number(data.owner.location.latitude),
        longitude: Number(data.owner.location.longitude),
      });

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
          <p className="owner_setting_loading">Loading shop location...</p>
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

          <h1>Shop Location</h1>

          <p>
            Select the exact location of your shop on the map. This location
            will be used for delivery routing.
          </p>
        </div>

        <form className="owner_location_form" onSubmit={handleSubmit}>
          <div className="owner_location_info">
            <strong>Shop Location</strong>

            <span>
              Move the marker or tap anywhere on the map to select your exact
              shop location.
            </span>
          </div>

          <button
            type="button"
            className="owner_location_current"
            onClick={handleUseCurrentLocation}
            disabled={saving}
          >
            📍 Use My Current Location
          </button>

          <div className="owner_location_map">
            <MapPicker
              initialLocation={shopLocation}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {!shopLocation && (
            <div className="owner_location_required">
              Please select your shop location before saving.
            </div>
          )}

          {shopLocation && (
            <div className="owner_location_confirmation">
              <strong>Shop location selected</strong>

              {shopLocation.address && <span>{shopLocation.address}</span>}

              <small>
                {shopLocation.latitude.toFixed(6)}
                {', '}
                {shopLocation.longitude.toFixed(6)}
              </small>
            </div>
          )}

          {error && <div className="owner_setting_error">{error}</div>}

          {successMessage && (
            <div className="owner_setting_success">{successMessage}</div>
          )}

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving || !shopLocation}
          >
            {saving ? 'Saving...' : 'Save Location'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Location;
