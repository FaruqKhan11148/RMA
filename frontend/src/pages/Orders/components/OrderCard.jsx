function OrderCard({ order, onOrderClick }) {
  return (
    <article
      className="order_card"
      role="button"
      tabIndex={0}
      onClick={() => onOrderClick(order)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOrderClick(order);
        }
      }}
    >
      <div className="order_card_top">
        <strong>{order.orderId}</strong>

        <span className="order_status">{order.status}</span>
      </div>

      <div className="order_card_middle">
        <strong>
          {order.ownerId?.shopName || order.ownerId?.ownerName || 'Shop'}
        </strong>

        <span className="order_card_arrow">›</span>
      </div>

      <div className="order_card_bottom">
        <span>
          {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
        </span>

        <span className="order_card_separator">•</span>

        <span>Delivery</span>

        <strong>
          ₹
          {Number(order.customerPayableAmount ?? order.totalPrice ?? 0).toFixed(
            2,
          )}
        </strong>
      </div>

      <div className="order_card_hint">Tap to view order details</div>
    </article>
  );
}

export default OrderCard;
