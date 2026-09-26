function OrderOverview({ orderStatus, dashboardLoading }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Order Overview</h2>
          <p>Current order distribution</p>
        </div>
      </div>

      <div className="order-status-list">
        <div className="order-status-row">
          <span>Pending</span>
          <strong>{dashboardLoading ? '...' : orderStatus.Pending}</strong>
        </div>

        <div className="order-status-row">
          <span>Accepted</span>
          <strong>{orderStatus.Accepted}</strong>
        </div>

        <div className="order-status-row">
          <span>Preparing</span>
          <strong>{orderStatus.Preparing}</strong>
        </div>

        <div className="order-status-row">
          <span>Ready</span>
          <strong>{orderStatus.Ready}</strong>
        </div>

        <div className="order-status-row">
          <span>Out for Delivery</span>
          <strong>{orderStatus.OutForDelivery}</strong>
        </div>

        <div className="order-status-row">
          <span>Completed</span>
          <strong>{orderStatus.Completed}</strong>
        </div>
      </div>
    </div>
  );
}

export default OrderOverview;
