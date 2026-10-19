import './OrderLocationMap.css';

import { useEffect } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
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

// =========================================================
// DELIVERY PARTNER DIRECTIONAL TRIANGLE
// =========================================================

const deliveryPartnerIcon = (heading = 0) =>
  L.divIcon({
    className: 'delivery_partner_map_icon_wrapper',
    html: `
      <div
        class="delivery_partner_map_arrow_wrap"
        style="transform: rotate(${heading}deg)"
      >
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

  const hasDeliveryLocation =
    Number.isFinite(Number(currentLocation?.latitude)) &&
    Number.isFinite(Number(currentLocation?.longitude)) &&
    currentLocation?.latitude !== null &&
    currentLocation?.latitude !== undefined &&
    currentLocation?.longitude !== null &&
    currentLocation?.longitude !== undefined;

  const deliveryBoyPosition = hasDeliveryLocation
    ? [Number(currentLocation.latitude), Number(currentLocation.longitude)]
    : null;

  const heading = Number.isFinite(Number(currentLocation?.heading))
    ? Number(currentLocation.heading)
    : 0;

  // OpenRouteService GeoJSON uses [longitude, latitude].
  const routePositions =
    route?.geometry?.coordinates?.map(([routeLongitude, routeLatitude]) => [
      routeLatitude,
      routeLongitude,
    ]) || [];

  return (
    <>
      <MapResizeHandler />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ROAD ROUTE */}

      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#2583f5',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* CUSTOMER LOCATION */}

      <Marker position={customerPosition} icon={rmaLocationIcon}>
        <Popup>Customer Delivery Location</Popup>
      </Marker>

      {/* DELIVERY PARTNER ACCURACY CIRCLE + DIRECTION */}

      {deliveryBoyPosition && (
        <>
          <Circle
            center={deliveryBoyPosition}
            radius={
              Number.isFinite(Number(currentLocation?.accuracy)) &&
              Number(currentLocation?.accuracy) > 0
                ? Math.min(Number(currentLocation.accuracy), 100)
                : 20
            }
            pathOptions={{
              color: '#1a73e8',
              weight: 1,
              opacity: 0.65,
              fillColor: '#1a73e8',
              fillOpacity: 0.12,
            }}
          />

          <Marker
            position={deliveryBoyPosition}
            icon={deliveryPartnerIcon(heading)}
            zIndexOffset={1000}
          >
            <Popup>Delivery Partner — Current Location</Popup>
          </Marker>
        </>
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
