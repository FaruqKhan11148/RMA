import { MapPin, Package } from 'lucide-react';

function ActiveDelivery({ activeDelivery, onViewDelivery }) {
  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Active Delivery</h2>

          <span>Your current delivery</span>
        </div>
      </div>

      {activeDelivery ? (
        <div className="delivery_active_card">
          <div className="delivery_active_top">
            <div>
              <span>Order</span>

              <strong>{activeDelivery.orderId}</strong>
            </div>

            <span className="delivery_active_status">Out for delivery</span>
          </div>

          <div className="delivery_active_details">
            <div>
              <MapPin size={17} />

              <span>
                {activeDelivery.deliveryLocation?.address ||
                  'Customer location'}
              </span>
            </div>

            <div>
              <Package size={17} />

              <span>
                {activeDelivery.items?.length || 0} item
                {activeDelivery.items?.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="delivery_active_button"
            onClick={() => onViewDelivery(activeDelivery.orderId)}
          >
            View Delivery
          </button>
        </div>
      ) : (
        <div className="delivery_empty_card">
          <div className="delivery_empty_icon">
            <Package size={25} />
          </div>

          <strong>No active delivery</strong>

          <p>Your assigned deliveries will appear here.</p>
        </div>
      )}
    </section>
  );
}

export default ActiveDelivery;
