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
// Constants
// =========================

const fallbackPosition = [14.6224, 75.6295];

const MAPTILER_KEY = process.env.REACT_APP_MAPTILER_KEY;

// =========================
// RMA Location Pin
// =========================

const rmaLocationIcon = L.divIcon({
  className: 'rma_location_marker',

  html: `
    <div class="rma_location_pin">
      <div class="rma_location_pin_inner">R</div>
    </div>
  `,

  iconSize: [44, 54],
  iconAnchor: [22, 54],
});

// =========================
// Map Controller
// =========================

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(position, 17, {
      animate: true,
      duration: 0.8,
    });
  }, [map, position]);

  return null;
}

// =========================
// Location Marker
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

  return <Marker position={position} icon={rmaLocationIcon} />;
}

// =========================
// Main Component
// =========================

function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  const [address, setAddress] = useState('');

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingAddress, setLoadingAddress] = useState(false);

  const [error, setError] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(null);

  // =========================
  // Reverse Geocoding
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

        setSelectedLocation({
          latitude,
          longitude,
          address: displayName,
          accuracy: locationAccuracy,
        });
      } catch (err) {
        console.error('Reverse geocoding error:', err);

        setAddress(
          'Unable to get the address. You can still confirm this location.',
        );

        setSelectedLocation({
          latitude,
          longitude,
          address: '',
          accuracy: locationAccuracy,
        });
      } finally {
        setLoadingAddress(false);
      }
    },
    [],
  );

  // =========================
  // Select Location
  // =========================

  const selectLocation = useCallback(
    (newPosition, locationAccuracy = null) => {
      setPosition(newPosition);

      setError('');

      getAddress(newPosition[0], newPosition[1], locationAccuracy);
    },
    [getAddress],
  );

  // =========================
  // Current Location
  // =========================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by your browser.');

      return;
    }

    setLoadingLocation(true);
    setError('');

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
                    'Unable to get your location right now. Please try again.',
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
      <div className="map_wrapper">
        <MapContainer
          center={position || fallbackPosition}
          zoom={position ? 17 : 14}
          minZoom={5}
          maxZoom={20}
          className="map"
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            url={`https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
            tileSize={512}
            zoomOffset={-1}
            minZoom={1}
            maxZoom={20}
            crossOrigin={true}
          />

          <MapController position={position} />

          <LocationMarker position={position} onSelect={selectLocation} />
        </MapContainer>

        <div className="map_top_bar">
          <div className="map_back_button">←</div>

          <div className="map_top_title">
            <h4>Choose your location</h4>
          </div>
        </div>

        {!position && (
          <div className="map_instruction">
            Tap the map to select your location
          </div>
        )}

        {!position && (
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
        )}
      </div>

      {error && <div className="map_error">{error}</div>}

      {position && (
        <div className="location_bottom_sheet">
          <div className="location_sheet_handle" />

          <div className="location_sheet_header">
            <div className="location_pin_circle">
              <span>●</span>
            </div>

            <div>
              <h2>Your delivery location</h2>

              <p>Make sure this is where you want your order delivered.</p>
            </div>
          </div>

          <div className="selected_address_card">
            <div className="address_icon">⌖</div>

            <div className="address_content">
              <span className="address_label">Delivery address</span>

              {loadingAddress ? (
                <p className="address_loading">Getting your address...</p>
              ) : (
                <p className="selected_address">
                  {address || 'Unable to get the address.'}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="confirm_location_button"
            disabled={loadingAddress || !selectedLocation}
            onClick={() => {
              if (!selectedLocation) return;

              if (onLocationSelect) {
                onLocationSelect(selectedLocation);
              }
            }}
          >
            {loadingAddress ? 'Getting address...' : 'Confirm this location'}
          </button>
        </div>
      )}
    </section>
  );
}

export default MapPicker;
