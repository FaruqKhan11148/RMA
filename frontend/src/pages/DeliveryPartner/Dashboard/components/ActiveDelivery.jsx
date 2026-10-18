import { MapPin, Package, Store, Truck } from 'lucide-react';

function ActiveDelivery({ activeDelivery, activeOrders, onViewDelivery }) {
  // Support both the new multi-order prop and the previous single-order prop.
  const deliveries = Array.isArray(activeOrders)
    ? activeOrders
    : activeDelivery
      ? [activeDelivery]
      : [];

  const getStatusLabel = (order) => {
    if (order.status === 'Ready') {
      return 'Ready for pickup';
    }

    if (order.status === 'OutForDelivery') {
      return 'Out for delivery';
    }

    return order.status || 'Assigned';
  };

  if (deliveries.length === 0) {
    return (
      <section className="delivery_section">
        <div className="delivery_section_header">
          <div>
            <h2>Active Deliveries</h2>
            <span>Your assigned delivery orders</span>
          </div>

          <span className="delivery_request_count">0</span>
        </div>

        <div className="delivery_empty_card">
          <div className="delivery_empty_icon">
            <Package size={25} />
          </div>

          <strong>No active deliveries</strong>

          <p>Your assigned orders will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Active Deliveries</h2>
          <span>Manage your assigned orders individually</span>
        </div>

        <span className="delivery_request_count">{deliveries.length}</span>
      </div>

      <div className="delivery_active_list">
        {deliveries.map((order) => {
          const shopName =
            order.ownerId?.shopName ||
            order.ownerId?.ownerName ||
            'Pickup shop';

          const itemCount = Array.isArray(order.items)
            ? order.items.reduce(
                (total, item) =>
                  total + Math.max(0, Number(item.quantity) || 1),
                0,
              )
            : 0;

          return (
            <article
              className="delivery_active_card"
              key={order._id || order.orderId}
            >
              <div className="delivery_active_top">
                <div>
                  <span>Order ID</span>
                  <strong>{order.orderId}</strong>
                </div>

                <span className="delivery_active_status">
                  {getStatusLabel(order)}
                </span>
              </div>

              <div className="delivery_active_details">
                <div>
                  <Store size={17} />

                  <span>
                    <strong>{shopName}</strong>
                    <small>Pickup shop</small>
                  </span>
                </div>

                <div>
                  <MapPin size={17} />

                  <span>
                    <strong>
                      {order.deliveryLocation?.address ||
                        'Customer location unavailable'}
                    </strong>
                    <small>Delivery address</small>
                  </span>
                </div>

                <div>
                  <Package size={17} />

                  <span>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="delivery_active_button"
                onClick={() => onViewDelivery?.(order.orderId)}
                disabled={!order.orderId || !onViewDelivery}
              >
                <Truck size={17} style={{marginBottom:"-5px", marginRight:"7px"}}/>
                View Delivery
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ActiveDelivery;
