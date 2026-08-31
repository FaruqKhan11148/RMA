import './MapPicker.css';

import { useEffect, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ------------------------------------
// MAP CLICK
// ------------------------------------

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      const newPosition = [event.latlng.lat, event.latlng.lng];

      setPosition(newPosition);
    },
  });

  if (!position) {
    return null;
  }

  return <Marker position={position} />;
}

// ------------------------------------
// MOVE MAP
// ------------------------------------

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16, {
        animate: true,
      });
    }
  }, [position, map]);

  return null;
}

// ------------------------------------
// MAP PICKER
// ------------------------------------

function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');
  // Ranibennur fallback
  const fallbackPosition = [14.6224, 75.6295];

  // ------------------------------------
  // SEND LOCATION TO PARENT
  // ------------------------------------

  const selectPosition = (newPosition, accuracy = null) => {
    setPosition(newPosition);

    onLocationSelect({
      latitude: newPosition[0],
      longitude: newPosition[1],
      accuracy,
    });
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get address');
      }

      const data = await response.json();

      return data.display_name || 'Address not found';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);

      return 'Unable to determine address';
    }
  };

  // ------------------------------------
  // GET CURRENT LOCATION
  // ------------------------------------

  const handleCurrentLocation = () => {
    setError('');
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');

      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const newPosition = [
          location.coords.latitude,
          location.coords.longitude,
        ];

        setPosition(newPosition);

        const selectedAddress = await getAddressFromCoordinates(
          newPosition[0],
          newPosition[1],
        );

        setAddress(selectedAddress);

        onLocationSelect({
          latitude: newPosition[0],
          longitude: newPosition[1],
          address: selectedAddress,
        });

        setLoadingLocation(false);
      },

      (locationError) => {
        console.error('Location error:', locationError);

        setError(
          'Unable to get your current location. Please allow location access or select your location manually.',
        );

        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      },
    );
  };

  // ------------------------------------
  // INITIAL LOCATION
  // ------------------------------------

  useEffect(() => {
    handleCurrentLocation();
  }, []);

  // ------------------------------------
  // MAP CLICK
  // ------------------------------------

  const handleMapClick = async (newPosition) => {
    setPosition(newPosition);

    const selectedAddress = await getAddressFromCoordinates(
      newPosition[0],
      newPosition[1],
    );

    setAddress(selectedAddress);

    onLocationSelect({
      latitude: newPosition[0],
      longitude: newPosition[1],
      address: selectedAddress,
    });
  };

  return (
    <section className="map_picker">
      <div className="map_header">
        <h2>Delivery Location</h2>

        <p>Select where you want your order delivered.</p>
      </div>

      <MapContainer
        center={position || fallbackPosition}
        zoom={position ? 16 : 12}
        className="map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position} setPosition={handleMapClick} />

        <MapController position={position} />
      </MapContainer>

      <button
        type="button"
        className="current_location_button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? 'Getting Location...' : 'Use My Current Location'}
      </button>

      {position && (
        <div className="selected_location">
          <h3>Selected Location</h3>

          <p>{address}</p>

          <small>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </small>
        </div>
      )}

      {error && <p className="map_error">{error}</p>}
    </section>
  );
}

export default MapPicker;
