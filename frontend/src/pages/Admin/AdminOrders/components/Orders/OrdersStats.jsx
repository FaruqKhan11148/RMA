function OrdersStats({ stats }) {
  return (
    <div className="admin-orders-stats">
      <div className="admin-order-stat-card">
        <span>Total Orders</span>
        <strong>{stats.totalOrders}</strong>
      </div>

      <div className="admin-order-stat-card pending-card">
        <span>Pending</span>
        <strong>{stats.pending}</strong>
      </div>

      <div className="admin-order-stat-card">
        <span>Accepted</span>
        <strong>{stats.accepted}</strong>
      </div>

      <div className="admin-order-stat-card preparing-card">
        <span>Preparing</span>
        <strong>{stats.preparing}</strong>
      </div>

      <div className="admin-order-stat-card ready-card">
        <span>Ready</span>
        <strong>{stats.ready}</strong>
      </div>

      <div className="admin-order-stat-card delivery-card">
        <span>Out for Delivery</span>
        <strong>{stats.outForDelivery}</strong>
      </div>

      <div className="admin-order-stat-card completed-card">
        <span>Completed</span>
        <strong>{stats.completed}</strong>
      </div>

      <div className="admin-order-stat-card rejected-card">
        <span>Rejected</span>
        <strong>{stats.rejected}</strong>
      </div>
    </div>
  );
}

export default OrdersStats;
