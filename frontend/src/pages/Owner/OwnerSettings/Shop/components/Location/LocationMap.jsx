import MapPicker from '../../../../../../components/map/MapPicker';

function LocationMap({ shopLocation, handleLocationSelect }) {
  return (
    <div className="owner_location_map">
      <MapPicker
        initialLocation={shopLocation}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}

export default LocationMap;
