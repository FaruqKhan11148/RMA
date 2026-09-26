import { ShoppingBag, Truck } from 'lucide-react';

function OwnerShopServices({ shopOwner }) {
  return (
    <section className="owner_shop_section">
      <div className="owner_shop_section_header">
        <div>
          <h2>Services</h2>
          <span>What your shop currently offers</span>
        </div>
      </div>

      <div className="owner_shop_services">
        <div
          className={`owner_shop_service ${
            shopOwner.delivery ? 'enabled' : 'disabled'
          }`}
        >
          <div className="owner_shop_service_icon">
            <Truck size={20} />
          </div>

          <div>
            <strong>Delivery</strong>
            <span>
              {shopOwner.delivery
                ? 'Available to customers'
                : 'Currently unavailable'}
            </span>
          </div>

          <span className="owner_shop_service_status">
            {shopOwner.delivery ? 'Available' : 'Off'}
          </span>
        </div>

        <div
          className={`owner_shop_service ${
            shopOwner.pickup ? 'enabled' : 'disabled'
          }`}
        >
          <div className="owner_shop_service_icon">
            <ShoppingBag size={20} />
          </div>

          <div>
            <strong>Pickup</strong>
            <span>
              {shopOwner.pickup
                ? 'Available to customers'
                : 'Currently unavailable'}
            </span>
          </div>

          <span className="owner_shop_service_status">
            {shopOwner.pickup ? 'Available' : 'Off'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default OwnerShopServices;
