import './MapPicker.css';

import { useCallback, useEffect, useState } from 'react';

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// =========================
// Leaflet marker fix
// =========================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// =========================
// Constants
// =========================

const fallbackPosition = [14.6224, 75.6295];

const MAPTILER_KEY = process.env.REACT_APP_MAPTILER_KEY;

// =========================
// Map controller
// =========================

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(position, 17, {
      animate: true,
    });
  }, [map, position]);

  return null;
}

// =========================
// Location marker
// =========================

function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(event) {
      const newPosition = [event.latlng.lat, event.latlng.lng];

      onSelect(newPosition);
    },
  });

  if (!position) {
    return null;
  }

  return <Marker position={position} />;
}

// =========================
// Main component
// =========================

function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  const [address, setAddress] = useState('');

  const [accuracy, setAccuracy] = useState(null);

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingAddress, setLoadingAddress] = useState(false);

  const [error, setError] = useState('');

  // =========================
  // Reverse geocoding
  // =========================

  const getAddress = useCallback(
    async (latitude, longitude, locationAccuracy = null) => {
      try {
        setLoadingAddress(true);
        setError('');

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
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

        const displayName = data.display_name || 'Selected location';

        setAddress(displayName);

        setAccuracy(locationAccuracy);

        if (onLocationSelect) {
          onLocationSelect({
            latitude,
            longitude,
            address: displayName,
            accuracy: locationAccuracy,
          });
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);

        setAddress('Unable to get address for this location.');

        if (onLocationSelect) {
          onLocationSelect({
            latitude,
            longitude,
            address: '',
            accuracy: locationAccuracy,
          });
        }
      } finally {
        setLoadingAddress(false);
      }
    },
    [onLocationSelect],
  );

  // =========================
  // Select location
  // =========================

  const selectLocation = useCallback(
    (newPosition, locationAccuracy = null) => {
      setPosition(newPosition);
      setAccuracy(locationAccuracy);
      setError('');

      getAddress(newPosition[0], newPosition[1], locationAccuracy);
    },
    [getAddress],
  );

  // =========================
  // Current location
  // =========================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    setError('');

    // First try a normal/faster location request.
    // This can use a recent location from the phone.
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        const locationAccuracy = location.coords.accuracy;

        selectLocation([latitude, longitude], locationAccuracy);

        setLoadingLocation(false);
      },

      (locationError) => {
        console.error('Initial geolocation error:', locationError);

        // If the normal request times out or the position is unavailable,
        // try again using high GPS accuracy.
        if (locationError.code === 2 || locationError.code === 3) {
          navigator.geolocation.getCurrentPosition(
            (location) => {
              const latitude = location.coords.latitude;
              const longitude = location.coords.longitude;
              const locationAccuracy = location.coords.accuracy;

              selectLocation([latitude, longitude], locationAccuracy);

              setLoadingLocation(false);
            },

            (highAccuracyError) => {
              console.error(
                'High accuracy geolocation error:',
                highAccuracyError,
              );

              switch (highAccuracyError.code) {
                case 1:
                  setError(
                    'Location permission was denied. Please allow location access in your browser settings.',
                  );
                  break;

                case 2:
                  setError(
                    'Your current location is unavailable. Please try again or select your location on the map.',
                  );
                  break;

                case 3:
                  setError(
                    'Unable to get your location right now. Please try again or select your location on the map.',
                  );
                  break;

                default:
                  setError(
                    'Unable to get your current location. Please try again.',
                  );
              }

              setLoadingLocation(false);
            },

            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            },
          );

          return;
        }

        // Permission denied
        if (locationError.code === 1) {
          setError(
            'Location permission was denied. Please allow location access in your browser settings.',
          );
        } else {
          setError(
            'Unable to get your current location. Please try again or select your location on the map.',
          );
        }

        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  };

  // =========================
  // Render
  // =========================

  return (
    <section className="map_picker">
      {/* Header */}

      <div className="map_header">
        <h2>Choose Delivery Location</h2>

        <p>Search by moving the map or tap on your delivery location.</p>
      </div>

      {/* Map */}

      <div className="map_wrapper">
        <MapContainer
          center={position || fallbackPosition}
          zoom={position ? 17 : 14}
          minZoom={5}
          maxZoom={20}
          className="map"
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url={`https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
            tileSize={512}
            zoomOffset={-1}
            minZoom={1}
            maxZoom={20}
            attribution={'&copy; MapTiler &copy; OpenStreetMap contributors'}
            crossOrigin={true}
          />

          <MapController position={position} />

          <LocationMarker position={position} onSelect={selectLocation} />
        </MapContainer>

        {/* Small map instruction */}

        <div className="map_instruction">Tap map to select location</div>
      </div>

      {/* Current location */}

      <button
        type="button"
        className="current_location_button"
        onClick={getCurrentLocation}
        disabled={loadingLocation}
      >
        <span className="current_location_icon">◎</span>

        <span>
          {loadingLocation
            ? 'Getting your location...'
            : 'Use My Current Location'}
        </span>
      </button>

      {/* Error */}

      {error && <div className="map_error">{error}</div>}

      {/* Selected location */}

      {position && (
        <div className="selected_location">
          <div className="selected_location_title">
            <span className="selected_location_icon">📍</span>

            <div>
              <h3>Selected Location</h3>

              {loadingAddress ? (
                <p className="address_loading">Getting address...</p>
              ) : (
                <p className="selected_address">{address}</p>
              )}
            </div>
          </div>

          <div className="location_coordinates">
            {position[0].toFixed(6)}
            {' , '}
            {position[1].toFixed(6)}
          </div>

          {accuracy && (
            <div className="location_accuracy">
              GPS accuracy: approximately {Math.round(accuracy)} m
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default MapPicker;
