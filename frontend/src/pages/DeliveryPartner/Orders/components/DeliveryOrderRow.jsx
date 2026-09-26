function DeliveryOrderRow({ order, onClick }) {
  const status =
    order.status === 'Completed'
      ? 'Completed'
      : order.status === 'OutForDelivery'
        ? 'Out for delivery'
        : order.status;

  return (
    <button type="button" className="delivery_order_row" onClick={onClick}>
      <div className="delivery_order_row_main">
        <strong>#{order.orderId}</strong>

        <span className="delivery_order_status">{status}</span>
      </div>

      <div className="delivery_order_row_info">
        <span>{order.customer?.name || 'Customer'}</span>

        <span>
          {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
        </span>

        <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
      </div>

      <div className="delivery_order_row_footer">
        <span>
          {order.deliveryDistance
            ? `${Number(order.deliveryDistance).toFixed(1)} km`
            : 'Delivery'}
        </span>

        <span>View Details →</span>
      </div>
    </button>
  );
}

export default DeliveryOrderRow;
