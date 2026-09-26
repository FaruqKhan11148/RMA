import MapPicker from '../../../../../components/map/MapPicker';

function ShopLocation({ shopLocation, setShopLocation }) {
  return (
    <section className="register_section shop_location_section">
      <h2>Shop Location</h2>

      <p className="section_description">
        Select the exact location of your shop on the map. This location will be
        used for delivery routing.
      </p>

      <MapPicker
        onLocationSelect={(location) => {
          setShopLocation(location);
        }}
      />

      {!shopLocation && (
        <p className="location_required">
          Please select your shop location before continuing.
        </p>
      )}

      {shopLocation && (
        <div className="shop_location_confirmation">
          <strong>Shop location selected</strong>

          <span>{shopLocation.address || 'Location selected'}</span>

          <small>
            {shopLocation.latitude.toFixed(6)},{' '}
            {shopLocation.longitude.toFixed(6)}
          </small>
        </div>
      )}
    </section>
  );
}

export default ShopLocation;
