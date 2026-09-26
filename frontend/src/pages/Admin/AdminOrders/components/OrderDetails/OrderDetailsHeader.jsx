function OrderDetailsHeader({ order, formatDateTime, getStatusClass, onBack }) {
  return (
    <header className="admin-order-details-header">
      <div>
        <button type="button" className="admin-order-back" onClick={onBack}>
          ← Back
        </button>

        <div className="admin-order-title-row">
          <div>
            <h1>{order.orderId}</h1>
            <p>Order placed {formatDateTime(order.createdAt)}</p>
          </div>

          <span
            className={`admin-order-main-status ${getStatusClass(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>
    </header>
  );
}

export default OrderDetailsHeader;
