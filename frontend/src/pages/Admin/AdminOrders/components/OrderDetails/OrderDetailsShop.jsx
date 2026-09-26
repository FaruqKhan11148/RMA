function OrderDetailsShop({ order }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Shop & Owner</h2>
          <p>Shop associated with this order.</p>
        </div>
      </div>

      <div className="admin-order-info-grid">
        <div>
          <span>Shop ID</span>
          <strong>{order.ownerId?.shopId || '—'}</strong>
        </div>

        <div>
          <span>Shop Name</span>
          <strong>{order.ownerId?.shopName || '—'}</strong>
        </div>

        <div>
          <span>Owner Name</span>
          <strong>{order.ownerId?.ownerName || '—'}</strong>
        </div>

        <div>
          <span>Owner Phone</span>
          <strong>{order.ownerId?.phone || '—'}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsShop;
