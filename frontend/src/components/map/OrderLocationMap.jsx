import './OrderLocationMap.css';

import { useEffect, useRef, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// =========================================================
// DEFAULT LEAFLET MARKER
// =========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// =========================================================
// RMA CUSTOMER LOCATION ICON
// Same marker used in MapPicker
// =========================================================

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

/* =========================================================
   DELIVERY PARTNER DIRECTIONAL TRIANGLE
========================================================= */

const deliveryPartnerIcon = (heading = 0) =>
  L.divIcon({
    className: 'delivery_partner_map_icon_wrapper',
    html: `
      <div class="delivery_partner_map_arrow_wrap"
           style="transform: rotate(${heading}deg)">
        <svg
          class="delivery_partner_map_arrow"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <path
            d="M20 3 L35 34 L20 27 L5 34 Z"
            fill="#1a73e8"
            stroke="#ffffff"
            stroke-width="2.5"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  });

// =========================================================
// MAP RESIZE HANDLER
// =========================================================

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(resizeTimer);
  }, [map]);

  return null;
}

function MapRotationHandler({ rotation, setRotation }) {
  const map = useMap();
  const gestureRef = useRef(null);

  useEffect(() => {
    const container = map.getContainer();
    const pane = map.getPane('mapPane');

    if (!pane) return;

    pane.style.transformOrigin = '50% 50%';
    pane.style.rotate = `${rotation}deg`;

    return () => {
      pane.style.rotate = '';
    };
  }, [map, rotation]);

  useEffect(() => {
    const container = map.getContainer();

    const getAngle = (touches) =>
      Math.atan2(
        touches[1].clientY - touches[0].clientY,
        touches[1].clientX - touches[0].clientX,
      ) *
      (180 / Math.PI);

    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return;

      gestureRef.current = {
        startAngle: getAngle(event.touches),
        startRotation: rotation,
      };
    };

    const onTouchMove = (event) => {
      if (event.touches.length !== 2 || !gestureRef.current) return;

      event.preventDefault();

      const currentAngle = getAngle(event.touches);
      const delta = currentAngle - gestureRef.current.startAngle;

      setRotation(
        (((gestureRef.current.startRotation + delta) % 360) + 360) % 360,
      );
    };

    const onTouchEnd = (event) => {
      if (event.touches.length < 2) {
        gestureRef.current = null;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [map, rotation, setRotation]);

  return null;
}

// =========================================================
// MAP CONTENT
// =========================================================

function OrderLocationMapContent({
  latitude,
  longitude,
  route,
  currentLocation,
}) {
  const customerPosition = [latitude, longitude];

  const deliveryBoyPosition = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : null;

  // OpenRouteService geometry coordinates are
  // [longitude, latitude]
  const routePositions =
    route?.geometry?.coordinates?.map(([routeLongitude, routeLatitude]) => [
      routeLatitude,
      routeLongitude,
    ]) || [];

  return (
    <>
      <MapResizeHandler />

      <TileLayer
        attribution="&copy;"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* =====================================================
          ACTUAL ROAD ROUTE
      ===================================================== */}

      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            weight: 5,
          }}
        />
      )}

      {/* =====================================================
          CUSTOMER LOCATION
          RMA R MARKER
      ===================================================== */}

      <Marker position={customerPosition} icon={rmaLocationIcon}>
        <Popup>Customer Delivery Location</Popup>
      </Marker>

      {/* =====================================================
          DELIVERY PARTNER CURRENT LOCATION
      ===================================================== */}

      {deliveryBoyPosition && (
        <Marker
          position={deliveryBoyPosition}
          icon={deliveryPartnerIcon(
            Number.isFinite(currentLocation?.heading)
              ? currentLocation.heading
              : 0,
          )}
        >
          <Popup>Delivery Partner — Current Location</Popup>
        </Marker>
      )}
    </>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

function OrderLocationMap({
  latitude,
  longitude,
  route,
  currentLocation,
  fullscreen = false,
}) {
  const customerPosition = [latitude, longitude];
  const [rotation, setRotation] = useState(0);

  return (
    <div
      className={`order_location_map ${
        fullscreen ? 'order_location_map_fullscreen' : ''
      }`}
    >
      <MapContainer
        center={customerPosition}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="order_location_leaflet_map"
      >
        <div className="map_rotation_controls">
          <button
            type="button"
            onClick={() => setRotation((value) => (value - 15 + 360) % 360)}
            aria-label="Rotate map left"
          >
            ↶
          </button>

          <button
            type="button"
            onClick={() => setRotation(0)}
            aria-label="Reset map rotation"
          >
            N
          </button>

          <button
            type="button"
            onClick={() => setRotation((value) => (value + 15) % 360)}
            aria-label="Rotate map right"
          >
            ↷
          </button>
        </div>

        <MapRotationHandler rotation={rotation} setRotation={setRotation} />

        <OrderLocationMapContent
          latitude={latitude}
          longitude={longitude}
          route={route}
          currentLocation={currentLocation}
        />
      </MapContainer>
    </div>
  );
}

export default OrderLocationMap;
