function OrderDetailsCustomer({ order }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Customer</h2>
          <p>Customer information for this order.</p>
        </div>
      </div>

      <div className="admin-order-info-grid">
        <div>
          <span>Name</span>
          <strong>{order.customer?.name || '—'}</strong>
        </div>

        <div>
          <span>Phone</span>
          <strong>{order.customer?.phone || '—'}</strong>
        </div>

        <div className="admin-order-info-wide">
          <span>Address</span>
          <strong>{order.customer?.address || '—'}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsCustomer;
