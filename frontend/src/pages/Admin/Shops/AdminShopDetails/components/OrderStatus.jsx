function OrderStatus({ orderStatus }) {
  return (
    <section className="admin-shop-panel">
      <div className="admin-shop-panel-header">
        <div>
          <h2>Order Status</h2>
          <p>Current order distribution for this shop</p>
        </div>
      </div>

      <div className="admin-shop-status-grid">
        <div>
          <span>Pending</span>
          <strong>{orderStatus.Pending}</strong>
        </div>

        <div>
          <span>Accepted</span>
          <strong>{orderStatus.Accepted}</strong>
        </div>

        <div>
          <span>Preparing</span>
          <strong>{orderStatus.Preparing}</strong>
        </div>

        <div>
          <span>Ready</span>
          <strong>{orderStatus.Ready}</strong>
        </div>

        <div>
          <span>Out for Delivery</span>
          <strong>{orderStatus.OutForDelivery}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>{orderStatus.Completed}</strong>
        </div>

        <div>
          <span>Rejected</span>
          <strong>{orderStatus.Rejected}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderStatus;
