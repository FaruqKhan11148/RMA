function OrderDetailsSystem({ order, formatDateTime }) {
  return (
    <section className="admin-order-card admin-system-card">
      <div className="admin-order-card-header">
        <div>
          <h2>System Information</h2>
          <p>Database timestamps for this order.</p>
        </div>
      </div>

      <div className="admin-order-info-grid">
        <div>
          <span>Created At</span>
          <strong>{formatDateTime(order.createdAt)}</strong>
        </div>

        <div>
          <span>Last Updated</span>
          <strong>{formatDateTime(order.updatedAt)}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsSystem;
