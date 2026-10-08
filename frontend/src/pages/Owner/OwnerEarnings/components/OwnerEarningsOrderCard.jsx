function OwnerEarningsOrderCard({ order, onClick }) {
  const handleOpen = () => {
    if (onClick) {
      onClick(order);
    }
  };

  return (
    <article
      className="owner_earnings_order_card"
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
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
          <span>Product Sales</span>
          <strong>₹{Number(order.productSubtotal || 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>RMA Fee</span>
          <strong>-₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Your Earnings</span>
          <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="owner_earnings_order_bottom">
        <span>
          {order.settledAt
            ? `Settled ${new Date(order.settledAt).toLocaleDateString()}`
            : new Date(order.orderDate).toLocaleDateString()}
        </span>

        <button
          type="button"
          className="owner_earnings_view_button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
        >
          View details →
        </button>
      </div>
    </article>
  );
}

export default OwnerEarningsOrderCard;
