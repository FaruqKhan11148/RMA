import { MapPin } from 'lucide-react';

function OwnerShopAddress({ shopOwner }) {
  return (
    <section className="owner_shop_section">
      <div className="owner_shop_section_header">
        <div>
          <h2>Shop Location</h2>
          <span>Your registered shop address</span>
        </div>
      </div>

      <div className="owner_shop_address_card">
        <div className="owner_shop_address_icon">
          <MapPin size={20} />
        </div>

        <div>
          <strong>{shopOwner.shopName}</strong>
          <p>{shopOwner.address}</p>

          {shopOwner.location?.latitude && shopOwner.location?.longitude && (
            <span>Location coordinates available</span>
          )}
        </div>
      </div>
    </section>
  );
}

export default OwnerShopAddress;
