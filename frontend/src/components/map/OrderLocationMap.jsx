import './OrderLocationMap.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

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

function OrderLocationMap({ latitude, longitude }) {
  const position = [latitude, longitude];

  return (
    <div className="order_location_map">
      <MapContainer
        center={position}
        zoom={16}
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

        <Marker position={position}>
          <Popup>Customer Delivery Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default OrderLocationMap;
