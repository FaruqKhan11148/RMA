function ManageOrdersCard({ navigate }) {
  return (
    <section className="manage_orders_section">
      <button
        className="manage_orders_card"
        onClick={() => navigate('/owner/orders')}
      >
        <div className="manage_orders_icon">📦</div>

        <div className="manage_orders_content">
          <strong>Manage All Orders</strong>

          <span>
            View and update pending, accepted, preparing, ready and completed
            orders.
          </span>
        </div>

        <div className="manage_orders_arrow">→</div>
      </button>
    </section>
  );
}

export default ManageOrdersCard;
