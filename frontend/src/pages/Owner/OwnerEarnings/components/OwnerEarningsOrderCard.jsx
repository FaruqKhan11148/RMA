function OwnerEarningsOrderCard({ order }) {
  return (
    <article className="owner_earnings_order_card" key={order.orderId}>
      <div className="owner_earnings_order_top">
        <div>
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>

        <span
          className={`owner_settlement_badge ${String(
            order.settlementStatus || '',
          ).toLowerCase()}`}
        >
          {order.settlementStatus}
        </span>
      </div>

      <div className="owner_earnings_order_details">
        <div>
          <span>Order Total</span>
          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Your Earnings</span>
          <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="owner_earnings_order_bottom">
        <span>{order.orderStatus}</span>

        {order.settledAt ? (
          <span>Settled {new Date(order.settledAt).toLocaleDateString()}</span>
        ) : (
          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
        )}
      </div>
    </article>
  );
}

export default OwnerEarningsOrderCard;
