const getOrderDisplayAmount = (order) => {
  const customerPayableAmount = Number(order.customerPayableAmount);
  const totalPrice = Number(order.totalPrice);

  if (
    order.customerPayableAmount != null &&
    Number.isFinite(customerPayableAmount) &&
    customerPayableAmount > 0
  ) {
    return customerPayableAmount;
  }

  if (Number.isFinite(totalPrice) && totalPrice >= 0) {
    return totalPrice;
  }

  return 0;
};

function OrderCard({
  order,
  onOrderClick,
  selectionMode,
  selected,
  canDelete,
}) {
  return (
    <article
      className={`order_card ${selectionMode ? 'order_card_selectable' : ''} ${
        selected ? 'order_card_selected' : ''
      } ${selectionMode && !canDelete ? 'order_card_not_deletable' : ''}`}
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
      {selectionMode && (
        <div className="order_card_selection">
          <span
            className={`order_checkbox ${
              selected ? 'order_checkbox_checked' : ''
            } ${!canDelete ? 'order_checkbox_disabled' : ''}`}
            aria-hidden="true"
          >
            {selected ? '✓' : ''}
          </span>
        </div>
      )}

      <div className="order_card_content">
        <div className="order_card_top">
          <strong>{order.orderId}</strong>

          <span className="order_status">{order.status}</span>
        </div>

        <div className="order_card_middle">
          <strong>
            {order.ownerId?.shopName || order.ownerId?.ownerName || 'Shop'}
          </strong>

          {!selectionMode && <span className="order_card_arrow">›</span>}
        </div>

        <div className="order_card_bottom">
          <span>
            {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
          </span>

          <span className="order_card_separator">•</span>

          <span>{order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span>

          <strong>₹{getOrderDisplayAmount(order).toFixed(2)}</strong>
        </div>

        {!selectionMode && (
          <div className="order_card_hint">Tap to view order details</div>
        )}

        {selectionMode && (
          <div className="order_card_hint">
            {!canDelete
              ? order.status === 'Rejected'
                ? 'Available after refund is completed'
                : 'Available after order is completed'
              : `Tap to ${selected ? 'unselect' : 'select'} this order`}
          </div>
        )}
      </div>
    </article>
  );
}

export default OrderCard;
