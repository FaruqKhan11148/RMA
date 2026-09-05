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
// MAP CLICK HANDLER
// ------------------------------------

function LocationMarker({ position, onMapClick }) {
  useMapEvents({
    click(event) {
      const newPosition = [event.latlng.lat, event.latlng.lng];

      onMapClick(newPosition);
    },
  });

  if (!position) {
    return null;
  }

  return <Marker position={position} />;
}

// ------------------------------------
// MOVE MAP TO SELECTED LOCATION
// ------------------------------------

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(position, 16, {
      animate: true,
    });
  }, [position, map]);

  return null;
}

// ------------------------------------
// MAP PICKER
// ------------------------------------

function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [error, setError] = useState('');

  // Ranebennur fallback
  const fallbackPosition = [14.6224, 75.6295];

  // ------------------------------------
  // REVERSE GEOCODING
  // ------------------------------------

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      setLoadingAddress(true);

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
    } finally {
      setLoadingAddress(false);
    }
  };

  // ------------------------------------
  // SELECT LOCATION
  // ------------------------------------

  const selectLocation = async (newPosition, locationAccuracy = null) => {
    try {
      setError('');

      setPosition(newPosition);
      setAccuracy(locationAccuracy);

      const selectedAddress = await getAddressFromCoordinates(
        newPosition[0],
        newPosition[1],
      );

      setAddress(selectedAddress);

      onLocationSelect({
        latitude: newPosition[0],
        longitude: newPosition[1],
        address: selectedAddress,
        accuracy: locationAccuracy,
      });
    } catch (error) {
      console.error('Location selection failed:', error);

      setError('Unable to determine this location. Please try again.');
    }
  };

  // ------------------------------------
  // CURRENT LOCATION
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

        await selectLocation(newPosition, location.coords.accuracy);

        setLoadingLocation(false);
      },

      (locationError) => {
        console.error('Location error:', locationError);

        if (locationError.code === 1) {
          setError(
            'Location permission was denied. Please allow location access or select your location manually.',
          );
        } else if (locationError.code === 2) {
          setError(
            'Your location could not be determined. Please select your location manually.',
          );
        } else if (locationError.code === 3) {
          setError(
            'Location request timed out. Please try again or select your location manually.',
          );
        } else {
          setError('Unable to get your current location. Please try again.');
        }

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
  // MAP CLICK
  // ------------------------------------

  const handleMapClick = (newPosition) => {
    selectLocation(newPosition);
  };

  return (
    <section className="map_picker">
      <div className="map_header">
        <h2>Delivery Location</h2>

        <p>Pin your exact delivery location on the map.</p>
      </div>

      <MapContainer
        center={position || fallbackPosition}
        zoom={position ? 16 : 12}
        className="map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position} onMapClick={handleMapClick} />

        <MapController position={position} />
      </MapContainer>

      <button
        type="button"
        className="current_location_button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation
          ? 'Getting Your Location...'
          : 'Use My Current Location'}
      </button>

      {position && (
        <div className="selected_location">
          <h3>Delivery Location Selected</h3>

          {loadingAddress ? <p>Finding your address...</p> : <p>{address}</p>}

          <small>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </small>

          {accuracy !== null && (
            <small>
              GPS accuracy: approximately {Math.round(accuracy)} metres
            </small>
          )}
        </div>
      )}

      {error && <p className="map_error">{error}</p>}
    </section>
  );
}

export default MapPicker;
