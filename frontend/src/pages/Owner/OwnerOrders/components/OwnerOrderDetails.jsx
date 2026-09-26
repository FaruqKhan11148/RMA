import OrderLocationMap from '../../../../components/map/OrderLocationMap';

function OwnerOrderDetails({ order, setSelectedOrder }) {
  return (
    <section className="owner_order_details">
      <div className="owner_order_details_header">
        <button
          type="button"
          className="owner_order_details_back"
          onClick={() => setSelectedOrder(null)}
        >
          ← Back to Orders
        </button>

        <div>
          <h1>Order #{order.orderId}</h1>

          <span
            className={`order_status ${order.status
              .toLowerCase()
              .replace(/([a-z])([A-Z])/g, '$1-$2')}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <section className="owner_order_details_section">
        <h2>Customer</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Name</span>
            <strong>{order.customer.name}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{order.customer.phone}</strong>
          </div>
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Order Information</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Order Type</span>
            <strong>
              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
            </strong>
          </div>

          {order.orderType === 'delivery' && order.deliveryDistance != null && (
            <div>
              <span>Delivery Distance</span>
              <strong>{Number(order.deliveryDistance).toFixed(2)} KM</strong>
            </div>
          )}

          <div>
            <span>Placed On</span>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
          </div>
        </div>
      </section>

      {order.orderType === 'delivery' && (
        <section className="owner_order_details_section">
          <h2>Delivery Address</h2>

          <div className="owner_order_address">
            <span>Address</span>
            <strong>{order.deliveryLocation?.address}</strong>
          </div>

          {order.deliveryLocation?.latitude != null &&
            order.deliveryLocation?.longitude != null && (
              <div className="owner_order_details_map">
                <OrderLocationMap
                  latitude={Number(order.deliveryLocation.latitude)}
                  longitude={Number(order.deliveryLocation.longitude)}
                />
              </div>
            )}
        </section>
      )}

      <section className="owner_order_details_section">
        <h2>Items</h2>

        <div className="owner_order_details_items">
          {order.items.map((item) => (
            <div className="owner_order_details_item" key={item.productId}>
              <div>
                <strong>{item.productName}</strong>

                <span>
                  {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
                </span>
              </div>

              <strong>
                ₹
                {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                  2,
                )}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Price Breakdown</h2>

        <div className="owner_order_price_breakdown">
          <div>
            <span>Subtotal</span>
            <strong>₹{Number(order.subtotal || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Delivery Charge</span>
            <strong>₹{Number(order.deliveryCharge || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>RMA Fee</span>
            <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
          </div>

          <div className="owner_order_price_total">
            <span>Total</span>
            <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Payment</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Status</span>
            <strong>{order.paymentStatus}</strong>
          </div>

          <div>
            <span>Method</span>
            <strong>{order.paymentMethod}</strong>
          </div>

          {order.paymentId && (
            <div>
              <span>Payment ID</span>
              <strong>{order.paymentId}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Delivery Partner</h2>

        {order.deliveryPersonId ? (
          <div className="owner_order_delivery_details">
            <div>
              <span>Partner Type</span>
              <strong>
                {order.deliveryAssignmentType === 'RMA'
                  ? 'RMA Delivery Partner'
                  : 'Shop Delivery Partner'}
              </strong>
            </div>

            <div>
              <span>Partner ID</span>
              <strong>{order.deliveryPersonId}</strong>
            </div>

            {order.deliveryPersonName && (
              <div>
                <span>Name</span>
                <strong>{order.deliveryPersonName}</strong>
              </div>
            )}

            {order.deliveryPersonPhone && (
              <div>
                <span>Phone</span>
                <strong>{order.deliveryPersonPhone}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="owner_order_delivery_unassigned">
            No delivery partner assigned yet.
          </div>
        )}
      </section>

      <section className="owner_order_details_section">
        <h2>Order Timeline</h2>

        <div className="owner_order_timeline">
          <div>
            <span>Created</span>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
          </div>

          {order.completedAt && (
            <div>
              <span>Completed</span>
              <strong>{new Date(order.completedAt).toLocaleString()}</strong>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default OwnerOrderDetails;
