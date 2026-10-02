import './OrderLocationMap.css';

import { useEffect } from 'react';

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

// =========================================================
// DELIVERY PARTNER CIRCULAR ICON
// =========================================================

const deliveryPartnerIcon = L.divIcon({
  className: 'delivery_partner_map_icon_wrapper',

  html: `
    <div class="delivery_partner_map_icon">
      <div class="delivery_partner_map_dot"></div>
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
        <Marker position={deliveryBoyPosition} icon={deliveryPartnerIcon}>
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
        zoomControl={true}
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
