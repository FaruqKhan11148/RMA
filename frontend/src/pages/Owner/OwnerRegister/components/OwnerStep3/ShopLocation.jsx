import { useEffect, useState } from 'react';

import MapPicker from '../../../../../components/map/MapPicker';

function ShopLocation({ shopLocation, setShopLocation }) {
  const [showMap, setShowMap] = useState(!shopLocation);

  useEffect(() => {
    if (shopLocation) {
      setShowMap(false);
    }
  }, [shopLocation]);

  const handleLocationSelect = (location) => {
    setShopLocation(location);
    setShowMap(false);
  };

  const handleChangeLocation = () => {
    setShowMap(true);
  };

  return (
    <section className="register_section shop_location_section">
      <h2>Shop Location</h2>

      <p className="section_description">
        Select the exact location of your shop on the map. This location will be
        used for pickup and delivery routing.
      </p>

      {showMap && <MapPicker onLocationSelect={handleLocationSelect} />}

      {shopLocation && !showMap && (
        <div className="shop_location_confirmation">
          <strong>Shop location selected</strong>

          <span>{shopLocation.address || 'Location selected'}</span>

          <small>
            {Number(shopLocation.latitude).toFixed(6)},{' '}
            {Number(shopLocation.longitude).toFixed(6)}
          </small>

          <button type="button" onClick={handleChangeLocation}>
            Change Location
          </button>
        </div>
      )}
    </section>
  );
}

export default ShopLocation;
