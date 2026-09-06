import './OrderLocationMap.css';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
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

function OrderLocationMap({ latitude, longitude, route, currentLocation }) {
  const customerPosition = [latitude, longitude];

  const deliveryBoyPosition = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : null;

  // OpenRouteService geometry coordinates are [longitude, latitude]
  const routePositions =
    route?.geometry?.coordinates?.map(([routeLongitude, routeLatitude]) => [
      routeLatitude,
      routeLongitude,
    ]) || [];

  return (
    <div className="order_location_map">
      <MapContainer
        center={customerPosition}
        zoom={10}
        scrollWheelZoom={true}
        style={{
          height: '300px',
          width: '100%',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Actual road route */}
        {routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              weight: 5,
            }}
          />
        )}

        {/* Customer location */}
        <Marker position={customerPosition}>
          <Popup>Customer Delivery Location</Popup>
        </Marker>

        {/* Delivery boy current location */}
        {deliveryBoyPosition && (
          <Marker position={deliveryBoyPosition}>
            <Popup>Delivery Boy — Current Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default OrderLocationMap;
